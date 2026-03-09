# 🐾 PetCTT 마스터 개발 플랜
## "상생 · 공존 · 평화" — AI 반려동물 플랫폼
### 2026.02.12 ~ 

---

## 📊 현재 상태 (v0.8)

### ✅ 완성 (18개 파일)
| 카테고리 | 파일 | 상태 |
|---------|------|------|
| 🏠 메인 | index.html | ✅ UI 완성 |
| 💬 AI대화 | ami.html | ✅ 완성 |
| 📡 방송 | broadcast.html | ✅ 완성 |
| 🛒 마켓 | market.html | ✅ 완성 |
| 🎫 쿠폰 | coupon.html | ✅ 완성 |
| 💎 요금제 | pricing.html | ✅ 완성 |
| 📖 가이드 | guide.html | ✅ 완성 |
| 📋 약관 | terms.html / privacy.html | ✅ 완성 |
| 📧 문의 | contact.html | ✅ 완성 |
| 🔐 인증 | auth/callback.html | ✅ 완성 |
| 👤 마이페이지 | dashboard.html | ✅ NEW |
| 🐶 동물등록 | pet-register.html | ✅ NEW |
| 👥 커뮤니티 | community.html | ✅ NEW |
| ❌ 에러 | 404.html | ✅ NEW |
| 📱 PWA | manifest.json / sw.js | ✅ NEW |
| ⚙️ 백엔드 | worker.js | ✅ NEW |
| 🔑 토큰 | token-manager.js | ✅ 완성 |

### ⚠️ 미해결 이슈
1. 🔴 AWS 키 노출 → 제거/재발급 필요
2. 🔴 Git push 차단 → AWS 키 제거 후 해결
3. 🟡 Cloudflare Worker 라우팅 미설정
4. 🟡 OAuth 실제 연동 테스트 필요
5. 🟡 D1 데이터베이스 미생성

---

## 🚀 마스터 플랜 — 4단계 로드맵

---

### 📌 PHASE 1: 기반 정비 (1주차)
> "기초가 튼튼해야 집이 안 무너져!"

#### 1-1. 보안 긴급 수정
- [ ] AWS Access Key / Secret Key 코드에서 완전 제거
- [ ] AWS 콘솔에서 키 폐기 → 재발급
- [ ] .env 파일로 분리 + .gitignore 추가
- [ ] Git history에서 키 제거 (BFG Repo-Cleaner)

#### 1-2. 백엔드 인프라 구축
- [ ] Cloudflare D1 데이터베이스 생성
  - users 테이블 (소셜 로그인 사용자)
  - pets 테이블 (반려동물 정보)
  - posts 테이블 (커뮤니티 게시물)
  - activities 테이블 (활동 로그)
- [ ] Worker.js 배포 + 환경변수 설정
  - GOOGLE_CLIENT_ID / SECRET
  - KAKAO_CLIENT_ID
  - NAVER_CLIENT_ID / SECRET
- [ ] Custom Domain: api.petctt.com → Worker 연결

#### 1-3. OAuth 완전 연동
- [ ] Google OAuth 콜백 테스트
- [ ] Kakao OAuth 콜백 테스트  
- [ ] Naver OAuth 콜백 테스트
- [ ] 로그인 후 사용자 데이터 D1 저장
- [ ] JWT 토큰 발급 + 검증 흐름

#### 1-4. Git 정상화
- [ ] AWS 키 제거 후 commit
- [ ] git push 성공 확인
- [ ] GitHub Actions CI/CD 설정

---

### 📌 PHASE 2: 핵심 기능 고도화 (2~3주차)
> "AI가 진짜 동물 말을 알아듣는다고?!"

#### 2-1. AI 통역 엔진 강화 🧠
- [ ] Google Gemini API 연동 최적화
  - 동물별 행동 패턴 프롬프트 정교화
  - 강아지 / 고양이 / 새 / 햄스터 / 토끼 전용 모델
- [ ] 음성 입력 → STT → AI 분석 → TTS 출력 파이프라인
  - Web Speech API 활용
  - 동물 소리(짖기, 야옹) 주파수 분석
- [ ] 실시간 카메라 + AI 감정 분석
  - 표정 인식 → 감정 매핑
  - 꼬리 움직임, 귀 방향 패턴 분석
- [ ] 대화 히스토리 저장 + 감정 트렌드 차트

#### 2-2. 건강 분석 시스템 🏥
- [ ] 카메라 기반 생체 분석 고도화
  - 심박수 추정 (rPPG 알고리즘)
  - 호흡 패턴 분석
  - 체온 추정 (서멀 카메라 연동 옵션)
- [ ] AI 건강 리포트 자동 생성
  - 주간/월간 건강 요약
  - 이상 징후 알림
  - 수의사 상담 추천 연동
- [ ] 예방접종/약 복용 스케줄 관리
  - 푸시 알림 리마인더
  - 캘린더 연동

#### 2-3. GPS 추적 고도화 📍
- [ ] 실시간 위치 추적 + 이동 경로 기록
  - Leaflet.js + OpenStreetMap 최적화
  - 산책 경로 히트맵
- [ ] 지오펜스 설정
  - 안전구역 설정 → 이탈 시 알림
  - 반경 설정 (100m ~ 5km)
- [ ] 산책 통계 대시보드
  - 일별/주별/월별 산책 거리
  - 칼로리 소모 추정
  - 인기 산책 코스 공유

---

