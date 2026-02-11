# 🐾 PetCTT Backend - MySQL 연결 가이드

## 📋 사전 준비 (이미 완료!)
- ✅ MySQL Server 설치/구동
- ✅ DB: petctt 생성
- ✅ 유저: petctt_user 생성 + 권한 부여

---

## 🚀 실행 순서

### Step 1: 프로젝트 폴더 이동
```powershell
cd C:\petctt-backend
```
(이 폴더에 파일들을 넣어주세요)

### Step 2: .env 파일 수정
`.env` 파일을 열고 **DB_PASSWORD** 부분만 실제 비밀번호로 변경:
```
DB_PASSWORD=여기에_실제_비밀번호
```

### Step 3: npm 패키지 설치
```powershell
npm install
```

### Step 4: DB 테이블 생성 (마이그레이션)
```powershell
mysql -u petctt_user -p petctt < database/schema.sql
```
비밀번호 입력하면 10개 테이블이 생성됩니다!

### Step 5: DB 연결 테스트
```powershell
node server/db-test.js
```
✅ 표시가 나오면 성공!

### Step 6: 서버 실행
```powershell
npm run dev
```

### Step 7: 확인
브라우저에서:
- http://localhost:5000/health → DB 연결 상태 확인
- http://localhost:5000/api → API 엔드포인트 목록

---

## 📁 파일 구조
```
petctt-backend/
├── .env                  ← DB 비밀번호 여기서 수정!
├── .env.example          ← 예시 (Git용)
├── .gitignore
├── package.json
├── README.md
├── database/
│   └── schema.sql        ← 테이블 생성 SQL
└── server/
    ├── server.js          ← 메인 서버
    ├── db.js              ← MySQL 연결 모듈
    └── db-test.js         ← 연결 테스트 스크립트
```

---

## 🗄️ 생성되는 테이블 (10개)
| 테이블 | 설명 |
|--------|------|
| users | 사용자 (소셜로그인 포함) |
| stores | 구름장터 입점 매장 |
| products | 매장 상품 |
| coupons | 쿠폰 (쿠폰톡톡) |
| coupon_wallet | 사용자 쿠폰 지갑 |
| orders | 주문 |
| order_items | 주문 상품 |
| game_records | 쿠폰 게임 기록 |
| pets | 반려동물 정보 |
| refresh_tokens | 인증 토큰 |
