global.EXPRESS = require("express");
global.FS = require("fs");
global.CHILD = require("child_process");
global.JWT = require("jsonwebtoken");

const https = require("https");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");

global.ROOTFOLDER = __dirname;
global.SHUTDOWN = 0;

const config = require(`${ROOTFOLDER}/conf`);
const port = config.port || 22000;

if (config.build.auto) require("./build");

global.APPS_ROOTFOLDER = `${ROOTFOLDER}/apps`;
global.CLIENT_ROOTFOLDER = `${ROOTFOLDER}/client`;
global.SERVER_ROOTFOLDER = `${ROOTFOLDER}/server`;
global.BUILD_ROOTFOLDER = `${ROOTFOLDER}/build`;

const {
    setAllRunningAppsStatus,
    stopApp,
    rconCommandHandler,
} = require(`${SERVER_ROOTFOLDER}/appsManagement`);

if (!FS.existsSync(`${APPS_ROOTFOLDER}`)) FS.mkdirSync(`${APPS_ROOTFOLDER}`);
if (!FS.existsSync(`${SERVER_ROOTFOLDER}/data`))
    FS.mkdirSync(`${SERVER_ROOTFOLDER}/data`);
if (!FS.existsSync(`${SERVER_ROOTFOLDER}/data/apps.json`))
    FS.writeFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, "[]");
if (!FS.existsSync(`${SERVER_ROOTFOLDER}/data/users.json`))
    FS.writeFileSync(`${SERVER_ROOTFOLDER}/data/users.json`, "[]");
if (!FS.existsSync(`${SERVER_ROOTFOLDER}/data/logs`))
    FS.mkdirSync(`${SERVER_ROOTFOLDER}/data/logs`);
if (!FS.existsSync(`${SERVER_ROOTFOLDER}/data/logs/_old`))
    FS.mkdirSync(`${SERVER_ROOTFOLDER}/data/logs/_old`);
if (!FS.existsSync(config.jwt.privateKey))
    throw new Error(
        `FATAL ERROR: ${config.jwt.privateKey}: no such file or directory.`
    );
if (FS.existsSync(`${SERVER_ROOTFOLDER}/temp`))
    FS.rmdirSync(`${SERVER_ROOTFOLDER}/temp`, {
        recursive: true,
        force: true,
    });
FS.mkdirSync(`${SERVER_ROOTFOLDER}/temp`);

global.JWT_PRIVATE_KEY = FS.readFileSync(
    config.jwt.privateKey[0] == "/"
        ? config.jwt.privateKey
        : `${ROOTFOLDER}/${config.jwt.privateKey}`
);

global.APPS = JSON.parse(
    FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
        encoding: "utf-8",
    })
);

for (let app = 0; app < APPS.length; app++) {
    let appPath =
        APPS[app].location[0] == "/"
            ? `${APPS[app].location}`
            : `${APPS_ROOTFOLDER}/${APPS[app].location}`;

    if (!FS.existsSync(appPath)) {
        APPS[app].status = -1;
        console.error(`ERROR: ${appPath}: no such file or directory.`);
    }
}

FS.writeFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, JSON.stringify(APPS));

global.APP = EXPRESS();
global.ROUTER = EXPRESS.Router();
global.LAUNCHED_APPS = new Array();

APP.use(morgan("combined"));
APP.use(cors());
APP.use(bodyParser.json());
APP.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

APP.use(favicon(`${CLIENT_ROOTFOLDER}/public/favicon.ico`));
APP.use(ROUTER);

let privateKey;
let certificate;

if (!config.ssl.bypass) {
    try {
        privateKey = FS.readFileSync(
            config.ssl.privateKey
                ? config.ssl.privateKey[0] == "/"
                    ? config.ssl.privateKey
                    : `${ROOTFOLDER}/${config.ssl.privateKey}`
                : "none"
        );
        certificate = FS.readFileSync(
            config.ssl.certificate
                ? config.ssl.certificate[0] == "/"
                    ? config.ssl.certificate
                    : `${ROOTFOLDER}/${config.ssl.certificate}`
                : "none"
        );
    } catch (err) {
        throw new Error(
            "\x1B[5m\x1B[31mFATAL ERROR\x1B[25m: NO CERTIFICATE/PRIVATE KEY FOUND.\x1B[39m"
        );
    }
} else
    console.error(
        "\x1B[33m[IGNORED] \x1B[5m\x1B[31mFATAL ERROR\x1B[25m: NO CERTIFICATE/PRIVATE KEY FOUND.\x1B[39m"
    );

setAllRunningAppsStatus(config.appStatus.KO);

let server;

try {
    if (!config.ssl.bypass)
        server = https
            .createServer(
                {
                    key: privateKey,
                    cert: certificate,
                },
                APP
            )
            .listen(port, () =>
                console.log(
                    `\x1B[36mServer app listening on port ${port}\x1B[39m`
                )
            );
    else
        server = APP.listen(port, () =>
            console.log(`\x1B[36mServer app listening on port ${port}\x1B[39m`)
        );

    require("./routes");
} catch (err) {
    if (err.message.includes("PEM routines") && !config.ssl.bypass)
        throw new Error(
            "\x1B[5m\x1B[31mFATAL ERROR\x1B[25m: CERTIFICATE/PRIVATE KEY NOT VALID.\x1B[39m"
        );
    else throw err;
}

const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];

for (const signal of signals) {
    process.on(signal, () => {
        console.log(
            `\n\x1B[93m${signal} signal received: closing PDS and all its apps...\x1B[39m`
        );
        closePDS();
    });
}

const exceptions = ["uncaughtException", "unhandledRejection"];

for (const exception of exceptions) {
    process.on(exception, (err) => {
        if (!SHUTDOWN) {
            console.error(err);
            console.log(
                `\n\x1B[93m${err.message}: closing PDS and all its apps...\x1B[39m`
            );
            closePDS();
        } else {
            SHUTDOWN = -1;
            console.error(`\n${err}`);
            console.error(
                `\x1B[91m${err.message}: crash during closing happened! Please report error to devs!\x1B[39m`
            );
            process.kill(process.pid);
        }
    });
}

async function closePDS() {
    SHUTDOWN = 1;

    FS.writeFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, JSON.stringify(APPS));
    server.close();
    console.log(
        `\x1B[93mSending closing signals and commands to apps...\x1B[39m`
    );

    const promises = [];

    for (const app of APPS) {
        if (app.status === config.appStatus.OK) {
            const { json } = stopApp(app.name);

            if (json)
                promises.push(
                    rconCommandHandler(app.name, app.rcon.closeCommand)
                );
        }
    }

    await Promise.all(promises);

    console.log("\x1B[92mAll signals sent with success!\x1B[39m");
    console.log(
        `\x1B[93mWaiting for async apps to shutdown and closing PDS...\x1B[39m`
    );
}

process.on("exit", () => {
    switch (SHUTDOWN) {
        case -1:
            break;
        case 0:
            console.error(
                "\x1B[5m\x1B[31mFATAL ERROR\x1B[91m: Process exited without PDS shutdown! This should never happen, please report error to devs!\x1B[39m"
            );
            break;
        default:
            console.log("\x1B[92mPDS closed successfully!\x1B[39m");
            break;
    }
});
