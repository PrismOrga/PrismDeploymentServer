const { OK, KO, UNKNOWN, NOT_LAUNCHED } = require(`${ROOTFOLDER}/consts`);

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
            if (!FS.existsSync(`${ROOTFOLDER}/server/data/logs/_old/${apps[app].name}`))
                FS.mkdirSync(`${ROOTFOLDER}/server/data/logs/_old/${apps[app].name}`);
            FS.writeFileSync(
                `${ROOTFOLDER}/server/data/logs/_old/${apps[app].name}/${new Date().toLocaleString().replaceAll("/", "-").replace(", ", " ").replaceAll(" ", "_").replaceAll(":", "-")}.console.log`,
                logFile
            );
            FS.rmSync(
                `${ROOTFOLDER}/server/data/logs/${apps[app].name}.console.log`
            );
        }
    },
};
