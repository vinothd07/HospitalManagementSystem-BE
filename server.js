"use strict";
var express = require("./config/express");
var app = express();

var server = app.listen(3000, '0.0.0.0', function () {
    console.log("Server running on port 3000..!!");
});


