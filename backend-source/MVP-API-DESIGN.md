# PetCTT MVP API 엔드포인트 설계

**설계일**: 2026-02-04  
**기반**: 기존 user-backend + merchant-backend 분석  
**목표**: MVP 최소 API 세트 (확장 가능)

---

## 🔐 1. Auth & User (인증/사용자)

### POST /api/auth/register
**기능**: 사용자 회원가입  
**요청**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "홍길동",
  "contact_no": "010-1234-5678"
}
```
**응답**:
```json
{
  "success": true,
  "message": "회원가입 성공. 이메일 인증을 확인하세요.",
  "data": {
    "user_id": 123,
    "email": "user@example.com"
  }
}
```

---

### POST /api/auth/login
**기능**: 로그인  
**요청**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**응답**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user_id": 123,
    "email": "user@example.com",
    "full_name": "홍길동",
    "user_status": "active"
  }
}
```

---

### GET /api/auth/profile
**기능**: 내 프로필 조회  
**헤더**: `Authorization: Bearer {token}`  
**응답**:
```json
{
  "success": true,
  "data": {
    "user_id": 123,
    "email": "user@example.com",
    "full_name": "홍길동",
    "contact_no": "010-1234-5678"
  }
}
```

---

## 🏪 2. Merchant & Outlet (상점/구름장터)

### POST /api/merchant/apply
**기능**: 구름장터 입점 신청  
**헤더**: `Authorization: Bearer {token}`  
**요청**:
```json
{
  "brand_name": "스타벅스",
  "outlet_name": "스타벅스 강남점",
  "lp_url": "https://example.com/shop/123",
  "latitude": "37.5012345",
  "longitude": "127.0398765",
  "address": "서울시 강남구...",
  "nearby_couponrange": 1000
}
```
**응답**:
```json
{
  "success": true,
  "message": "입점 신청 완료. 승인 대기 중입니다.",
  "data": {
    "outlet_id": 456,
    "status": "pending"
  }
}
```

---

### GET /api/outlet/:id
**기능**: 상점 정보 조회  
**응답**:
```json
{
  "success": true,
  "data": {
    "outlet_id": 456,
    "outlet_name": "스타벅스 강남점",
    "lp_url": "https://example.com/shop/123",
    "latitude": "37.5012345",
    "longitude": "127.0398765",
    "nearby_couponrange": 1000,
    "brand": {
      "brand_id": 10,
      "brand_name": "스타벅스"
    }
  }
}
```

---

## 🎟️ 3. Coupon (쿠폰 발행/조회)

### POST /api/coupon/issue
**기능**: 반경 쿠폰 발행 (관리자/상점)  
**헤더**: `Authorization: Bearer {token}`  
**요청**:
```json
{
  "outlet_id": 456,
  "coupon_name": "아메리카노 50% 할인",
  "coupon_type": "radius_based",
  "total_coupons": 100,
  "percent_off": 50,
  "radius_meters": 1000,
  "valid_from": "2026-02-04T00:00:00Z",
  "valid_till": "2026-02-28T23:59:59Z"
}
```
**응답**:
```json
{
  "success": true,
  "message": "쿠폰 발행 완료",
  "data": {
    "coupon_id": 789,
    "remaining_coupons": 100
  }
}
```

---

### GET /api/coupon/nearby
**기능**: 내 주변 쿠폰 조회 (반경 기반)  
**헤더**: `Authorization: Bearer {token}`  
**파라미터**: `?lat=37.5012345&lng=127.0398765&radius=5000`  
**응답**:
```json
{
  "success": true,
  "data": [
    {
      "coupon_id": 789,
      "coupon_name": "아메리카노 50% 할인",
      "percent_off": 50,
      "remaining_coupons": 95,
      "valid_till": "2026-02-28T23:59:59Z",
      "outlet": {
        "outlet_id": 456,
        "outlet_name": "스타벅스 강남점",
        "distance_meters": 450
      }
    }
  ]
}
```

---

## 🎮 4. Game Reward (게임 보상 → 쿠폰 획득)

### POST /api/game/reward/claim
**기능**: 쿠폰톡톡 게임에서 쿠폰 획득  
**헤더**: `Authorization: Bearer {token}`  
**요청**:
```json
{
  "coupon_id": 789,
  "game_session_id": "session_abc123",
  "location": {
    "latitude": 37.5012345,
    "longitude": 127.0398765
  }
}
```
**응답**:
```json
{
  "success": true,
  "message": "쿠폰 획득 성공! 지갑에 저장되었습니다.",
  "data": {
    "collected_coupon_id": 999,
    "coupon_name": "아메리카노 50% 할인",
    "is_coupon": "COLLECTED",
    "hash": "a1b2c3d4..."
  }
}
```

---

## 💼 5. Wallet (지갑)

