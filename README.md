# 🐾 PetCTT 로그인 백엔드 설치 가이드

## 📁 파일 구조
```
C:\petctt\backend\
├── .env                    ← (이미 완성됨!)
├── package.json            ← npm 의존성
├── server.js               ← 메인 서버
├── config/
│   ├── database.js         ← MySQL 연결 + 테이블 자동 생성
│   └── passport.js         ← Google/Kakao/Naver OAuth
├── models/
│   └── User.js             ← 사용자 모델
├── middleware/
│   └── auth.js             ← JWT 인증 미들웨어
├── routes/
│   └── auth.js             ← 인증 API 라우트
└── frontend-login-modal.html ← 프론트엔드 로그인 모달 (index.html에 삽입)
```

## 🚀 설치 방법

### 1단계: 파일 복사
다운로드한 파일들을 `C:\petctt\backend\` 폴더에 넣으세요.
(.env 파일은 이미 있으므로 덮어쓰지 마세요!)

### 2단계: 패키지 설치
```bash
cd C:\petctt\backend
npm install
```

### 3단계: MySQL 데이터베이스 확인
MySQL에서 petctt 데이터베이스가 있는지 확인하세요:
```sql
CREATE DATABASE IF NOT EXISTS petctt CHARACTER SET utf8mb4;
```

### 4단계: 서버 실행
```bash
# 개발 모드 (자동 재시작)
npm run dev

# 또는 일반 실행
npm start
```

성공하면 이렇게 나와요:
```
🐾 ================================
🐾 PetCTT Backend Server
🐾 Port: 5000
🐾 Mode: development
🐾 ================================
✅ MySQL 연결 성공!
✅ 테이블 확인/생성 완료!
```

## 📡 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 이메일 회원가입 |
| POST | `/api/auth/login` | 이메일 로그인 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| GET | `/api/auth/google` | 구글 로그인 |
| GET | `/api/auth/kakao` | 카카오 로그인 |
| GET | `/api/auth/naver` | 네이버 로그인 |
| GET | `/api/auth/me` | 내 정보 조회 (인증 필요) |
| POST | `/api/auth/logout` | 로그아웃 (인증 필요) |
| GET | `/api/health` | 서버 상태 확인 |

## 🎨 프론트엔드 연결

1. `frontend-login-modal.html` 파일의 내용을
2. `index.html`의 `</body>` 바로 위에 붙여넣기
3. 기존 로그인 버튼에 `onclick="openLoginModal()"` 추가

## 🔑 소셜 로그인 흐름
1. 사용자가 소셜 버튼 클릭
2. → `/api/auth/google` (또는 kakao, naver)
3. → 해당 서비스 로그인 페이지
4. → 로그인 성공 → `/api/auth/google/callback`
5. → JWT 토큰 생성 → 프론트엔드로 리다이렉트
6. → 프론트엔드에서 토큰 저장 → 로그인 완료!
