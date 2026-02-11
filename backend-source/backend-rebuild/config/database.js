const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'petctt_mvp',
  process.env.DB_USER || 'petctt_user',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false
    }
  }
);

// DB 연결 테스트
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected:', process.env.DB_NAME);
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = sequelize;
