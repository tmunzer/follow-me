var express = require('express');
var router = express.Router();
var API = require("./../bin/aerohive/api/main");

var devAccount = require("../config").devAccount;
var serverHostname = require("../config.js").appServer.vhost;

function checkApi(req, res, next) {
    if (req.session.xapi) next();
    else res.status(401).send({ error: "Session not found" });
}


function sendError(res, request, err) {
    var errStatus = 500;
    if (err.status > 0 && err.status < 500) errStatus = err.status;
    res.status(err.status).send({ error: err, request: request });
}
function sendSuccess(res, response, request) {
    res.json({ response: response, request: request });
}
function sendReponse(res, err, response, request) {
    if (err) sendError(res, request, err);
    else sendSuccess(res, response, request);
}
/**
 * CONFIGURATION Location
 */
router.get("/configuration/apiLocationFolder", checkApi, function (req, res) {
    if (req.query.locationId) {
        API.configuration.locations.location(req.session.xapi, devAccount, req.query.locationId, function (err, response, request) {
            sendReponse(res, err, response, request);
        })
    } else res.status(500).send({ error: "locationId has to passed into request query." });
})
router.get("/configuration/apiLocationFolders", checkApi, function (req, res, next) {
    API.configuration.locations.locations(req.session.xapi, devAccount, function (err, response, request) {
        sendReponse(res, err, response, request);
    })
})

/**
 * IDENTITY
 */
router.get("/identity/credentials", checkApi, function (req, res, next) {
    API.identity.credentials.getCredentials(req.session.xapi, devAccount, null, null, null, null, null, null, null, null, null, null, null, null, function (err, response, request) {
        sendReponse(res, err, response, request);
    })
})
router.get("/identity/userGroups", checkApi, function (req, res, next) {
    API.identity.userGroups.getUserGroups(req.session.xapi, devAccount, null, null, function (err, response, request) {
        sendReponse(res, err, response, request);
    })
})


/**
 * MONITOR
 */
router.get("/monitor/client", checkApi, function (req, res, next) {
    if (req.query.clientId) {
        API.monitor.clients.client(req.session.xapi, devAccount, req.query.clientId, null, function (err, response, request) {
            sendReponse(res, err, response, request);
        })
    } else res.status(500).send({ error: "clientId has to passed into request query." });
})
router.get("/monitor/clients", checkApi, function (req, res, next) {
    API.monitor.clients.clients(req.session.xapi, devAccount, null, function (err, response, request) {
        sendReponse(res, err, response, request);
    })
})

router.get("/monitor/device", checkApi, function (req, res, next) {
    if (req.query.deviceId) {
        API.monitor.devices.device(req.session.xapi, devAccount, req.query.deviceId, null, function (err, response, request) {
            sendReponse(res, err, response, request);
        })
    } else res.status(500).send({ error: "deviceId has to passed into request query." });
})
router.get("/monitor/devices", checkApi, function (req, res, next) {
    API.monitor.devices.devices(req.session.xapi, devAccount, null, function (err, response, request) {
        sendReponse(res, err, response, request);
    })
})

/*
function getClients(qs, cb){
    let paginationOffset = 0;
    let clientsCount = 0;
    let clientsTotal = 1;
    while (clientsCount < clientsTotal){
        API.monitor.clients.clients(req.session.xapi, devAccount, qs, function (err, response, request) {
            if (err) InitDone(req, res, err);
    }

}
/**
 * INIT
*/
function InitDone(req, res, err) {
    if (err) sendError(res, req, err);
    else if (req.session.locations && req.session.devices && req.session.clients)
        res.json({ locations: req.session.locations, devices: req.session.devices, clients: req.session.clients });
}
router.get("/init", checkApi, function (req, res, next) {
    req.session.location = undefined;
    req.session.devices = undefined;
    req.session.clients = undefined;
    const endTime = new Date();
    const startTime = new Date(new Date().setHours(endTime.getHours() - 96));
    console.log(startTime, endTime);
    qs = [
        { 'key': 'startTime', 'value': startTime.toISOString() },
        { 'key': 'endTime', 'value': endTime.toISOString() }
    ];

    API.configuration.locations.locations(req.session.xapi, devAccount, function (err, response, request) {
        if (err) InitDone(req, res, err);
        else {
            req.session.locations = response;
            InitDone(req, res);
        }
    })
    API.monitor.devices.devices(req.session.xapi, devAccount, qs, function (err, response, request) {
        if (err) InitDone(req, res, err);
        else {
            req.session.devices = response;
            InitDone(req, res);
        }
    })
    API.monitor.clients.clients(req.session.xapi, devAccount, qs, function (err, response, request) {
        if (err) InitDone(req, res, err);
        else {
            let clientsObject = {};
            let clients = [];
            let session;
            if (response.length > 0) {
                response.forEach(function (session) {
                    //console.log(session.clientId, clientsObject[session.clientId]);
                    if (clientsObject[session.clientId] != undefined) {
                        clientsObject[session.clientId].sessions.push(session);
                        clientsObject[session.clientId].usage += session.usage;
                        if (clientsObject[session.clientId].ip.indexOf(session.ip) < 0) clientsObject[session.clientId].ip.push(session.ip);
                    } else clientsObject[session.clientId] = {
                        'clientId': session.clientId,
                        'clientMac': session.clientMac,
                        'hostName': session.hostName,
                        'usage': session.usage,
                        'ip': [session.ip],
                        'sessions': [session],
                        'wireless': false,
                        'wired': false
                    }
                    if (session.connectionType == "WIRELESS") clientsObject[session.clientId].wireless = true;
                    else if (session.connectionType == "WIRED") clientsObject[session.clientId].wired = true;
                });
                const clientsIds = Object.keys(clientsObject);
                clientsIds.forEach(function (clientsId) {
                    clients.push(clientsObject[clientsId]);
                });
            }
            req.session.clients = clients;
            InitDone(req, res);
        }
    })
})
module.exports = router;
