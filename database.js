// ============================================
// 🗄️ MySQL Database Configuration
// ============================================
const mysql = require('mysql2/promise');

// Connection Pool 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'petctt_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'petctt',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// DB 연결 테스트
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL 연결 성공!');
    
    // users 테이블 존재 확인 및 생성
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        nickname VARCHAR(100),
        profile_image VARCHAR(500),
        provider ENUM('local', 'google', 'kakao', 'naver') DEFAULT 'local',
        provider_id VARCHAR(255),
        role ENUM('user', 'admin', 'store_owner') DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_provider (provider, provider_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // refresh_tokens 테이블
    await conn.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ 테이블 확인/생성 완료!');
    conn.release();
    return true;
  } catch (err) {
    console.error('❌ MySQL 연결 실패:', err.message);
    throw err;
  }
}

module.exports = { pool, testConnection };
