"use strict";
var mainModel = require("./../models/main.model");
var db = require("./../config/db-config");
var serverJWT_Secret = db.serverJWT_Secret;

// doctor
exports.getAllAppointments = function (req, res) {
	var user_id= req.params.user_id,
		location_id= req.params.location_id;
	mainModel.getAllAppointments(user_id, location_id, function (err, result) {
        if (err) res.send(err);
        res.send(result);
	});
};

exports.updateAppointment = function (req, res) {
	var appointment_id= req.params.appointment_id,
		status= req.params.status;
	mainModel.updateAppointment(appointment_id, status, function (err, result) {
        if (err) res.send(err);
        res.send(result);
	});
};


// patient
exports.getAllLocations = function (req, res) {
	mainModel.getAllLocations(function (err, result) {
        if (err) res.send(err);
        res.send(result);
	});
};
exports.getDoctors = function (req, res) {
	var location_id= req.params.location_id;
	mainModel.getDoctors(location_id, function (err, result) {
        if (err) res.send(err);
        res.send(result);
	});
};
exports.createAppointment = function (req, res) {
	var data= req.body;
	mainModel.createAppointment(data, function (err, result) {
        if (err) res.send(err);
        res.send(result);
	});
};


// login
exports.loginUser = function (req, res) {
	var data = req.body;
	mainModel.loginUser(data, function (err, result) {
        if (err) res.send(err);
        res.send(result);
	});
}


// dashboard charts
exports.mainGraph = function (req, res) {
	var user_id= req.params.user_id;
	mainModel.mainGraph(user_id, function (err, result) {
        if (err) res.send(err);
        res.send(result);
	});
}
exports.cardGraph = function (req, res) {
	var user_id= req.params.user_id;
	mainModel.cardGraph(user_id, function (err, result) {
        if (err) res.send(err);
        res.send(result);
	});
}
exports.pieGraph = function (req, res) {
	var user_id= req.params.user_id;
	mainModel.pieGraph(user_id, function (err, result) {
        if (err) res.send(err);
        res.send(result);
	});
}