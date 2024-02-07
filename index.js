global.EXPRESS = require("express");
global.FS = require("fs");

const https = require("https");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");

global.ROOTFOLDER = __dirname;

const config = require(`${ROOTFOLDER}/conf`);
const port = config.port || 22000;

if (config.build.auto) require("./build");

global.APPS_ROOTFOLDER = `${ROOTFOLDER}/apps`;
global.CLIENT_ROOTFOLDER = `${ROOTFOLDER}/client`;
global.SERVER_ROOTFOLDER = `${ROOTFOLDER}/server`;
global.BUILD_ROOTFOLDER = `${ROOTFOLDER}/build`;

if (!FS.existsSync(`${APPS_ROOTFOLDER}`)) FS.mkdirSync(`${APPS_ROOTFOLDER}`);
if (!FS.existsSync(`${SERVER_ROOTFOLDER}/data`))
    FS.mkdirSync(`${SERVER_ROOTFOLDER}/data`);
if (!FS.existsSync(`${SERVER_ROOTFOLDER}/data/apps.json`))
    FS.writeFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, "[]");
if (!FS.existsSync(`${SERVER_ROOTFOLDER}/data/logs`))
    FS.mkdirSync(`${SERVER_ROOTFOLDER}/data/logs`);
if (!FS.existsSync(`${SERVER_ROOTFOLDER}/data/logs/_old`))
    FS.mkdirSync(`${SERVER_ROOTFOLDER}/data/logs/_old`);

let apps = JSON.parse(
    FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
        encoding: "utf-8",
    })
);

for (let app = 0; app < apps.length; app++) {
    let appPath =
        apps[app].location[0] == "/"
            ? `${apps[app].location}`
            : `${APPS_ROOTFOLDER}/${apps[app].location}`;

    if (!FS.existsSync(appPath)) {
        apps[app].status = -1;
        console.error(`ERROR: ${appPath}: no such file or directory.`);
    }
}

FS.writeFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, JSON.stringify(apps));

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

const privateKey = FS.readFileSync(
    config.ssl.privateKey
        ? config.ssl.privateKey[0] == "/"
            ? config.ssl.privateKey
            : `${ROOTFOLDER}/${config.ssl.privateKey}`
        : "none"
);
const certificate = FS.readFileSync(
    config.ssl.certificate
        ? config.ssl.certificate[0] == "/"
            ? config.ssl.certificate
            : `${ROOTFOLDER}/${config.ssl.certificate}`
        : "none"
);

if (!certificate || !privateKey) {
    throw new Error("FATAL ERROR: NO CERTIFICATE/PRIVATE KEY FOUND");
}

const server = https
    .createServer(
        {
            key: privateKey,
            cert: certificate,
        },
        APP
    )
    .listen(port, () =>
        console.log(`\x1B[36mServer app listening on port ${port}\x1B[0m`)
    );

require("./routes");
