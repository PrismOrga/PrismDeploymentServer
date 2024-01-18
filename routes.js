const express = require("express");

router.get("/", (req, res) => {
    app.use(express.static(__dirname + "/public"));
    res.sendFile(`${__dirname}/src/home.html`);
});
