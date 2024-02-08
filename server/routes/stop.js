const { sendAppRCONCommand } = require("../appsManagement");

const {
    getAppIndexByName,
    finaliseExit,
} = require(`${SERVER_ROOTFOLDER}/appsManagement`);
const { authenticateJWT } = require(`${SERVER_ROOTFOLDER}/jwtAuthChecker`);

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

    switch (apps[app].closeProcess) {
        case "KILL":
            process.kill(LAUNCHED_APPS[launchedApp].child.pid, "SIGTERM");
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
