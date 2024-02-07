const Convert = require("ansi-to-html");
const convert = new Convert();

ROUTER.get("/", (req, res) => {
    APP.use(EXPRESS.static(`${BUILD_ROOTFOLDER}/client/src/homePage`));
    APP.use(EXPRESS.static(`${CLIENT_ROOTFOLDER}/public`));
    res.sendFile(`${BUILD_ROOTFOLDER}/client/src/homePage/home.html`);
});

ROUTER.get("/apps", (req, res) => {
    res.sendFile(`${SERVER_ROOTFOLDER}/data/apps.json`);
});

ROUTER.post("/currentLog", (req, res) => {
    console.log(
        `${SERVER_ROOTFOLDER}/data/logs/${req.body.appName}.console.log`
    );
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
