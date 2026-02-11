var express = require('express');
var router = express.Router();
const AddressController = require('../controllers/UserAddressController');
const authGaurd = require('../middleware/authGaurd');


router.get('/', function (req, res, next) {
    res.send('Try another route');
});

router.post('/addAddress', authGaurd.authenticatePrivate, function (req, res, next) {
    AddressController().addAddress(req, res);
});

router.post('/getAddresses',authGaurd.authenticatePrivate,  function (req, res, next) {
    AddressController().getAddresses(req, res);
});

router.post('/getAddressById', authGaurd.authenticatePrivate, function (req, res, next) {
    AddressController().getAddressById(req, res);
});


router.post('/updateAddress', authGaurd.authenticatePrivate, function (req, res, next) {
    AddressController().updateAddress(req, res);
});


router.post('/deleteAddress', authGaurd.authenticatePrivate, function (req, res, next) {
    AddressController().deleteAddress(req, res);
});

router.post('/setDefaultAddress', authGaurd.authenticatePrivate, function (req, res, next) {
    AddressController().setDefaultAddress(req, res);
});


module.exports = router;