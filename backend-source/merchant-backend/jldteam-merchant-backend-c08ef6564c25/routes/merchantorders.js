var express = require('express');
var router = express.Router();
const MerchantOrdersController = require('../controllers/MerchantOrdersController');
const authGaurd = require('../middleware/authGaurd');
//const response = require('../helper/response');

/** Library */
const multer = require('multer');
const path = require('path');




/* Order txid update */
router.post('/updateordertxid', authGaurd.authenticatePrivate, function (req, res, next) {
  MerchantOrdersController().updateordertransactionid(req, res);
});







module.exports = router;
