var express = require('express');
var router = express.Router();

/*================================================================
 ENTRY POINT
 ================================================================*/
router.get('/', function (req, res) {
    if (req.session.xapi) {
        res.render('web-app', {
            title: 'Follow Me',
            vpcUrl: req.session.xapi.vpcUrl,
            ownerId: req.session.xapi.ownerId,
            accessToken: req.session.xapi.accessToken,
            type: req.session.xapi.type
        });
    } else res.redirect("/");
});
module.exports = router;
