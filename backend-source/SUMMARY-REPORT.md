# PetCTT x 쿠폰톡톡 리빌드 1차 산출물

**작업일**: 2026-02-04  
**작업자**: 클 (Claude)  
**검토 대기**: 아미 (총괄)  
**버전**: MVP v0.1

---

## 📊 작업 완료 요약

### ✅ 완료 항목

1. ✅ **백엔드 소스 분석**
   - user-backend ZIP 압축 해제 완료
   - merchant-backend 구조 확인 완료
   - Node.js + Express + Sequelize + MySQL 스택 확인

2. ✅ **테이블 매핑표 작성**
   - 기존 40+ 테이블 → MVP 8개 핵심 테이블 추출
   - 제거 후보 30+ 테이블 정리
   - 관계도 및 스키마 단순화 제안

3. ✅ **API 엔드포인트 설계**
   - MVP 필수 7개 API 정의
   - 전체 API 25+ 개 설계 (확장용)
   - 요청/응답 JSON 예시 포함

4. ✅ **로컬 실행 가이드**
   - .env.example 템플릿 제공
   - Docker MySQL 빠른 시작 가이드
   - 트러블슈팅 포함

---

## 📁 산출 파일 목록

모든 파일은 `C:\petctt\backend-source\` 에 저장되었습니다:

```
C:\petctt\backend-source\
├── MVP-TABLE-MAPPING.md       # 테이블 매핑표
├── MVP-API-DESIGN.md          # API 설계 문서
├── LOCAL-SETUP-GUIDE.md       # 로컬 실행 가이드
└── SUMMARY-REPORT.md          # 본 요약 보고서 (이 파일)

백엔드 소스:
├── user-backend\
│   └── jldteam-user-backend-42835de9bbf5\
│       ├── models\              # 40+ 모델 파일
│       ├── controllers\         # 14개 컨트롤러
│       ├── routes\              # 12개 라우터
│       └── package.json
└── merchant-backend\
    └── jldteam-merchant-backend-c08ef6564c25\
```

---

## 🎯 핵심 발견사항

### 1. 기존 아키텍처 (레거시)

**스택**:
- Backend: Node.js 14.x + Express 4.16
- ORM: Sequelize 5.2
- DB: MySQL 5.7+
- Auth: JWT + bcrypt
- Storage: AWS S3
- Push: FCM

**테이블 수**: 40+ 개 (user, coupon, outlet, AR 마커, 캠페인, 광고 등)

**문제점**:
- ❌ 과도한 테이블 (AR 마커, 캠페인 등 MVP 불필요)
- ❌ 복잡한 관계 (country/state/city 리스트)
- ❌ 중복 구조 (wallet_crypto + wallet_fiat)
- ❌ 레거시 코드 혼재

---

### 2. MVP 최적화 제안

**핵심 테이블 5개**:
1. `user` - 사용자 계정
2. `brand` - 브랜드
3. `outlet` - 상점 (+ `lp_url` 컬럼 추가 필요)
4. `coupon` - 쿠폰 마스터 (+ `radius_meters` 컬럼 추가 필요)
5. `collected_coupon` - 사용자 지갑 (완벽한 구조)

**선택 테이블 3개**:
6. `wallet` (crypto+fiat 통합)
7. `transactions` (거래 기록)
8. `orders` (주문 연계)

**제거 테이블**: 30+ 개
- AR 마커 관련 (`ARM_*` 시리즈)
- 캠페인/광고
- 국가/지역 리스트
- 상품 관리
- FCM 토큰

---

### 3. 핵심 플로우 (MVP)

```
1. 구름장터 승인
   ↓
   outlet 테이블에 lp_url 등록

2. 반경 쿠폰 발행
   ↓
   coupon 테이블 생성 (radius_meters 지정)

3. 사용자 위치 기반 조회
   ↓
   GET /api/coupon/nearby?lat=&lng=&radius=

4. 쿠폰톡톡 게임에서 획득
   ↓
   POST /api/game/reward/claim
   ↓
   collected_coupon 테이블 저장 (location POINT)

5. 지갑 확인
   ↓
   GET /api/wallet/coupons

