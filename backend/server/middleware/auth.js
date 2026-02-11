// server/middleware/auth.js
// JWT 인증 미들웨어 - PetCTT

const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// JWT 토큰 생성
function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, nickname: user.nickname },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
}

// 인증 필수 미들웨어
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '로그인이 필요합니다' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '토큰이 만료되었습니다', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }
}

// 인증 선택 미들웨어
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch (e) {}
  }
  next();
}

// 관리자 전용
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다' });
  }
  next();
}

// DB에서 사용자 찾기/생성 (소셜 로그인용)
async function findOrCreateUser({ provider, providerId, email, name, nickname, profileImage }) {
  const conn = pool.promise();
  
  // 1) provider + provider_id로 검색
  const [existing] = await conn.query(
    'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
    [provider, providerId]
  );
  if (existing.length > 0) {
    await conn.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [existing[0].id]);
    return existing[0];
  }
  
  // 2) 이메일로 검색 (다른 소셜로 이미 가입된 경우)
  if (email) {
    const [byEmail] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    if (byEmail.length > 0) {
      await conn.query(
        'UPDATE users SET provider = ?, provider_id = ?, last_login_at = NOW() WHERE id = ?',
        [provider, providerId, byEmail[0].id]
      );
      return { ...byEmail[0], provider, provider_id: providerId };
    }
  }
  
  // 3) 신규 생성
  const [result] = await conn.query(
    `INSERT INTO users (email, nickname, name, profile_image, provider, provider_id, last_login_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [email, nickname || name, name, profileImage, provider, providerId]
  );
  
  const [newUser] = await conn.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  return newUser[0];
}

// Refresh Token 저장
async function saveRefreshToken(userId, token) {
  const conn = pool.promise();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await conn.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
    [userId, token, expiresAt]
  );
}

module.exports = { generateTokens, requireAuth, optionalAuth, requireAdmin, findOrCreateUser, saveRefreshToken };