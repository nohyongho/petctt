# PetCTT MVP 로컬 실행 가이드

**작성일**: 2026-02-04  
**대상**: user-backend 기반 MVP  
**환경**: Node.js 14+, MySQL 5.7+

---

## 🚀 빠른 시작 (3단계)

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일 수정 (DB 정보 입력)

# 3. 서버 실행
npm run dev
```

**서버 확인**: http://localhost:3080/health → `Api ok. TAK`

---

## 📋 사전 준비

### 1. Node.js 설치
**권장 버전**: 14.x 이상  
**확인**:
```bash
node -v  # v14.17.0 이상
npm -v   # 6.14.0 이상
```

### 2. MySQL 설치
**권장 버전**: 5.7 또는 8.0  
**확인**:
```bash
mysql --version  # mysql Ver 5.7.x 이상
```

---

## 🐳 Docker로 MySQL 빠르게 시작 (권장)

```bash
# MySQL 8.0 컨테이너 실행
docker run --name petctt-mysql \
  -e MYSQL_ROOT_PASSWORD=petctt123 \
  -e MYSQL_DATABASE=ctt_db \
  -e MYSQL_USER=ctt_user \
  -e MYSQL_PASSWORD=ctt_password \
  -p 3306:3306 \
  -d mysql:8.0

# 컨테이너 상태 확인
docker ps | grep petctt-mysql
```

---

## 📂 프로젝트 구조

```
C:\petctt\backend-source\user-backend\jldteam-user-backend-42835de9bbf5\
├── app.js                 # Express 앱 설정
├── bin/
│   └── www               # 서버 시작 엔트리포인트
├── config/
│   ├── database.js       # Sequelize DB 연결
│   └── keys.js           # AWS S3 등 키 설정
├── models/               # Sequelize 모델 (테이블)
│   ├── User.js
│   ├── Coupon.js
│   ├── CollectedCoupon.js
│   └── ...
├── controllers/          # 비즈니스 로직
│   ├── AuthController.js
│   ├── CouponController.js
│   └── ...
├── routes/               # API 라우팅
│   ├── auth.js
│   ├── coupon.js
│   └── ...
├── middleware/           # 인증/검증
│   └── authGaurd.js
├── services/             # 헬퍼 함수
├── package.json          # 의존성
└── .env                  # 환경변수 (복사 필요)
```

---

## ⚙️ 환경변수 설정 (.env)

### .env.example 템플릿

```env
# 서버 설정
NODE_ENV=development
PORT=3080

# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ctt_db
DB_USER=ctt_user
DB_PASSWORD=ctt_password
DB_DIALECT=mysql

# JWT 인증
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AWS S3 (선택 - 이미지 업로드용)
AWS_ACCESS_KEY_ID=YOUR_AWS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=petctt-assets

# FCM (선택 - 푸시 알림용)
FCM_SERVER_KEY=YOUR_FCM_KEY

# SendGrid (선택 - 이메일 인증용)
SENDGRID_API_KEY=YOUR_SENDGRID_KEY
```

### MVP 필수 항목
```env
NODE_ENV=development
PORT=3080
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ctt_db
DB_USER=ctt_user
DB_PASSWORD=ctt_password
JWT_SECRET=petctt-mvp-secret-key-2026
```

**⚠️ 주의**: `.env` 파일은 절대 Git에 커밋하지 마세요!

---

## 🗄️ 데이터베이스 세팅

### 1. MySQL 접속
```bash
mysql -u root -p
# 또는
mysql -u ctt_user -p ctt_db
```

### 2. 데이터베이스 생성 (Docker 사용 시 스킵)
```sql
CREATE DATABASE ctt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ctt_user'@'localhost' IDENTIFIED BY 'ctt_password';
GRANT ALL PRIVILEGES ON ctt_db.* TO 'ctt_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 테이블 생성

Sequelize가 자동으로 테이블을 생성하지만, MVP 핵심 테이블만 먼저 생성 권장:

