var express = require('express');
var router = express.Router();
const OutletController = require('../controllers/OutletController');
const authGaurd = require('../middleware/authGaurd');


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Try another route');
});

/* GET users listing. */
router.post('/allOutletList', authGaurd.authenticatePrivate, function (req, res, next) {
    OutletController().allOutletList(req, res);
});

/* GET users listing. */
router.post('/createOutlet', authGaurd.authenticatePrivate, function (req, res, next) {
    console.log(req)
    OutletController().createOutlet(req, res);
});

router.post('/getOutletItems',  function (req, res, next) {
    OutletController().getOutletItems(req, res);
});

router.post('/getNearByOutlets',  function (req, res, next) {
    OutletController().getNearByOutlets(req, res);
});

router.post('/getNearByOutletsTyped',  function (req, res, next) {
    OutletController().getNearByOutletsTyped(req, res);
});

module.exports = router;
