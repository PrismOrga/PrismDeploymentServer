ROUTER.get("/", (req, res) => {
    APP.use(EXPRESS.static(`${BUILD_ROOTFOLDER}/client/src/homePage`));
    APP.use(EXPRESS.static(`${CLIENT_ROOTFOLDER}/public`));
    res.sendFile(`${BUILD_ROOTFOLDER}/client/src/homePage/home.html`);
});

ROUTER.get("/apps", (req, res) => {
    res.sendFile(`${SERVER_ROOTFOLDER}/data/apps.json`);
});
