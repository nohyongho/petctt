// ============================================
// 🔐 Authentication Routes
// POST /api/auth/register     — 이메일 회원가입
// POST /api/auth/login        — 이메일 로그인
// POST /api/auth/refresh      — 토큰 갱신
// GET  /api/auth/google       — 구글 로그인
// GET  /api/auth/kakao        — 카카오 로그인
// GET  /api/auth/naver        — 네이버 로그인
// GET  /api/auth/me           — 내 정보 조회
// POST /api/auth/logout       — 로그아웃
// ============================================
const router = require('express').Router();
const passport = require('passport');
const User = require('../models/User');
const { generateTokens, requireAuth } = require('../middleware/auth');
const { pool } = require('../config/database');

// 프론트엔드 URL
const FRONTEND = process.env.FRONTEND_URL || 'https://petctt.com';

// ──────────────────────────────────────
// 📧 이메일 회원가입
// ──────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 유효성 검사
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일과 비밀번호를 입력해주세요' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: '비밀번호는 6자 이상이어야 합니다' 
      });
    }

    // 이메일 중복 확인
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: '이미 가입된 이메일입니다' 
      });
    }

    // 사용자 생성
    const user = await User.createLocal({ 
      email, 
      password, 
      nickname: nickname || email.split('@')[0] 
    });
    
    const tokens = generateTokens(user);

    // Refresh Token DB 저장
    await saveRefreshToken(user.id, tokens.refreshToken);

    res.status(201).json({
      success: true,
      message: '회원가입 성공! 🐾',
      user: User.sanitize(user),
      ...tokens
    });
  } catch (err) {
    console.error('❌ 회원가입 오류:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// ──────────────────────────────────────
// 📧 이메일 로그인
// ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일과 비밀번호를 입력해주세요' 
      });
    }

    // 사용자 찾기
    const user = await User.findByEmail(email);
    if (!user || user.provider !== 'local') {
      return res.status(401).json({ 
        success: false, 
        message: '이메일 또는 비밀번호가 올바르지 않습니다' 
      });
    }

    // 비밀번호 검증
    const isValid = await User.verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: '이메일 또는 비밀번호가 올바르지 않습니다' 
      });
    }

    const tokens = generateTokens(user);
    await saveRefreshToken(user.id, tokens.refreshToken);

    res.json({
      success: true,
      message: '로그인 성공! 🐾',
      user: User.sanitize(user),
      ...tokens
    });
  } catch (err) {
    console.error('❌ 로그인 오류:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// ──────────────────────────────────────
// 🔄 토큰 갱신
// ──────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token 필요' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // DB에서 유효한 refresh token인지 확인
    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE user_id = ? AND token = ? AND expires_at > NOW()',
      [decoded.id, refreshToken]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: '유효하지 않은 토큰' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: '사용자 없음' });
    }

    // 새 토큰 발급
    const tokens = generateTokens(user);

    // 기존 refresh token 삭제 후 새것 저장
    await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    await saveRefreshToken(user.id, tokens.refreshToken);

    res.json({ success: true, ...tokens });
  } catch (err) {
    res.status(401).json({ success: false, message: '토큰 갱신 실패' });
  }
});

// ──────────────────────────────────────
// 🔵 Google OAuth
// ──────────────────────────────────────
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND}?login=fail` }),
  async (req, res) => {
    const tokens = generateTokens(req.user);
    await saveRefreshToken(req.user.id, tokens.refreshToken);
    // 프론트엔드로 토큰 전달
    res.redirect(`${FRONTEND}?login=success&token=${tokens.accessToken}&refresh=${tokens.refreshToken}`);
  }
);

// ──────────────────────────────────────
// 🟡 Kakao OAuth
// ──────────────────────────────────────
router.get('/kakao',
  passport.authenticate('kakao')
);

router.get('/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: `${FRONTEND}?login=fail` }),
  async (req, res) => {
    const tokens = generateTokens(req.user);
    await saveRefreshToken(req.user.id, tokens.refreshToken);
    res.redirect(`${FRONTEND}?login=success&token=${tokens.accessToken}&refresh=${tokens.refreshToken}`);
  }
);

// ──────────────────────────────────────
// 🟢 Naver OAuth
// ──────────────────────────────────────
router.get('/naver',
  passport.authenticate('naver')
);

router.get('/naver/callback',
  passport.authenticate('naver', { failureRedirect: `${FRONTEND}?login=fail` }),
  async (req, res) => {
    const tokens = generateTokens(req.user);
    await saveRefreshToken(req.user.id, tokens.refreshToken);
    res.redirect(`${FRONTEND}?login=success&token=${tokens.accessToken}&refresh=${tokens.refreshToken}`);
  }
);

// ──────────────────────────────────────
// 👤 내 정보 조회
// ──────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ──────────────────────────────────────
// 🚪 로그아웃
// ──────────────────────────────────────
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // DB에서 해당 사용자의 refresh token 삭제
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [req.user.id]);
    
    req.logout?.(() => {});
    
    res.json({ success: true, message: '로그아웃 되었습니다' });
  } catch (err) {
    res.status(500).json({ success: false, message: '로그아웃 오류' });
  }
});

// ──────────────────────────────────────
// 🔧 Helper: Refresh Token 저장
// ──────────────────────────────────────
async function saveRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
}

module.exports = router;
