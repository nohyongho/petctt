/**
 * PetCTT i18n v2.0 — 5개국어 (ko/en/ja/zh/id)
 * 사용법:
 *   <span data-i18n="hero.title"></span>
 *   PetCTTI18N.t('hero.title')
 *   PetCTTI18N.setLang('en')
 *   PetCTTI18N.renderLangDropdown('#lang-dropdown')
 */
const PetCTTI18N = (function() {
  'use strict';

  const SK = 'petctt_lang';
  const LANGS = [
    { code: 'ko', flag: '🇰🇷', label: '한국어' },
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'ja', flag: '🇯🇵', label: '日本語' },
    { code: 'zh', flag: '🇨🇳', label: '中文' },
    { code: 'id', flag: '🇮🇩', label: 'Indonesia' }
  ];

  const S = {
    ko: {
      'hero.title':'반려동물과 대화하세요','hero.subtitle':'AI 통역 · 위치 추적 · 건강 체크 · 주민등록증 · 소개팅 · 콘테스트',
      'hero.cta':'🐾 지금 시작하기','hero.learnMore':'더 알아보기 ↓',
      'nav.start':'앱 시작하기','nav.login':'🔑 로그인','nav.logout':'🚪 로그아웃','nav.mypage':'👤 마이페이지','nav.pricing':'⚡ 요금제',
      'feat.title':'핵심 기능',
      'feat.talk.title':'AI 통역','feat.talk.desc':'반려동물의 소리를 AI가 분석하여 실시간 양방향 음성 통역. 감정 분석 그래프와 학습 진도까지.',
      'feat.health.title':'건강 체크','feat.health.desc':'카메라 기반 AI 생체 스캔으로 심박수, 체온, 스트레스 레벨을 실시간 분석.',
      'feat.gps.title':'위치 추적','feat.gps.desc':'GPS 기반 실시간 반려동물 위치 추적. 이동 경로, 속도, 히스토리 지도.',
      'smart.title':'스마트 AI 글래스','smart.desc':'ROUNZ × PetCTT 스마트 글래스를 쓰면 반려동물을 바라보는 것만으로 실시간 통역, 건강 상태, 감정이 AR로 표시됩니다.',
      'smart.more':'자세히 보기 →',
      'idcard.title':'펫 주민등록증','idcard.desc':'반려동물의 공식 신분증. 정면사진, 코끝, 앞양발 지문으로 세상에 하나뿐인 ID를 발급합니다.',
      'idcard.cta':'📋 주민등록증 발급하기',
      'dating.title':'라이브 영상 소개팅','dating.desc':'우리 아이에게 친구를 만들어주세요! 실시간 영상으로 매칭하고, 채팅하고, 만남을 이어가세요.',
      'dating.cta':'💕 소개팅 시작하기',
      'contest.title':'콘테스트 & 오디션','contest.desc':'매주 주말 펫 콘테스트! 아미 심사위원장 특별상과 함께 우리 아이를 스타로 만들어보세요.',
      'contest.cta':'🏆 콘테스트 참가하기',
      'tech.title':'기술 & 특허',
      'partner.title':'제휴 & 문의','partner.cta':'📩 제휴 문의하기',
      'sub.btn':'구독하기','sub.free':'무료','sub.standard':'스탠다드','sub.premium':'프리미엄',
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
      'mypage.logout':'로그아웃',
      'footer.copy':'© 2026 PetCTT — 반려동물 AI 플랫폼',
      'stat.animals':'지원 동물','stat.ai':'양방향 통역','stat.gps':'실시간 추적'
    },
    en: {
      'hero.title':'Talk with your pet','hero.subtitle':'AI Translation · GPS Tracking · Health Check · Pet ID · Dating · Contest',
      'hero.cta':'🐾 Get Started','hero.learnMore':'Learn More ↓',
      'nav.start':'Open App','nav.login':'🔑 Login','nav.logout':'🚪 Logout','nav.mypage':'👤 My Page','nav.pricing':'⚡ Pricing',
      'feat.title':'Core Features',
      'feat.talk.title':'AI Translation','feat.talk.desc':'Real-time bidirectional voice translation powered by AI with emotion analysis.',
      'feat.health.title':'Health Check','feat.health.desc':'AI bioscan via camera — heart rate, temperature, stress level in real-time.',
      'feat.gps.title':'GPS Tracking','feat.gps.desc':'Real-time pet location tracking with route history, speed and map.',
      'smart.title':'Smart AI Glasses','smart.desc':'With ROUNZ × PetCTT smart glasses, just look at your pet to see real-time translation, health and emotions in AR.',
      'smart.more':'Learn More →',
      'idcard.title':'Pet ID Card','idcard.desc':'Official pet ID card. Unique ID issued with front photo, nose print, and paw prints.',
      'idcard.cta':'📋 Issue Pet ID',
      'dating.title':'Live Video Dating','dating.desc':'Find friends for your pet! Match via live video, chat, and meet up.',
      'dating.cta':'💕 Start Dating',
      'contest.title':'Contest & Audition','contest.desc':'Weekly pet contests! Special prizes from judge Ami and make your pet a star.',
      'contest.cta':'🏆 Join Contest',
      'tech.title':'Technology & Patents',
      'partner.title':'Partnership','partner.cta':'📩 Contact Us',
      'sub.btn':'Subscribe','sub.free':'Free','sub.standard':'Standard','sub.premium':'Premium',
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
      'mypage.logout':'Logout',
      'footer.copy':'© 2026 PetCTT — AI Pet Platform',
      'stat.animals':'Supported Animals','stat.ai':'Bidirectional AI','stat.gps':'Real-time GPS'
    },
    ja: {
      'hero.title':'ペットと話しましょう','hero.subtitle':'AI通訳・位置追跡・健康チェック・ペットID・マッチング・コンテスト',
      'hero.cta':'🐾 今すぐ始める','hero.learnMore':'もっと見る ↓',
      'nav.start':'アプリを開く','nav.login':'🔑 ログイン','nav.logout':'🚪 ログアウト','nav.mypage':'👤 マイページ','nav.pricing':'⚡ 料金プラン',
      'feat.title':'主な機能',
      'feat.talk.title':'AI通訳','feat.talk.desc':'AIによるリアルタイム双方向音声通訳。感情分析も搭載。',
      'feat.health.title':'健康チェック','feat.health.desc':'カメラAIで心拍数・体温・ストレスをリアルタイム分析。',
      'feat.gps.title':'位置追跡','feat.gps.desc':'GPSリアルタイム追跡・移動ルート・速度・履歴マップ。',
      'smart.title':'スマートAIグラス','smart.desc':'ROUNZ × PetCTTスマートグラスでペットを見るだけで通訳・健康情報がARで表示。',
      'smart.more':'詳しく見る →',
      'idcard.title':'ペット住民登録証','idcard.desc':'ペットの公式身分証。正面写真・鼻先・前足の指紋で唯一のIDを発行。',
      'idcard.cta':'📋 ID発行する',
      'dating.title':'ライブマッチング','dating.desc':'ペットに友達を作ってあげよう！ライブ映像でマッチング。',
      'dating.cta':'💕 マッチング開始',
      'contest.title':'コンテスト＆オーディション','contest.desc':'毎週末ペットコンテスト！アミ審査委員長特別賞でスターに。',
      'contest.cta':'🏆 参加する',
      'tech.title':'技術と特許',
      'partner.title':'提携・お問い合わせ','partner.cta':'📩 お問い合わせ',
      'sub.btn':'購読する','sub.free':'無料','sub.standard':'スタンダード','sub.premium':'プレミアム',
      'app.selectAnimal':'通訳する動物を選択','app.startTalk':'会話を始める','app.stopTalk':'停止',
      'app.humanMic':'私が話す','app.animalMic':'ペットを聞く',
      'app.liveReady':'LIVE準備中','app.liveActive':'LIVE中','app.recording':'録音中...','app.aiThinking':'AI解析中...',
      'app.loginRequired':'ログインが必要です',
      'auth.loginTitle':'ログインが必要です','auth.loginDesc':'ペットと話すにはログインしてください',
      'pricing.title':'プランを選択','pricing.free':'無料','pricing.standard':'スタンダード','pricing.premium':'プレミアム',
      'pricing.monthly':'月払い','pricing.yearly':'年払い','pricing.start':'始める','pricing.upgrade':'アップグレード',
      'mypage.title':'マイページ','mypage.plan':'現在のプラン','mypage.usage':'使用量','mypage.payment':'支払い履歴',
      'mypage.dailyUsed':'今日の使用','mypage.monthlyUsed':'今月の使用','mypage.remaining':'残り',
      'mypage.logout':'ログアウト',
      'footer.copy':'© 2026 PetCTT — AIペットプラットフォーム',
      'stat.animals':'対応動物','stat.ai':'双方向AI','stat.gps':'リアルタイムGPS'
    },
    zh: {
      'hero.title':'和宠物对话吧','hero.subtitle':'AI翻译·位置追踪·健康检查·宠物身份证·交友·竞赛',
      'hero.cta':'🐾 立即开始','hero.learnMore':'了解更多 ↓',
      'nav.start':'打开应用','nav.login':'🔑 登录','nav.logout':'🚪 退出','nav.mypage':'👤 我的页面','nav.pricing':'⚡ 价格',
      'feat.title':'核心功能',
      'feat.talk.title':'AI翻译','feat.talk.desc':'AI实时双向语音翻译，带情感分析图表和学习进度。',
      'feat.health.title':'健康检查','feat.health.desc':'通过摄像头AI生物扫描实时分析心率、体温、压力水平。',
      'feat.gps.title':'位置追踪','feat.gps.desc':'基于GPS的实时宠物位置追踪，含移动路线、速度和历史地图。',
      'smart.title':'智能AI眼镜','smart.desc':'戴上ROUNZ × PetCTT智能眼镜，只需看着宠物就能AR显示翻译、健康和情感信息。',
      'smart.more':'查看详情 →',
      'idcard.title':'宠物身份证','idcard.desc':'宠物的官方身份证。通过正面照片、鼻纹和前爪指纹发行独一无二的ID。',
      'idcard.cta':'📋 办理身份证',
      'dating.title':'直播视频交友','dating.desc':'给您的宠物交朋友！通过实时视频匹配、聊天和见面。',
      'dating.cta':'💕 开始交友',
      'contest.title':'竞赛与选秀','contest.desc':'每周末宠物竞赛！阿米评委长特别奖，让您的宠物成为明星。',
      'contest.cta':'🏆 参加竞赛',
      'tech.title':'技术与专利',
      'partner.title':'合作与咨询','partner.cta':'📩 联系我们',
      'sub.btn':'订阅','sub.free':'免费','sub.standard':'标准版','sub.premium':'高级版',
      'app.selectAnimal':'选择要翻译的动物','app.startTalk':'开始对话','app.stopTalk':'停止',
      'app.humanMic':'我说话','app.animalMic':'宠物听',
      'app.liveReady':'LIVE就绪','app.liveActive':'LIVE中','app.recording':'录音中...','app.aiThinking':'AI分析中...',
      'app.loginRequired':'请登录后使用',
      'auth.loginTitle':'需要登录','auth.loginDesc':'请登录后与宠物对话',
      'pricing.title':'选择适合您的套餐',
      'pricing.free':'免费','pricing.standard':'标准版','pricing.premium':'高级版',
      'pricing.monthly':'月付','pricing.yearly':'年付','pricing.start':'开始','pricing.upgrade':'升级',
      'mypage.title':'我的页面','mypage.plan':'当前套餐','mypage.usage':'使用量','mypage.payment':'支付记录',
      'mypage.dailyUsed':'今日使用','mypage.monthlyUsed':'本月使用','mypage.remaining':'剩余',
      'mypage.logout':'退出登录',
      'footer.copy':'© 2026 PetCTT — AI宠物平台',
      'stat.animals':'支持动物','stat.ai':'双向AI','stat.gps':'实时GPS'
    },
    id: {
      'hero.title':'Bicara dengan hewan peliharaan','hero.subtitle':'Terjemahan AI · Lacak GPS · Cek Kesehatan · ID Hewan · Kencan · Kontes',
      'hero.cta':'🐾 Mulai Sekarang','hero.learnMore':'Pelajari lebih ↓',
      'nav.start':'Buka Aplikasi','nav.login':'🔑 Masuk','nav.logout':'🚪 Keluar','nav.mypage':'👤 Halaman Saya','nav.pricing':'⚡ Harga',
      'feat.title':'Fitur Utama',
      'feat.talk.title':'Terjemahan AI','feat.talk.desc':'Terjemahan suara dua arah real-time dengan AI dan analisis emosi.',
      'feat.health.title':'Cek Kesehatan','feat.health.desc':'Scan bio AI via kamera — detak jantung, suhu, tingkat stres real-time.',
      'feat.gps.title':'Lacak GPS','feat.gps.desc':'Pelacakan lokasi real-time dengan riwayat rute, kecepatan dan peta.',
      'smart.title':'Kacamata AI Pintar','smart.desc':'Dengan kacamata pintar ROUNZ × PetCTT, lihat hewan Anda untuk terjemahan, kesehatan dan emosi dalam AR.',
      'smart.more':'Selengkapnya →',
      'idcard.title':'Kartu ID Hewan','idcard.desc':'Kartu identitas resmi hewan. ID unik dengan foto, sidik hidung dan cakar.',
      'idcard.cta':'📋 Buat ID',
      'dating.title':'Kencan Video Live','dating.desc':'Temukan teman untuk hewan Anda! Cocokkan via video live.',
      'dating.cta':'💕 Mulai Kencan',
      'contest.title':'Kontes & Audisi','contest.desc':'Kontes hewan mingguan! Hadiah spesial dari juri Ami.',
      'contest.cta':'🏆 Ikut Kontes',
      'tech.title':'Teknologi & Paten',
      'partner.title':'Kemitraan','partner.cta':'📩 Hubungi Kami',
      'sub.btn':'Berlangganan','sub.free':'Gratis','sub.standard':'Standar','sub.premium':'Premium',
      'app.selectAnimal':'Pilih hewan','app.startTalk':'Mulai Bicara','app.stopTalk':'Berhenti',
      'app.humanMic':'Saya bicara','app.animalMic':'Hewan dengar',
      'app.liveReady':'LIVE Siap','app.liveActive':'LIVE Aktif','app.recording':'Merekam...','app.aiThinking':'AI menganalisis...',
      'app.loginRequired':'Silakan login untuk melanjutkan',
      'auth.loginTitle':'Login Diperlukan','auth.loginDesc':'Masuk untuk bicara dengan hewan Anda',
      'pricing.title':'Pilih Paket Anda','pricing.free':'Gratis','pricing.standard':'Standar','pricing.premium':'Premium',
      'pricing.monthly':'Bulanan','pricing.yearly':'Tahunan','pricing.start':'Mulai','pricing.upgrade':'Tingkatkan',
      'mypage.title':'Halaman Saya','mypage.plan':'Paket Saat Ini','mypage.usage':'Penggunaan','mypage.payment':'Riwayat Pembayaran',
      'mypage.dailyUsed':'Digunakan Hari Ini','mypage.monthlyUsed':'Digunakan Bulan Ini','mypage.remaining':'Sisa',
      'mypage.logout':'Keluar',
      'footer.copy':'© 2026 PetCTT — Platform AI Hewan Peliharaan',
      'stat.animals':'Hewan Didukung','stat.ai':'AI Dua Arah','stat.gps':'GPS Real-time'
    }
  };

  let _lang = 'ko';

  function _detect() {
    try {
      const s = localStorage.getItem(SK);
      if (s && S[s]) return s;
      const b = (navigator.language || 'ko').substring(0, 2);
      if (S[b]) return b;
    } catch(e) {}
    return 'ko';
  }

  function t(key) {
    return (S[_lang] && S[_lang][key]) || (S.ko && S.ko[key]) || key;
  }

  function setLang(lang) {
    if (!S[lang]) return;
    _lang = lang;
    try { localStorage.setItem(SK, lang); } catch(e) {}
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n'), v = t(k);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = v;
      else el.textContent = v;
    });
    // 드롭다운 현재 언어 표시 갱신
    document.querySelectorAll('.petctt-lang-current').forEach(el => {
      const info = LANGS.find(l => l.code === lang);
      if (info) el.textContent = info.flag + ' ' + info.label;
    });
  }

  function getLang() { return _lang; }

  /** 드롭다운 언어 선택 UI 삽입 */
  function renderLangDropdown(selector) {
    const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!container) return;

    const current = LANGS.find(l => l.code === _lang) || LANGS[0];
    container.innerHTML = '';
    container.style.cssText = 'position:relative;display:inline-block;';

    const btn = document.createElement('button');
    btn.className = 'petctt-lang-btn';
    btn.innerHTML = '<span class="petctt-lang-current">' + current.flag + ' ' + current.label + '</span> <span style="font-size:0.7em">▼</span>';
    btn.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:6px 14px;color:#fff;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:6px;backdrop-filter:blur(4px);transition:all 0.2s;';
    btn.onmouseover = function(){ this.style.background='rgba(255,255,255,0.2)'; };
    btn.onmouseout = function(){ this.style.background='rgba(255,255,255,0.1)'; };

    const menu = document.createElement('div');
    menu.className = 'petctt-lang-menu';
    menu.style.cssText = 'display:none;position:absolute;top:110%;right:0;background:rgba(20,20,30,0.95);border:1px solid rgba(255,255,255,0.15);border-radius:12px;overflow:hidden;min-width:160px;z-index:9999;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.4);';

    LANGS.forEach(l => {
      const item = document.createElement('div');
      item.textContent = l.flag + '  ' + l.label;
      item.style.cssText = 'padding:10px 16px;cursor:pointer;color:#fff;font-size:14px;transition:background 0.15s;' + (l.code === _lang ? 'background:rgba(100,200,255,0.15);' : '');
      item.onmouseover = function(){ this.style.background='rgba(100,200,255,0.2)'; };
      item.onmouseout = function(){ this.style.background = l.code === _lang ? 'rgba(100,200,255,0.15)' : 'transparent'; };
      item.onclick = function(e) {
        e.stopPropagation();
        setLang(l.code);
        menu.style.display = 'none';
        // 모든 드롭다운 메뉴 아이템 스타일 갱신
        menu.querySelectorAll('div').forEach(d => d.style.background = 'transparent');
        this.style.background = 'rgba(100,200,255,0.15)';
      };
 * PetCTT i18n v2.0 — 5개국어 (ko/en/ja/zh/id)
 * <span data-i18n="key"></span>
 * PetCTTI18N.setLang('en')
 */
const PetCTTI18N = (function() {
'use strict';
const SK = 'petctt_lang';
const LANGS = [
  {code:'ko',flag:'🇰🇷',label:'한국어'},
  {code:'en',flag:'🇺🇸',label:'English'},
  {code:'ja',flag:'🇯🇵',label:'日本語'},
  {code:'zh',flag:'🇨🇳',label:'中文'},
  {code:'id',flag:'🇮🇩',label:'Indonesia'}
];
const S = {
ko:{
'hero.title':'반려동물과 대화하세요','hero.subtitle':'AI 통역 · 위치 추적 · 건강 체크 · 주민등록증 · 소개팅 · 콘테스트',
'hero.cta':'🐾 지금 시작하기','hero.learnMore':'더 알아보기 ↓',
'nav.start':'앱 시작하기','nav.login':'🔑 로그인','nav.logout':'🚪 로그아웃','nav.mypage':'👤 마이페이지','nav.pricing':'⚡ 요금제',
'feat.title':'핵심 기능','feat.talk.title':'AI 통역','feat.talk.desc':'반려동물의 소리를 AI가 분석하여 실시간 양방향 음성 통역.',
'feat.health.title':'건강 체크','feat.health.desc':'카메라 기반 AI 생체 스캔으로 심박수, 체온, 스트레스 레벨 실시간 분석.',
'feat.gps.title':'위치 추적','feat.gps.desc':'GPS 기반 실시간 반려동물 위치 추적. 이동 경로, 속도, 히스토리 지도.',
'smart.title':'스마트 AI 글래스','smart.desc':'ROUNZ × PetCTT 스마트 글래스를 쓰면 반려동물을 바라보는 것만으로 실시간 통역, 건강 상태, 감정이 AR로 표시됩니다.',
'smart.more':'자세히 보기 →',
'idcard.title':'펫 주민등록증','idcard.cta':'📋 주민등록증 발급하기',
'dating.title':'라이브 영상 소개팅','dating.cta':'💕 소개팅 시작하기',
'contest.title':'콘테스트 & 오디션','contest.cta':'🏆 콘테스트 참가하기',
'tech.title':'기술 & 특허','partner.title':'제휴 & 문의','partner.cta':'📩 제휴 문의하기',
'sub.btn':'구독하기','sub.free':'무료','sub.standard':'스탠다드','sub.premium':'프리미엄',
'app.selectAnimal':'통역할 동물을 선택하세요','app.startTalk':'동물대화 시작','app.stopTalk':'중지',
'app.humanMic':'내가 말하기','app.animalMic':'동물 듣기','app.recording':'녹음 중...','app.aiThinking':'AI 분석 중...',
'app.loginRequired':'로그인 후 이용 가능합니다',
'pricing.title':'딱 맞는 요금제를 선택하세요','pricing.free':'무료','pricing.standard':'스탠다드','pricing.premium':'프리미엄',
'pricing.monthly':'월간 결제','pricing.yearly':'연간 결제','pricing.start':'시작하기','pricing.upgrade':'업그레이드',
'mypage.title':'마이페이지','mypage.plan':'현재 플랜','mypage.usage':'사용량','mypage.logout':'로그아웃',
'mypage.dailyUsed':'오늘 사용','mypage.monthlyUsed':'이번달 사용',
'footer.copy':'© 2026 PetCTT — 반려동물 AI 플랫폼','stat.animals':'지원 동물','stat.ai':'양방향 통역','stat.gps':'실시간 추적'
},
en:{
'hero.title':'Talk with your pet','hero.subtitle':'AI Translation · GPS Tracking · Health Check · Pet ID · Dating · Contest',
'hero.cta':'🐾 Get Started','hero.learnMore':'Learn More ↓',
'nav.start':'Open App','nav.login':'🔑 Login','nav.logout':'🚪 Logout','nav.mypage':'👤 My Page','nav.pricing':'⚡ Pricing',
'feat.title':'Core Features','feat.talk.title':'AI Translation','feat.talk.desc':'Real-time bidirectional voice translation powered by AI.',
'feat.health.title':'Health Check','feat.health.desc':'AI bioscan via camera — heart rate, temperature, stress level.',
'feat.gps.title':'GPS Tracking','feat.gps.desc':'Real-time pet location tracking with route, speed and map.',
'smart.title':'Smart AI Glasses','smart.desc':'With ROUNZ × PetCTT smart glasses, see translation, health and emotions in AR.',
'smart.more':'Learn More →',
'idcard.title':'Pet ID Card','idcard.cta':'📋 Issue Pet ID',
'dating.title':'Live Video Dating','dating.cta':'💕 Start Dating',
'contest.title':'Contest & Audition','contest.cta':'🏆 Join Contest',
'tech.title':'Technology & Patents','partner.title':'Partnership','partner.cta':'📩 Contact Us',
'sub.btn':'Subscribe','sub.free':'Free','sub.standard':'Standard','sub.premium':'Premium',
'app.selectAnimal':'Select your pet','app.startTalk':'Start Talking','app.stopTalk':'Stop',
'app.humanMic':'I speak','app.animalMic':'Pet listens','app.recording':'Recording...','app.aiThinking':'AI analyzing...',
'app.loginRequired':'Please login to continue',
'pricing.title':'Choose Your Plan','pricing.free':'Free','pricing.standard':'Standard','pricing.premium':'Premium',
'pricing.monthly':'Monthly','pricing.yearly':'Yearly','pricing.start':'Get Started','pricing.upgrade':'Upgrade',
'mypage.title':'My Page','mypage.plan':'Current Plan','mypage.usage':'Usage','mypage.logout':'Logout',
'mypage.dailyUsed':'Used Today','mypage.monthlyUsed':'Used This Month',
'footer.copy':'© 2026 PetCTT — AI Pet Platform','stat.animals':'Animals','stat.ai':'Bidirectional AI','stat.gps':'Real-time GPS'
},
ja:{
'hero.title':'ペットと話しましょう','hero.subtitle':'AI通訳・位置追跡・健康チェック・ペットID・マッチング・コンテスト',
'hero.cta':'🐾 今すぐ始める','hero.learnMore':'もっと見る ↓',
'nav.start':'アプリを開く','nav.login':'🔑 ログイン','nav.logout':'🚪 ログアウト','nav.mypage':'👤 マイページ','nav.pricing':'⚡ 料金',
'feat.title':'主な機能','feat.talk.title':'AI通訳','feat.talk.desc':'AIによるリアルタイム双方向音声通訳。',
'feat.health.title':'健康チェック','feat.health.desc':'カメラAIで心拍数・体温・ストレスをリアルタイム分析。',
'feat.gps.title':'位置追跡','feat.gps.desc':'GPSリアルタイム追跡・ルート・速度・履歴マップ。',
'smart.title':'スマートAIグラス','smart.desc':'ROUNZ × PetCTTスマートグラスでペットを見るだけでARに情報表示。',
'smart.more':'詳しく見る →',
'idcard.title':'ペット住民登録証','idcard.cta':'📋 ID発行する',
'dating.title':'ライブマッチング','dating.cta':'💕 マッチング開始',
'contest.title':'コンテスト','contest.cta':'🏆 参加する',
'tech.title':'技術と特許','partner.title':'提携','partner.cta':'📩 お問い合わせ',
'sub.btn':'購読する','sub.free':'無料','sub.standard':'スタンダード','sub.premium':'プレミアム',
'app.selectAnimal':'動物を選択','app.startTalk':'会話開始','app.stopTalk':'停止',
'app.humanMic':'私が話す','app.animalMic':'ペット','app.recording':'録音中...','app.aiThinking':'AI解析中...',
'app.loginRequired':'ログインが必要です',
'pricing.title':'プランを選択','pricing.free':'無料','pricing.standard':'スタンダード','pricing.premium':'プレミアム',
'pricing.monthly':'月払い','pricing.yearly':'年払い','pricing.start':'始める','pricing.upgrade':'アップグレード',
'mypage.title':'マイページ','mypage.plan':'現在のプラン','mypage.usage':'使用量','mypage.logout':'ログアウト',
'mypage.dailyUsed':'今日の使用','mypage.monthlyUsed':'今月の使用',
'footer.copy':'© 2026 PetCTT — AIペットプラットフォーム','stat.animals':'対応動物','stat.ai':'双方向AI','stat.gps':'GPS'
},
zh:{
'hero.title':'和宠物对话吧','hero.subtitle':'AI翻译·位置追踪·健康检查·宠物身份证·交友·竞赛',
'hero.cta':'🐾 立即开始','hero.learnMore':'了解更多 ↓',
'nav.start':'打开应用','nav.login':'🔑 登录','nav.logout':'🚪 退出','nav.mypage':'👤 我的','nav.pricing':'⚡ 价格',
'feat.title':'核心功能','feat.talk.title':'AI翻译','feat.talk.desc':'AI实时双向语音翻译，带情感分析。',
'feat.health.title':'健康检查','feat.health.desc':'摄像头AI生物扫描实时分析心率、体温、压力。',
'feat.gps.title':'位置追踪','feat.gps.desc':'基于GPS的实时宠物位置追踪。',
'smart.title':'智能AI眼镜','smart.desc':'戴上ROUNZ × PetCTT智能眼镜，AR显示翻译和健康信息。',
'smart.more':'查看详情 →',
'idcard.title':'宠物身份证','idcard.cta':'📋 办理身份证',
'dating.title':'直播交友','dating.cta':'💕 开始交友',
'contest.title':'竞赛','contest.cta':'🏆 参加竞赛',
'tech.title':'技术与专利','partner.title':'合作咨询','partner.cta':'📩 联系我们',
'sub.btn':'订阅','sub.free':'免费','sub.standard':'标准版','sub.premium':'高级版',
'app.selectAnimal':'选择动物','app.startTalk':'开始对话','app.stopTalk':'停止',
'app.humanMic':'我说话','app.animalMic':'宠物听','app.recording':'录音中...','app.aiThinking':'AI分析中...',
'app.loginRequired':'请登录后使用',
'pricing.title':'选择套餐','pricing.free':'免费','pricing.standard':'标准版','pricing.premium':'高级版',
'pricing.monthly':'月付','pricing.yearly':'年付','pricing.start':'开始','pricing.upgrade':'升级',
'mypage.title':'我的页面','mypage.plan':'当前套餐','mypage.usage':'使用量','mypage.logout':'退出',
'mypage.dailyUsed':'今日使用','mypage.monthlyUsed':'本月使用',
'footer.copy':'© 2026 PetCTT — AI宠物平台','stat.animals':'支持动物','stat.ai':'双向AI','stat.gps':'实时GPS'
},
id:{
'hero.title':'Bicara dengan hewan peliharaan','hero.subtitle':'AI · GPS · Kesehatan · ID · Kencan · Kontes',
'hero.cta':'🐾 Mulai Sekarang','hero.learnMore':'Pelajari lebih ↓',
'nav.start':'Buka App','nav.login':'🔑 Masuk','nav.logout':'🚪 Keluar','nav.mypage':'👤 Saya','nav.pricing':'⚡ Harga',
'feat.title':'Fitur Utama','feat.talk.title':'Terjemahan AI','feat.talk.desc':'Terjemahan suara dua arah real-time dengan AI.',
'feat.health.title':'Cek Kesehatan','feat.health.desc':'Scan bio AI via kamera real-time.',
'feat.gps.title':'Lacak GPS','feat.gps.desc':'Pelacakan lokasi real-time.',
'smart.title':'Kacamata AI','smart.desc':'Kacamata pintar ROUNZ × PetCTT untuk terjemahan AR.',
'smart.more':'Selengkapnya →',
'idcard.title':'Kartu ID','idcard.cta':'📋 Buat ID',
'dating.title':'Kencan Live','dating.cta':'💕 Mulai Kencan',
'contest.title':'Kontes','contest.cta':'🏆 Ikut Kontes',
'tech.title':'Teknologi','partner.title':'Kemitraan','partner.cta':'📩 Hubungi',
'sub.btn':'Berlangganan','sub.free':'Gratis','sub.standard':'Standar','sub.premium':'Premium',
'app.selectAnimal':'Pilih hewan','app.startTalk':'Mulai','app.stopTalk':'Berhenti',
'app.humanMic':'Saya bicara','app.animalMic':'Hewan','app.recording':'Merekam...','app.aiThinking':'AI analisis...',
'app.loginRequired':'Silakan login',
'pricing.title':'Pilih Paket','pricing.free':'Gratis','pricing.standard':'Standar','pricing.premium':'Premium',
'pricing.monthly':'Bulanan','pricing.yearly':'Tahunan','pricing.start':'Mulai','pricing.upgrade':'Tingkatkan',
'mypage.title':'Halaman Saya','mypage.plan':'Paket','mypage.usage':'Penggunaan','mypage.logout':'Keluar',
'mypage.dailyUsed':'Hari Ini','mypage.monthlyUsed':'Bulan Ini',
'footer.copy':'© 2026 PetCTT — Platform AI Hewan','stat.animals':'Hewan','stat.ai':'AI','stat.gps':'GPS'
}};

let _lang='ko';
function _detect(){try{const s=localStorage.getItem(SK);if(s&&S[s])return s;const b=(navigator.language||'ko').substring(0,2);if(S[b])return b;}catch(e){}return'ko';}
function t(key){return(S[_lang]&&S[_lang][key])||(S.ko&&S.ko[key])||key;}
function setLang(lang){if(!S[lang])return;_lang=lang;try{localStorage.setItem(SK,lang)}catch(e){}document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n'),v=t(k);if(el.tagName==='INPUT'||el.tagName==='TEXTAREA')el.placeholder=v;else el.textContent=v;});document.querySelectorAll('.petctt-lang-current').forEach(el=>{const info=LANGS.find(l=>l.code===lang);if(info)el.textContent=info.flag+' '+info.label;});}
function getLang(){return _lang;}

function renderLangDropdown(sel){
  const c=typeof sel==='string'?document.querySelector(sel):sel;if(!c)return;
  const cur=LANGS.find(l=>l.code===_lang)||LANGS[0];
  c.innerHTML='';c.style.cssText='position:relative;display:inline-block;';
  const btn=document.createElement('button');
  btn.className='petctt-lang-btn';
  btn.innerHTML='<span class="petctt-lang-current">'+cur.flag+' '+cur.label+'</span> <span style="font-size:0.7em">▼</span>';
  btn.style.cssText='background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:6px 14px;color:#fff;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:6px;backdrop-filter:blur(4px);transition:all 0.2s;';
  btn.onmouseover=function(){this.style.background='rgba(255,255,255,0.2)';};
  btn.onmouseout=function(){this.style.background='rgba(255,255,255,0.1)';};
  const menu=document.createElement('div');
  menu.style.cssText='display:none;position:absolute;top:110%;right:0;background:rgba(20,20,30,0.95);border:1px solid rgba(255,255,255,0.15);border-radius:12px;overflow:hidden;min-width:160px;z-index:9999;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.4);';
  LANGS.forEach(l=>{
    const item=document.createElement('div');
    item.textContent=l.flag+'  '+l.label;
    item.style.cssText='padding:10px 16px;cursor:pointer;color:#fff;font-size:14px;transition:background 0.15s;'+(l.code===_lang?'background:rgba(100,200,255,0.15);':'');
    item.onmouseover=function(){this.style.background='rgba(100,200,255,0.2)';};
    item.onmouseout=function(){this.style.background=l.code===_lang?'rgba(100,200,255,0.15)':'transparent';};
    item.onclick=function(e){e.stopPropagation();setLang(l.code);menu.style.display='none';};
    menu.appendChild(item);
  });
  btn.onclick=function(e){e.stopPropagation();menu.style.display=menu.style.display==='none'?'block':'none';};
  document.addEventListener('click',function(){menu.style.display='none';});
  c.appendChild(btn);c.appendChild(menu);
}

function renderSubDropdown(sel){
  const c=typeof sel==='string'?document.querySelector(sel):sel;if(!c)return;
  c.innerHTML='';c.style.cssText='position:relative;display:inline-block;';
  const btn=document.createElement('button');
  btn.innerHTML='<span>⚡ '+t('sub.btn')+'</span> <span style="font-size:0.7em">▼</span>';
  btn.style.cssText='background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:20px;padding:6px 16px;color:#fff;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:6px;transition:all 0.2s;box-shadow:0 2px 8px rgba(99,102,241,0.3);';
  btn.onmouseover=function(){this.style.transform='scale(1.05)';};
  btn.onmouseout=function(){this.style.transform='scale(1)';};
  const plans=[{id:'free',icon:'🆓'},{id:'standard',icon:'⭐'},{id:'premium',icon:'💎'}];
  const menu=document.createElement('div');
  menu.style.cssText='display:none;position:absolute;top:110%;right:0;background:rgba(20,20,30,0.95);border:1px solid rgba(255,255,255,0.15);border-radius:12px;overflow:hidden;min-width:180px;z-index:9999;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.4);';
  plans.forEach(p=>{
    const item=document.createElement('a');item.href='/pages/pricing.html#'+p.id;
    item.textContent=p.icon+'  '+t('sub.'+p.id);
    item.style.cssText='display:block;padding:10px 16px;cursor:pointer;color:#fff;font-size:14px;text-decoration:none;transition:background 0.15s;';
    item.onmouseover=function(){this.style.background='rgba(100,200,255,0.2)';};
    item.onmouseout=function(){this.style.background='transparent';};
    menu.appendChild(item);
  });
  btn.onclick=function(e){e.stopPropagation();menu.style.display=menu.style.display==='none'?'block':'none';};
  document.addEventListener('click',function(){menu.style.display='none';});
  c.appendChild(btn);c.appendChild(menu);
}

function init(){_lang=_detect();setLang(_lang);
  document.querySelectorAll('[data-lang-dropdown]').forEach(el=>renderLangDropdown(el));
  document.querySelectorAll('[data-sub-dropdown]').forEach(el=>renderSubDropdown(el));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
return{t,setLang,getLang,init,renderLangDropdown,renderSubDropdown,LANGS};
})();
