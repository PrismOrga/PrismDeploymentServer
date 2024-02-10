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

        if (
            FS.existsSync(
                `${SERVER_ROOTFOLDER}/data/logs/${apps[app].name}.console.log`
            )
        ) {
            let logFile = FS.readFileSync(
                `${SERVER_ROOTFOLDER}/data/logs/${apps[app].name}.console.log`
            );

            logFile += `Exited with code: ${0}`;
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
        const apps = JSON.parse(
            FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
                encoding: "utf-8",
            })
        );
        let app = module.exports.getAppIndexByName(apps, appName);
        let appChild = null;

        if (app === null || !apps[app]) return 404;
        if (
            apps[app].status === appStatus.OK ||
            apps[app].status === appStatus.NOT_LAUNCHED
        )
            return 400;

        appChild = CHILD.spawn(
            apps[app].launchScript.command,
            apps[app].launchScript.args,
            {
                cwd:
                    apps[app].location[0] == "/"
                        ? `${apps[app].location}`
                        : `${APPS_ROOTFOLDER}/${apps[app].location}`,
            }
        );

        LAUNCHED_APPS.push({
            name: apps[app].name,
            child: appChild,
        });

        apps[app].status = appStatus.OK;

        if (
            FS.existsSync(
                `${SERVER_ROOTFOLDER}/data/logs/${apps[app].name}.console.log`
            )
        )
            FS.rmSync(
                `${SERVER_ROOTFOLDER}/data/logs/${apps[app].name}.console.log`
            );

        appChild.stdout.on("data", (data) => {
            let launchedApp = module.exports.getAppIndexByName(
                LAUNCHED_APPS,
                apps[app].name
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
                apps[app].name
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
                apps[app].name
            );

            if (launchedApp === null) {
                treeKill(appChild.pid);
                return;
            }

            module.exports.finaliseExit(apps, app, launchedApp, code);
        });

        FS.writeFileSync(
            `${SERVER_ROOTFOLDER}/data/apps.json`,
            JSON.stringify(apps)
        );

        return 200;
    },

    stopApp(appName) {
        const apps = JSON.parse(
            FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
                encoding: "utf-8",
            })
        );
        let app = module.exports.getAppIndexByName(apps, appName);
        let launchedApp = module.exports.getAppIndexByName(
            LAUNCHED_APPS,
            apps[app].name
        );

        if (app === null || !apps[app]) return { status: 404 };
        if (launchedApp === null || !LAUNCHED_APPS[launchedApp])
            return { status: 400 };

        if (apps[app].autoRestart) return { status: 400 };

        switch (apps[app].closeProcess) {
            case "KILL":
                treeKill(LAUNCHED_APPS[launchedApp].child.pid);
                module.exports.finaliseExit(apps, app, launchedApp);
                break;
            case "RCON":
                return {
                    status: 403,
                    json: { closeCommand: apps[app].rcon.closeCommand },
                };
            default:
                console.log("TODO: CUSTOM EXIT");
        }

        return { status: 200 };
    },

    async rconCommandHandler(appName, rconCommand) {
        const apps = JSON.parse(
            FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
                encoding: "utf-8",
            })
        );
        const app = module.exports.getAppIndexByName(apps, appName);
        let launchedApp = module.exports.getAppIndexByName(
            LAUNCHED_APPS,
            apps[app].name
        );

        if (app === null || !apps[app]) return 404;
        if (launchedApp === null || !LAUNCHED_APPS[launchedApp])
            return 400;

        const commandExitCode = await module.exports.sendAppRCONCommand(
            apps[app].name,
            apps[app].rcon,
            rconCommand
        );

        if (commandExitCode === 0) return 200;

        return 500;
    },

    setAppStatus(app, status) {
        app.status = status;
        return app;
    },

    setAllRunningAppsStatus(status) {
        const apps = JSON.parse(
            FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
                encoding: "utf-8",
            })
        );

        for (let app of apps) {
            if (app.status === appStatus.OK)
                app = module.exports.setAppStatus(app, status);
        }

        FS.writeFileSync(
            `${SERVER_ROOTFOLDER}/data/apps.json`,
            JSON.stringify(apps)
        );
    },
};
