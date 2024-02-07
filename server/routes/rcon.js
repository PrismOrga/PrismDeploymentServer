const {
    sendAppRCONCommand,
    getAppIndexByName,
} = require(`${SERVER_ROOTFOLDER}/appsManagement`);

ROUTER.post("/rcon", async (req, res) => {
    const apps = JSON.parse(
        FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
            encoding: "utf-8",
        })
    );
    const commandExitCode = await sendAppRCONCommand(
        getAppIndexByName(LAUNCHED_APPS, req.body.appName),
        apps[getAppIndexByName(apps, req.body.appName)].rcon,
        req.body.rconCommand
    );

    if (commandExitCode === 0) return res.sendStatus(200);

    return res.sendStatus(500);
});
