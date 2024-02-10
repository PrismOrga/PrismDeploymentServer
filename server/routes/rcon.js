const {
    rconCommandHandler,
} = require(`${SERVER_ROOTFOLDER}/appsManagement`);
const { authenticateJWT } = require(`${SERVER_ROOTFOLDER}/jwtAuthChecker`);

ROUTER.post("/rcon", authenticateJWT, async (req, res) => {
    return res.sendStatus(await rconCommandHandler(req.body.appName, req.body.rconCommand));
});
