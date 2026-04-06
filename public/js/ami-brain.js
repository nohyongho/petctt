/**
 * =====================================================
 *  🐰 아미 브레인 v1.0 — PetCTT 우주대스타 AR 가이드 두뇌
 * =====================================================
 *  역할: 서버/API 없이 아미의 대화를 처리하는 스마트 응답 엔진
 *  구조: 카테고리 매칭 → 컨텍스트 응답 → 프리미엄 유도
 *  연결: ami.js의 callAmi() 를 오버라이드
 *  
 *  Phase 2에서 Gemma 4 로컬 브리지로 확장 가능하도록 설계
 * =====================================================
 */
(function(){
  'use strict';

  // ─────────────────────────────────────
  // 1. 아미 캐릭터 설정
  // ─────────────────────────────────────
  const AMI_PERSONA = {
    name: '아미',
    emoji: '🐰',
    tone: 'cute',  // 6~7살 소녀 톤
    maxLen: 120     // 응답 최대 글자수 (짧고 귀엽게)
  };

  // ─────────────────────────────────────
  // 2. 지식 베이스 — PetCTT 핵심 정보
  // ─────────────────────────────────────
  const KNOWLEDGE = {
    petctt: {
      name: 'PetCTT',
      fullName: '펫쿠폰톡톡',
      desc: '반려동물 AI 플랫폼',
      features: [
        { id: 'translate', name: 'AI 통역', desc: '우리 아이 말을 사람 말로 통역해줘요', free: true, icon: '🗣️' },
        { id: 'gps', name: 'GPS 추적', desc: '우리 아이 위치를 실시간으로 확인해요', free: false, icon: '📍' },
        { id: 'health', name: '건강 체크', desc: 'AI가 우리 아이 건강 상태를 분석해요', free: false, icon: '💚' },
        { id: 'id-card', name: '주민등록증', desc: '세상에 하나뿐인 반려동물 주민등록증', free: true, icon: '🪪' },
        { id: 'live-match', name: '소개팅', desc: '반려동물 친구 찾기 라이브 매칭', free: true, icon: '💕' },
        { id: 'contest', name: '콘테스트', desc: '우리 아이 자랑 대회', free: true, icon: '🏆' },
        { id: 'market', name: '구름장터', desc: '반려동물 용품 거래', free: true, icon: '🛒' },
        { id: 'restaurant', name: '펫 맛집', desc: '반려동물 동반 맛집 찾기', free: true, icon: '🍽️' },
        { id: 'glasses', name: 'AI 글래스', desc: '스마트 글래스로 AR 펫 케어', free: false, icon: '🕶️' },
        { id: 'scan', name: '스캔', desc: 'AI로 우리 아이 분석하기', free: true, icon: '📸' }
      ]
    },
    premium: {
      features: ['개체별 분석', '맞춤 학습', '기록 저장', '행동 변화 추적', '우리 아이 전용 누적 분석'],
      price: '월 4,900원',
      trial: '무료 체험 가능'
    },
    company: {
      name: '주식회사 발로레',
      ceo: 'Zeus',
      sister: 'AIRCTT (에어쿠폰톡톡)',
      philosophy: '상생 공존 마켓'
    }
  };

  // ─────────────────────────────────────
  // 3. 반려동물 통역 체험 데이터
  // ─────────────────────────────────────
  const PET_TRANSLATIONS = {
    dog: {
      sounds: ['멍멍', '왈왈', '낑낑', '끙끙', '하울링', '으르렁', '킁킁'],
      behaviors: ['꼬리 흔들', '배 보여', '핥', '짖', '점프', '앉아', '기지개', '엎드려', '뒹굴'],
      translations: {
        '멍멍': ['밥 줘! 배고파~ 🍖', '놀아줘! 심심해~ 🎾', '누가 왔어! 알려줘야지! 🚪', '사랑해 집사! 💕'],
        '왈왈': ['경고야! 조심해! ⚠️', '나 여기 있어! 👋', '산책 가자! 🏃'],
        '낑낑': ['외로워... 같이 있어줘 🥺', '아파... 걱정돼 😢', '간식 주면 안 돼? 🍪'],
        '꼬리 흔들': ['너무 행복해! 최고야! 😆', '반가워! 사랑해! 💖'],
        '배 보여': ['나 믿어! 쓰다듬어줘~ 🫄', '너무 편해~ 행복해 💤'],
        '핥': ['사랑한다는 뜻이야! 💋', '짠맛 나! 맛있어 😋'],
        '킁킁': ['뭔가 냄새 나! 조사 중~ 🔍', '누구 왔다 갔어? 🐾']
      }
    },
    cat: {
      sounds: ['야옹', '냐옹', '그르르', '하악', '골골', '먀아', '치치'],
      behaviors: ['꼬리 세우', '머리 비비', '그루밍', '박치기', '냥펀치', '배 보여', '꾹꾹이'],
      translations: {
        '야옹': ['밥! 지금! 당장! 🍽️', '문 열어줘~ 🚪', '관심 좀 줘봐 👀'],
        '냐옹': ['심심해~ 놀아줘 🧶', '어디 갔었어? 보고싶었어 💜'],
        '그르르': ['기분 좋아~ 계속해줘 😌', '최고의 집사야! ⭐'],
        '골골': ['너무 행복해... 천국이야 😴💕', '안전하다고 느껴~ 🏠'],
        '하악': ['건들지 마! 화났어! 😾', '무서워! 가까이 오지 마! 🙀'],
        '머리 비비': ['내꺼! 마킹 완료! 😤💜', '사랑해 집사~ 🥰'],
        '꾹꾹이': ['엄마 생각나~ 편안해 🍼', '여기 내 자리! 폭신해~ 💤'],
        '박치기': ['관심 줘! 나한테 집중! 😼', '사랑의 박치기! 💥💕']
      }
    }
  };

  // ─────────────────────────────────────
  // 4. 응답 카테고리 & 매칭 룰
  // ─────────────────────────────────────
  const RESPONSE_RULES = [
    // ── 인사 ──
    {
      keywords: ['안녕', '하이', 'hi', 'hello', '반가', '처음'],
      category: 'greeting',
      responses: [
        '안녕! 나는 아미야~ 🐰✨ PetCTT의 우주대스타 가이드! 뭐든 물어봐~',
        '반가워!! 🐰💜 나 아미! 우리 아이 이야기 해줄래~?',
        '하이하이~ 아미 등장! 🌟 PetCTT 궁금한 거 다 알려줄게!'
      ]
    },
    // ── PetCTT 설명 ──
    {
      keywords: ['petctt', '펫쿠폰', '이게 뭐', '뭐하는', '서비스', '소개', '설명', '알려줘', '뭐야'],
      category: 'about',
      responses: [
        'PetCTT는 반려동물 AI 플랫폼이야! 🐾 AI 통역, 건강체크, 소개팅, 콘테스트까지~ 우리 아이를 위한 모든 것! 💜',
        '여기는 PetCTT! 🐰✨ 반려동물 AI 통역도 하고, 주민등록증도 만들고, 구름장터에서 쇼핑도 해! 궁금한 거 더 물어봐~',
        'PetCTT = 반려동물 AI 세상! 🌏🐾 통역, GPS, 건강, 소개팅, 콘테스트... 우리 아이한테 필요한 거 다 있어!'
      ]
    },
    // ── 기능별 안내 ──
    {
      keywords: ['통역', '번역', '말', '이해', '무슨 뜻', '뭐라고'],
      category: 'translate',
      responses: [
        '아미가 통역해줄게! 🗣️✨ 우리 아이가 뭐라고 했어? 멍멍? 야옹? 알려줘~!',
        'AI 통역 기능이야! 🐾 강아지가 멍멍하면 뭐라는 건지, 고양이가 야옹하면 무슨 뜻인지 알려줘! 💜'
      ]
    },
    {
      keywords: ['gps', '위치', '추적', '어디', '찾기', '잃어버'],
      category: 'gps',
      responses: [
        'GPS 추적으로 우리 아이 위치를 실시간 확인! 📍✨ 이 기능은 프리미엄이야~ 무료 체험 먼저 해볼래? 💜',
        '우리 아이 어디 갔지?! 😱 GPS 추적 기능으로 실시간 위치 확인! 프리미엄 기능이지만 체험해볼 수 있어! 📍'
      ]
    },
    {
      keywords: ['건강', '아파', '병원', '체크', '진단', '상태'],
      category: 'health',
      responses: [
        'AI 건강 체크! 💚 우리 아이 상태를 AI가 분석해줘~ 프리미엄 기능이야! 무료 체험으로 먼저 확인해봐! 🩺',
        '우리 아이 건강이 걱정돼? 😢 AI 건강 체크로 확인해보자! 프리미엄 기능이지만 기본 체험 가능해! 💚'
      ]
    },
    {
      keywords: ['주민등록', '신분증', '카드', '등록증', 'id'],
      category: 'id-card',
      responses: [
        '우리 아이 주민등록증! 🪪✨ 세상에 하나뿐인 특별한 신분증 만들어줄게~ 무료야! 🐾',
        '주민등록증 만들러 가자! 🪪 우리 아이 사진 넣고 예쁘게 만들어줄게~ 무료! 💜'
      ]
    },
    {
      keywords: ['소개팅', '매칭', '친구', '만남', '짝'],
      category: 'live-match',
      responses: [
        '소개팅! 💕 우리 아이 친구 찾아줄게~ 라이브 매칭으로 딱 맞는 친구! 🐾✨',
        '우리 아이도 친구가 필요해! 💕 라이브 소개팅으로 찾아보자~ 🐰'
      ]
    },
    {
      keywords: ['콘테스트', '대회', '자랑', '투표', '우승'],
      category: 'contest',
      responses: [
        '우리 아이 자랑 대회! 🏆✨ 사진 올리고 투표 받고~ 우승하면 상품도! 참여해볼래? 🐾',
        '콘테스트 열렸어! 🎉 우리 아이가 제일 귀엽다고! 🏆 참가해서 자랑해봐~ 💜'
      ]
    },
    {
      keywords: ['장터', '마켓', '구름', '쇼핑', '사고', '팔고', '용품'],
      category: 'market',
      responses: [
        '구름장터! 🛒✨ 반려동물 용품 사고팔기~ 좋은 물건 많아! 구경해볼래? 🐾',
        '쇼핑하러 가자! 🛒 구름장터에서 우리 아이 용품 찾아보자~ 💜'
      ]
    },
    {
      keywords: ['맛집', '레스토랑', '식당', '카페', '동반'],
      category: 'restaurant',
      responses: [
        '펫 맛집! 🍽️✨ 우리 아이랑 같이 갈 수 있는 맛집 찾아줄게~ 🐾',
        '반려동물 동반 맛집 어디 있지? 🍽️ 펫 맛집 코너에서 찾아봐! 💜'
      ]
    },
    {
      keywords: ['글래스', '안경', 'ar', '스마트', '증강'],
      category: 'glasses',
      responses: [
        'AI 스마트 글래스! 🕶️✨ AR로 우리 아이 정보를 실시간 확인! 미래 기술이야~ 곧 만나! 💜',
        '스마트 글래스 쓰면 우리 아이 감정이 AR로 보여! 🕶️ 미래에서 온 기술~ 기대해! ✨'
      ]
    },
    {
      keywords: ['스캔', '사진', '분석', '찍어'],
      category: 'scan',
      responses: [
        '스캔 기능! 📸✨ 우리 아이 사진 찍으면 AI가 분석해줘~ 종류, 특징 다 알려줘! 🐾',
        '우리 아이 사진 한 장이면! 📸 AI가 종류, 나이, 특징 분석해줘~ 해볼래? 💜'
      ]
    },
    // ── 프리미엄 ──
    {
      keywords: ['프리미엄', '유료', '구독', '가격', '얼마', '결제', '무료', 'pro', '업그레이드'],
      category: 'premium',
      responses: [
        '프리미엄은 월 4,900원! 💎 개체별 분석, 맞춤 학습, 기록 저장, 행동 추적까지! 무료 체험 먼저 해볼래? 🐰✨',
        '무료로도 기본 통역, 주민등록증, 소개팅, 콘테스트 다 돼! 🎉 프리미엄은 우리 아이 전용 분석이 추가돼~ 💜'
      ]
    },
    // ── 반려동물 통역 체험 (강아지) ──
    {
      keywords: ['멍멍', '왈왈', '낑낑', '강아지', '개', '멍뭉이', '댕댕이', '퍼피'],
      category: 'dog-translate',
      handler: 'translateDog'
    },
    // ── 반려동물 통역 체험 (고양이) ──
    {
      keywords: ['야옹', '냐옹', '고양이', '냥이', '묘', '캣', '골골', '하악', '꾹꾹이'],
      category: 'cat-translate',
      handler: 'translateCat'
    },
    // ── 아미 자신 ──
    {
      keywords: ['아미', '너 누구', '누구야', '자기소개', '이름'],
      category: 'self',
      responses: [
        '나? 아미! 🐰✨ PetCTT의 우주대스타 AR 가이드야! 반려동물 세상의 모든 걸 안내해줄게~ 💜',
        '아미 등장~! 🌟 나는 PetCTT의 귀여운 흰토끼 가이드! 우주에서 제일 귀여운 건 나! 🐰💕'
      ]
    },
    // ── 회사 정보 ──
    {
      keywords: ['발로레', '회사', '만든', '대표', '누가', 'airctt', '에어쿠폰'],
      category: 'company',
      responses: [
        'PetCTT는 주식회사 발로레에서 만들었어! 🏢 AIRCTT라는 자매 서비스도 있어~ 상생 공존 마켓 철학! 💜✨',
        '발로레가 만들었어! 🐰 AIRCTT(에어쿠폰톡톡)이랑 PetCTT(펫쿠폰톡톡), 둘 다 사랑으로 만든 플랫폼! 💕'
      ]
    },
    // ── 감정/잡담 ──
    {
      keywords: ['사랑', '좋아', '예뻐', '귀여', '최고', '고마워', '감사'],
      category: 'love',
      responses: [
        '으앙 고마워!! 🥹💜 아미도 사랑해~! 우리 아이도 사랑해~! 🐾✨',
        '헤헤~ 칭찬 좋아! 💕🐰 아미가 더 열심히 안내해줄게! ✨',
        '사랑사랑~ 💜💜 아미 심장이 콩닥콩닥! 🐰💕'
      ]
    },
    {
      keywords: ['심심', '놀자', '놀아', '재미', '뭐해'],
      category: 'play',
      responses: [
        '심심해? 🐰 우리 아이 통역 체험 해볼래? "멍멍" 이나 "야옹" 입력해봐! 🎮✨',
        '놀자!! 🎉 콘테스트 구경하러 갈래? 아니면 우리 아이 통역해줄까? 🐾💜'
      ]
    },
    {
      keywords: ['도움', '도와', '모르', '어떻게', '사용법', '방법'],
      category: 'help',
      responses: [
        '아미가 도와줄게! 🐰✨ 궁금한 거 뭐야?\n🗣️ AI 통역 | 🪪 주민등록증\n💕 소개팅 | 🏆 콘테스트\n뭐가 궁금해? 💜',
        '어려워? 걱정 마! 🐰💜 아미한테 물어보면 다 알려줄게~ 기능 이름이나 궁금한 거 말해봐! ✨'
      ]
    }
  ];

  // ─────────────────────────────────────
  // 5. 통역 핸들러
  // ─────────────────────────────────────
  function translateDog(msg) {
    const m = msg.toLowerCase();
    // 특정 소리/행동 매칭
    for (const [key, vals] of Object.entries(PET_TRANSLATIONS.dog.translations)) {
      if (m.includes(key)) {
        const t = vals[Math.floor(Math.random() * vals.length)];
        return `🐶 강아지가 "${key}" 했어?\n통역 결과: ${t}\n\n더 정확한 개체별 분석은 프리미엄에서! 💎`;
      }
    }
    // 일반 강아지 관련
    const general = [
      '강아지 얘기! 🐶💕 우리 아이가 뭐라고 했어? "멍멍", "왈왈", "낑낑" 같은 소리 알려줘~ 아미가 통역해줄게! 🗣️',
      '댕댕이! 🐶✨ 무슨 소리 냈어? 꼬리는 흔들었어? 아미한테 자세히 알려줘~ 💜'
    ];
    return general[Math.floor(Math.random() * general.length)];
  }

  function translateCat(msg) {
    const m = msg.toLowerCase();
    for (const [key, vals] of Object.entries(PET_TRANSLATIONS.cat.translations)) {
      if (m.includes(key)) {
        const t = vals[Math.floor(Math.random() * vals.length)];
        return `🐱 고양이가 "${key}" 했어?\n통역 결과: ${t}\n\n더 정확한 개체별 분석은 프리미엄에서! 💎`;
      }
    }
    const general = [
      '냥이 얘기! 🐱💜 우리 아이가 뭐라고 했어? "야옹", "골골", "하악" 같은 소리 알려줘~ 통역해줄게! 🗣️',
      '고양이님! 🐱✨ 무슨 행동 했어? 꾹꾹이? 머리 비비기? 아미한테 알려줘~ 💕'
    ];
    return general[Math.floor(Math.random() * general.length)];
  }

  const HANDLERS = {
    translateDog,
    translateCat
  };

  // ─────────────────────────────────────
  // 6. 매칭 엔진
  // ─────────────────────────────────────
  function findBestMatch(msg) {
    const m = msg.toLowerCase().replace(/\s+/g, '');
    let bestRule = null;
    let bestScore = 0;

    for (const rule of RESPONSE_RULES) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (m.includes(kw.toLowerCase().replace(/\s+/g, ''))) {
          score += kw.length; // 긴 키워드일수록 높은 점수
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestRule = rule;
      }
    }

    return bestRule;
  }

  // ─────────────────────────────────────
  // 7. 응답 생성
  // ─────────────────────────────────────
  let lastCategory = '';
  let turnCount = 0;
  const PREMIUM_NUDGE_INTERVAL = 5; // 5턴마다 프리미엄 자연 유도

  function generateResponse(msg) {
    turnCount++;
    const rule = findBestMatch(msg);

    if (rule) {
      lastCategory = rule.category;

      // 핸들러가 있는 경우 (통역 등)
      if (rule.handler && HANDLERS[rule.handler]) {
        return HANDLERS[rule.handler](msg);
      }

      // 일반 응답
      const resp = rule.responses[Math.floor(Math.random() * rule.responses.length)];

      // 프리미엄 자연 유도 (N턴마다)
      if (turnCount % PREMIUM_NUDGE_INTERVAL === 0 && rule.category !== 'premium') {
        return resp + '\n\n💡 참! 프리미엄이면 우리 아이 전용 분석도 돼~ 궁금하면 "프리미엄" 이라고 해봐! 💎';
      }

      return resp;
    }

    // 매칭 실패 — 폴백 응답
    const fallbacks = [
      '음~ 아미가 아직 잘 모르는 거야! 🤔 PetCTT 기능이나 우리 아이 이야기 해줄래? 🐰💜',
      '어려운 질문이야! 😵‍💫 아미는 반려동물 전문이야~ "멍멍" 통역이나 기능 설명은 잘 해! 🐾✨',
      '그건 아미한테 좀 어려워~ 🙈 대신 이건 어때?\n🗣️ "멍멍" — 강아지 통역\n🐱 "야옹" — 고양이 통역\n❓ "PetCTT" — 서비스 소개! 💜',
      '아미가 열심히 공부 중이야! 📚🐰 지금은 반려동물 통역이랑 PetCTT 안내 전문! 뭐 궁금해? 💜'
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // ─────────────────────────────────────
  // 8. 첫인사 메시지 (페이지 로드 시)
  // ─────────────────────────────────────
  const WELCOME_MESSAGES = [
    '안녕! 아미야~ 🐰✨ PetCTT에 온 걸 환영해! 궁금한 거 물어봐!',
    '폴짝~! 🐰💜 아미가 왔어! 우리 아이 이야기 해줄래?',
    '우주대스타 아미 등장! 🌟🐰 PetCTT 뭐든 물어봐~ 아미가 안내해줄게!'
  ];

  function getWelcomeMessage() {
    return WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
  }

  // ─────────────────────────────────────
  // 9. ami.js callAmi 오버라이드
  // ─────────────────────────────────────
  function overrideCallAmi() {
    // 기존 callAmi를 오프라인 브레인으로 교체
    // ami.js에서 callAmi는 IIFE 내부라 직접 접근 불가
    // → window.__amiBrain 으로 노출하고, ami.js를 수정하거나
    //   또는 send() 함수를 오버라이드

    // 방법: amiSend를 래핑
    const origSend = window.amiSend;

    // 전역 브레인 함수 노출 (ami.js 수정 시 사용)
    window.__amiBrain = {
      call: async function(msg) {
        // 짧은 타이핑 딜레이 (자연스러움)
        await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
        return generateResponse(msg);
      },
      welcome: getWelcomeMessage,
      version: '1.0.0',
      mode: 'offline-smart' // Phase 2에서 'gemma4-local'로 전환
    };

    console.log('🐰 아미 브레인 v1.0 로드 완료! (오프라인 스마트 모드)');
  }

  // ─────────────────────────────────────
  // 10. 초기화
  // ─────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', overrideCallAmi);
  } else {
    overrideCallAmi();
  }

})();
