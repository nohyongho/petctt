// server/db.js
// MySQL 데이터베이스 연결 설정 (mysql2 사용)

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'petctt',
  user: process.env.DB_USER || 'petctt_user',
  password: process.env.DB_PASSWORD || '',

  // 연결 풀 설정
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // 타임존 (한국)
  timezone: '+09:00',

  // 날짜 처리
  dateStrings: true,
});

// 연결 테스트 함수
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('✅ MySQL 연결 성공! 테스트 쿼리 결과:', rows[0].result);

    // DB 버전 확인
    const [version] = await connection.query('SELECT VERSION() AS version');
    console.log(`📦 MySQL 버전: ${version[0].version}`);

    // 현재 DB 확인
    const [db] = await connection.query('SELECT DATABASE() AS db_name');
    console.log(`🗄️  현재 DB: ${db[0].db_name}`);

    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL 연결 실패:', error.message);
    console.error('   Host:', process.env.DB_HOST);
    console.error('   Port:', process.env.DB_PORT);
    console.error('   DB:', process.env.DB_NAME);
    console.error('   User:', process.env.DB_USER);
    return false;
  }
}

// 쿼리 헬퍼 함수
async function query(sql, params = []) {
  const [results] = await pool.execute(sql, params);
  return results;
}

module.exports = {
  pool,
  query,
  testConnection,
};
