var express = require('express');
var router = express.Router();
const OrderController = require('../controllers/OrderController');
const authGaurd = require('../middleware/authGaurd');

router.get('/', function (req, res, next) {
    res.send('Try another route');
});

router.post('/createOrder', authGaurd.authenticatePrivate, function (req, res, next) {
    OrderController().createOrder(req, res);
});

router.post('/getOrderById', authGaurd.authenticatePrivate, function (req, res, next) {
    OrderController().getOrderById(req, res);
});

router.post('/getAllOrders', authGaurd.authenticatePrivate, function (req, res, next) {
    OrderController().getAllOrders(req, res);
});

router.post('/cancelOrder', authGaurd.authenticatePrivate, function (req, res, next) {
    OrderController().cancelOrder(req, res);
});

module.exports = router;