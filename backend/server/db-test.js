// server/db-test.js
// MySQL 연결 테스트 (독립 실행용)
// 사용법: node server/db-test.js

const { testConnection, pool, query } = require('./db');

async function runTests() {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  🗄️  PetCTT MySQL 연결 테스트');
  console.log('═══════════════════════════════════════');
  console.log('');

  // 1. 연결 테스트
  console.log('📌 Step 1: 기본 연결 테스트...');
  const connected = await testConnection();

  if (!connected) {
    console.log('');
    console.log('❌ 연결 실패! 다음을 확인하세요:');
    console.log('   1. MySQL 서버가 실행 중인지 확인');
    console.log('   2. .env 파일의 DB 설정 확인');
    console.log('   3. petctt_user 계정에 petctt DB 접근 권한이 있는지 확인');
    process.exit(1);
  }

  // 2. 테이블 존재 여부 확인
  console.log('');
  console.log('📌 Step 2: 테이블 확인...');
  try {
    const tables = await query(
      `SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
       FROM information_schema.tables
       WHERE table_schema = ?
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME || 'petctt']
    );

    if (tables.length === 0) {
      console.log('⚠️  테이블이 없습니다! 마이그레이션을 실행하세요:');
      console.log('   mysql -u petctt_user -p petctt < database/schema.sql');
    } else {
      console.log(`✅ ${tables.length}개 테이블 발견:`);
      tables.forEach((t) => {
        console.log(`   📋 ${t.TABLE_NAME} (${t.TABLE_ROWS || 0} rows)`);
      });
    }
  } catch (err) {
    console.log('⚠️  테이블 조회 실패:', err.message);
  }

  // 3. 쓰기/읽기 테스트
  console.log('');
  console.log('📌 Step 3: 쓰기/읽기 테스트...');
  try {
    // 임시 테스트 테이블
    await query(`CREATE TABLE IF NOT EXISTS _health_check (
      id INT AUTO_INCREMENT PRIMARY KEY,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await query(`INSERT INTO _health_check (checked_at) VALUES (NOW())`);
    const rows = await query(`SELECT COUNT(*) AS cnt FROM _health_check`);
    console.log(`✅ 쓰기/읽기 성공! (${rows[0].cnt}건 기록)`);
    await query(`DROP TABLE _health_check`);
    console.log('✅ 정리 완료!');
  } catch (err) {
    console.log('❌ 쓰기/읽기 실패:', err.message);
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  ✅ 모든 테스트 완료!');
  console.log('═══════════════════════════════════════');
  console.log('');

  await pool.end();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('테스트 실행 에러:', err);
  process.exit(1);
});
