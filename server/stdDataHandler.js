module.exports = {
    handleData(app, data) {
        if (
            !FS.existsSync(
                `${SERVER_ROOTFOLDER}/data/logs/${app.name}.console.log`
            )
        )
            FS.writeFileSync(
                `${SERVER_ROOTFOLDER}/data/logs/${app.name}.console.log`,
                "\x1B[39m\x1B[49m\x1B[22m\x1B[24m\x1B[27m"
            );

        let logFile = FS.readFileSync(
            `${SERVER_ROOTFOLDER}/data/logs/${app.name}.console.log`
        );

        logFile += data;
        FS.writeFileSync(
            `${SERVER_ROOTFOLDER}/data/logs/${app.name}.console.log`,
            logFile
        );
        PDS_EMITTER.emit("logsUpdated!");
    },
};
