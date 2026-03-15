# PetCTT 구독 시스템 DB 스키마 v1.0

## 플랜 구조

| 플랜 | ID | 월간(₩) | 연간(₩) | 일일토큰 | AI감정분석 | GPS | 프로필 | 생체분석 | API |
|------|-----|---------|---------|----------|-----------|-----|--------|---------|-----|
| Free | free | 0 | 0 | 50 | 5회/일 | 기본 | 1개 | X | X |
| Standard | standard | 9,900 | 99,000 | 200 | 무제한 | 실시간 | 3개 | O | X |
| Premium | premium | 19,900 | 199,000 | 500 | 무제한 | 실시간+안심 | 5개 | O | O |

## DB 테이블

### 1. users
```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  provider      TEXT DEFAULT 'kakao',
  avatar_url    TEXT,
  plan_id       TEXT DEFAULT 'free',
  lang          TEXT DEFAULT 'ko',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### 2. plans
```sql
CREATE TABLE plans (
  id            TEXT PRIMARY KEY,
  name_ko       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  price_monthly INTEGER DEFAULT 0,
  price_yearly  INTEGER DEFAULT 0,
  daily_tokens  INTEGER DEFAULT 50,
  max_profiles  INTEGER DEFAULT 1,
  features      JSONB DEFAULT '{}',
  is_active     BOOLEAN DEFAULT true
);

INSERT INTO plans VALUES
('free','무료','Free',0,0,50,1,'{"ai_emotion":5,"gps":"basic","bio_scan":false}',true),
('standard','스탠다드','Standard',9900,99000,200,3,'{"ai_emotion":-1,"gps":"realtime","bio_scan":true}',true),
('premium','프리미엄','Premium',19900,199000,500,5,'{"ai_emotion":-1,"gps":"realtime+safe","bio_scan":true,"api":true}',true);
```

### 3. subscriptions
```sql
CREATE TABLE subscriptions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT REFERENCES users(id),
  plan_id       TEXT REFERENCES plans(id),
  status        TEXT DEFAULT 'active',
  billing_cycle TEXT DEFAULT 'monthly',
  started_at    TIMESTAMP DEFAULT NOW(),
  expires_at    TIMESTAMP,
  cancelled_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### 4. payments
```sql
CREATE TABLE payments (
  id            TEXT PRIMARY KEY,
  user_id       TEXT REFERENCES users(id),
  subscription_id TEXT REFERENCES subscriptions(id),
  amount        INTEGER NOT NULL,
  currency      TEXT DEFAULT 'KRW',
  method        TEXT,
  status        TEXT DEFAULT 'pending',
  pg_tx_id      TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### 5. usage_logs
```sql
CREATE TABLE usage_logs (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT REFERENCES users(id),
  action        TEXT NOT NULL,
  tokens_used   INTEGER DEFAULT 1,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_user_date ON usage_logs(user_id, created_at);
```

## 구독 흐름

```
[로그인] → users 조회/생성
    ↓
[마이페이지] → subscriptions 조회 → 현재 플랜 표시
    ↓
[요금제 선택] → 결제 진행 → payments 기록
    ↓
[구독 활성화] → subscriptions 생성/갱신
    ↓
[기능 사용] → usage_logs 기록 → 일일한도 체크
```

## 프론트 연동 (subscription.js)

```javascript
// localStorage 키
petctt_user     // { id, email, name, plan_id, ... }
petctt_plan     // 'free' | 'standard' | 'premium'
petctt_usage    // { daily: 3, monthly: 45, date: '2026-03-15' }
```

## 상태값

| status | 설명 |
|--------|------|
| active | 구독 활성 |
| expired | 기간 만료 |
| cancelled | 사용자 해지 |
| past_due | 결제 실패 |
