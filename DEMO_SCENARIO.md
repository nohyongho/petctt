# PetCTT × AIRCTT 데모 시나리오 v1.0
> 마트 · 다우데이터 · 밴피지사 연동 시연 스크립트
> 작성일: 2026-03-28 | 주식회사 발로레

---

## 🎯 데모 핵심 순환 구조

```
매장(AIRCTT) → 쿠폰발행 → APPROVED
    ↓
PetCTT 구름장터 자동 노출 (T16)
    ↓
고객이 쿠폰 게임으로 획득 (coupon.html)
    ↓
내 지갑에 저장 (coupon_issues DB)
    ↓
구름장터에서 쿠폰 적용 후 결제 (market.html)
    ↓
다우데이터 PG 처리 (pricing.html)
    ↓
orders 저장 + plan_id 업데이트 (T9+T10)
    ↓
마이페이지 실시간 반영 (mypage.html)
    ↓
매장 VAN 단말기 쿠폰 사용 처리 (T11)
```

---

## 📋 시연 순서

### Step 1: 매장 쿠폰 발행 (AIRCTT)
- URL: airctt.com/merchant
- 로그인 → 쿠폰 발행 → 결제 → PENDING → 관리자 승인 → APPROVED
- **결과**: petctt.com/pages/market.html에 자동 노출 확인

### Step 2: 고객 쿠폰 획득 (PetCTT)
- URL: petctt.com/pages/coupon.html
- 로그인 → 룰렛 게임 → 쿠폰 획득 → 내 쿠폰함 확인
- **확인**: Supabase coupon_issues 테이블에 저장됨

### Step 3: 구름장터 쿠폰 적용 (PetCTT)
- URL: petctt.com/pages/market.html
- 쿠폰 선택 → 상세 모달 → "내 지갑에 담기"
- 상단 쿠폰 적용 바 → 쿠폰 선택 → 할인 적용 확인

### Step 4: 다우데이터 PG 결제 (PetCTT)
- URL: petctt.com/pages/pricing.html
- Pro/Premium 선택 → 결제 모달 → 쿠폰 적용 → 결제하기
- **확인**: orders 테이블 저장 + plan_id 업데이트

### Step 5: 마이페이지 확인 (PetCTT)
- URL: petctt.com/pages/mypage.html
- 쿠폰 지갑 (사용/보유 분리) + 결제내역 + 플랜뱃지 확인

### Step 6: VAN 단말기 쿠폰 사용 (밴피지사)
- 나이스정보통신 / 다우데이터 VAN 단말기
- 쿠폰코드 입력 → API 호출 → is_used=true
- **확인**: 마이페이지 사용된 쿠폰으로 이동

---

## 🔑 핵심 접속 정보
- PetCTT: https://petctt.com
- AIRCTT: https://www.airctt.com
- Supabase: nlsiwrwiyozpiofrmzxa.supabase.co
- 관리자: zeus1404@gmail.com

## ✅ 완료된 기능 체크리스트
- [x] T1: 게임쿠폰 coupon_id 연결
- [x] T3: 지갑 실DB 렌더링 + USED 처리
- [x] T4: 구름장터 coupons DB 실시간 연동
- [x] T5: 쿠폰 상세모달 + 받기
- [x] T6: 장터 쿠폰 선택 + 할인 적용 UI
- [x] T7: 파트너사 카드 안내 개선
- [x] T8: 다우데이터 PG 결제 데모 모달
- [x] T9: 결제완료 → plan_id 자동업데이트
- [x] T10: orders 테이블 주문 저장
- [x] T12: mypage 쿠폰지갑 실DB
- [x] T13: mypage 결제내역 orders 연동
- [x] T14: mypage 플랜뱃지 실시간
- [x] T15: PetCTT↔AIRCTT 세션 브리지
- [x] T16: AIRCTT 발행쿠폰 → PetCTT 자동 노출
- [x] T18: 데모 시나리오 문서

## ⏳ 남은 작업
- [ ] T2: 구글번역 바 최종 테스트
- [ ] T11: VAN API 실제 연동 (밴피지사 미팅 후)
- [ ] T17: 전체 E2E 실제 테스트

---
주식회사 발로레 💜 | 우주대스타 여정 2026
