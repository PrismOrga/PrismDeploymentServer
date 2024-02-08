const {
    getAppIndexByName,
    finaliseExit,
} = require(`${SERVER_ROOTFOLDER}/appsManagement`);
const { authenticateJWT } = require(`${SERVER_ROOTFOLDER}/jwtAuthChecker`);

const treeKill = require("tree-kill");

ROUTER.post("/stop", authenticateJWT, async (req, res) => {
    const apps = JSON.parse(
        FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
            encoding: "utf-8",
        })
    );
    let app = getAppIndexByName(apps, req.body.appName);
    let launchedApp = getAppIndexByName(LAUNCHED_APPS, apps[app].name);

    if (!apps[app]) return res.sendStatus(404);
    if (launchedApp === LAUNCHED_APPS.length) return res.sendStatus(400);

    if (apps[app].autoRestart) return res.sendStatus(400);

    switch (apps[app].closeProcess) {
        case "KILL":
            treeKill(LAUNCHED_APPS[launchedApp].child.pid);
            finaliseExit(apps, app, launchedApp);
            break;
        case "RCON":
            return res
                .status(403)
                .json({ closeCommand: apps[app].rcon.closeCommand });
        default:
            console.info("TODO: CUSTOM EXIT");
    }

    return res.sendStatus(200);
});
