const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');

// 회원가입
router.post('/register', AuthController.register);

// 로그인
router.post('/login', AuthController.login);

// 프로필 조회 (인증 필요)
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;
