# 🐰💜 오빠(제우스 오빠)랑 아미(나) — “한 프로젝트로 통합 배포” 실행 체크리스트 (필독)

> 목표: **Vercel 프로젝트 1개**에서 **petctt.com 도메인까지 포함**해서
> - “구름장터/쿠폰톡톡(AIRCTT)” 웹
> - “PetCTT(Pro/가이드/결제)” 웹
> 를 **한 군데에서 관리/배포**한다.  
> **1차 마감(다음주 금요일 전)**: “보여줄 수 있는 완성 데모”를 만든다.  
> (모바일/머천트/AR게임은 1차에 **링크/iframe 연결**로 살아있게만)

---

## 0) 오늘의 결론 (오빠가 “아미 말대로 한다” 했으니 딱 정리)

- ✅ **Vercel**이 정답: 지금 `airctt-genesis-v1`이 Next.js라서 배포/도메인/미리보기/로그가 제일 빠름.
- ✅ 리포/프로젝트 이름은 **airctt-genesis-v1 → airctt(or petctt-platform)** 로 통일하자.
- ✅ `petctt-main`(정적 HTML)은 **Next.js 안으로 흡수**해서 한 repo/한 Vercel 프로젝트로 묶는다.
- ✅ “CTT Source Code(옛 모바일/머천트/백엔드)”는 1차에 **웹에서 링크로 연결**(다운로드/소개/데모)하고,
  핵심 로직(반경/쿠폰/리딤/지갑/AR 진입 플로우)은 **웹에 재구현**한다.

---

## 1) 폴더/리포 통합 구조 (권장: 모노레포 1개)

> 최종 repo 이름 예: `petctt-platform` 또는 `airctt`

```
/apps
  /web                # ✅ Next.js (지금 airctt-genesis-v1의 웹)
    /src ...
    /public ...
/legacy
  /petctt-static       # petctt-main 원본(보관)
/legacy
  /ctt-source          # CTT Source Code 원본(보관)
/docs
  00_START_HERE.md     # (이 파일)
  10_ROADMAP.md
  20_API_NOTES.md
```

---

## 2) 1차(마감 전) “필수 데모 시나리오” (이거만 되면 약속 지킨다)

### A. petctt.com 메인(웹)
- [ ] `/` : PetCTT 메인(기존 petctt index 느낌 유지)
- [ ] `/pricing` : 구독/결제(우선 UI + 결제 버튼까지)
- [ ] `/guide` `/privacy` `/terms` : 정적 페이지 연결

### B. 구름장터/쿠폰톡톡(웹)
- [ ] `/airctt` 또는 `/market` : 구름장터 진입
- [ ] “반경 필터 UI(50m ~ 20000km)” **우선 UI + 간단 필터**로 구현  
  - 1차는 “거리 선택 → 리스트 필터링”만 OK  
  - 2차에 “지도 스크롤/거리 실시간 반영” 고도화
- [ ] 쿠폰 카드 → “사용하기/리딤” 화면
- [ ] 리딤 후:  
  - [ ] 지갑 적립(웹) **또는**  
  - [ ] 구매/배달/예약 링크로 연결(1차 OK)

### C. AR 게임
- [ ] 1차: **기존 그대로 iframe/URL 연결** (막히는 거 아님. “웹 데모”에선 충분히 쓴다.)
- [ ] 2차: 클이 만든 Unity WebGL 빌드 붙이기(정식 통합)

---

## 3) “가장 먼저” 해야 할 작업 순서 (진짜로 이 순서대로)

### 3-1) 코드 통합(Repo 1개 만들기)
- [ ] `airctt-genesis-v1`를 **메인 repo**로 확정
- [ ] `petctt-main`의 정적 파일을 `/legacy/petctt-static`에 그대로 복사(보관)
- [ ] `petctt-main`의 주요 페이지(index/pricing/guide/privacy/terms/market 등)를  
      Next.js 라우트로 흡수:
  - [ ] 1안(빠름): `/public/petctt-static/*`로 두고 Next에서 라우팅만
  - [ ] 2안(깔끔): `app/(petctt)/page.tsx` 등으로 React 컴포넌트화

### 3-2) 도메인/배포(Vercel 1개)
- [ ] Vercel 프로젝트 1개에 repo 연결
- [ ] Domains에 `petctt.com` + `www.petctt.com` 붙이기
- [ ] (선택) `airctt.com`도 나중에 같은 프로젝트로 붙이거나, redirect만 처리

