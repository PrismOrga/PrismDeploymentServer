const { handleData } = require("./stdDataHandler");

const { OK, KO, UNKNOWN, NOT_LAUNCHED } = require(`${ROOTFOLDER}/consts`);

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

    finaliseExit(apps, app, launchedApp) {
        LAUNCHED_APPS.splice(launchedApp, 1);

        apps[app].status = KO;

        FS.writeFileSync(
            `${ROOTFOLDER}/server/data/apps.json`,
            JSON.stringify(apps)
        );

        if (
            FS.existsSync(
                `${ROOTFOLDER}/server/data/logs/${apps[app].name}.console.log`
            )
        ) {
            let logFile = FS.readFileSync(
                `${ROOTFOLDER}/server/data/logs/${apps[app].name}.console.log`
            );

            logFile += `Exited with code: ${0}`;
            if (
                !FS.existsSync(
                    `${ROOTFOLDER}/server/data/logs/_old/${apps[app].name}`
                )
            )
                FS.mkdirSync(
                    `${ROOTFOLDER}/server/data/logs/_old/${apps[app].name}`
                );
            FS.writeFileSync(
                `${ROOTFOLDER}/server/data/logs/_old/${
                    apps[app].name
                }/${getCurrentLocaleFormattedDate()}.console.log`,
                logFile
            );
            FS.rmSync(
                `${ROOTFOLDER}/server/data/logs/${apps[app].name}.console.log`
            );
        }
    },

    sendAppRCONCommand(launchedApp, rcon, command) {
        let currentCommandFilename = getCurrentLocaleFormattedDate();
        let rconChild = null;

        if (!FS.existsSync(`${ROOTFOLDER}/server/temp`))
            FS.mkdirSync(`${ROOTFOLDER}/server/temp`);

        FS.writeFileSync(
            `${ROOTFOLDER}/server/temp/${currentCommandFilename}`,
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
            `${ROOTFOLDER}/server/temp/${currentCommandFilename}`,
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
    },
};
