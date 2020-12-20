const express = require("express");
var cors = require('cors')


const app = express(); app.get("/main.js", function (req, res) {
    res.sendFile(__dirname + "/main.js");
});

app.use(cors())

app.listen(3000, function () {
    console.log("Server is running on localhost:3000");
});
