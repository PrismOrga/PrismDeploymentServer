const { sendAppRCONCommand, getAppIndexByName } = require("../appsManagement");

ROUTER.get("/rcon", (req, res) => {
    const apps = JSON.parse(
        FS.readFileSync(`${ROOTFOLDER}/server/data/apps.json`, {
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
