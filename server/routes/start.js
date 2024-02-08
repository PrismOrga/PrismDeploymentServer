const { appStatus } = require(`${ROOTFOLDER}/conf`);

const {
    finaliseExit,
    getAppIndexByName,
} = require(`${SERVER_ROOTFOLDER}/appsManagement`);
const { handleData } = require(`${SERVER_ROOTFOLDER}/stdDataHandler`);
const { authenticateJWT } = require(`${SERVER_ROOTFOLDER}/jwtAuthChecker`);

ROUTER.post("/start", authenticateJWT, (req, res) => {
    const apps = JSON.parse(
        FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
            encoding: "utf-8",
        })
    );
    let app = getAppIndexByName(apps, req.body.appName);
    let appChild = null;

    if (!apps[app]) return res.sendStatus(404);
    if (
        apps[app].status === appStatus.OK ||
        apps[app].status === appStatus.NOT_LAUNCHED
    )
        return res.sendStatus(400);

    appChild = CHILD.spawn(
        apps[app].launchScript.command,
        apps[app].launchScript.args,
        {
            cwd:
                apps[app].location[0] == "/"
                    ? `${apps[app].location}`
                    : `${APPS_ROOTFOLDER}/${apps[app].location}`,
        }
    );

    LAUNCHED_APPS.push({
        name: apps[app].name,
        child: appChild,
    });

    apps[app].status = appStatus.OK;

    let launchedApp = getAppIndexByName(LAUNCHED_APPS, apps[app].name);

    if (
        FS.existsSync(
            `${SERVER_ROOTFOLDER}/data/logs/${apps[app].name}.console.log`
        )
    )
        FS.rmSync(
            `${SERVER_ROOTFOLDER}/data/logs/${apps[app].name}.console.log`
        );

    appChild.stdout.on("data", (data) => {
        handleData(LAUNCHED_APPS[launchedApp], data);
    });

    appChild.stderr.on("data", (data) => {
        handleData(LAUNCHED_APPS[launchedApp], data);
    });

    appChild.on("exit", (code) => {
        finaliseExit(apps, app, launchedApp);
    });

    FS.writeFileSync(
        `${SERVER_ROOTFOLDER}/data/apps.json`,
        JSON.stringify(apps)
    );

    return res.sendStatus(200);
});
