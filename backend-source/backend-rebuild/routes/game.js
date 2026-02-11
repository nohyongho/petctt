const express = require('express');
const router = express.Router();
const GameController = require('../controllers/GameController');
const { authenticateToken } = require('../middleware/auth');

// 쿠폰 획득 (게임 보상)
router.post('/reward/claim', authenticateToken, GameController.claimReward);

module.exports = router;
