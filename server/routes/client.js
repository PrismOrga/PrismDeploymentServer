const { authenticateJWT } = require(`${SERVER_ROOTFOLDER}/jwtAuthChecker`);

const Convert = require("ansi-to-html");
const convert = new Convert();

/**
 * Routes
 */

ROUTER.get("/", (req, res) => {
    APP.use(EXPRESS.static(`${BUILD_ROOTFOLDER}/client/src/homePage`));
    APP.use(EXPRESS.static(`${CLIENT_ROOTFOLDER}/public`));
    res.sendFile(`${BUILD_ROOTFOLDER}/client/src/homePage/home.html`);
});

ROUTER.get("/login", (req, res) => {
    APP.use(EXPRESS.static(`${BUILD_ROOTFOLDER}/client/src/loginPage`));
    APP.use(EXPRESS.static(`${CLIENT_ROOTFOLDER}/public`));
    res.sendFile(`${BUILD_ROOTFOLDER}/client/src/loginPage/login.html`);
});

/**
 * "API" routes
 */

ROUTER.get("/apps", authenticateJWT, (req, res) => {
    let apps = JSON.parse(
        FS.readFileSync(`${SERVER_ROOTFOLDER}/data/apps.json`, {
            encoding: "utf-8",
        })
    );
    let allowedApps = [];

    for (const app of apps) {
        if (req.user.access.apps.includes(app.name) || req.user.access.apps.includes("*")) allowedApps.push(app);
    }
    res.json(allowedApps);
});

ROUTER.post("/currentLog", authenticateJWT, (req, res) => {
    if (
        !FS.existsSync(
            `${SERVER_ROOTFOLDER}/data/logs/${req.body.appName}.console.log`
        )
    )
        res.status(200).json({ lines: "" });
    else
        res.status(200).json({
            lines: convert.toHtml(
                `${FS.readFileSync(
                    `${SERVER_ROOTFOLDER}/data/logs/${req.body.appName}.console.log`
                )}`
            ),
        });
});
