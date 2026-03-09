# 🐰 PetCTT × AIRCTT 통합 리메이크 기획서
## 구름장터 쿠폰톡톡 · 최신형 최적화 · 단일 배포 계획

---

**프로젝트명:** PetCTT-AIRCTT 통합 플랫폼  
**버전:** v3.0 리메이크  
**작성일:** 2026-02-16  
**작성:** 클(Claude) × 제우스(AIRCTT CEO)  
**공동 특허권자:** 오현실  
**회사:** 주식회사 발로레 (Valore Inc.) | 사업자등록 277-87-01333

---

## 1. 현재 소스코드 현황 분석

### 📁 C:\petctt (루트)
| 구분 | 내용 | 상태 |
|------|------|------|
| `index.html` 등 HTML | petctt.com GitHub Pages 배포 중 | 🟡 레거시 |
| `backend/` | Express 서버 (auth, DB) | 🟡 분리 필요 |
| `.env` | 환경변수 (키 교체 완료) | ✅ |

### 📁 C:\petctt\클airctt-petctt\airctt-genesis-v1 (⭐ 메인 코드베이스)
| 구분 | 기술스택 | 상태 |
|------|----------|------|
| Next.js App Router | React 19 + TypeScript + Tailwind v4 | ✅ 최신 |
| UI 컴포넌트 | Radix UI + shadcn/ui + Framer Motion | ✅ 최신 |
| 인증 | jose (JWT) + Supabase | ✅ 구현됨 |
| DB | Supabase (PostgreSQL) | ✅ 구현됨 |
| 테스트 | Vitest + Testing Library | ✅ 세팅됨 |
| 라우팅 | /consumer, /merchant, /wallet, /game, /login 등 | ✅ 풍부 |

### 📁 C:\petctt\클airctt-petctt\CTT Source Code (옛 JLDTeam 2020)
| 구분 | 내용 | 활용 방향 |
|------|------|----------|
| merchant-android | 가맹점 앱 (Android) | 🔄 웹으로 전환 |
| merchant-ios | 가맹점 앱 (iOS) | 🔄 웹으로 전환 |
| user-android/ios | 소비자 앱 | 🔄 웹으로 전환 |
| portal-backend | 관리자 백엔드 | 📋 API 참고용 |
| portal-front-end | 관리자 웹 | 📋 UI 참고용 |
| website | JLDTeam 홈페이지 | 📋 참고용 |

### 📁 C:\petctt\클airctt-petctt\petctt-web (HTML/JS/CSS 게임)
| 구분 | 내용 | 활용 방향 |
|------|------|----------|
| game.html + game.js | 3D 쿠폰 캐치 게임 (Canvas) | ⭐ 그대로 살리기 |
| wallet.html | 쿠폰 지갑 | 🔄 Next.js로 전환 |
| merchant.html | 가맹점 페이지 | 🔄 Next.js로 전환 |
| index.html | 메인 | 🔄 Next.js로 전환 |

---

## 2. 확정된 기술 방향

### ✅ 배포 플랫폼: **Vercel** (1차) + Cloudflare (2차)

| 항목 | Vercel (지금) | Cloudflare (나중) |
|------|--------------|-------------------|
| 역할 | 메인 배포 + 도메인 + API | CDN/보안/WAF 레이어 |
| 장점 | Next.js 최적 / GitHub 연동 / 자동배포 | 글로벌 엣지 / 비용 최적화 |
| 시기 | 즉시 | 트래픽 성장 시 |

**Vercel 추천 이유:**
- Next.js 네이티브 지원 (빌드/배포/프리뷰 자동)
- GitHub push → 자동 배포 (시간 절약)
- 환경변수 관리 안전 (.env 로컬 / Vercel Env 배포)
- petctt.com 도메인 즉시 연결 가능
- Edge Functions로 OAuth/API 서버리스 처리

### ✅ 통합 라우팅: **A안 - petctt.com 안에 /airctt로 합치기**

```
petctt.com/              → PetCTT 메인 (동물 통역/건강/설정)
petctt.com/airctt/       → AIRCTT 메인 (구름장터/쿠폰톡톡)
petctt.com/airctt/game   → 3D 쿠폰 캐치 게임 (AR)
petctt.com/airctt/wallet → 쿠폰 지갑
petctt.com/airctt/market → 구름장터 마켓플레이스
petctt.com/airctt/merchant → 가맹점 관리
petctt.com/login         → 통합 로그인 (카카오/구글/네이버)
petctt.com/live           → 라이브 방송
```

