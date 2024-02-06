global.EXPRESS = require("express");
global.FS = require("fs");

const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");

const port = process.env.PORT || 22000;

global.ROOTFOLDER = __dirname;

if (!FS.existsSync(`${ROOTFOLDER}/server/data`))
    FS.mkdirSync(`${ROOTFOLDER}/server/data`);
if (!FS.existsSync(`${ROOTFOLDER}/server/data/apps.json`))
    FS.writeFileSync(`${ROOTFOLDER}/server/data/apps.json`, "[]");
if (!FS.existsSync(`${ROOTFOLDER}/server/data/logs`))
    FS.mkdirSync(`${ROOTFOLDER}/server/data/logs`);
if (!FS.existsSync(`${ROOTFOLDER}/server/data/logs/_old`))
    FS.mkdirSync(`${ROOTFOLDER}/server/data/logs/_old`);
if (!FS.existsSync(`${ROOTFOLDER}/apps`)) FS.mkdirSync(`${ROOTFOLDER}/apps`);

let apps = JSON.parse(
    FS.readFileSync(`${ROOTFOLDER}/server/data/apps.json`, {
        encoding: "utf-8",
    })
);

for (let app = 0; app < apps.length; app++) {
    let appPath =
        apps[app].location[0] == "/"
            ? `${apps[app].location}`
            : `${ROOTFOLDER}/${apps[app].location}`;

    if (!FS.existsSync(appPath)) {
        apps[app].status = -1;
        console.error(`ERROR: ${appPath}: no such file or directory.`);
    }
}

FS.writeFileSync(`${ROOTFOLDER}/server/data/apps.json`, JSON.stringify(apps));

global.APP = EXPRESS();
global.ROUTER = EXPRESS.Router();
global.LAUNCHED_APPS = new Array();

APP.use(morgan("combined"));
APP.use(cors());
APP.use(bodyParser.json());
APP.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

APP.use(favicon(ROOTFOLDER + "/client/public/favicon.ico"));
APP.use(ROUTER);

APP.listen(port, () => console.log("Server app listening on port " + port));

require("./routes");
