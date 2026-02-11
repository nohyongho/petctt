# PetCTT x 쿠폰톡톡 MVP 테이블 매핑표

**분석일**: 2026-02-04  
**분석 대상**: jldteam-user-backend, jldteam-merchant-backend  
**목표**: MVP용 핵심 테이블만 추출, 불필요한 레거시 제거

---

## 🎯 MVP 핵심 테이블 (8개)

### ✅ 1. user (유지)
**역할**: 사용자 계정 관리  
**핵심 컬럼**:
- `id` (PK)
- `email` (unique)
- `password` (bcrypt)
- `full_name`
- `contact_no`
- `user_status` (ENUM: active, blocked)
- `is_email_verified`
- `role_id` (FK → role)

**MVP 판단**: ✅ **필수** - 로그인/회원가입 핵심  
**변경사항**: 불필요한 SNS 연동 컬럼 제거 권장

---

### ✅ 2. coupon (유지)
**역할**: 쿠폰 발행 정보 (마스터)  
**핵심 컬럼**:
- `id` (PK)
- `outlet_id` (FK → outlet)
- `brand_id` (FK → brand)
- `coupon_name`
- `coupon_type` (ENUM: common, random, user_location)
- `total_coupons` / `remaining_coupons`
- `amount` / `percent_off`
- `valid_from` / `valid_till`
- `status` (ENUM: available, pending, expired)

**MVP 판단**: ✅ **필수** - 쿠폰톡톡 핵심  
**변경사항**: `coupon_type`에 'radius_based' 추가 고려

---

### ✅ 3. collected_coupon (유지)
**역할**: 사용자가 획득한 쿠폰 (지갑)  
**핵심 컬럼**:
- `id` (PK)
- `user_id` (FK → user)
- `coupon_id` (FK → coupon)
- `coupon_code_id` (FK → coupon_code)
- `location` (GEOMETRY POINT) ← **반경 기반 중요**
- `is_coupon` (ENUM: COLLECTED, REDEEMED, HIDDEN)
- `hash` - 보안용

**MVP 판단**: ✅ **필수** - 지갑/사용 기록  
**변경사항**: 없음 (완벽한 구조)

---

### ✅ 4. outlet (유지)
**역할**: 상점/아웃렛 위치 정보  
**핵심 컬럼**:
- `id` (PK)
- `brand_id` (FK → brand)
- `outlet_name`
- `latitude` / `longitude` ← **반경 쿠폰 핵심**
- `nearby_couponrange` (반경 m)
- `address` / `postal_code`
- `status`

**MVP 판단**: ✅ **필수** - 구름장터 승인 상점  
**변경사항**: `lp_url` 컬럼 추가 필요 (구름장터 LP 연결)

---

### ✅ 5. brand (유지)
**역할**: 브랜드 정보 (outlet/coupon 상위)  
**핵심 컬럼**:
- `id` (PK)
- `brand_name`
- `brand_logo`
- `status`

**MVP 판단**: ✅ **필수** - outlet/coupon 관계  
**변경사항**: 없음

---

### ✅ 6. user_wallet_crypto (유지 → 통합 검토)
**역할**: 사용자 암호화폐/토큰 지갑  
**핵심 컬럼**:
- `id` (PK)
- `user_id` (FK → user)
- `coin_id` (FK → coins)
- `balance_crypto` (DECIMAL 17,8)
- `status`

**MVP 판단**: 🔶 **선택** - 쿠폰 거래장터 필요 시  
**변경사항**: `user_wallet_fiat`와 통합하여 `user_wallet` 하나로 단순화 권장

---

### ✅ 7. transaction_crypto (유지 → 통합 검토)
**역할**: 거래/정산 기록  
**핵심 컬럼**:
- `id` (PK)
- `txn_initiater_user_id` (FK → user)
- `debit_wallet_id` / `credit_wallet_id`
- `amount_crypto`
- `fee_crypto`
- `blockchain_txn_id`
- `txn_status`

