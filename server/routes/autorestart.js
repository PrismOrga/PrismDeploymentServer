const { appStatus } = require(`${ROOTFOLDER}/conf`);

const { getAppIndexByName } = require(`${SERVER_ROOTFOLDER}/appsManagement`);
const { authenticateJWT } = require(`${SERVER_ROOTFOLDER}/jwtAuthChecker`);

ROUTER.post("/autorestart", authenticateJWT, (req, res) => {
    let app = getAppIndexByName(APPS, req.body.appName);

    if (app === null || !APPS[app]) return res.sendStatus(404);
    if (
        APPS[app].status === appStatus.OK ||
        APPS[app].status === appStatus.NOT_LAUNCHED
    )
        return res.sendStatus(400);

    APPS[app].autoRestart = !APPS[app].autoRestart;
    FS.writeFileSync(
        `${SERVER_ROOTFOLDER}/data/apps.json`,
        JSON.stringify(APPS)
    );
    return res.sendStatus(200);
});
