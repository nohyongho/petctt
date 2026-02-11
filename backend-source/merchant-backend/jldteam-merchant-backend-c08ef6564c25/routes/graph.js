var express = require('express');
var router = express.Router();
const GraphController = require('../controllers/GraphController');
const authGaurd = require('../middleware/authGaurd');


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Try another route');
});

/* GET users listing. */
router.get('/registeredUser', authGaurd.authenticatePrivate, function (req, res, next) {
    GraphController().registeredUser(req, res);
});

router.get('/roleBasedUserSummary', authGaurd.authenticatePrivate, function (req, res, next) {
    GraphController().roleBasedUserSummary(req, res);
});

router.get('/collectedCouponSummary', authGaurd.authenticatePrivate, function (req, res, next) {
    GraphController().collectedCouponSummary(req, res);
});

router.get('/couponCategorySummary', authGaurd.authenticatePrivate, function (req, res, next) {
    GraphController().couponCategorySummary(req, res);
});


module.exports = router;
