global.CHILD = require("child_process");

require(`${SERVER_ROOTFOLDER}/routes/client`);
require(`${SERVER_ROOTFOLDER}/routes/start`);
require(`${SERVER_ROOTFOLDER}/routes/stop`);
require(`${SERVER_ROOTFOLDER}/routes/rcon`);
require(`${SERVER_ROOTFOLDER}/routes/login`);
