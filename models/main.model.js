"use strict";
var db = require("./../config/db-config");
var path=require("path");
const fs = require('fs');
const jwt = require('jsonwebtoken');
var database = path.join(__dirname, db.database);


// doctor
function getAllAppointments(user_id, location_id, cb) {
    let rawdata = fs.readFileSync(database);
    let appointments = JSON.parse(rawdata).appointments;
    let users = JSON.parse(rawdata).users;
    var response_data;
    let result;
    isDoctor(user_id, function(response){
        if(response){
            response_data = appointments.filter(function(item) {
                return item.doctor_id == user_id && item.location_id == location_id;
            });
            result = innerJoin(response_data, users,
                ({_id, patient_id, location_id, date, time, status, created_at}, {_id:uid, role_id, name: patient_name, mobile: patient_mobile, email: patient_email}) =>
                    uid === patient_id && {_id, uid, role_id, patient_name, patient_mobile, patient_email, location_id, date, time, status, created_at});
        }else{
            response_data = appointments.filter(function(item) {
                return item.patient_id == user_id && item.location_id == location_id;
            });

            result = innerJoin(response_data, users,
                ({_id, doctor_id, location_id, date, time, status, created_at}, {_id:uid, role_id, name: doctor_name, mobile: doctor_mobile, email: doctor_email}) =>
                    uid === doctor_id && {_id, uid, role_id, doctor_name, doctor_mobile, doctor_email, location_id, date, time, status, created_at});
        }
    })
    cb(null, result);
}

function updateAppointment(appointment_id, status, cb) {
    let rawdata = fs.readFileSync(database);
    let datas = JSON.parse(rawdata);
    let appointments = JSON.parse(rawdata).appointments;
    var found = appointments.find(function (item) {
        return item._id == parseInt(appointment_id);
    });
    if (found) {
        let updated = {
            _id: found._id,
            patient_id: found.patient_id,
            doctor_id: found.doctor_id,
            location_id: found.location_id,
            date: found.date,
            time: found.time,
            status: status,
            created_at: found.created_at
        };

        let targetIndex = appointments.indexOf(found);
        console.log(targetIndex, JSON.stringify(updated))

        appointments.splice(targetIndex, 1, updated);

        let newData = {
            users: datas.users,
            roles: datas.roles,
            locations:datas.locations,
            appointments:appointments,
            locations:datas.locations
        }

        let data = JSON.stringify(newData, null, 2);
        fs.writeFile(database, data, (err) => {
            if (err) throw err;
            console.log('Data written to file');
            cb(null, { statusCode:200, msg:'updated' });
        });       
    }else{
        cb(null, {statusCode:404, msg:'not found'})
    }
}


// patient
function getAllLocations(cb) {
    let rawdata = fs.readFileSync(database);
    let locations = JSON.parse(rawdata).locations;
    cb(null, locations);
}

function getDoctors(location_id, cb) {
    let rawdata = fs.readFileSync(database);
    let users = JSON.parse(rawdata).users;
    var response_data = users.filter(function(user) {
        return user.location_id == location_id && user.role_id == 1;
    });
    cb(null, response_data);
}

function getDoctors(location_id, cb) {
    let rawdata = fs.readFileSync(database);
    let users = JSON.parse(rawdata).users;
    var response_data = users.filter(function(user) {
        return user.location_id == location_id && user.role_id == 1;
    });
    cb(null, response_data);
}

function createAppointment(data, cb) {   
    let rawdata = fs.readFileSync(database);
    let datas = JSON.parse(rawdata);
    let appointments = JSON.parse(rawdata).appointments;
    let itemIds = appointments.map(item => item._id);
    let newId = itemIds.length > 0 ? Math.max.apply(Math, itemIds) + 1 : 1;
    let appointment = {
        _id: newId,
        patient_id: data.patient_id,
        doctor_id: data.doctor_id,
        location_id: data.location_id,
        date: data.date,
        time: data.time,
        status: 'p',
        created_at: new Date()
    };
    appointments.push(appointment);

    let newItem = {
        users: datas.users,
        roles: datas.roles,
        locations:datas.locations,
        appointments:appointments,
        locations:datas.locations
    }
    let newData = JSON.stringify(newItem, null, 2);
    fs.writeFile(database, newData, (err) => {
        if (err) throw err;
        console.log('Data written to file');
        cb(null, { statusCode:200, msg:'created' });
    });  
}