**MVP 판단**: 🔶 **선택** - 거래장터 1차 MVP 후  
**변경사항**: `transaction_fiat`와 통합하여 `transactions` 하나로

---

### ✅ 8. orders (유지 최소화)
**역할**: 쿠폰 사용/주문 연동  
**핵심 컬럼**:
- `id` (PK)
- `user_id` (FK → user)
- `outlet_id` (FK → outlet)
- `total_amount`
- `order_status`

**MVP 판단**: 🔶 **선택** - 쿠폰 사용 시 주문 연계용  
**변경사항**: MVP에서는 collected_coupon의 상태만으로 충분

---

## ❌ 제거 후보 테이블 (MVP에서 불필요)

| 테이블명 | 이유 |
|---------|------|
| `ARM_*` 시리즈 (6개) | AR 마커 관련, MVP 범위 밖 |
| `campaign` | 광고 캠페인, 1차 MVP 불필요 |
| `country_list`, `state_list`, `city_list` | 글로벌 확장 전 불필요 |
| `coupon_code` | 쿠폰 코드 개별 관리 (collected_coupon에 통합 가능) |
| `fcm` | 푸시 알림, 2차 기능 |
| `products`, `product_types` | 상품 관리, 쿠폰 중심 MVP에선 과도 |
| `user_address` | 배송 주소, MVP 불필요 |
| `user_verification` | 이메일 인증은 user 테이블에 충분 |

---

## 🔧 MVP 스키마 단순화 제안

### Before (기존 40+ 테이블)
```
user, user_detail, user_address, user_verification, user_wallet_crypto, 
user_wallet_fiat, coupon, coupon_code, coupon_category, collected_coupon, 
outlet, brand, campaign, ARM_*, fcm, products, orders, transactions...
```

### After (MVP 8개 핵심)
```
✅ user
✅ brand
✅ outlet (+ lp_url 컬럼 추가)
✅ coupon
✅ collected_coupon
🔶 wallet (crypto+fiat 통합)
🔶 transactions (crypto+fiat 통합)
🔶 orders (선택)
```

---

## 📊 테이블 관계도 (MVP)

```
user (1) ────< (N) collected_coupon
              └──< (N) wallet
              └──< (N) transactions

brand (1) ───< (N) outlet
              └──< (N) coupon

outlet (1) ──< (N) coupon

coupon (1) ──< (N) collected_coupon

collected_coupon (N) ──> (1) user
                      ──> (1) coupon
```

---

## 💡 추가 필요 컬럼

### outlet 테이블
```sql
ALTER TABLE outlet ADD COLUMN lp_url VARCHAR(500);
-- 구름장터 승인 후 LP URL 저장
```

### coupon 테이블
```sql
ALTER TABLE coupon ADD COLUMN radius_meters INT DEFAULT 1000;
-- 반경 쿠폰 배포 거리 (m)
```

### collected_coupon 테이블
```sql
-- 이미 location GEOMETRY POINT 존재 → 완벽
-- hash 컬럼 활용 (보안/중복 방지)
```

---

## 🎯 결론

**MVP 필수 테이블**: 5개 (user, brand, outlet, coupon, collected_coupon)  
**MVP 선택 테이블**: 3개 (wallet, transactions, orders)  
**제거 테이블**: 30+ 개 (AR, 캠페인, 광고, 국가 리스트 등)

**핵심 플로우**:
1. 구름장터 승인 (outlet.lp_url 등록)
2. 반경 쿠폰 발행 (coupon.radius_meters 기준)
3. 게임에서 쿠폰 획득 (collected_coupon 생성 + location 기록)
4. 지갑 확인 (collected_coupon 조회)
5. 사용 (is_coupon = 'REDEEMED' + outlet.lp_url 이동)

**다음 단계**: API 엔드포인트 설계 → 로컬 실행 가이드
