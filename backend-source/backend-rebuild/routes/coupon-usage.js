const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/WalletController');
const { authenticateToken } = require('../middleware/auth');

// 쿠폰 사용
router.post('/redeem', authenticateToken, WalletController.redeemCoupon);

// LP URL 리다이렉트
router.get('/redirect/:collected_id', WalletController.redirectToLP);

module.exports = router;