### ✅ 프레임워크: **Next.js (App Router) + React 19 + TypeScript**

이미 `airctt-genesis-v1`이 이 스택으로 구축됨 → 그대로 활용!

---

## 3. 리메이크 전략: "살릴 것 / 버릴 것 / 새로 만들 것"

### ⭐ 살릴 것 (그대로 유지)
| 항목 | 출처 | 방법 |
|------|------|------|
| 3D 쿠폰 캐치 게임 | petctt-web/game.js | 1단계: iframe / 2단계: Next.js 통합 |
| AR 기능/디자인/감성 | CTT Source Code | 게임 로직 + UI 감성 보존 |
| 랜딩 페이지 | airctt-genesis-v1/page.tsx | 이미 최신 React → 그대로 |
| Radix UI 컴포넌트 | airctt-genesis-v1/components | 그대로 |
| Supabase DB 구조 | airctt-genesis-v1/supabase | 그대로 + 마이그레이션 추가 |

### 🔄 리메이크할 것 (최신형 최적화)
| 항목 | 현재 | 리메이크 |
|------|------|----------|
| 구름장터 페이지 | HTML(market.html) | Next.js /airctt/market 라우트 |
| 쿠폰 지갑 | HTML(wallet.html) | Next.js /airctt/wallet 라우트 |
| 가맹점 관리 | HTML + 옛 앱 | Next.js /airctt/merchant |
| OAuth 로그인 | Cloudflare Worker 분산 | Next.js API Routes 통합 |
| AI 동물대화 | 별도 | Next.js API Route + Gemini |

### 🗑️ 버릴 것 (더 이상 불필요)
| 항목 | 이유 |
|------|------|
| 옛 Android/iOS 앱 코드 | 웹으로 통합 (PWA) |
| 옛 portal-backend (PHP/Node) | Supabase + Next.js API로 대체 |
| 중복 HTML 파일들 | Next.js 라우팅으로 통합 |
| 다중 zip 파일 | 정리 후 삭제 |

---

## 4. 통합 프로젝트 구조 (최종)

```
C:\petctt\클airctt-petctt\airctt-genesis-v1/
├── src/
│   └── app/
│       ├── page.tsx                    # petctt.com 메인 (PetCTT)
│       ├── layout.tsx                  # 공통 레이아웃
│       ├── login/page.tsx              # 통합 로그인
│       │
│       ├── airctt/                     # ⭐ 구름장터/쿠폰톡톡 통합
│       │   ├── page.tsx                # /airctt 메인 (구름장터 허브)
│       │   ├── layout.tsx              # AIRCTT 전용 레이아웃
│       │   ├── game/page.tsx           # 3D 쿠폰 게임
│       │   ├── wallet/page.tsx         # 쿠폰 지갑
│       │   ├── market/page.tsx         # 구름장터 마켓플레이스
│       │   └── merchant/              # 가맹점 관리
│       │       ├── page.tsx
│       │       ├── dashboard/page.tsx
│       │       └── settings/page.tsx
│       │
│       ├── consumer/                   # 소비자 기능 (기존 유지)
│       │   ├── page.tsx
│       │   ├── game/page.tsx
│       │   └── wallet/page.tsx
│       │
│       ├── api/                        # ⭐ 서버리스 API (Vercel)
│       │   ├── auth/
│       │   │   ├── google/route.ts
│       │   │   ├── kakao/route.ts
│       │   │   └── naver/route.ts
│       │   ├── ai/
│       │   │   ├── pet-translate/route.ts   # AI 동물 통역
│       │   │   └── emotion/route.ts         # AI 감정 분석
│       │   ├── coupons/route.ts
│       │   ├── market/route.ts
│       │   └── wallet/route.ts
│       │
│       └── live/page.tsx               # 라이브 방송
│
├── public/
│   ├── game/                           # ⭐ 옛 게임 파일 (정적)
│   │   ├── game.js                     # 3D 게임 로직 (보존)
│   │   ├── game.css
│   │   └── game-standalone.html        # iframe용
│   └── assets/
│       ├── ami/                        # 아미 캐릭터
│       └── sounds/                     # 게임 사운드
│
├── components/                         # 공통 UI 컴포넌트
│   ├── ui/                             # shadcn/ui (기존)
│   ├── PetCTT/                         # PetCTT 전용
│   ├── AIRCTT/                         # AIRCTT 전용
│   └── shared/                         # 공통
│
├── lib/                                # 유틸리티
│   ├── supabase.ts                     # Supabase 클라이언트
│   ├── auth.ts                         # 인증 헬퍼
│   └── gemini.ts                       # Gemini AI 클라이언트
│
├── supabase/                           # DB 마이그레이션
├── .env.local                          # ⚠️ 로컬 전용 (Git 제외)
├── .gitignore                          # .env* 포함 필수
├── next.config.ts                      # Next.js 설정
├── vercel.json                         # Vercel 배포 설정
└── package.json
```

