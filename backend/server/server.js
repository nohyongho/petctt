// server/server.js
// PetCTT Backend API Server (MySQL + OAuth)

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const { testConnection } = require('./db');

// 환경변수 로드
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// Passport 설정 (환경변수 로드 후!)
const passport = require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// 미들웨어 설정
// ============================================

// CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://petctt.com',
    'http://localhost:3000',
    'http://localhost:5000',
  ],
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 로깅
app.use(morgan('dev'));

// 세션 (Passport용)
app.use(session({
  secret: process.env.SESSION_SECRET || 'petctt-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1일
  },
}));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// ============================================
// 라우트 설정
// ============================================

// 헬스체크 (DB 연결 상태 포함)
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: dbConnected ? 'ok' : 'degraded',
    service: 'PetCTT API',
    version: '1.1.0',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    auth: {
      google: !!process.env.GOOGLE_CLIENT_ID,
      kakao: !!(process.env.KAKAO_JAVASCRIPT_KEY || process.env.KAKAO_CLIENT_ID),
      naver: !!process.env.NAVER_CLIENT_ID,
    },
  });
});

// API 루트
app.get('/api', (req, res) => {
  res.json({
    message: '🐾 PetCTT API에 오신 것을 환영합니다!',
    version: '1.1.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        google: 'GET /api/auth/google',
        kakao: 'GET /api/auth/kakao',
        naver: 'GET /api/auth/naver',
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
      },
      stores: '/api/stores/* (준비 중)',
      products: '/api/products/* (준비 중)',
      coupons: '/api/coupons/* (준비 중)',
      game: '/api/game/* (준비 중)',
      pets: '/api/pets/* (준비 중)',
    },
  });
});

// ===== 라우트 모듈 연결 =====
app.use('/api/auth', require('./routes/auth'));

// TODO: 추가 라우트 (다음 단계)
// app.use('/api/stores', require('./routes/stores'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/coupons', require('./routes/coupons'));
// app.use('/api/game', require('./routes/game'));
// app.use('/api/pets', require('./routes/pets'));

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('🔴 Server Error:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ============================================
// 서버 시작
// ============================================

async function startServer() {
  console.log('\n  🐾 PetCTT Backend Server Starting...\n');

  // DB 연결 테스트
  const dbOk = await testConnection();

  if (!dbOk) {
    console.warn('  ⚠️  DB 연결 실패! 서버는 시작되지만 DB 기능은 제한됩니다');
    console.warn('     .env 파일의 DB 설정을 확인하세요\n');
  }

  app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║  🐾 PetCTT API Server Running!          ║
  ║  🌐 Port: ${String(PORT).padEnd(35)}║
  ║  🔒 Auth: Google ✅  Kakao ✅  Naver ✅  ║
  ║  🗃️  DB: ${(dbOk ? 'Connected ✅' : 'Failed ❌').padEnd(33)}║
  ║  📍 http://localhost:${PORT}${' '.repeat(20)}║
  ╚══════════════════════════════════════════╝
    `);
  });
}

startServer();

module.exports = app;