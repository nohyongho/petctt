# PetCTT MVP 백엔드 빠른 시작 가이드

**⏱️ 5분 안에 서버 실행하기**

---

## 📋 사전 준비

✅ Node.js 18+ 설치됨  
✅ Docker 설치됨 (또는 MySQL 8.0+)  
✅ Git 설치됨

---

## 🚀 3단계로 시작

### Step 1: 프로젝트 준비
```bash
cd C:\petctt\backend-source\backend-rebuild

# 의존성 설치
npm install
```

### Step 2: 환경변수 설정
```bash
# .env 파일 생성
copy .env.example .env

# .env 파일 열어서 수정 (메모장 또는 VS Code)
notepad .env
```

**최소 필수 설정**:
```env
NODE_ENV=development
PORT=3080
DB_HOST=localhost
DB_NAME=petctt_mvp
DB_USER=petctt_user
DB_PASSWORD=petctt_password
JWT_SECRET=petctt-mvp-secret-2026
```

### Step 3: MySQL 실행 (Docker)
```bash
docker run --name petctt-mysql ^
  -e MYSQL_ROOT_PASSWORD=petctt123 ^
  -e MYSQL_DATABASE=petctt_mvp ^
  -e MYSQL_USER=petctt_user ^
  -e MYSQL_PASSWORD=petctt_password ^
  -p 3306:3306 ^
  -d mysql:8.0
```

**MySQL 상태 확인**:
```bash
docker ps | findstr petctt-mysql
```

---

## 🎯 서버 실행

### 개발 모드 (자동 재시작)
```bash
npm run dev
```

**성공 메시지**:
```
🚀 PetCTT MVP Backend running on http://localhost:3080
📊 Environment: development
🔗 Health Check: http://localhost:3080/health
✅ Database connected: petctt_mvp
```

---

## ✅ 동작 확인

### 1. 브라우저
http://localhost:3080/health  
→ "PetCTT MVP Backend OK 🐰💜"

### 2. curl (PowerShell)
```powershell
curl http://localhost:3080/health
```

### 3. API 정보
```powershell
curl http://localhost:3080/api
```

---

## 📦 Postman 테스트

### Postman에서 컬렉션 Import
1. Postman 실행
2. File → Import
3. `PETCTT-MVP.postman_collection.json` 선택
4. "0. Health Check" 요청 실행
5. ✅ 응답 확인

---

## 🐛 문제 해결

### ❌ 포트 이미 사용 중
```bash
# 다른 포트로 실행
$env:PORT=3090; npm run dev
```

### ❌ DB 연결 실패
```bash
# Docker 컨테이너 확인
docker ps -a | findstr petctt

# 로그 확인
docker logs petctt-mysql

# 재시작
docker restart petctt-mysql
```

### ❌ npm install 오류
```bash
# 캐시 삭제 후 재설치
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

---

## 📚 다음 단계

1. ✅ 서버 실행 완료
2. ⏭️ DB 테이블 생성 (SQL 스크립트)
3. ⏭️ API 구현
4. ⏭️ Postman 테스트
5. ⏭️ 프론트엔드 연결

---

## 🎉 완료!

서버가 정상 실행되면 다음 단계로 진행하세요:
- **DB 스키마**: `../MVP-TABLE-MAPPING.md` 참조
- **API 설계**: `../MVP-API-DESIGN.md` 참조
- **문서**: `README.md` 참조

---

**작성**: 클 (Claude)  
**버전**: MVP v0.1  
**날짜**: 2026-02-04
