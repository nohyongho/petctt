const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/WalletController');
const { authenticateToken } = require('../middleware/auth');

// 내 쿠폰 목록
router.get('/coupons', authenticateToken, WalletController.getMyCoupons);

module.exports = router;
