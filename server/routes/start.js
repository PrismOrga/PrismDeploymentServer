const { authenticateJWT } = require(`${SERVER_ROOTFOLDER}/jwtAuthChecker`);
const { startApp } = require(`${SERVER_ROOTFOLDER}/appsManagement`);

ROUTER.post("/start", authenticateJWT, (req, res) => {
    return res.sendStatus(startApp(req.body.appName));
});
