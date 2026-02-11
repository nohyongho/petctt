var express = require('express');
var router = express.Router();
const AuthController = require('../controllers/AuthController');
const authGaurd = require('../middleware/authGaurd');
const TransactionController = require('../controllers/TransactionController');



router.get('/', function(req, res, next) {
    res.send('Invalid Path');
});

router.get('/getadminWallets', function(req, res, next) {
    TransactionController().getadminWallets(req, res);
});
router.post('/sendfiat', authGaurd.authenticatePrivate, function(req, res, next) {
    TransactionController().sendfiat(req, res);
});
router.post('/sendcrypto', authGaurd.authenticatePrivate, function(req, res, next) {
    TransactionController().sendcrypto(req, res);
});
router.post('/Topupwalletcrypto', authGaurd.authenticatePrivate, function(req, res, next) {
    TransactionController().Topupwalletcrypto(req, res);
});
router.post('/Topupwalletfiat', authGaurd.authenticatePrivate, function(req, res, next) {
    TransactionController().Topupwalletfiat(req, res);
});


router.post('/TransactionHistoryCrypto', authGaurd.authenticatePrivate, function(req, res, next) {
    TransactionController().TransactionHistoryCrypto(req, res);
});
router.post('/TransactionHistoryFiat', authGaurd.authenticatePrivate, function(req, res, next) {
    TransactionController().TransactionHistoryFiat(req, res);
});
router.post('/CancelTransactionCrypto', authGaurd.authenticatePrivate, function(req, res, next) {
    TransactionController().CancelTransactionCrypto(req, res);
});
router.post('/CancelTransactionFiat', authGaurd.authenticatePrivate, function(req, res, next) {
    TransactionController().CancelTransactionFiat(req, res);
});


module.exports = router;