var express = require('express');
var router = express.Router();
const CouponController = require('../controllers/CouponController');
const authGaurd = require('../middleware/authGaurd');

router.get('/', function (req, res, next) {
  res.send('Invalid Path');
});

router.post('/getCoupons', function (req, res, next) {
  CouponController().getCoupons(req, res);
});

router.post('/collectCoupon', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().collectCoupon(req, res);
});

router.post('/getCollectedCouponHistory', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().getCollectedCouponHistory(req, res);
});

router.post('/getCouponsByOutlet', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().getCouponsByOutlet(req, res);
});

router.post('/getCouponsTest', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().getCouponsTest(req, res);
});

router.get('/getCollectedCouponsList', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().getCollectedCouponsList(req, res);
})

router.post('/redeemptionQR', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().redeemptionQR(req, res);
})

router.post('/redeemCoupons', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().redeemCoupons(req, res);
})

router.get('/walletDetail', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().walletDetail(req, res);
})

router.get('/outletSummary', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().outletSummary(req, res);
})

router.post('/hideCollectedCoupon', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().hideCollectedCoupon(req, res);
})

router.post('/getOutletsWithCoupons', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().getOutletsWithCoupons(req, res);
})

router.post('/deleteCollectedCoupon', authGaurd.authenticatePrivate, function (req, res, next) {
  CouponController().deleteCollectedCoupon(req, res);
})

module.exports = router;