# PetCTT MVP Backend

**쿠폰톡톡 게임 → 지갑 저장 → 구름장터 연동**

## 🎯 MVP 목표

- 반경 기반 쿠폰 발행/조회
- 쿠폰톡톡 게임에서 쿠폰 획득
- 지갑에 쿠폰 저장
- 사용 시 구름장터 LP URL로 이동

---

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env
# .env 파일 열어서 DB 정보 입력
```

### 3. MySQL 준비 (Docker 권장)
```bash
docker run --name petctt-mysql \
  -e MYSQL_ROOT_PASSWORD=petctt123 \
  -e MYSQL_DATABASE=petctt_mvp \
  -e MYSQL_USER=petctt_user \
  -e MYSQL_PASSWORD=petctt_password \
  -p 3306:3306 \
  -d mysql:8.0
```

### 4. 서버 실행
```bash
npm run dev
```

### 5. 동작 확인
```bash
curl http://localhost:3080/health
# 응답: PetCTT MVP Backend OK 🐰💜
```

---

## 📂 프로젝트 구조

```
backend-rebuild/
├── server.js              # 서버 엔트리포인트
├── package.json           # 의존성 (간소화)
├── .env.example           # 환경변수 템플릿
├── config/
│   └── database.js        # Sequelize DB 연결
├── models/                # MVP 핵심 모델 5개
│   ├── User.js
│   ├── Brand.js
│   ├── Outlet.js
│   ├── Coupon.js
│   └── CollectedCoupon.js
├── controllers/           # 비즈니스 로직 (추가 예정)
├── routes/                # API 라우팅 (추가 예정)
└── middleware/            # 인증/검증 (추가 예정)
```

---

## 🗄️ MVP 데이터베이스 스키마

### 핵심 테이블 5개

1. **user** - 사용자 계정
2. **brand** - 브랜드
3. **outlet** - 상점 (구름장터 LP URL 포함)
4. **coupon** - 쿠폰 마스터 (반경 정보 포함)
5. **collected_coupon** - 사용자 지갑

---

## 🔧 환경변수 (.env)

```env
NODE_ENV=development
PORT=3080

DB_HOST=localhost
DB_PORT=3306
DB_NAME=petctt_mvp
DB_USER=petctt_user
DB_PASSWORD=your-password

JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

---

## 📡 API 엔드포인트 (계획)

### Phase 1 (최소 MVP)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/coupon/nearby` - 주변 쿠폰 조회
- `POST /api/game/reward/claim` - 게임 보상 (쿠폰 획득)
- `GET /api/wallet/coupons` - 내 지갑
- `POST /api/coupon/redeem` - 쿠폰 사용
- `GET /api/coupon/redirect/:id` - LP URL 리다이렉트

---

## 🐛 트러블슈팅

### DB 연결 실패
```bash
# MySQL 실행 확인
docker ps | grep petctt-mysql

# .env 파일 확인
cat .env
```

### 포트 충돌
```bash
# Windows
netstat -ano | findstr :3080

# 다른 포트 사용
PORT=3090 npm run dev
```

---

## 📚 다음 단계

1. ✅ 기본 서버 실행
2. ⏭️ DB 테이블 생성 (SQL 스크립트)
3. ⏭️ 모델/컨트롤러 연결
4. ⏭️ API 구현
5. ⏭️ Postman 테스트

---

## ⚠️ 중요 사항

- 🔴 **라이브 index.html 절대 건드리지 않음**
- 🔴 **PR/머지 전 아미 검토 필수**
- 🔴 **프로덕션 배포 전 .env 보안 확인**

---

**작성**: 클 (Claude)  
**검토**: 아미 총괄  
**버전**: MVP v0.1  
**날짜**: 2026-02-04
