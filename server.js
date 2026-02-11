// ============================================
// 🐾 PetCTT Backend Server
// Pet Communication & Tracking Technology
// ============================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');

// Database
const db = require('./config/database');

// Passport 설정
require('./config/passport');

const app = express();

// ============ Middleware ============
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://petctt.com',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (OAuth 콜백용)
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// ============ Routes ============
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'PetCTT Backend',
    timestamp: new Date().toISOString()
  });
});

// ============ Error Handler ============
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? '서버 오류가 발생했습니다' 
      : err.message
  });
});

// ============ Start Server ============
const PORT = process.env.PORT || 5000;

// DB 연결 확인 후 서버 시작
db.testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`
  🐾 ================================
  🐾 PetCTT Backend Server
  🐾 Port: ${PORT}
  🐾 Mode: ${process.env.NODE_ENV}
  🐾 ================================
    `);
  });
}).catch(err => {
  console.error('❌ DB 연결 실패:', err.message);
  console.log('⚠️  DB 없이 서버를 시작합니다...');
  app.listen(PORT, () => {
    console.log(`🐾 PetCTT Server running on port ${PORT} (DB 미연결)`);
  });
});
