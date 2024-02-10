const { stopApp } = require(`${SERVER_ROOTFOLDER}/appsManagement`);

const { authenticateJWT } = require(`${SERVER_ROOTFOLDER}/jwtAuthChecker`);

ROUTER.post("/stop", authenticateJWT, async (req, res) => {
    const { status } = await stopApp(req.body.appName);

    return res.sendStatus(status);
});