// login
function loginUser(data, cb){
    if (data) {
        let rawdata = fs.readFileSync(database);
        let users = JSON.parse(rawdata).users;

        var user = users.filter(function(item) {
            return item.username == data.username;
        });
        if(user.length > 0){
            user = user[0];
        }
        if (user && user.password == data.password) {
            const userWithoutPassword = {...user};
            delete userWithoutPassword.password;
            const token = jwt.sign(userWithoutPassword, db.serverJWT_Secret); // <==== The all-important "jwt.sign" function
            userWithoutPassword.token = token;
            cb(null, userWithoutPassword)
        } else {
            cb(null, {code:404, errorMessage: 'Permission denied!'})
        }
    } else {
        cb(null, {code:403, errorMessage: 'Please provide username and password'})
    }
}


// dashboard charts
function mainGraph(user_id, cb) {
    let rawdata = fs.readFileSync(database);
    let appointments = JSON.parse(rawdata).appointments;
    let datas = appointments.filter(function(item) {
        return item.doctor_id == user_id;
    });
    var res = datas.reduce(function(obj, v) { //group by
        obj[v.date] = (obj[v.date] || 0) + 1;
        return obj;
    }, {})
    const objectArray = Object.entries(res);

    let tmpArr = [];
    objectArray.forEach(([key, value]) => { //object to array by key
        let obj = {
            date: key,
            count: value
        }

        tmpArr.push(obj)
    });
    let data = tmpArr.sort(function (a, b) { return new Date(b.date) - new Date(a.date); }); //sort desc by date
    cb(null, data.slice(0, 7));
}

function cardGraph(user_id, cb) {
    let rawdata = fs.readFileSync(database);
    let appointments = JSON.parse(rawdata).appointments;
    let total = appointments.filter(function(item) {
        return item.doctor_id == user_id;
    });
    let pending = appointments.filter(function(item) {
        return item.status == 'p' && item.doctor_id == user_id;
    });
    let accepted = appointments.filter(function(item) {
        return item.status == 'a' && item.doctor_id == user_id;
    });
    let rejected = appointments.filter(function(item) {
        return item.status == 'r' && item.doctor_id == user_id;
    });

    let obj = {
        total: total.length,
        pending: pending.length,
        accepted: accepted.length,
        rejected: rejected.length
    }
    const objectArray = Object.entries(obj);

    let tmpArr = [];
    objectArray.forEach(([key, value]) => { //object to array by key
        let obj = {
            name: key,
            y: value
        }
        tmpArr.push(obj)
    });
    cb(null, tmpArr);
}

function pieGraph(user_id, cb) {
    let rawdata = fs.readFileSync(database);
    let appointments = JSON.parse(rawdata).appointments;
    let total = appointments.filter(function(item) {
        return item.doctor_id == user_id;
    });
    let pending = appointments.filter(function(item) {
        return item.status == 'p' && item.doctor_id == user_id;
    });
    let accepted = appointments.filter(function(item) {
        return item.status == 'a' && item.doctor_id == user_id;
    });
    let rejected = appointments.filter(function(item) {
        return item.status == 'r' && item.doctor_id == user_id;
    });
    let cancelled = appointments.filter(function(item) {
        return item.status == 'c' && item.doctor_id == user_id;
    });

    let obj = {
        total: total.length,
        pending: pending.length,
        accepted: accepted.length,
        rejected: rejected.length,
        cancelled: cancelled.length
    }
    const objectArray = Object.entries(obj);

    let tmpArr = [];
    objectArray.forEach(([key, value]) => { //object to array by key
        if(key == 'total'){
            let obj = {
                name: key,
                y: value,
                sliced: true,
                selected: true 
            }
            tmpArr.push(obj)
        }else{
            let obj = {
                name: key,
                y: value
            }
            tmpArr.push(obj)
        }
    });
    cb(null, tmpArr);
}



// common
function isDoctor(user_id, cb) {
    let rawdata = fs.readFileSync(database);
    let users = JSON.parse(rawdata).users;
    var response_data = users.filter(function(user) {
        return user._id == user_id;
    });
    if(response_data.length > 0){
        if(response_data[0].role_id == 1){
            cb(true);
        }else{
            cb(false);
        }
    }
}

const innerJoin = (xs, ys, sel) =>
    xs.reduce((zs, x) =>
    ys.reduce((zs, y) =>       
    zs.concat(sel(x, y) || []),
    zs), []);

module.exports = {
    getAllAppointments: getAllAppointments,
    updateAppointment: updateAppointment,
    getAllLocations: getAllLocations,
    getDoctors: getDoctors,
    createAppointment: createAppointment,
    loginUser: loginUser,
    mainGraph: mainGraph,
    cardGraph: cardGraph,
    pieGraph: pieGraph
}

