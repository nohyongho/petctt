var express = require('express');
var router = express.Router();
const CommonController = require('../controllers/CommonController');
const authGaurd = require('../middleware/authGaurd');


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Try another route');
});

/* GET country listing. */
router.get('/getCountryList', function (req, res, next) {
    CommonController().getCountryList(req, res);
});

/** GET states list  */
router.post('/statesList', authGaurd.authenticatePrivate, function (req, res, next) {
    CommonController().statesList(req, res);
});

/**Get cities List */
router.post('/citiesList', authGaurd.authenticatePrivate, function (req, res, next) {
    CommonController().citiesList(req, res);
});

/**Get coupon categories with most popular brands. */
router.get('/getCouponCategories', authGaurd.authenticatePrivate, function (req, res, next) {
    CommonController().getCouponCategories(req, res);
});

/**Get coupon categories with most popular brands. */
router.get('/getBrandsList/:categoryId', authGaurd.authenticatePrivate, function (req, res, next) {
    CommonController().getBrandsList(req, res);
});

/**Get coupon categories with most popular brands. */
router.post('/getOutletsList', authGaurd.authenticatePrivate, function (req, res, next) {
    CommonController().getOutletsList(req, res);
});

router.post('/getBrandsListTyped', authGaurd.authenticatePrivate, function (req, res, next) {
    CommonController().getBrandsListTyped(req, res);
});

/**TEST */
router.get('/test', function (req, res, next) {
    CommonController().test(req, res);
});



module.exports = router;
