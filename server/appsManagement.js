const { appStatus } = require(`${ROOTFOLDER}/conf`);

const { handleData } = require(`${SERVER_ROOTFOLDER}/stdDataHandler`);
const { startApp } = require(`${SERVER_ROOTFOLDER}/childManagement`);

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

    sendAppRCONCommand(launchedApp, rcon, command) {
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
            handleData(LAUNCHED_APPS[launchedApp], `RCON: ${data}`);
        });

        rconChild.stderr.on("data", (data) => {
            handleData(LAUNCHED_APPS[launchedApp], `RCON: ${data}`);
        });

        rconChild.on("error", (error) => {
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
};
