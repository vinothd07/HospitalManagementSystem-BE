"use strict";
var express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
	methodOverride = require("method-override");
;

module.exports = function () {
    var app = express();
    app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());
	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
		next();
	});

    require("./../routes/main.routes")(app);
    return app;
};

