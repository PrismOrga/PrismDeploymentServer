ROUTER.get("/", (req, res) => {
    APP.use(EXPRESS.static(`${ROOTFOLDER}/client/public`));
    APP.use(EXPRESS.static(`${ROOTFOLDER}/client/src/homePage`));
    res.sendFile(`${ROOTFOLDER}/client/src/homePage/home.html`);
});

ROUTER.get("/apps", (req, res) => {
    res.sendFile(`${ROOTFOLDER}/server/data/apps.json`);
});
