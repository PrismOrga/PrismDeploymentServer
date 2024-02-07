ROUTER.get("/", (req, res) => {
    APP.use(EXPRESS.static(`${CLIENT_ROOTFOLDER}/src/homePage`));
    APP.use(EXPRESS.static(`${CLIENT_ROOTFOLDER}/public`));
    res.sendFile(`${CLIENT_ROOTFOLDER}/src/homePage/home.html`);
});

ROUTER.get("/apps", (req, res) => {
    res.sendFile(`${SERVER_ROOTFOLDER}/data/apps.json`);
});