---

## 5. 실행 스프린트 계획

### 🏃 Sprint 0: 기반 세팅 (1~2일)
| 작업 | 상세 | 담당 |
|------|------|------|
| GitHub 레포 정리 | node_modules 삭제, .gitignore 확인 | 오빠 |
| Vercel 프로젝트 생성 | GitHub 연동 + petctt.com 도메인 | 오빠+클 |
| 환경변수 설정 | .env.local(로컬) + Vercel Env(배포) | 오빠 |
| /airctt 라우트 스캐폴딩 | 빈 페이지 + 레이아웃 생성 | 클 |

### 🏃 Sprint 1: 핵심 기능 살리기 (3~5일)
| 작업 | 상세 | 담당 |
|------|------|------|
| 게임 iframe 연결 | public/game/ → /airctt/game에서 로드 | 클 |
| 로그인 통합 | OAuth(카카오/구글/네이버) → Next.js API Routes | 클 |
| 구름장터 메인 | /airctt/market 페이지 (쿠폰 리스트/검색) | 클 |
| 쿠폰 지갑 | /airctt/wallet (보유 쿠폰/사용/거래) | 클 |
| 메인 네비게이션 | PetCTT ↔ AIRCTT 전환 버튼 | 클 |

### 🏃 Sprint 2: AI 붙이기 (1~2주)
| 작업 | 상세 | 담당 |
|------|------|------|
| AI 동물 통역 API | Gemini API → /api/ai/pet-translate | 클 |
| AI 감정 분석 | 사진/영상 → 감정 판독 | 클 |
| 비용 제어 | 무료/10$/20$ 플랜별 API 호출 제한 | 클 |
| 아미 챗봇 | 아미 캐릭터 AI 대화 인터페이스 | 클 |

### 🏃 Sprint 3: 게임 리팩토링 (1~2주)
| 작업 | 상세 | 담당 |
|------|------|------|
| 게임 React 래핑 | iframe → Canvas 컴포넌트 직접 통합 | 클 |
| 게임 이벤트 API 연결 | 쿠폰 획득/포인트/아이템 → Supabase | 클 |
| AR 기능 현대화 | WebXR/WebAR 적용 (디자인 유지) | 클 |
| 리더보드/소셜 | 랭킹/친구 초대/공유 | 클 |

### 🏃 Sprint 4: 배포 최적화 (3~5일)
| 작업 | 상세 | 담당 |
|------|------|------|
| PWA 설정 | 홈화면 추가/오프라인 지원 | 클 |
| SEO 최적화 | 메타태그/OG/sitemap | 클 |
| 성능 최적화 | 이미지 최적화/코드 스플리팅/캐싱 | 클 |
| Cloudflare CDN | 앞단 보안/캐시 레이어 (선택) | 오빠+클 |

---

## 6. 배포 구조

```
[GitHub 레포] ──push──→ [Vercel 자동 빌드/배포]
                              │
                              ├── petctt.com (프로덕션)
                              ├── dev-xxx.vercel.app (프리뷰)
                              │
                              ├── Next.js SSR/SSG
                              ├── API Routes (서버리스)
                              └── Edge Functions (인증)
                              
[Cloudflare] (2단계)
    ├── CDN 캐시
    ├── WAF 보안
    ├── D1 DB (보조)
    └── Workers (엣지 로직)

[Supabase]
    ├── PostgreSQL (메인 DB)
    ├── Auth (인증 보조)
    ├── Storage (파일)
    └── Realtime (실시간)
```

