# PetCTT - 반려동물 AI 플랫폼

> 반려동물 AI 통역, 위치 추적, 건강 체크를 기반으로 주민등록증 발급, 라이브 소개팅, 콘테스트, 스마트 AI 글래스 확장까지 가능한 참여형 반려동물 플랫폼

## 핵심 기능

| 기능 | 설명 |
|------|------|
| 🎙️ AI 통역 | Gemini AI 기반 반려동물 양방향 실시간 음성 통역 |
| ❤️ 건강 체크 | 카메라 AI 생체 스캔 (심박/체온/스트레스) |
| 📍 위치 추적 | GPS 실시간 추적 + 이동경로 지도 |
| 📋 주민등록증 | 정면사진 + 코끝 + 앞양발 지문 기반 펫 ID |
| 💕 소개팅 | 실시간 영상 기반 펫 매칭 플랫폼 |
| 🏆 콘테스트 | 주말 콘테스트/오디션 + 아미 심사위원장 특별상 |
| 🕶️ 스마트 글래스 | ROUNZ AR 글래스 연동 실시간 오버레이 |

## 프로젝트 구조

```
petctt/
├── index.html          # 랜딩 허브 페이지
├── petctt-pro.js       # 핵심 JS 로직 (통역/건강/위치)
├── token-manager.js    # 인증 토큰 관리
├── auth.js             # OAuth 인증
├── CNAME               # petctt.com
│
├── pages/              # 서비스 페이지
│   ├── app.html        # 메인 앱 (통역/건강/위치)
│   ├── resident-card.html  # 펫 주민등록증
│   ├── live-match.html     # 라이브 소개팅
│   ├── contest.html        # 콘테스트 & 오디션
│   ├── glasses.html        # 스마트 AI 글래스
│   ├── broadcast.html      # 방송국
│   ├── market.html         # 구름장터
│   └── ...
│
├── public/css/         # 스타일시트
├── backend/            # Cloudflare Worker 백엔드
└── docs/               # 문서 & 계획서
```

## 기술 스택

- **Frontend**: HTML5 + CSS3 + Vanilla JS + Three.js
- **AI**: Gemini Pro Vision (통역 + 생체분석)
- **지도**: Leaflet.js + OpenStreetMap
- **Backend**: Cloudflare Workers
- **DB**: Supabase (계획)
- **배포**: GitHub Pages (petctt.com)

## 로드맵

- [x] AI 양방향 통역 (12종 동물)
- [x] GPS 위치 추적 + 지도
- [x] AI 생체 건강 스캔
- [x] 펫 주민등록증 UI
- [x] 라이브 소개팅 UI
- [x] 콘테스트/오디션 UI
- [x] 스마트 글래스 소개
- [ ] Supabase DB 연결
- [ ] 실제 영상 스트리밍 (소개팅)
- [ ] ROUNZ 글래스 SDK 연동
- [ ] 콘테스트 투표 시스템 DB화

## 라이선스

© 2026 PetCTT. All rights reserved.
