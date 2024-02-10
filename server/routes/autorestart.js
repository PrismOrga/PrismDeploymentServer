const { appStatus } = require(`${ROOTFOLDER}/conf`);

const { getAppIndexByName } = require(`${SERVER_ROOTFOLDER}/appsManagement`);
const { authenticateJWT } = require(`${SERVER_ROOTFOLDER}/jwtAuthChecker`);

ROUTER.post("/autorestart", authenticateJWT, (req, res) => {
    const apps = JSON.parse(
        FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
            encoding: "utf-8",
        })
    );
    let app = getAppIndexByName(apps, req.body.appName);

    if (app === null || !apps[app]) return res.sendStatus(404);
    if (
        apps[app].status === appStatus.OK ||
        apps[app].status === appStatus.NOT_LAUNCHED
    )
        return res.sendStatus(400);

    apps[app].autoRestart = !apps[app].autoRestart;
    FS.writeFileSync(
        `${SERVER_ROOTFOLDER}/data/apps.json`,
        JSON.stringify(apps)
    );
    return res.sendStatus(200);
});
