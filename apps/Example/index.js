const express = require("express");

const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const serveIndex = require("serve-index");
const favicon = require("serve-favicon");

const port = process.env.PORT || 22222;

global.app = express();
global.router = express.Router();

app.use(morgan("combined"));
app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(router);

app.listen(port, () => console.log("Server app listening on port " + port));
