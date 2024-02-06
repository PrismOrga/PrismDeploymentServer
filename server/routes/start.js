const { finaliseExit, getAppIndexByName } = require("../appsManagement");
const { handleData } = require("../stdDataHandler");

const { OK, KO, UNKNOWN, NOT_LAUNCHED } = require(`${ROOTFOLDER}/consts`);

ROUTER.post("/start", (req, res) => {
    const apps = JSON.parse(
        FS.readFileSync(`${ROOTFOLDER}/server/data/apps.json`, {
            encoding: "utf-8",
        })
    );
    let app = getAppIndexByName(apps, req.body.appName);
    let appChild = null;

    if (!apps[app]) return res.sendStatus(404);
    if (apps[app].status === OK || apps[app].status === NOT_LAUNCHED)
        return res.sendStatus(400);

    appChild = CHILD.spawn(
        apps[app].launchScript.command,
        apps[app].launchScript.args,
        {
            cwd:
                apps[app].location[0] == "/"
                    ? `${apps[app].location}`
                    : `${ROOTFOLDER}/${apps[app].location}`,
        }
    );

    LAUNCHED_APPS.push({
        name: apps[app].name,
        child: appChild,
    });

    apps[app].status = OK;

    let launchedApp = getAppIndexByName(LAUNCHED_APPS, apps[app].name);

    if (
        FS.existsSync(
            `${ROOTFOLDER}/server/data/logs/${apps[app].name}.console.log`
        )
    )
        FS.rmSync(
            `${ROOTFOLDER}/server/data/logs/${apps[app].name}.console.log`
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
        `${ROOTFOLDER}/server/data/apps.json`,
        JSON.stringify(apps)
    );

    return res.sendStatus(200);
});
