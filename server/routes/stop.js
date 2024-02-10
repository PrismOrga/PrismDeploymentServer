const { stopApp } = require(`${SERVER_ROOTFOLDER}/appsManagement`);

const { authenticateJWT } = require(`${SERVER_ROOTFOLDER}/jwtAuthChecker`);

ROUTER.post("/stop", authenticateJWT, async (req, res) => {
    const { status, json } = stopApp(req.body.appName);

    if (!json) return res.sendStatus(status);
    return res.status(status).json(json);
});
