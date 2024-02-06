const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const fs = require("fs");

const port = process.env.PORT || 22000;

if (!fs.existsSync(`${__dirname}/data`)) fs.mkdirSync(`${__dirname}/data`);
if (!fs.existsSync(`${__dirname}/data/apps.json`))
    fs.writeFileSync(`${__dirname}/data/apps.json`, "[]");
if (!fs.existsSync(`${__dirname}/data/logs`))
    fs.mkdirSync(`${__dirname}/data/logs`);
if (!fs.existsSync(`${__dirname}/data/logs/_old`))
    fs.mkdirSync(`${__dirname}/data/logs/_old`);
if (!fs.existsSync(`${__dirname}/apps`)) fs.mkdirSync(`${__dirname}/apps`);

let apps = JSON.parse(
    fs.readFileSync(`${__dirname}/data/apps.json`, { encoding: "utf-8" })
);

for (let app = 0; app < apps.length; app++) {
    let appPath = apps[app].location[0] == "/" ? `${apps[app].location}` : `${__dirname}/${apps[app].location}`;

    if (!fs.existsSync(appPath)) {
        apps[app].status = -1;
        console.error(
            `ERROR: ${appPath}: no such file or directory.`
        );
    }
}

fs.writeFileSync(`${__dirname}/data/apps.json`, JSON.stringify(apps));

global.app = express();
global.router = express.Router();
global.launchedApps = new Array();

app.use(morgan("combined"));
app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(favicon(__dirname + "/client/public/favicon.ico"));
app.use(router);

app.listen(port, () => console.log("Server app listening on port " + port));

require("./routes");
