var express = require('express');
var router = express.Router();
const OrdersController = require('../controllers/OrdersController');
const authGaurd = require('../middleware/authGaurd');
//const response = require('../helper/response');

/** Library */
const multer = require('multer');
const path = require('path');

/* GET orders listing */
router.post('/orderList', authGaurd.authenticatePrivate, function (req, res, next) {
  OrdersController().ordersList(req, res);
});



/* Order status update */
router.post('/updateorderstatus', authGaurd.authenticatePrivate, function (req, res, next) {
  OrdersController().updateorderstatus(req, res);
});







module.exports = router;
