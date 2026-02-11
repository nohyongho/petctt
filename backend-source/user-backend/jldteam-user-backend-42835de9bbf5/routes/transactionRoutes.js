var express = require('express');
var router = express.Router();
const TransactionController = require('../controllers/TransactionController');
const authGaurd = require('../middleware/authGaurd');

router.get('/', function (req, res, next) {
    res.send('Try another route');
});


router.post('/getCryptoTxns', authGaurd.authenticatePrivate, function (req, res, next) {
    TransactionController().getCryptoTxns(req, res);
});


router.post('/getFiatTxns', authGaurd.authenticatePrivate, function (req, res, next) {
    TransactionController().getFiatTxns(req, res);
});

router.post('/updatePendingFiatBankTxn', authGaurd.authenticatePrivate, function (req, res, next) {
    TransactionController().updatePendingFiatBankTxn(req, res);
});

module.exports = router;