### GET /api/wallet/coupons
**기능**: 내 지갑의 쿠폰 목록  
**헤더**: `Authorization: Bearer {token}`  
**파라미터**: `?status=COLLECTED` (옵션: COLLECTED, REDEEMED, HIDDEN)  
**응답**:
```json
{
  "success": true,
  "data": [
    {
      "collected_coupon_id": 999,
      "coupon": {
        "coupon_id": 789,
        "coupon_name": "아메리카노 50% 할인",
        "percent_off": 50,
        "valid_till": "2026-02-28T23:59:59Z"
      },
      "outlet": {
        "outlet_id": 456,
        "outlet_name": "스타벅스 강남점",
        "lp_url": "https://example.com/shop/123"
      },
      "is_coupon": "COLLECTED",
      "collected_at": "2026-02-04T10:30:00Z"
    }
  ]
}
```

---

## ✅ 6. Coupon Usage (쿠폰 사용)

### POST /api/coupon/redeem
**기능**: 쿠폰 사용 (상태 변경)  
**헤더**: `Authorization: Bearer {token}`  
**요청**:
```json
{
  "collected_coupon_id": 999
}
```
**응답**:
```json
{
  "success": true,
  "message": "쿠폰 사용 완료",
  "data": {
    "collected_coupon_id": 999,
    "is_coupon": "REDEEMED",
    "redeemed_at": "2026-02-04T14:00:00Z",
    "redirect_url": "https://example.com/shop/123"
  }
}
```

---

### GET /api/coupon/redirect/:collected_id
**기능**: 쿠폰 사용 시 LP URL로 리다이렉트  
**동작**:
1. collected_coupon 유효성 검증
2. is_coupon = 'REDEEMED' 상태 변경
3. outlet.lp_url로 302 리다이렉트

**응답**: `HTTP 302 Redirect to {lp_url}`

---

## 🏪 7. Market (쿠폰 거래장터 - 선택)

### POST /api/market/list
**기능**: 보유 쿠폰 거래 등록  
**헤더**: `Authorization: Bearer {token}`  
**요청**:
```json
{
  "collected_coupon_id": 999,
  "price": 5000,
  "currency": "KRW"
}
```
**응답**:
```json
{
  "success": true,
  "message": "거래 등록 완료",
  "data": {
    "listing_id": 111,
    "price": 5000,
    "status": "active"
  }
}
```

---

### GET /api/market/listings
**기능**: 거래장터 쿠폰 목록  
**파라미터**: `?page=1&limit=20`  
**응답**:
```json
{
  "success": true,
  "data": [
    {
      "listing_id": 111,
      "coupon_name": "아메리카노 50% 할인",
      "price": 5000,
      "seller": {
        "user_id": 456,
        "full_name": "판매자A"
      },
      "created_at": "2026-02-04T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total_pages": 5
  }
}
```

---

### POST /api/market/buy
**기능**: 쿠폰 구매  
**헤더**: `Authorization: Bearer {token}`  
**요청**:
```json
{
  "listing_id": 111
}
```
**응답**:
```json
{
  "success": true,
  "message": "구매 완료. 지갑에 저장되었습니다.",
  "data": {
    "collected_coupon_id": 1000,
    "transaction_id": 5555
  }
}
```

---

## 🔧 8. Utility

### GET /health
**기능**: 서버 상태 확인  
**응답**: `Api ok. TAK`

---

### GET /api/config/general
**기능**: 앱 설정 조회 (선택)  
**응답**:
```json
{
  "success": true,
  "data": {
    "default_radius_meters": 1000,
    "max_coupons_per_user": 10,
    "game_reward_probability": 0.3
  }
}
```

---

## 📋 API 그룹별 우선순위

| 우선순위 | 그룹 | 엔드포인트 수 | MVP 필수 여부 |
|---------|------|--------------|--------------|
| 🔴 P0 | Auth | 3개 | ✅ 필수 |
| 🔴 P0 | Coupon | 2개 | ✅ 필수 |
| 🔴 P0 | Game Reward | 1개 | ✅ 필수 |
| 🔴 P0 | Wallet | 1개 | ✅ 필수 |
| 🟡 P1 | Merchant | 2개 | ⚠️ 준필수 |
| 🟡 P1 | Coupon Usage | 2개 | ⚠️ 준필수 |
| 🟢 P2 | Market | 3개 | 🔶 선택 (2차 MVP) |
| 🟢 P2 | Utility | 2개 | 🔶 선택 |

---

## 🎯 1차 MVP 최소 API (7개)

```
✅ POST /api/auth/register
✅ POST /api/auth/login
✅ GET /api/coupon/nearby
✅ POST /api/game/reward/claim
✅ GET /api/wallet/coupons
✅ POST /api/coupon/redeem
✅ GET /api/coupon/redirect/:collected_id
```

**이 7개만 있으면**:
- 회원가입/로그인
- 주변 쿠폰 조회
- 게임에서 쿠폰 획득
- 지갑 확인
- 쿠폰 사용 + LP 이동

---

## 📦 다음 단계

1. ✅ 테이블 매핑표 완료
2. ✅ API 설계 완료
3. ⏭️ 로컬 실행 가이드 작성 (.env.example + Docker)
4. ⏭️ Postman 컬렉션 생성

**아미 검토 후 다음 단계 진행 예정**
