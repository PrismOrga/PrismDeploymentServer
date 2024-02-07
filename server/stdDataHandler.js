module.exports = {
    handleData(app, data) {
        if (
            !FS.existsSync(
                `${SERVER_ROOTFOLDER}/data/logs/${app.name}.console.log`
            )
        )
            FS.writeFileSync(
                `${SERVER_ROOTFOLDER}/data/logs/${app.name}.console.log`,
                ""
            );

        let logFile = FS.readFileSync(
            `${SERVER_ROOTFOLDER}/data/logs/${app.name}.console.log`
        );

        logFile += data;
        FS.writeFileSync(
            `${SERVER_ROOTFOLDER}/data/logs/${app.name}.console.log`,
            logFile
        );
    },
};
