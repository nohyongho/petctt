// server/routes/auth.js
// 인증 라우트 - Google, Kakao, Naver 소셜 로그인 + JWT

const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { generateTokens, requireAuth, saveRefreshToken } = require('../middleware/auth');

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

// 소셜 로그인 성공 후 프론트로 토큰 전달
function handleSocialCallback(req, res) {
  try {
    const user = req.user;
    if (!user) return res.redirect(`${FRONTEND_URL}?error=login_failed`);

    const { accessToken, refreshToken } = generateTokens(user);
    saveRefreshToken(user.id, refreshToken).catch(console.error);

    // 프론트엔드로 토큰 전달 (쿼리 파라미터)
    const params = new URLSearchParams({
      token: accessToken,
      refresh: refreshToken,
      user: JSON.stringify({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        name: user.name,
        profileImage: user.profile_image,
        provider: user.provider,
        role: user.role,
      }),
    });
    res.redirect(`${FRONTEND_URL}?login=success&${params.toString()}`);
  } catch (err) {
    console.error('Social callback error:', err);
    res.redirect(`${FRONTEND_URL}?error=server_error`);
  }
}

// ===== Google =====
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}?error=google_failed` }),
  handleSocialCallback
);

// ===== Kakao =====
router.get('/kakao', passport.authenticate('kakao'));
router.get('/kakao/callback',
  passport.authenticate('kakao', { session: false, failureRedirect: `${FRONTEND_URL}?error=kakao_failed` }),
  handleSocialCallback
);

// ===== Naver =====
router.get('/naver', passport.authenticate('naver'));
router.get('/naver/callback',
  passport.authenticate('naver', { session: false, failureRedirect: `${FRONTEND_URL}?error=naver_failed` }),
  handleSocialCallback
);

// ===== 이메일 회원가입 =====
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' });
    if (password.length < 6) return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다' });

    const conn = pool.promise();
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: '이미 가입된 이메일입니다' });

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await conn.query(
      'INSERT INTO users (email, password_hash, nickname, name, provider, last_login_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [email, passwordHash, nickname || email.split('@')[0], name, 'local']
    );

    const [newUser] = await conn.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const { accessToken, refreshToken } = generateTokens(newUser[0]);
    await saveRefreshToken(newUser[0].id, refreshToken);

    res.status(201).json({
      message: '회원가입 성공!',
      user: { id: newUser[0].id, email: newUser[0].email, nickname: newUser[0].nickname, role: newUser[0].role },
      accessToken, refreshToken,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다' });
  }
});

// ===== 이메일 로그인 =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' });

    const conn = pool.promise();
    const [users] = await conn.query('SELECT * FROM users WHERE email = ? AND provider = ?', [email, 'local']);
    if (users.length === 0) return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다' });

    const user = users[0];
    const validPw = await bcrypt.compare(password, user.password_hash);
    if (!validPw) return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다' });

    await conn.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    const { accessToken, refreshToken } = generateTokens(user);
    await saveRefreshToken(user.id, refreshToken);

    res.json({
      message: '로그인 성공!',
      user: { id: user.id, email: user.email, nickname: user.nickname, name: user.name, profileImage: user.profile_image, role: user.role },
      accessToken, refreshToken,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다' });
  }
});

// ===== 토큰 갱신 =====
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token이 필요합니다' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const conn = pool.promise();
    const [tokens] = await conn.query(
      'SELECT * FROM refresh_tokens WHERE user_id = ? AND token = ? AND expires_at > NOW()',
      [decoded.id, refreshToken]
    );
    if (tokens.length === 0) return res.status(401).json({ error: '유효하지 않은 refresh token입니다' });

    const [users] = await conn.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) return res.status(401).json({ error: '사용자를 찾을 수 없습니다' });

    const newTokens = generateTokens(users[0]);
    await saveRefreshToken(users[0].id, newTokens.refreshToken);

    res.json({ accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken });
  } catch (err) {
    return res.status(401).json({ error: '토큰 갱신에 실패했습니다' });
  }
});

// ===== 내 정보 =====
router.get('/me', requireAuth, async (req, res) => {
  try {
    const conn = pool.promise();
    const [users] = await conn.query(
      'SELECT id, email, nickname, name, phone, profile_image, role, provider, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    res.json({ user: users[0] });
  } catch (err) {
    res.status(500).json({ error: '정보 조회 실패' });
  }
});

// ===== 로그아웃 =====
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const conn = pool.promise();
    await conn.query('DELETE FROM refresh_tokens WHERE user_id = ?', [req.user.id]);
    res.json({ message: '로그아웃 완료' });
  } catch (err) {
    res.json({ message: '로그아웃 완료' });
  }
});

module.exports = router;