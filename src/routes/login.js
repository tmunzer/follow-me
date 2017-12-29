var express = require('express');
var router = express.Router();
var devAccount = require("../config").devAccount;

var apiServers = ["cloud-va.aerohive.com", "cloud-va2.aerohive.com", "cloud-ie.aerohive.com"];

/*================================================================
 ROUTES
 ================================================================*/
/*================================================================
 DASHBOARD
 ================================================================*/
router.get('/', function (req, res, next) {
    if (req.session.xapi) res.redirect("/web-app/");
    else {
        var errorcode;
        if (req.query.errorcode) errorcode = req.query["errorcode"];
        res.render('login', {
            title: 'API Test Tool',
            errorcode: errorcode,
            client_id: devAccount.clientID,
            apiServers: apiServers,
            redirect_uri: devAccount.redirectUrl
        });
    }
});
router.post('/', function (req, res, next) {
    var ownerIdRegexp = new RegExp("^[0-9]*$");
    var accessTokenRegexp = new RegExp("^[^ ]{40}$");
    if (!(req.body.vpcUrl && apiServers.indexOf(req.body["vpcUrl"]) >= 0)) {
        res.redirect("/?errorcode=1");
    } else if (!(req.body.ownerId && ownerIdRegexp.test(req.body['ownerId']))) {
        res.redirect("/?errorcode=2");
    } else if (!(req.body.accessToken && accessTokenRegexp.test(req.body["accessToken"].trim()))) {
        res.redirect("/?errorcode=3");
    } else {
        req.session.xapi = {
            rejectUnauthorized: true,
            vpcUrl: req.body["vpcUrl"],
            ownerId: req.body["ownerId"],
            accessToken: req.body["accessToken"].trim(),
            hmngType: "public"
        };
        res.redirect('/web-app/');
    }
});
router.post('/op', function (req, res, next) {
    var ownerIdRegexp = new RegExp("^[0-9]*$");
    var accessTokenRegexp = new RegExp("^[^ ]{40}$");
    if (!(req.body.vpcUrl && req.body["vpcUrl"] != "")) res.redirect("/?errorcode=1");
    else if (!(req.body.ownerId) && ownerIdRegexp.test(req.body['ownerId'])) res.redirect("/?errorcode=2");
    else if (!(req.body.accessToken && accessTokenRegexp.test(req.body["accessToken"].trim()))) res.redirect("/?errorcode=3");
    else if (apiServers.indexOf(req.body["vpcUrl"]) >= 0) res.redirect('/?errorcode=4');
    else {
        req.session.xapi = {
            rejectUnauthorized: false,
            vpcUrl: req.body["vpcUrl"],
            ownerId: req.body["ownerId"],
            accessToken: req.body["accessToken"].trim(),
            hmngType: "private"
        };
        res.redirect('/web-app/');
    }
});
router.get('/howto/', function (req, res, next) {
    res.render('howto', {
        title: 'Api Test Tool',
        clientID: devAccount.clientID,
        apiServers: apiServers
    });
});
router.get('/logout/', function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) logger.error(err);
        else res.redirect('/');
    });
});
module.exports = router;
