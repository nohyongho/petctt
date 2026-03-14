/**
 * PetCTT i18n v1.0 — 4개국어 (ko/en/ja/id)
 * <span data-i18n="hero.title"></span>
 * PetCTTI18N.t('hero.title')
 * PetCTTI18N.setLang('en')
 */
const PetCTTI18N = (function() {
    'use strict';
    const SK = 'petctt_lang';
    const S = {
          ko: {
                  'hero.title':'반려동물과 대화하세요','hero.subtitle':'AI 통역 · 위치 추적 · 건강 체크 · 주민등록증 · 소개팅 · 콘테스트',
                  'hero.cta':'🐾 지금 시작하기','hero.learnMore':'더 알아보기 ↓',
                  'nav.start':'앱 시작하기','nav.login':'🔑 로그인','nav.logout':'🚪 로그아웃','nav.mypage':'👤 마이페이지','nav.pricing':'⚡ 요금제',
                  'feat.title':'핵심 기능',
                  'feat.talk.title':'AI 통역','feat.talk.desc':'반려동물의 소리를 AI가 분석하여 실시간 양방향 음성 통역',
                  'feat.health.title':'건강 체크','feat.health.desc':'카메라 기반 AI 생체 스캔으로 심박수, 체온, 스트레스 레벨 실시간 분석',
                  'feat.gps.title':'위치 추적','feat.gps.desc':'GPS 기반 실시간 반려동물 위치 추적. 이동 경로, 속도, 히스토리 지도',
                  'app.selectAnimal':'통역할 동물을 선택하세요','app.startTalk':'동물대화 시작','app.stopTalk':'중지',
                  'app.humanMic':'내가 말하기','app.animalMic':'동물 듣기',
                  'app.liveReady':'LIVE 준비','app.liveActive':'LIVE 활성','app.recording':'녹음 중...','app.aiThinking':'AI 분석 중...',
                  'app.loginRequired':'로그인 후 이용 가능합니다',
                  'auth.loginTitle':'로그인이 필요해요','auth.loginDesc':'반려동물과 대화하려면 로그인하세요',
                  'pricing.title':'딱 맞는 요금제를 선택하세요',
                  'pricing.free':'무료','pricing.standard':'스탠다드','pricing.premium':'프리미엄',
                  'pricing.monthly':'월간 결제','pricing.yearly':'연간 결제','pricing.start':'시작하기','pricing.upgrade':'업그레이드',
                  'mypage.title':'마이페이지','mypage.plan':'현재 플랜','mypage.usage':'사용량','mypage.payment':'결제 내역',
                  'mypage.dailyUsed':'오늘 사용','mypage.monthlyUsed':'이번달 사용','mypage.remaining':'남은 횟수',
                  'footer.copy':'© 2026 PetCTT — 반려동물 AI 플랫폼'
          },
          en: {
                  'hero.title':'Talk with your pet','hero.subtitle':'AI Translation · GPS Tracking · Health Check · Pet ID · Dating · Contest',
                  'hero.cta':'🐾 Get Started','hero.learnMore':'Learn More ↓',
                  'nav.start':'Open App','nav.login':'🔑 Login','nav.logout':'🚪 Logout','nav.mypage':'👤 My Page','nav.pricing':'⚡ Pricing',
                  'feat.title':'Core Features',
                  'feat.talk.title':'AI Translation','feat.talk.desc':'Real-time bidirectional voice translation powered by AI',
                  'feat.health.title':'Health Check','feat.health.desc':'AI bioscan via camera — heart rate, temperature, stress level',
                  'feat.gps.title':'GPS Tracking','feat.gps.desc':'Real-time pet location tracking with route history and speed',
                  'app.selectAnimal':'Select your pet','app.startTalk':'Start Talking','app.stopTalk':'Stop',
                  'app.humanMic':'I speak','app.animalMic':'Pet listens',
                  'app.liveReady':'LIVE Ready','app.liveActive':'LIVE Active','app.recording':'Recording...','app.aiThinking':'AI analyzing...',
                  'app.loginRequired':'Please login to continue',
                  'auth.loginTitle':'Login Required','auth.loginDesc':'Sign in to talk with your pet',
                  'pricing.title':'Choose Your Plan',
                  'pricing.free':'Free','pricing.standard':'Standard','pricing.premium':'Premium',
                  'pricing.monthly':'Monthly','pricing.yearly':'Yearly','pricing.start':'Get Started','pricing.upgrade':'Upgrade',
                  'mypage.title':'My Page','mypage.plan':'Current Plan','mypage.usage':'Usage','mypage.payment':'Payment History',
                  'mypage.dailyUsed':'Used Today','mypage.monthlyUsed':'Used This Month','mypage.remaining':'Remaining',
                  'footer.copy':'© 2026 PetCTT — AI Pet Platform'
          },
          ja: {
                  'hero.title':'ペットと話しましょう','hero.subtitle':'AI通訳・位置追跡・健康チェック・ペットID・マッチング・コンテスト',
                  'hero.cta':'🐾 今すぐ始める','hero.learnMore':'もっと見る ↓',
                  'nav.start':'アプリを開く','nav.login':'🔑 ログイン','nav.logout':'🚪 ログアウト','nav.mypage':'👤 マイページ','nav.pricing':'⚡ 料金プラン',
                  'feat.title':'主な機能',
                  'feat.talk.title':'AI通訳','feat.talk.desc':'AIによるリアルタイム双方向音声通訳',
                  'feat.health.title':'健康チェック','feat.health.desc':'カメラAIで心拍数・体温・ストレスをリアルタイム分析',
                  'feat.gps.title':'位置追跡','feat.gps.desc':'GPSリアルタイム追跡・移動ルート・速度・履歴マップ',
                  'app.selectAnimal':'通訳する動物を選択','app.startTalk':'会話を始める','app.stopTalk':'停止',
                  'app.humanMic':'私が話す','app.animalMic':'ペットを聞く',
                  'app.liveReady':'LIVE準備中','app.liveActive':'LIVE中','app.recording':'録音中...','app.aiThinking':'AI解析中...',
                  'app.loginRequired':'ログインが必要です',
                  'auth.loginTitle':'ログインが必要です','auth.loginDesc':'ペットと話すにはログインしてください',
                  'pricing.title':'プランを選択','pricing.free':'無料','pricing.standard':'スタンダード','pricing.premium':'プレミアム',
                  'pricing.monthly':'月払い','pricing.yearly':'年払い','pricing.start':'始める','pricing.upgrade':'アップグレード',
                  'mypage.title':'マイページ','mypage.plan':'現在のプラン','mypage.usage':'使用量','mypage.payment':'支払い履歴',
                  'mypage.dailyUsed':'今日の使用','mypage.monthlyUsed':'今月の使用','mypage.remaining':'残り',
                  'footer.copy':'© 2026 PetCTT — AIペットプラットフォーム'
          },
          id: {
                  'hero.title':'Bicara dengan hewan peliharaan','hero.subtitle':'Terjemahan AI · Lacak GPS · Cek Kesehatan · ID Hewan · Kencan · Kontes',
                  'hero.cta':'🐾 Mulai Sekarang','hero.learnMore':'Pelajari lebih ↓',
                  'nav.start':'Buka Aplikasi','nav.login':'🔑 Masuk','nav.logout':'🚪 Keluar','nav.mypage':'👤 Halaman Saya','nav.pricing':'⚡ Harga',
                  'feat.title':'Fitur Utama',
                  'feat.talk.title':'Terjemahan AI','feat.talk.desc':'Terjemahan suara dua arah real-time dengan AI',
                  'feat.health.title':'Cek Kesehatan','feat.health.desc':'Scan bio AI via kamera — detak jantung, suhu, stres',
                  'feat.gps.title':'Lacak GPS','feat.gps.desc':'Pelacakan lokasi real-time dengan riwayat rute',
                  'app.selectAnimal':'Pilih hewan','app.startTalk':'Mulai Bicara','app.stopTalk':'Berhenti',
                  'app.humanMic':'Saya bicara','app.animalMic':'Hewan dengar',
                  'app.liveReady':'LIVE Siap','app.liveActive':'LIVE Aktif','app.recording':'Merekam...','app.aiThinking':'AI menganalisis...',
                  'app.loginRequired':'Silakan login untuk melanjutkan',
                  'auth.loginTitle':'Login Diperlukan','auth.loginDesc':'Masuk untuk bicara dengan hewan Anda',
                  'pricing.title':'Pilih Paket Anda','pricing.free':'Gratis','pricing.standard':'Standar','pricing.premium':'Premium',
                  'pricing.monthly':'Bulanan','pricing.yearly':'Tahunan','pricing.start':'Mulai','pricing.upgrade':'Tingkatkan',
                  'mypage.title':'Halaman Saya','mypage.plan':'Paket Saat Ini','mypage.usage':'Penggunaan','mypage.payment':'Riwayat Pembayaran',
                  'mypage.dailyUsed':'Digunakan Hari Ini','mypage.monthlyUsed':'Digunakan Bulan Ini','mypage.remaining':'Sisa',
                  'footer.copy':'© 2026 PetCTT — Platform AI Hewan Peliharaan'
          }
    };
    let _lang = 'ko';
    function _detect() {
          try { const s=localStorage.getItem(SK); if(s&&S[s]) return s; const b=(navigator.language||'ko').substring(0,2); if(S[b]) return b; } catch(e){} return 'ko';
    }
    function t(key) { return (S[_lang]&&S[_lang][key])||(S.ko&&S.ko[key])||key; }
    function setLang(lang) {
          if(!S[lang]) return; _lang=lang;
          try{localStorage.setItem(SK,lang)}catch(e){}
          document.documentElement.lang=lang;
          document.querySelectorAll('[data-i18n]').forEach(el=>{
                  const k=el.getAttribute('data-i18n'), v=t(k);
                  if(el.tagName==='INPUT'||el.tagName==='TEXTAREA') el.placeholder=v; else el.textContent=v;
          });
    }
    function getLang() { return _lang; }
    function init() { _lang=_detect(); setLang(_lang); }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
    return { t, setLang, getLang, init };
})();
