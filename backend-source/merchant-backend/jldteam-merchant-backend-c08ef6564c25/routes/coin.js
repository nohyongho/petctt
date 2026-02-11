var express = require('express');
var router = express.Router();
const CoinController = require('../controllers/CoinController');
const authGaurd = require('../middleware/authGaurd');
//const response = require('../helper/response');

/** Library */
const multer = require('multer');
const path = require('path');

/* GET orders listing */
router.get('/coinsList', authGaurd.authenticatePrivate, function (req, res, next) {
  CoinController().coinslist(req, res);
});









module.exports = router;
