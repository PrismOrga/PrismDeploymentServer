const { appStatus } = require(`${ROOTFOLDER}/conf`);

const { handleData } = require(`${SERVER_ROOTFOLDER}/stdDataHandler`);

const treeKill = require("tree-kill");

function getCurrentLocaleFormattedDate() {
    return new Date()
        .toLocaleString()
        .replaceAll("/", "-")
        .replace(", ", " ")
        .replaceAll(" ", "_")
        .replaceAll(":", "-");
}

module.exports = {
    getAppIndexByName(apps, appName) {
        for (let app = 0; app < apps.length; app++) {
            if (apps[app].name === appName) {
                return app;
            }
        }

        return null;
    },

    finaliseExit(apps, app, launchedApp, _code) {
        LAUNCHED_APPS.splice(launchedApp, 1);

        apps[app].status = appStatus.KO;

        if (_code && _code !== 0) apps[app].status = appStatus.UNKNOWN;

        FS.writeFileSync(
            `${SERVER_ROOTFOLDER}/data/apps.json`,
            JSON.stringify(apps)
        );
        PDS_EMITTER.emit("appsUpdated!");

        if (
            FS.existsSync(
                `${SERVER_ROOTFOLDER}/data/logs/${apps[app].name}.console.log`
            )
        ) {
            let logFile = FS.readFileSync(
                `${SERVER_ROOTFOLDER}/data/logs/${apps[app].name}.console.log`
            );

            logFile += `Exited with code: ${_code || 0}`;
            if (
                !FS.existsSync(
                    `${SERVER_ROOTFOLDER}/data/logs/_old/${apps[app].name}`
                )
            )
                FS.mkdirSync(
                    `${SERVER_ROOTFOLDER}/data/logs/_old/${apps[app].name}`
                );
            FS.writeFileSync(
                `${SERVER_ROOTFOLDER}/data/logs/_old/${
                    apps[app].name
                }/${getCurrentLocaleFormattedDate()}.console.log`,
                logFile
            );
            FS.rmSync(
                `${SERVER_ROOTFOLDER}/data/logs/${apps[app].name}.console.log`
            );
            PDS_EMITTER.emit("logsUpdated!");
        }

        if (
            (apps[app].status === appStatus.KO ||
                apps[app].status === appStatus.UNKNOWN) &&
            apps[app].autoRestart
        )
            startApp(apps[app].name);
    },

    sendAppRCONCommand(appName, rcon, command) {
        let currentCommandFilename = getCurrentLocaleFormattedDate();
        let rconChild = null;

        if (!FS.existsSync(`${SERVER_ROOTFOLDER}/temp`))
            FS.mkdirSync(`${SERVER_ROOTFOLDER}/temp`);

        FS.writeFileSync(
            `${SERVER_ROOTFOLDER}/temp/${currentCommandFilename}`,
            command
        );

        rconChild = CHILD.spawn(`${ROOTFOLDER}/bin/ARRCON`, [
            "--host",
            rcon.host,
            "--port",
            rcon.port,
            "--pass",
            rcon.pass,
            "--file",
            `${SERVER_ROOTFOLDER}/temp/${currentCommandFilename}`,
        ]);

        rconChild.stdout.on("data", (data) => {
            let launchedApp = module.exports.getAppIndexByName(
                LAUNCHED_APPS,
                appName
            );

            if (launchedApp === null) {
                treeKill(rconChild.pid);
                return null;
            }

            handleData(LAUNCHED_APPS[launchedApp], data);
        });

        rconChild.stderr.on("data", (data) => {
            let launchedApp = module.exports.getAppIndexByName(
                LAUNCHED_APPS,
                appName
            );

            if (launchedApp === null) {
                treeKill(rconChild.pid);
                return null;
            }

            handleData(LAUNCHED_APPS[launchedApp], data);
        });

        rconChild.on("error", (error) => {
            let launchedApp = module.exports.getAppIndexByName(
                LAUNCHED_APPS,
                appName
            );

            if (launchedApp === null) {
                treeKill(rconChild.pid);
                return;
            }

            handleData(
                LAUNCHED_APPS[launchedApp],
                `RCON: Couldn't send RCON command:\n${error}`
            );
        });

        return new Promise((resolve) => {
            rconChild.on("close", (code) => {
                resolve(code);
            });
        });
    },

    startApp(appName) {
        let app = module.exports.getAppIndexByName(APPS, appName);
        let appChild = null;

        if (app === null || !APPS[app]) return 404;
        if (
            APPS[app].status === appStatus.OK ||
            APPS[app].status === appStatus.NOT_LAUNCHED
        )
            return 400;

        appChild = CHILD.spawn(
            APPS[app].launchScript.command,
            APPS[app].launchScript.args,
            {
                cwd:
                    APPS[app].location[0] == "/"
                        ? `${APPS[app].location}`
                        : `${APPS_ROOTFOLDER}/${APPS[app].location}`,
            }
        );

        LAUNCHED_APPS.push({
            name: APPS[app].name,
            child: appChild,
        });

        APPS[app].status = appStatus.OK;

        if (
            FS.existsSync(
                `${SERVER_ROOTFOLDER}/data/logs/${APPS[app].name}.console.log`
            )
        ) {
            FS.rmSync(
                `${SERVER_ROOTFOLDER}/data/logs/${APPS[app].name}.console.log`
            );
            PDS_EMITTER.emit("logsUpdated!");
        }

        appChild.stdout.on("data", (data) => {
            let launchedApp = module.exports.getAppIndexByName(
                LAUNCHED_APPS,
                APPS[app].name
            );

            if (launchedApp === null) {
                treeKill(appChild.pid);
                return;
            }

            handleData(LAUNCHED_APPS[launchedApp], data);
        });

        appChild.stderr.on("data", (data) => {
            let launchedApp = module.exports.getAppIndexByName(
                LAUNCHED_APPS,
                APPS[app].name
            );

            if (launchedApp === null) {
                treeKill(appChild.pid);
                return;
            }

            handleData(LAUNCHED_APPS[launchedApp], data);
        });

        appChild.on("exit", (code) => {
            let launchedApp = module.exports.getAppIndexByName(
                LAUNCHED_APPS,
                APPS[app].name
            );

            if (launchedApp === null) {
                treeKill(appChild.pid);
                return;
            }

            module.exports.finaliseExit(APPS, app, launchedApp, code);
        });

        FS.writeFileSync(
            `${SERVER_ROOTFOLDER}/data/apps.json`,
            JSON.stringify(APPS)
        );
        PDS_EMITTER.emit("appsUpdated!");

        return 200;
    },

    async stopApp(appName) {
        let app = module.exports.getAppIndexByName(APPS, appName);
        let launchedApp = module.exports.getAppIndexByName(
            LAUNCHED_APPS,
            APPS[app].name
        );

        if (app === null || !APPS[app]) return { status: 404 };
        if (launchedApp === null || !LAUNCHED_APPS[launchedApp])
            return { status: 400 };

        if (APPS[app].autoRestart) return { status: 400 };

        switch (APPS[app].closeProcess) {
            case "KILL":
                treeKill(LAUNCHED_APPS[launchedApp].child.pid);
                module.exports.finaliseExit(APPS, app, launchedApp);
                break;
            case "RCON":
                let rconStatus = await module.exports.rconCommandHandler(
                    APPS[app].name,
                    APPS[app].rcon.closeCommand
                );

                if (rconStatus === 200 && APPS[app].status === appStatus.OK) {
                    APPS[app].status = appStatus.TO_KO;
                    FS.writeFileSync(
                        `${SERVER_ROOTFOLDER}/data/apps.json`,
                        JSON.stringify(APPS)
                    );
                    PDS_EMITTER.emit("appsUpdated!");
                }
                break;
            default:
                console.log("TODO: CUSTOM EXIT");
        }

        return { status: 200 };
    },

    async rconCommandHandler(appName, rconCommand) {
        const app = module.exports.getAppIndexByName(APPS, appName);
        let launchedApp = module.exports.getAppIndexByName(
            LAUNCHED_APPS,
            APPS[app].name
        );

        if (app === null || !APPS[app]) return 404;
        if (launchedApp === null || !LAUNCHED_APPS[launchedApp] || !APPS[app].rcon) return 400;

        const commandExitCode = await module.exports.sendAppRCONCommand(
            APPS[app].name,
            APPS[app].rcon,
            rconCommand
        );

        if (commandExitCode === 0) return 200;

        return 500;
    },

    setAppStatus(app, status) {
        app.status = status;
        PDS_EMITTER.emit("appsUpdated!");
        return app;
    },

    setAllRunningAppsStatus(status) {
        for (let app of APPS) {
            if (app.status === appStatus.OK)
                app = module.exports.setAppStatus(app, status);
        }

        FS.writeFileSync(
            `${SERVER_ROOTFOLDER}/data/apps.json`,
            JSON.stringify(APPS)
        );
    },
};