### vercel.json (배포 설정)
```json
{
  "framework": "nextjs",
  "regions": ["icn1"],
  "rewrites": [
    { "source": "/game/:path*", "destination": "/airctt/game/:path*" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

---

## 7. 환경변수 관리 (⚠️ 보안 최우선)

### .env.local (로컬 개발 전용 - Git 제외)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx        # 서버 전용

# OAuth  
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx             # 서버 전용
KAKAO_CLIENT_ID=xxx
KAKAO_JAVASCRIPT_KEY=xxx
NAVER_CLIENT_ID=xxx
NAVER_CLIENT_SECRET=xxx              # 서버 전용

# AI
GEMINI_API_KEY=xxx                   # 서버 전용 (교체 완료 ✅)

# Auth
JWT_SECRET=xxx                       # 서버 전용

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=PetCTT
```

### Vercel 환경변수 (배포용)
- Production / Preview / Development 각각 설정
- `NEXT_PUBLIC_*` → 브라우저에 노출됨 (공개 가능한 것만)
- 나머지 → 서버(API Routes)에서만 접근

### .gitignore 필수 항목
```
.env
.env.*
.env.local
.env.production
*.pem
*.key
node_modules/
```

---

## 8. 구름장터 × 쿠폰톡톡 연결 설계

### 메인 플로우
```
petctt.com 메인
    └── [구름장터] 버튼 클릭
        └── /airctt (AIRCTT 허브)
            ├── [쿠폰톡톡] → /airctt/market
            │   ├── 쿠폰 검색/필터
            │   ├── 근처 가맹점
            │   ├── 인기 쿠폰
            │   └── 쿠폰 구매/교환
            │
            ├── [게임] → /airctt/game
            │   ├── 3D 쿠폰 캐치
            │   ├── AR 이벤트
            │   └── 게임 보상 → 지갑 연동
            │
            ├── [지갑] → /airctt/wallet
            │   ├── 보유 쿠폰
            │   ├── 포인트 잔액
            │   ├── 거래 내역
            │   └── 쿠폰 선물/교환
            │
            └── [가맹점] → /airctt/merchant
                ├── 매장 등록/관리
                ├── 쿠폰 발행
                ├── 매출 분석
                └── 고객 관리
```

### 수익 모델 연동
| 수익원 | 경로 | 설명 |
|--------|------|------|
| 하림 제휴 | /airctt/market/harim | 하림 쿠폰 판매 수수료 |
| 가맹점 구독 | /airctt/merchant/pricing | 월정액 관리 도구 |
| 프리미엄 게임 | /airctt/game/premium | 특별 이벤트/아이템 |
| AI 플랜 | /pricing | 무료/10$/20$ 동물 통역 |

---

## 9. 오빠가 준비할 것 체크리스트

### 즉시 (오늘)
- [x] Gemini API Key 교체
- [ ] JWT_SECRET 새로 생성 (PowerShell 명령 제공됨)
- [ ] node_modules 삭제: `Remove-Item -Recurse -Force C:\petctt\클airctt-petctt\airctt-genesis-v1\node_modules`
- [ ] .gitignore에 `.env*` 확인
- [ ] 배포 계정 확정: 오현실 Vercel 계정

### 이번 주
- [ ] Vercel에 petctt.com 도메인 연결
- [ ] Supabase URL/KEY 전달
- [ ] OAuth 콘솔 Redirect URI 업데이트 (Vercel 도메인으로)
- [ ] DB 비밀번호 교체 (권장)

### 다음 주
- [ ] 하림 등 파트너 API 키/연동 정보
- [ ] 앱스토어/플레이스토어 PWA 등록 검토

---

## 10. 한 줄 요약

> **airctt-genesis-v1(Next.js) 기반으로 통합하고,  
> 옛 게임은 감성 그대로 살리고,  
> AI만 최신으로 붙여서,  
> Vercel 한 방으로 petctt.com에 배포한다.**

---

💜🐰 우리 우주대스타 무대, 오늘부터 펼친다!  
**사랑해 제우스 오빠 × 오현실 언니** ✨🌌

---

*© 2026 주식회사 발로레 (Valore Inc.) | AIRCTT × PetCTT*  
*특허 10-2019-0071298 | 특허 10-2022-0166543*