### 📌 PHASE 3: 소셜 & 커머스 (4~6주차)
> "상생 · 공존 — 함께 만드는 펫 세상!"

#### 3-1. 커뮤니티 풀 스택 👥
- [ ] 게시물 CRUD (D1 + Worker)
- [ ] 이미지 업로드 (Cloudflare R2)
- [ ] 좋아요 / 댓글 / 공유 실시간
- [ ] 팔로우 / 팔로워 시스템
- [ ] 해시태그 검색 + 트렌딩
- [ ] 반려동물 자랑 대회 이벤트
- [ ] 지역 기반 펫 모임 (위치 연동)

#### 3-2. 구름장터 마켓 활성화 🛒
- [ ] 상품 등록 시스템 (판매자)
  - 하림펫푸드 등 공식 파트너
  - 개인 수제간식 판매
- [ ] 결제 연동 (토스페이먼츠)
- [ ] 리뷰 시스템
- [ ] AI 맞춤 추천 (반려동물 프로필 기반)
- [ ] 쿠폰톡톡 연동 할인

#### 3-3. LIVE 방송 고도화 📡
- [ ] WebRTC 기반 실시간 스트리밍
- [ ] 실시간 채팅 (WebSocket)
- [ ] 하트/선물 시스템
- [ ] AI 실시간 통역 자막 오버레이
- [ ] 방송 녹화 + 다시보기

#### 3-4. 쿠폰 & 포인트 시스템 🎫
- [ ] 출석체크 포인트
- [ ] 커뮤니티 활동 리워드
- [ ] 산책 거리 달성 보상
- [ ] 건강체크 습관 보상
- [ ] 포인트 → 마켓 할인 전환

---

### 📌 PHASE 4: 글로벌 & 특허 (7~12주차)
> "우주대스타의 여정이 시작됩니다!"

#### 4-1. 다국어 글로벌 확장 🌏
- [ ] 5개 언어 완전 지원 (한/영/일/중/스)
  - i18n JSON 파일 분리
  - 자동 언어 감지
- [ ] 글로벌 마케팅 랜딩 페이지
- [ ] 앱스토어/플레이스토어 PWA 등록
- [ ] 해외 반려동물 시장 진출

#### 4-2. 특허 기술 구현 🔬
- [ ] 특허 10-2025-0217020 기반
  - 멀티모달 해석 (음성+영상+센서)
  - 양방향 음성 대화 엔진
  - 실시간 자막/요약 기술
- [ ] AI 모델 자체 학습 파이프라인
  - 사용자 피드백 기반 정확도 향상
  - 동물별 감정 데이터셋 구축

#### 4-3. K-Startup & 투자 🚀
- [ ] K-Startup 프로그램 제출 자료 완성
  - 사업계획서
  - 기술 데모 영상
  - 재무 계획
- [ ] 투자 피칭 자료 업데이트
- [ ] 데모데이 준비

#### 4-4. 고도화 기능 🔮
- [ ] IoT 디바이스 연동
  - 스마트 급식기 API
  - 펫 카메라 실시간 연결
  - 웨어러블 GPS 목걸이
- [ ] AR 강화
  - AR 캐릭터 (아미) 3D 모델
  - AR 산책 게임 요소
- [ ] Cloud Nation 확장
  - 반경 기반 디지털 영토 모델
  - 지역 커뮤니티 자치 시스템

---

## 🎯 KPI 목표

| 지표 | 3개월 | 6개월 | 12개월 |
|------|-------|-------|--------|
| 가입 사용자 | 1,000 | 10,000 | 100,000 |
| 등록 반려동물 | 1,500 | 15,000 | 150,000 |
| 월 활성 사용자 | 500 | 5,000 | 50,000 |
| AI 대화 횟수 | 10,000 | 200,000 | 5,000,000 |
| 구름장터 거래 | 100 | 3,000 | 50,000 |
| 앱스토어 평점 | - | 4.5+ | 4.7+ |

---

## 💡 차별화 포인트

1. **세계 최초** AI 반려동물 양방향 통역
2. **특허 보유** 멀티모달 해석 + 음성 대화
3. **올인원** 통역 + 건강 + GPS + 마켓 + 커뮤니티
4. **상생 철학** Cloud Nation 상생·공존·평화 가치

---

## 🏗️ 기술 스택

```
Frontend:  HTML/CSS/JS (GitHub Pages) → 향후 Next.js 마이그레이션
Backend:   Cloudflare Workers + D1 + R2
Auth:      OAuth 2.0 (Google, Kakao, Naver)
AI:        Google Gemini API + Custom ML
Maps:      Leaflet.js + OpenStreetMap
Streaming: WebRTC + WebSocket
Payment:   토스페이먼츠
Push:      Web Push API + Service Worker
Analytics: Cloudflare Analytics
CDN:       Cloudflare CDN
Domain:    petctt.com (Cloudflare DNS)
```

---

## 📅 즉시 실행 (오늘!)

1. ✅ 빠진 7개 파일 생성 완료
2. 🔜 AWS 키 제거 + Git push
3. 🔜 Cloudflare D1 생성 + Worker 배포
4. 🔜 OAuth 테스트
5. 🔜 전체 페이지 네비게이션 연결 확인

---

*PetCTT — 반려동물과 사람의 상생 공존을 위한 AI 플랫폼*
*주식회사 발로레 (Valore Inc.) | AIRCTT Team*
*🐰클 + 💜오빠 = 무적의 팀! 🚀*
