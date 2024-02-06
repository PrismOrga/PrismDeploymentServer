module.exports = {
    handleData(app, data) {
        if (
            !FS.existsSync(
                `${ROOTFOLDER}/server/data/logs/${app.name}.console.log`
            )
        )
            FS.writeFileSync(
                `${ROOTFOLDER}/server/data/logs/${app.name}.console.log`,
                ""
            );

        let logFile = FS.readFileSync(
            `${ROOTFOLDER}/server/data/logs/${app.name}.console.log`
        );

        logFile += data;
        FS.writeFileSync(
            `${ROOTFOLDER}/server/data/logs/${app.name}.console.log`,
            logFile
        );
    },
};
