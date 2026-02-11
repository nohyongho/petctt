const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/CouponController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// 주변 쿠폰 조회
router.get('/nearby', authenticateToken, CouponController.getNearby);

// 쿠폰 발행 (관리자)
router.post('/issue', authenticateToken, requireAdmin, CouponController.issueCoupon);

module.exports = router;
