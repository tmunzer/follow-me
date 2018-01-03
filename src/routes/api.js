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
    if (response.error.status > 0 && err.status < 500) errStatus = err.status;
    res.status(response.error.status).send({ error: err, request: request });
}
function sendSuccess(res, response, request) {
    res.json({ response: response, request: request });
}
function sendReponse(res, response, request) {
    if (response.error) sendError(res, request, response.error);
    else sendSuccess(res, response.data, request);
}
/**
 * CONFIGURATION Location
 */
router.get("/configuration/apiLocationFolder", checkApi, function (req, res) {
    if (req.query.locationId) {
        API.configuration.locations.location(req.session.xapi, devAccount, req.query.locationId, function (response, request) {
            sendReponse(res, response, request);
        })
    } else res.status(500).send({ error: "locationId has to passed into request query." });
})
router.get("/configuration/apiLocationFolders", checkApi, function (req, res, next) {
    API.configuration.locations.locations(req.session.xapi, devAccount, function (response, request) {
        sendReponse(res, response, request);
    })
})


/**
 * IDENTITY
 */
router.get("/identity/credentials", checkApi, function (req, res, next) {
    API.identity.credentials.getCredentials(req.session.xapi, devAccount, null, null, null, null, null, null, null, null, null, null, null, null, function (response, request) {
        sendReponse(res, response, request);
    })
})
router.get("/identity/userGroups", checkApi, function (req, res, next) {
    API.identity.userGroups.getUserGroups(req.session.xapi, devAccount, null, null, function (response, request) {
        sendReponse(res, response, request);
    })
})


/**
 * MONITOR
 */
router.get("/monitor/client", checkApi, function (req, res, next) {
    if (req.query.clientId) {
        API.monitor.clients.client(req.session.xapi, devAccount, req.query.clientId, null, function (response, request) {
            sendReponse(res, response, request);
        })
    } else res.status(500).send({ error: "clientId has to passed into request query." });
})
router.get("/monitor/clients", checkApi, function (req, res, next) {
    API.monitor.clients.clients(req.session.xapi, devAccount, null, function (response, request) {
        sendReponse(res, response, request);
    })
})

router.get("/monitor/device", checkApi, function (req, res, next) {
    if (req.query.deviceId) {
        API.monitor.devices.device(req.session.xapi, devAccount, req.query.deviceId, null, function (response, request) {
            sendReponse(res, response, request);
        })
    } else res.status(500).send({ error: "deviceId has to passed into request query." });
})
router.get("/monitor/devices", checkApi, function (req, res, next) {
    API.monitor.devices.devices(req.session.xapi, devAccount, null, function (response, request) {
        sendReponse(res, response, request);
    })
})


function getClients(req, res, qsParam, cb, clientsParam, clientsCountParam) {
    let clients = clientsParam || [];
    let clientsCount = clientsCountParam || 0;

    API.monitor.clients.clients(req.session.xapi, devAccount, qs, function (response, request) {
        console.log(response.pagination);
        if (response.error) InitDone(req, res, response.error);
        else {
            for (var i = 0; i < response.data.length; i++) {
                clients.push(response.data[i])
                clientsCount += 1;
            }
            for (var i = 0; i < qs.length; i++) {
                if (qs[i].key == 'page') qs[i].value += 1;
            }
            if (clientsCount < response.pagination.totalCount)
                getClients(req, res, qs, cb, clients, clientsCount);
            else cb(clients);
        }
    });


}
/**
 * INIT
*/
function InitDone(req, res, err) {
    if (err) sendError(res, req, err);
    else if (req.session.locations && req.session.devices && req.session.clients)
        res.json({
            locations: req.session.locations,
            devices: req.session.devices,
            clients: req.session.clients,
            concurentSessions: req.session.concurentSessions,
            averageConcurentSessions: req.session.averageConcurentSessions,
            os: req.session.os
        });
}

