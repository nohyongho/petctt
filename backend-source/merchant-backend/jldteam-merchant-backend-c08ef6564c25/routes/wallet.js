var express = require('express');
var router = express.Router();
const AuthController = require('../controllers/AuthController');
const authGaurd = require('../middleware/authGaurd');
const WalletController = require('../controllers/WalletController');



router.get('/', function (req, res, next) {
  res.send('Invalid Path');
});


router.get('/getWallets',authGaurd.authenticatePrivate, function (req, res, next) {
      WalletController().getWallets(req, res);
});

module.exports = router;
