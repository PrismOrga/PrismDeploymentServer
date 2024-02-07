const {
    sendAppRCONCommand,
    getAppIndexByName,
} = require(`${SERVER_ROOTFOLDER}/appsManagement`);

ROUTER.get("/rcon", (req, res) => {
    const apps = JSON.parse(
        FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
            encoding: "utf-8",
        })
    );

    sendAppRCONCommand(
        getAppIndexByName(LAUNCHED_APPS, req.body.appName),
        apps[getAppIndexByName(apps, req.body.appName)].rcon,
        req.body.rconCommand
    );

    return res.sendStatus(200);
});
