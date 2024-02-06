const express = require("express");
const fs = require("fs");
const child = require("child_process");

const { OK, KO, UNKNOWN, NOT_LAUNCHED } = require("./consts");

router.get("/", (req, res) => {
    app.use(express.static(`${__dirname}/client/public`));
    app.use(express.static(`${__dirname}/client/src/homePage`));
    res.sendFile(`${__dirname}/client/src/homePage/home.html`);
});

router.get("/apps", (req, res) => {
    res.sendFile(`${__dirname}/data/apps.json`);
});

router.post("/start", (req, res) => {
    const appName = req.body.appName;
    const apps = JSON.parse(
        fs.readFileSync(`${__dirname}/data/apps.json`, { encoding: "utf-8" })
    );
    let app = null;
    let launchedApp = null;
    let appChild = null;

    for (app = 0; app < apps.length; app++) {
        if (apps[app].name === appName) {
            break;
        }
    }
    if (!apps[app]) return res.sendStatus(404);
    if (apps[app].status === OK || apps[app].status === NOT_LAUNCHED)
        return res.sendStatus(400);
    for (launchedApp = 0; launchedApp < launchedApps.length; launchedApp++) {
        if (launchedApps[launchedApp].name === apps[app].name) {
            return res.sendStatus(400);
        }
    }

    appChild = child.spawn(
        apps[app].launchScript.command,
        apps[app].launchScript.args,
        {
            cwd:
                apps[app].location[0] == "/"
                    ? `${apps[app].location}`
                    : `${__dirname}/${apps[app].location}`,
        }
    );

    appChild.stdout.on("data", (data) => {
        if (
            !fs.existsSync(
                `${__dirname}/data/logs/${apps[app].name}.console.log`
            )
        )
            fs.writeFileSync(
                `${__dirname}/data/logs/${apps[app].name}.console.log`,
                ""
            );

        let logFile = fs.readFileSync(
            `${__dirname}/data/logs/${apps[app].name}.console.log`
        );

        logFile += data;
        fs.writeFileSync(
            `${__dirname}/data/logs/${apps[app].name}.console.log`,
            logFile
        );
    });

    appChild.stderr.on("data", (data) => {
        if (
            !fs.existsSync(
                `${__dirname}/data/logs/${apps[app].name}.console.log`
            )
        )
            fs.writeFileSync(
                `${__dirname}/data/logs/${apps[app].name}.console.log`,
                ""
            );

        let logFile = fs.readFileSync(
            `${__dirname}/data/logs/${apps[app].name}.console.log`
        );

        logFile += data;
        fs.writeFileSync(
            `${__dirname}/data/logs/${apps[app].name}.console.log`,
            logFile
        );
    });

    appChild.on("exit", (code) => {
        launchedApps.splice(launchedApp, 1);

        apps[app].status = UNKNOWN;

        fs.writeFileSync(`${__dirname}/data/apps.json`, JSON.stringify(apps));

        if (
            fs.existsSync(
                `${__dirname}/data/logs/${apps[app].name}.console.log`
            )
        ) {
            let logFile = fs.readFileSync(
                `${__dirname}/data/logs/${apps[app].name}.console.log`
            );

            logFile += `Exited with code: ${code}`;
            fs.writeFileSync(
                `${__dirname}/data/logs/_old/${apps[app].name}.console.log`,
                logFile
            );
            fs.rmSync(`${__dirname}/data/logs/${apps[app].name}.console.log`);
        }
    });

    launchedApps.push({
        name: apps[app].name,
        child: appChild,
    });

    apps[app].status = OK;

    fs.writeFileSync(`${__dirname}/data/apps.json`, JSON.stringify(apps));

    return res.sendStatus(200);
});

router.post("/stop", (req, res) => {
    const appName = req.body.appName;
    const apps = JSON.parse(
        fs.readFileSync(`${__dirname}/data/apps.json`, { encoding: "utf-8" })
    );
    let app = null;
    let launchedApp = null;

    for (app = 0; app < apps.length; app++) {
        if (apps[app].name === appName) {
            break;
        }
    }
    if (!apps[app]) return res.sendStatus(404);
    for (launchedApp = 0; launchedApp < launchedApps.length; launchedApp++) {
        if (launchedApps[launchedApp].name === apps[app].name) {
            break;
        }
    }
    if (launchedApp === launchedApps.length) return res.sendStatus(400);

    switch (apps[app].closeProcess) {
        case "KILL":
            process.kill(launchedApps[launchedApp].child.pid, "SIGTERM");
            break;
        case "RCON":
            console.info("TODO: RCON EXIT");
            break;
        default:
            console.info("TODO: CUSTOM EXIT");
    }

    launchedApps.splice(launchedApp, 1);

    apps[app].status = KO;

    fs.writeFileSync(`${__dirname}/data/apps.json`, JSON.stringify(apps));

    if (fs.existsSync(`${__dirname}/data/logs/${apps[app].name}.console.log`)) {
        let logFile = fs.readFileSync(
            `${__dirname}/data/logs/${apps[app].name}.console.log`
        );

        logFile += `Exited with code: ${0}`;
        fs.writeFileSync(
            `${__dirname}/data/logs/_old/${apps[app].name}.console.log`,
            logFile
        );
        fs.rmSync(`${__dirname}/data/logs/${apps[app].name}.console.log`);
    }

    return res.sendStatus(200);
});
