var express = require('express');
var router = express.Router();
const WalletController = require('../controllers/WalletController');
const authGaurd = require('../middleware/authGaurd');

router.get('/', function (req, res, next) {
    res.send('Try another route');
});


router.get('/getITCaddress', authGaurd.authenticatePrivate, function (req, res, next) {
    WalletController().getITCaddress(req, res);
});

router.post('/getWallets', authGaurd.authenticatePrivate, function (req, res, next) {
    WalletController().getWallets(req, res);
});

router.post('/topUpCrypto', authGaurd.authenticatePrivate, function (req, res, next) {
    WalletController().topUpCrypto(req, res);
});

router.post('/sendCrypto', authGaurd.authenticatePrivate, function (req, res, next) {
    WalletController().sendCrypto(req, res);
});

router.post('/sendFiat', authGaurd.authenticatePrivate, function (req, res, next) {
    WalletController().sendFiat(req, res);
});

router.post('/topUpFiat', authGaurd.authenticatePrivate, function (req, res, next) {
    WalletController().topUpFiat(req, res);
});

router.post('/rewardToKrw', authGaurd.authenticatePrivate, function (req, res, next) {
    WalletController().rewardToKrw(req, res);
});

router.post('/krwToItc', authGaurd.authenticatePrivate, function (req, res, next) {
    WalletController().krwToItc(req, res);
});

router.post('/trnsfrITC1314TAK', function (req, res, next) {
    WalletController().transferItcFromAdminToUser(req, res);
});

router.post('/topUpITC', authGaurd.authenticatePrivate, function (req, res, next) {
    WalletController().topUpITC(req, res);
});

module.exports = router;