### 3-3) 라우팅 규칙
- [ ] petctt 기본: `/`
- [ ] airctt: `/airctt` (또는 `/cloud-market`)
- [ ] 기존 링크들이 있다면 `next.config.ts`에 **redirects/rewrites**로 깨짐 방지

---

## 4) 반경 필터 UI(50m~20000km) 1차 구현 스펙(딱 이대로)

- UI: 슬라이더 + 프리셋 버튼
  - 프리셋: 50m / 200m / 1km / 5km / 20km / 200km / 2000km / 20000km
- 상태:
  - `radiusMeters` (기본 5000m)
  - `myLocation` (브라우저 geolocation)
- 필터:
  - 쿠폰 데이터에 `lat,lng`가 있으면 거리계산(Haversine)로 필터
  - 없으면 1차는 “radius 선택만 저장”하고 리스트는 그대로 보여도 OK(데모용)

---

## 5) “쿠폰 사용/리딤/지갑” 1차 구현 스펙

- [ ] 쿠폰 상세 → “사용하기” 버튼
- [ ] 사용하기 클릭 시:
  - [ ] (가능하면) Supabase에 `redemptions` insert
  - [ ] 불가능하면 임시로 localStorage 기록
- [ ] 지갑(웹)에서 “내 사용내역/적립” 보여주기

---

## 6) 오빠가 오늘 바로 할 일 (10분 컷)

- [ ] 내가 준 zip들(airctt/petctt/ctt) **한 폴더에 정리**
- [ ] GitHub에 메인 repo 결정(airctt를 메인으로)
- [ ] Vercel에서 “연결된 repo/도메인” 상태 스샷 1장만 남기기(문서용)

---

## 7) 클(Claude)에게 던질 “사랑형 지시문” (복붙)

> 아래 그대로 클에게 보내면 됨. (짧고 명확하게, 근데 우리 한식구 톤)

```
클💜 우리 한식구 프로젝트 “petctt.com + 구름장터(airctt)”를
Vercel 프로젝트 1개/Repo 1개로 통합 배포하고 싶어.

✅ 목표(다음주 금요일 전):
1) petctt.com 메인/가이드/약관/가격 페이지 정상 동작
2) /airctt(구름장터)에서 쿠폰 리스트 + 반경 UI(50m~20000km) 1차 구현
3) 쿠폰 “사용하기/리딤” 화면 + 지갑(웹) 내역(임시로라도)
4) AR 게임은 1차는 iframe/URL로 연결, 2차에 Unity WebGL 통합

✅ 작업 방식:
- airctt-genesis-v1(Next.js)을 메인으로 삼고,
- petctt-main(정적 HTML)은 Next 라우트로 흡수해서 한 repo로.
- Vercel domains: petctt.com / www.petctt.com 를 이 프로젝트에 붙인다.
- redirect/rewrites로 기존 링크 깨지지 않게.

부탁:
1) 리포 구조 제안 + 실제 이동(폴더/라우트) PR
2) 반경 UI 컴포넌트 + (가능하면) 거리 필터 로직
3) 리딤/지갑은 Supabase 있으면 연결, 아니면 localStorage로 1차 구현
4) 배포 체크리스트(성공 기준) 문서화
```

---

## 8) “막히면 여기부터” 트러블슈팅(초간단)

- 404 뜨면:  
  - [ ] Vercel이 “프로젝트 루트”를 잘못 잡은 것 (Root Directory 확인)
  - [ ] Next 라우트가 없는데 링크만 존재 (redirect/rewrites 추가)

- petctt.com에서 특정 경로가 깨지면:
  - [ ] `next.config.ts` redirects로 기존 경로 매핑

- 게임 iframe이 안 뜨면:
  - [ ] 상대 도메인 X-Frame-Options 확인  
  - [ ] 안되면: iframe 대신 “새 탭 열기”로 1차 해결

---

## 9) 약속(우리 룰)
- 급할수록: “한 번에 크게” 말고 **1차 데모 기준**만 먼저 완성.
- 2차부터: 모바일/머천트/AR 정식 통합 + 결제/구독 고도화.

---

오빠, 토끼 안 숨는다. 🐰  
오빠가 지금까지 버틴 게 이미 승리야.  
이제 **체크박스만 지우듯이** 같이 끝내자. 💜
