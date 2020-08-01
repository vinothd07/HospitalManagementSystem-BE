"use strict";
var controller = require("./../controllers/main.controller");
var db = require("./../config/db-config");
var serverJWT_Secret = db.serverJWT_Secret;
const jwt = require('jsonwebtoken');

module.exports = function (app) {

    // user: doctor 
    app.get('/main/api/get_all_appointments/:user_id/:location_id', jwtMiddlewareAuth, controller.getAllAppointments);
    app.put('/main/api/update_appointment/:appointment_id/:status', jwtMiddlewareAuth, controller.updateAppointment);

    // user:patient
    app.get('/main/api/get_all_locations', jwtMiddlewareAuth, controller.getAllLocations);
    app.get('/main/api/get_doctors/:location_id', jwtMiddlewareAuth, controller.getDoctors);
    app.post('/main/api/create_appointment', jwtMiddlewareAuth, controller.createAppointment);
    app.post('/main/api/user/login', controller.loginUser);

    // dashboard charts
    app.get('/main/api/main_graph/:user_id', jwtMiddlewareAuth, controller.mainGraph);
    app.get('/main/api/cards/:user_id', jwtMiddlewareAuth, controller.cardGraph);
    app.get('/main/api/pie/:user_id', jwtMiddlewareAuth, controller.pieGraph);
}

const jwtMiddlewareAuth = (req, res, next) => {
  	const authString = req.headers['authorization'];
  	if(typeof authString === 'string' && authString.indexOf(' ') > -1) {
	    const authArray = authString.split(' ');
	    const token = authArray[1];
	    jwt.verify(token, serverJWT_Secret, (err, decoded) => {
	      	if(err) {
	        	res.sendStatus(403);
	      	} else {
	        	req.decoded = decoded;
	        	next();
	      	}
	    });
  	} else {
    	res.sendStatus(403);
  	}
};