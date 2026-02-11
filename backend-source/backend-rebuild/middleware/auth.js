const jwt = require('jsonwebtoken');

const authMiddleware = {
  // JWT 토큰 생성
  generateToken: (payload) => {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'petctt-mvp-secret-2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  },

  // JWT 토큰 검증 미들웨어
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'petctt-mvp-secret-2026', (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: '유효하지 않은 토큰입니다.'
        });
      }

      req.user = user;
      next();
    });
  },

  // 관리자 권한 체크
  requireAdmin: (req, res, next) => {
    if (!req.user || req.user.role_id !== 3) {
      return res.status(403).json({
        success: false,
        message: '관리자 권한이 필요합니다.'
      });
    }
    next();
  }
};

module.exports = authMiddleware;