```sql
USE ctt_db;

-- User 테이블
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  full_name VARCHAR(50),
  contact_no VARCHAR(20) UNIQUE,
  user_status ENUM('active', 'blocked') DEFAULT 'blocked',
  is_email_verified BOOLEAN DEFAULT false,
  role_id INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Brand 테이블
CREATE TABLE brand (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand_name VARCHAR(100),
  brand_logo VARCHAR(500),
  status BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Outlet 테이블
CREATE TABLE outlet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand_id INT,
  outlet_name VARCHAR(100),
  latitude VARCHAR(255),
  longitude VARCHAR(255),
  address VARCHAR(255),
  lp_url VARCHAR(500),
  nearby_couponrange DOUBLE DEFAULT 1000,
  status BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brand(id)
);

-- Coupon 테이블
CREATE TABLE coupon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outlet_id INT,
  brand_id INT,
  coupon_name VARCHAR(100),
  coupon_type ENUM('common', 'random', 'user_localtion', 'radius_based') DEFAULT 'common',
  total_coupons INT DEFAULT 0,
  remaining_coupons INT DEFAULT 0,
  percent_off INT,
  amount DECIMAL(8,2) DEFAULT 0,
  valid_from DATETIME,
  valid_till DATETIME,
  status ENUM('available', 'pending', 'expired') DEFAULT 'pending',
  radius_meters INT DEFAULT 1000,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlet(id),
  FOREIGN KEY (brand_id) REFERENCES brand(id)
);

-- CollectedCoupon 테이블
CREATE TABLE collected_coupon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  coupon_id INT,
  location POINT,
  hash VARCHAR(64),
  is_coupon ENUM('COLLECTED', 'REDEEMED', 'HIDDEN') DEFAULT 'COLLECTED',
  is_deleted BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (coupon_id) REFERENCES coupon(id)
);
```

---

## 📦 의존성 설치

```bash
cd C:\petctt\backend-source\user-backend\jldteam-user-backend-42835de9bbf5

npm install
# 또는
yarn install
```

**주요 의존성**:
- `express`: 웹 프레임워크
- `sequelize`: ORM
- `mysql2`: MySQL 드라이버
- `jsonwebtoken`: JWT 인증
- `bcrypt-nodejs`: 비밀번호 암호화
- `dotenv`: 환경변수
- `cors`: CORS 설정

---

## 🏃 서버 실행

### 개발 모드 (nodemon - 자동 재시작)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm run prod
```

### 직접 실행
```bash
node ./bin/www
```

**서버 시작 로그 예시**:
```
Express server listening on port 3080
Database connected: ctt_db
```

---

## ✅ 동작 확인

### 1. Health Check
```bash
curl http://localhost:3080/health
# 응답: Api ok. TAK
```

### 2. 회원가입 테스트
```bash
curl -X POST http://localhost:3080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "full_name": "테스트유저",
    "contact_no": "010-1234-5678"
  }'
```

### 3. 로그인 테스트
```bash
curl -X POST http://localhost:3080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

## 🐛 트러블슈팅

### 문제 1: DB 연결 실패
```
Error: ER_ACCESS_DENIED_ERROR
```
**해결**:
1. `.env` 파일의 `DB_USER`, `DB_PASSWORD` 확인
2. MySQL 서비스 실행 확인: `mysql -u ctt_user -p`

### 문제 2: 포트 충돌
```
Error: listen EADDRINUSE :::3080
```
**해결**:
```bash
# Windows
netstat -ano | findstr :3080
taskkill /PID [PID번호] /F

# Linux/Mac
lsof -ti:3080 | xargs kill -9
```

### 문제 3: Sequelize 마이그레이션 오류
```
Error: Table 'ctt_db.user' doesn't exist
```
**해결**:
- SQL 스크립트로 수동 테이블 생성 (위 "데이터베이스 세팅" 참조)
- 또는 Sequelize sync 활성화 (개발 환경만):
  ```javascript
  // config/database.js
  sequelize.sync({ force: false });
  ```

---

## 📚 다음 단계

1. ✅ 로컬 서버 실행 확인
2. ⏭️ Postman 컬렉션으로 API 테스트
3. ⏭️ 프론트엔드 연결 (index.html)
4. ⏭️ 배포 (Docker + AWS/GCP)

---

## 📝 Postman 컬렉션 (다음 문서)

MVP API 테스트용 Postman 컬렉션은 별도 파일로 제공 예정:
- `PETCTT-MVP.postman_collection.json`

---

## ⚠️ 중요 보안 사항

### 프로덕션 배포 전 체크리스트
- [ ] `.env` 파일 Git에서 제외 (.gitignore 확인)
- [ ] `JWT_SECRET` 강력한 랜덤 키로 변경
- [ ] DB 비밀번호 변경
- [ ] CORS 설정 검토 (현재: 모든 도메인 허용)
- [ ] Rate Limiting 추가
- [ ] HTTPS 적용
- [ ] AWS S3 키 보안 관리

---

**작성**: 클 (Claude)  
**검토 대기**: 아미 총괄  
**버전**: MVP v0.1