6. 사용
   ↓
   POST /api/coupon/redeem
   ↓
   is_coupon = 'REDEEMED'
   ↓
   GET /api/coupon/redirect/:id → outlet.lp_url로 302 리다이렉트
```

---

## 🚀 다음 단계 제안

### Phase 1: 즉시 시작 가능
1. ✅ **DB 스키마 확정**
   - MVP 5개 테이블만 우선 생성
   - `outlet.lp_url`, `coupon.radius_meters` 컬럼 추가

2. ✅ **백엔드 정리**
   - 불필요한 모델/컨트롤러 제거
   - 7개 필수 API만 우선 구현

3. ✅ **로컬 환경 구축**
   - Docker MySQL 실행
   - .env 설정
   - 서버 실행 확인

### Phase 2: 1주일 내
4. ⏭️ **API 테스트**
   - Postman 컬렉션 생성
   - 각 API 동작 검증

5. ⏭️ **프론트 연결**
   - index.html에 API 호출 추가
   - "쿠폰톡톡" 버튼 연동

### Phase 3: 2주일 내
6. ⏭️ **게임 연동**
   - 쿠폰톡톡 게임 → /api/game/reward/claim
   - 지갑 저장 확인

7. ⏭️ **LP 리다이렉트**
   - /api/coupon/redirect 동작 확인
   - 구름장터 URL 이동 테스트

---

## ⚠️ 주의사항 (중요!)

### 🔴 절대 규칙
1. ❌ **index.html 절대 건드리지 않음**
   - 현재 라이브 서비스 중
   - 투자자 뷰 보호

2. ❌ **PR/머지 없음**
   - 모든 작업은 문서/제안으로만
   - 아미 검토 → OK 후에만 진행

3. ❌ **코드 리팩토링 금지 (지금은)**
   - 분석/정리만
   - 실제 수정은 다음 단계

### 🟡 보완 필요 사항
1. **ERD PDF 미확인**
   - 경로 문제로 아직 열어보지 못함
   - PDF 확인 후 테이블 매핑 재검토 필요

2. **merchant-backend 상세 분석 미진행**
   - user-backend 중심으로 분석
   - 상점 승인 로직은 merchant-backend 확인 필요

3. **Postman 컬렉션 미작성**
   - 다음 단계에서 생성 예정

---

## 📋 체크리스트

### 아미 검토 요청 항목
- [ ] MVP 테이블 5개 적절한가?
- [ ] 제거 테이블 30+ 개 동의하는가?
- [ ] API 7개로 1차 MVP 가능한가?
- [ ] `outlet.lp_url` 컬럼 추가 승인?
- [ ] Docker MySQL 사용 OK?

### 다음 작업 대기 항목
- [ ] ERD PDF 경로 확인 → 재분석
- [ ] merchant-backend 상세 분석
- [ ] Postman 컬렉션 생성
- [ ] .env.example → .env 실제 값 입력
- [ ] 로컬 서버 실행 테스트

---

## 💬 클로징 메시지

아미님, 제우스 오빠,

기존 쿠폰톡톡 백엔드를 분석한 결과, **구조는 탄탄하지만 MVP에 불필요한 기능이 과도**합니다.

**핵심 발견**:
- ✅ `collected_coupon` 테이블의 `location POINT` 필드 → 반경 쿠폰 완벽 지원
- ✅ Sequelize ORM → 테이블 정리만 하면 바로 사용 가능
- ✅ JWT 인증 → 보안 구조 갖춰짐

**제안**:
1. 40+ 테이블 → 5~8개로 다이어트
2. 7개 API만 우선 완성
3. "쿠폰톡톡 게임 → 지갑 → 구름장터" 플로우 집중

**다음 단계**:
- 아미님 검토 후 OK 나오면
- `backend-rebuild/` 폴더에 정리된 코드 작성 시작

천천히, 확실하게 갑시다! 🐰💜

---

**문서 위치**: `C:\petctt\backend-source\`  
**파일 3개**:
1. MVP-TABLE-MAPPING.md (테이블 분석)
2. MVP-API-DESIGN.md (API 설계)
3. LOCAL-SETUP-GUIDE.md (실행 가이드)

감사합니다! 🌹
