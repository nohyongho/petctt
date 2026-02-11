const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3080;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.send('PetCTT MVP Backend OK 🐰💜');
});

// API Routes
const authRoutes = require('./routes/auth');
const couponRoutes = require('./routes/coupon');
const gameRoutes = require('./routes/game');
const walletRoutes = require('./routes/wallet');
const couponUsageRoutes = require('./routes/coupon-usage');

app.use('/api/auth', authRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/coupon', couponUsageRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'PetCTT MVP API',
    version: '0.1.0',
    status: 'Running',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      coupon: {
        nearby: 'GET /api/coupon/nearby',
        issue: 'POST /api/coupon/issue (관리자)',
        redeem: 'POST /api/coupon/redeem',
        redirect: 'GET /api/coupon/redirect/:id'
      },
      game: {
        claim: 'POST /api/game/reward/claim'
      },
      wallet: {
        coupons: 'GET /api/wallet/coupons'
      }
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 PetCTT MVP Backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