function alignSessionTime(sessionTime, delta) {
    let resultMinutes, result;
    const minutes = new Date(sessionTime).getMinutes()
    const minutesMod = minutes % delta;
    const secondes = new Date(sessionTime).getSeconds() + 60 * minutesMod;
    const deltaSec = delta * 60 / 2;
    if (secondes - deltaSec <= 0) resultMinutes = minutes - minutesMod;
    else if (secondes - deltaSec > 0) resultMinutes = minutes + delta - minutesMod;
    result = new Date(sessionTime).setMinutes(resultMinutes);
    result = new Date(result).setSeconds(00);
    result = new Date(result).setMilliseconds(00);
    return new Date(result).getTime();
}
function calculateConcurent(req, session) {
    if (new Date(session.sessionStart) > new Date(0)) {
        const delta = 5;
        const deltams = 60000 * delta; // x minutes
        const endTime = alignSessionTime(session.sessionEnd, delta);
        const startTime = alignSessionTime(session.sessionStart, delta);
        for (var time = startTime; time <= endTime; time += deltams) {
            if (!req.session.concurentSessions[time]) req.session.concurentSessions[time] = { count: 1, list: [session.clientId] };
            else if (req.session.concurentSessions[time].list.indexOf(session.clientId) < 0) {
                req.session.concurentSessions[time].count += 1;
                req.session.concurentSessions[time].list.push(session.clientId);
            }
        }
    }
}
function calculateAvergaeConcurent(req) {
    let hours, minutes, index;
    let averageConcurentSessions = {};
    for (var key in req.session.concurentSessions) {
        hours = new Date(parseInt(key)).getHours();
        minutes = new Date(parseInt(key)).getMinutes();
        index = hours + ":" + minutes;
        if (!averageConcurentSessions[index])
            averageConcurentSessions[index] = {
                count: 1,
                total: req.session.concurentSessions[key].count,
                max: req.session.concurentSessions[key].count
            }
        else {
            averageConcurentSessions[index].count += 1;
            averageConcurentSessions[index].total += req.session.concurentSessions[key].count
            if (req.session.concurentSessions[key].count > averageConcurentSessions[index].max)
                averageConcurentSessions[index].max = req.session.concurentSessions[key].count
        }
    }
    for (var key in averageConcurentSessions) {
        averageConcurentSessions[key].average = averageConcurentSessions[key].total / averageConcurentSessions[key].count;
    }
    req.session.averageConcurentSessions = averageConcurentSessions;
}
router.get("/init", checkApi, function (req, res, next) {
    let endTime, startTime;
    if (req.query.endTime && req.query.startTime) {
        endTime = req.query.endTime;
        startTime = req.query.startTime;
    } else {
        endTime = new Date();
        startTime = new Date(new Date().setHours(endTime.getHours() - 96));
        endTime = endTime.toISOString();
        startTime = startTime.toISOString();
    }
    qs = [
        { 'key': 'startTime', 'value': startTime },
        { 'key': 'endTime', 'value': endTime },
        { 'key': 'page', 'value': 0 }
    ];
    if (req.session.sessionStart == startTime && req.session.sessionEnd == endTime) InitDone(req, res);
    else {
        req.session.locations = undefined;
        req.session.devices = undefined;
        req.session.clients = undefined;
        req.session.os = {};
        req.session.concurentSessions = {};
        req.session.averageConcurentSessions = {};
        req.session.sessionStart = startTime;
        req.session.sessionEnd = endTime;

        API.configuration.locations.locations(req.session.xapi, devAccount, function (response, request) {
            if (response.error) InitDone(req, res, response.error);
            else {
                req.session.locations = response;
                InitDone(req, res);
            }
        })
        API.monitor.devices.devices(req.session.xapi, devAccount, qs, function (response, request) {
            if (response.error) InitDone(req, res, response.errorresponse.error);
            else {
                req.session.devices = response;
                InitDone(req, res);
            }
        })

        getClients(req, res, qs, function (response, request) {
            let clientsObject = {};
            let clients = [];
            let sessions = {};
            let concurentSessions = {};
            if (response.length > 0) {
                response.forEach(function (session) {
                    //console.log(session.clientId, clientsObject[session.clientId]);
                    if (clientsObject[session.clientId] != undefined) {
                        clientsObject[session.clientId].sessions += 1;
                        clientsObject[session.clientId].usage += session.usage;
                        if (clientsObject[session.clientId].ip.indexOf(session.ip) < 0) clientsObject[session.clientId].ip.push(session.ip);
                        sessions[session.clientId].push(session);
                    } else {
                        clientsObject[session.clientId] = {
                            'clientId': session.clientId,
                            'clientMac': session.clientMac,
                            'hostName': session.hostName,
                            'usage': session.usage,
                            'ip': [session.ip],
                            'os': session.os,
                            'sessions': 1,
                            'wireless': false,
                            'wired': false
                        }
                        sessions[session.clientId] = [session];
                        if (req.session.os[session.os]) req.session.os[session.os] += 1;
                        else req.session.os[session.os] = 1
                    }
                    if (session.connectionType == "WIRELESS") clientsObject[session.clientId].wireless = true;
                    else if (session.connectionType == "WIRED") clientsObject[session.clientId].wired = true;
                    console.log("concur");
                    calculateConcurent(req, session);
                });
                console.log("average");
                calculateAvergaeConcurent(req);
                const clientsIds = Object.keys(clientsObject);
                clientsIds.forEach(function (clientsId) {
                    clientsObject[clientsId].ip = clientsObject[clientsId].ip.join(", ");
                    clients.push(clientsObject[clientsId]);
                });
            }
            req.session.clients = clients;
            req.session.sessions = sessions;
            InitDone(req, res);
        });
    }
})

/**
 * GET CLIENT INFO
 */
router.get("/client", checkApi, function (req, res, next) {

    const clientId = req.query.clientId;
    let details = {}

    for (var i = 0; i < req.session.clients.length; i++) {
        if (req.session.clients[i].clientId == clientId)
            details = req.session.clients[i];
    }
    res.json({ sessions: req.session.sessions[clientId], details: details });
});


module.exports = router;
