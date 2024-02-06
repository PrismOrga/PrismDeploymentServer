global.CHILD = require("child_process");

require("./server/routes/client");
require("./server/routes/start");
require("./server/routes/stop");
require("./server/routes/rcon");
