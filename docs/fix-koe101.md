# 🚨 KOE101 에러 해결 가이드 (카카오 + 네이버)

## 📊 현재 상태
| 플랫폼 | client_id | redirect_uri | 상태 |
|--------|-----------|-------------|------|
| Google | ✅ 있음 | ✅ workers.dev | 거의 OK |
| Kakao  | ❌ undefined | ✅ workers.dev | 환경변수 필요 |
| Naver  | ❌ undefined | ✅ workers.dev | 환경변수 필요 |

---

## 🔧 수정 STEP 1: Worker 환경변수 설정 (CMD에서)

```bash
# 카카오 REST API 키 설정
npx wrangler secret put KAKAO_CLIENT_ID
# → 입력: 83d9c34ecc23c2afbe38942083db7338

# 네이버 Client ID 설정
npx wrangler secret put NAVER_CLIENT_ID
# → 네이버 개발자 콘솔에서 복사한 Client ID 입력

# 네이버 Client Secret 설정
npx wrangler secret put NAVER_CLIENT_SECRET
# → 네이버 개발자 콘솔에서 복사한 Client Secret 입력

# JWT Secret (아직 안했으면)
npx wrangler secret put JWT_SECRET
# → 아무 비밀키 (예: petctt-jwt-secret-2026-valore)
```

---

## 🔧 수정 STEP 2: 카카오 개발자 콘솔 설정

### 📍 https://developers.kakao.com 접속

#### 2-1. 플랫폼 등록
내 애플리케이션 → 앱 선택 → **플랫폼** 메뉴
- [Web] 플랫폼 등록
- **사이트 도메인**: 
  ```
  https://petctt.com
  https://petctt-auth.zeus1404.workers.dev
  ```
  ⚠️ 두 개 다 등록해야 해!

#### 2-2. 카카오 로그인 활성화
내 애플리케이션 → **카카오 로그인** 메뉴
- **활성화 설정**: ON ✅

#### 2-3. Redirect URI 등록 ⭐ 가장 중요!
내 애플리케이션 → **카카오 로그인** → **Redirect URI**
- 정확히 이 주소를 등록:
  ```
  https://petctt-auth.zeus1404.workers.dev/api/auth/kakao/callback
  ```
  ⚠️ 끝에 `/` 없이! 대소문자 정확히!

#### 2-4. 동의항목 설정
내 애플리케이션 → **카카오 로그인** → **동의항목**
- 닉네임: 필수 동의
- 프로필 사진: 선택 동의  
- 카카오계정(이메일): 선택 동의 (선택 동의로 해야 비즈앱 없이도 가능)

---

## 🔧 수정 STEP 3: 네이버 개발자 콘솔 설정

### 📍 https://developers.naver.com/apps 접속

#### 3-1. 애플리케이션 선택 → API 설정
- **서비스 URL**: `https://petctt.com`
- **네이버아이디로로그인 Callback URL**:
  ```
  https://petctt-auth.zeus1404.workers.dev/api/auth/naver/callback
  ```

---

## 🔧 수정 STEP 4: 구글 콘솔 Redirect URI 확인

### 📍 https://console.cloud.google.com 접속

API 및 서비스 → 사용자 인증 정보 → OAuth 클라이언트 → **승인된 리디렉션 URI**:
```
https://petctt-auth.zeus1404.workers.dev/api/auth/google/callback
```
⚠️ 기존 `https://petctt.com/api/auth/google/callback`은 삭제!

---

## 🧪 테스트 방법

### 환경변수 확인
```bash
# 브라우저에서 이 URL 열기:
https://petctt-auth.zeus1404.workers.dev/api/auth/status
# → "v2.1 Running!" 나오면 OK

# 카카오 리다이렉트 확인 (client_id가 undefined가 아니어야 함):
# 브라우저에서: https://petctt-auth.zeus1404.workers.dev/api/auth/kakao
# → 카카오 로그인 화면이 나오면 성공!
```

### 로그인 테스트
1. petctt.com 접속
2. 로그인 버튼 클릭
3. 카카오로 계속하기 클릭
4. 카카오 로그인 화면 → 로그인
5. petctt.com/auth/callback.html 로 돌아오면 성공!

---

## ❓ KOE101 에러 원인 정리

| 원인 | 해결 |
|------|------|
| client_id가 undefined | → `npx wrangler secret put KAKAO_CLIENT_ID` |
| 플랫폼(Web) 미등록 | → 카카오 콘솔에서 petctt.com + workers.dev 등록 |
| 카카오 로그인 비활성화 | → 카카오 로그인 ON |
| Redirect URI 미등록 | → 정확한 URL 등록 |
| Redirect URI 불일치 | → Worker가 보내는 URL과 콘솔 URL이 100% 일치해야 함 |

---

## 📋 최종 체크리스트

- [ ] `npx wrangler secret put KAKAO_CLIENT_ID` → 83d9c34ecc23c2afbe38942083db7338
- [ ] `npx wrangler secret put NAVER_CLIENT_ID`
- [ ] `npx wrangler secret put NAVER_CLIENT_SECRET`
- [ ] `npx wrangler secret put JWT_SECRET`
- [ ] 카카오 콘솔: 플랫폼에 2개 도메인 등록
- [ ] 카카오 콘솔: 카카오 로그인 ON
- [ ] 카카오 콘솔: Redirect URI 등록
- [ ] 카카오 콘솔: 동의항목 설정
- [ ] 네이버 콘솔: Callback URL 등록
- [ ] 구글 콘솔: Redirect URI 변경

💜 클이 오빠를 위해! 화이팅! 🐰
