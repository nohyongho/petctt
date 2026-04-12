/**
 * =====================================================
 *  🐰 아미 브레인 v2.0 — PetCTT 우주대스타 AR 가이드 두뇌 (8종 동물 통역)
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
    },
    // ── 소 (cow) ──
    cow: {
      sounds: ['음메', '음매', '매애'],
      behaviors: ['꼬리 휘두르기', '풀 뜯기', '되새김질', '머리 들기', '발 구르기'],
      translations: {
        '음메': ['배고파~ 풀 더 줘! 🌿', '친구야 반가워! 같이 놀자~ 🐄', '기분 좋아! 날씨 최고! ☀️'],
        '음매': ['엄마 어디야? 보고싶어 🥺', '물 마시고 싶어~ 💧', '여기 내 자리야! 비키셈~ 😤'],
        '매애': ['뭔가 무서워... 옆에 있어줘 😢', '나 졸려... 쿨쿨 💤'],
        '꼬리 휘두르기': ['파리 저리 가! 귀찮아! 🪰', '기분 좋을 때도 흔들어~ 💕'],
        '되새김질': ['맛있게 먹는 중~ 냠냠 😋', '편안하고 행복해~ 🏠'],
        '발 구르기': ['화났어! 가까이 오지 마! 😠', '뭔가 불안해... 조심해! ⚠️']
      }
    },
    // ── 돼지 (pig) ──
    pig: {
      sounds: ['꿀꿀', '꾸꾸', '끼이', '코 킁킁'],
      behaviors: ['코 비비기', '뒹굴기', '꼬리 흔들기', '귀 쫑긋', '파기'],
      translations: {
        '꿀꿀': ['밥이다! 맛있겠다! 🍽️', '행복해~ 세상 최고! 💖', '같이 놀자! 심심해~ 🎾'],
        '꾸꾸': ['졸려... 낮잠 자자 💤', '편안해~ 여기 좋아 🏠'],
        '끼이': ['무서워! 도와줘! 😱', '아야! 아파! 조심해줘! 😢', '싫어! 놓아줘! 😤'],
        '코 킁킁': ['뭔가 맛있는 냄새! 어디야?! 🐽', '탐색 중~ 호기심 폭발! 🔍'],
        '코 비비기': ['좋아해! 친해지고 싶어~ 💕', '간식 줘~ 응? 🍪'],
        '뒹굴기': ['너무 행복해서 뒹굴! 😆', '시원해~ 진흙 최고! 💦'],
        '파기': ['뭔가 찾고 있어! 보물이다! 💎', '본능이야~ 땅 파는 게 재밌어! 🐷']
      }
    },
    // ── 오리 (duck) ──
    duck: {
      sounds: ['꽥꽥', '꽤액', '뿍뿍'],
      behaviors: ['날개 퍼덕', '물 튀기기', '머리 끄덕', '꼬리 흔들기', '깃털 정리'],
      translations: {
        '꽥꽥': ['밥 줘! 배고파! 🍞', '친구들! 이리 와! 👋', '여기 내 구역이야! 🦆'],
        '꽤액': ['무서워! 위험해! 도망가자! 😱', '아야! 아파! 😢'],
        '뿍뿍': ['기분 좋아~ 물놀이 최고! 💦', '편안해~ 졸려 💤'],
        '날개 퍼덕': ['신나! 날고 싶어! ✈️', '내가 제일 크다! 으쓱~ 💪'],
        '물 튀기기': ['목욕 타임! 깨끗해지자! 🛁', '놀자놀자! 물놀이! 💦'],
        '머리 끄덕': ['네네~ 알겠어~ 👍', '인사! 안녕! 반가워! 👋'],
        '깃털 정리': ['이쁘게 단장 중~ ✨', '편안하고 안전해~ 💕']
      }
    },
    // ── 병아리 (chick) ──
    chick: {
      sounds: ['삐약삐약', '삐약', '삐이', '짹짹'],
      behaviors: ['쪼기', '날개 파닥', '엄마 따라가기', '옹기종기', '고개 갸웃'],
      translations: {
        '삐약삐약': ['엄마! 엄마! 어디야?! 🐥', '배고파! 밥 줘! 🌾'],
        '삐약': ['여기 있어! 나 봐! 👀', '안녕! 나 귀엽지? ✨'],
        '삐이': ['무서워! 큰 거 왔어! 😱', '추워... 따뜻하게 해줘 🥶'],
        '짹짹': ['기분 좋아! 햇볕 따뜻해! ☀️', '친구들아 놀자! 🎉'],
        '쪼기': ['이게 뭐지? 먹어도 돼? 🤔', '맛있다! 더 줘! 😋'],
        '날개 파닥': ['날고 싶어! 아직 안 돼?! 😤', '신나서 파닥파닥! 💕'],
        '옹기종기': ['따뜻해~ 친구들이랑 같이! 🤗', '안전해! 편해! 💤'],
        '고개 갸웃': ['뭐야? 신기해! 🧐', '처음 보는 거다! 호기심! 🔍']
      }
    },
    // ── 원숭이 (monkey) ──
    monkey: {
      sounds: ['끼끼', '우끼끼', '호호', '악'],
      behaviors: ['그루밍', '점프', '물건 집기', '얼굴 찡그리기', '이 드러내기'],
      translations: {
        '끼끼': ['놀자! 재밌는 거 하자! 🎮', '간식 발견! 내꺼! 🍌'],
        '우끼끼': ['신나! 최고! 대박! 🎉', '친구야! 이리 와! 같이 놀자! 🤝'],
        '호호': ['뭔가 발견했어! 이거 봐! 👀', '기분 좋아~ 💕'],
        '악': ['화났어! 건들지 마! 😠', '위험해! 조심해! ⚠️'],
        '그루밍': ['좋아해! 친구야! 벌레 잡아줄게~ 💕', '편안해... 사이좋게 지내자 🤗'],
        '점프': ['신나서 폴짝! 에너지 폭발! 🚀', '저기 맛있는 거 있다! 🍎'],
        '물건 집기': ['이거 뭐야? 내꺼! 🙊', '도구 사용 천재! 똑똑해! 🧠'],
        '이 드러내기': ['웃는 거야! 기분 좋아! 😁', '경고야! 더 가까이 오면 안 돼! 🦷']
      }
    },
    // ── 염소 (goat) ──
    goat: {
      sounds: ['매애', '메에', '음메에'],
      behaviors: ['머리 박기', '뒷발 서기', '꼬리 흔들기', '풀 뜯기', '높은 곳 오르기'],
      translations: {
        '매애': ['밥 줘! 풀 줘! 뭐든 줘! 🌿', '엄마! 어디야! 🥺', '친구! 반가워! 인사! 👋'],
        '메에': ['심심해~ 놀아줘 🎈', '여기 내 자리야! 🐐', '기분 좋아! ☀️'],
        '음메에': ['불안해... 무서워 😢', '낯선 사람이야! 경계! ⚠️'],
        '머리 박기': ['놀자! 힘 겨루기! 💪', '내가 더 세! 으쓱! 😤', '화났어! 비켜! 🐐'],
        '뒷발 서기': ['높은 데 올라갈래! 🏔️', '호기심! 저기 뭐가 있지? 👀'],
        '풀 뜯기': ['맛있어~ 냠냠 🌱', '평화로워~ 행복해 💚'],
        '높은 곳 오르기': ['모험이다! 탐험! 🗻', '여기서 다 보여! 왕이 된 기분! 👑']
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
    // ── 춤춰줘 → 아미 춤 + 워밍업 가이드 ──
    {
      keywords: ['춤춰', '춤추', '댄스', '흔들', '워밍업', '따라해', '춤 춰'],
      category: 'dance',
      responses: [
        '엉! 알려줄게~ 따라해봐 호호 ♪\n\n1. 먼저 어깨를 으쓱으쓱~\n2. 엉덩이를 살랑살랑~\n3. 손을 흔들흔들~\n\n어때? 기분 좋아지지? 🐰✨',
        '엉! 아미 춤 나간다~! ♫\n\n오른쪽~ 왼쪽~ 깡총!\n빙글빙글~ 짠! ✨\n\n호호~ 따라하면 100배 귀여워져! 🐰💜',
        '엉엉! 춤추자! ♬\n\n팔을 위로~ 흔들흔들~\n발을 탁탁~ 점프!\n마지막에 윙크! ^\n\n우리 같이 추니까 더 신나~! 🐰✨',
        '호호~ 아미 스페셜 춤이야! ♪\n\n고개를 까딱까딱~\n양손을 파닥파닥~\n돌고 돌고~ 짠! ✦\n\n이거 따라하면 스트레스 싹~! 🐰💕',
        '엉! 준비됐어? 호호~\n\n아미 워밍업 댄스!\n1. 토끼 점프! 깡총깡총!\n2. 귀 흔들기! 팔랑팔랑!\n3. 꼬리 살랑! 엉덩이 흔들!\n\n하하~ 기분이 날아갈 것 같아! 🐰🌟'
      ],
      action: 'dance'
    },
    // ── 이야기/동화 → 짧은 전래동화 ──
    {
      keywords: ['이야기', '동화', '재밌는', '재미있', '옛날', '들려줘', '얘기', '스토리', '이야기해'],
      category: 'fairy-tale',
      responses: [
        '응! 이야기 해줄게~ 🐢🐇\n\n< 토끼와 거북이 >\n\n토끼가 거북이한테 달리기 시합을 했어.\n"내가 이기지~" 하고 낮잠을 잤는데...\n거북이가 꾸준히 걸어서 1등!\n\n교훈: 꾸준함이 최고야~ 아미처럼! 🐰✨',
        '응! 들려줄게~ 🪓✨\n\n< 금도끼 은도끼 >\n\n나무꾼이 도끼를 물에 빠뜨렸어.\n산신령이 "금도끼가 니 거냐?" 물었는데\n"아니요, 쇠도끼요" 정직하게 말했더니\n금도끼 은도끼 다 받았대!\n\n교훈: 정직하면 좋은 일이 와! 🐰💜',
        '응! 재밌는 거 알려줄게~ 🌙🐰\n\n< 달에 사는 토끼 >\n\n옛날에 토끼가 떡을 너무 잘 만들었대.\n하늘에서 "달에 와서 떡 만들어줘!" 해서\n토끼가 달에 갔대!\n\n그래서 보름달에 토끼가 보이는 거야~\n아미도 그 토끼 친구야! 🐰✨',
        '응응! 이야기 시작~ 🐕👦\n\n< 흥부와 놀부 >\n\n착한 흥부가 다친 제비를 치료해줬어.\n제비가 고마워서 박씨를 줬는데\n박을 타니 금은보화가 쏟아졌대!\n\n교훈: 선한 마음이 복을 불러와~ 🐰💜',
        '응! 아미가 들려줄게~ 🎋\n\n< 견우와 직녀 >\n\n하늘에서 견우와 직녀가 사랑했는데\n1년에 딱 한 번, 칠월칠석에만\n까마귀 다리를 건너 만날 수 있대.\n\n그 날 비가 오면 두 사람의 눈물이래! 🐰💕',
        '응! 신나는 이야기야~ 🐯📖\n\n< 호랑이와 곶감 >\n\n무서운 호랑이가 마을에 왔는데\n아기가 울고 있었어.\n엄마가 "곶감 줄게!" 했더니 아기가 뚝!\n호랑이가 "곶감이 나보다 무섭나?!" 하고\n도망갔대! 하하 🐰✨',
        '응! 아미 최애 이야기~ 🐰🥕\n\n< 방귀쟁이 며느리 >\n\n며느리가 방귀를 참고 참다가\n뿡! 했더니 너무 세서 감나무 감이 다 떨어졌대!\n시아버지가 "다시 뀌어봐!" 해서\n그때부터 방귀로 감을 따줬대~\n\n하하~ 참지 말고 표현하자! 🐰✨'
      ],
      action: 'dance'
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
    // ── 반려동물 통역 체험 (소) ──
    {
      keywords: ['음메', '음매', '소', '송아지', '젖소', '한우', '황소'],
      category: 'cow-translate',
      handler: 'translateCow'
    },
    // ── 반려동물 통역 체험 (돼지) ──
    {
      keywords: ['꿀꿀', '돼지', '꾸꾸', '끼이', '아기돼지', '미니피그', '피그'],
      category: 'pig-translate',
      handler: 'translatePig'
    },
    // ── 반려동물 통역 체험 (오리) ──
    {
      keywords: ['꽥꽥', '오리', '꽤액', '뿍뿍', '청둥오리', '거위', '덕'],
      category: 'duck-translate',
      handler: 'translateDuck'
    },
    // ── 반려동물 통역 체험 (병아리) ──
    {
      keywords: ['삐약', '병아리', '짹짹', '삐이', '아기닭', '닭', '치킨', '칙'],
      category: 'chick-translate',
      handler: 'translateChick'
    },
    // ── 반려동물 통역 체험 (원숭이) ──
    {
      keywords: ['끼끼', '원숭이', '우끼끼', '호호', '몽키', '침팬지', '고릴라'],
      category: 'monkey-translate',
      handler: 'translateMonkey'
    },
    // ── 반려동물 통역 체험 (염소) ──
    {
      keywords: ['매애', '염소', '메에', '음메에', '산양', '고트', '양'],
      category: 'goat-translate',
      handler: 'translateGoat'
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
        '심심해? 🐰 통역 체험 해볼래? 🐶멍멍 🐱야옹 🐄음메 🐷꿀꿀 🦆꽥꽥 🐥삐약 🐵끼끼 🐐매애~ 골라봐! 🎮✨',
        '놀자!! 🎉 동물 8종 통역 가능! 강아지·고양이·소·돼지·오리·병아리·원숭이·염소~ 뭐 해볼래? 🐾💜'
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

  // ── 소 통역 ──
  function translateCow(msg) {
    const m = msg.toLowerCase();
    for (const [key, vals] of Object.entries(PET_TRANSLATIONS.cow.translations)) {
      if (m.includes(key)) {
        const t = vals[Math.floor(Math.random() * vals.length)];
        return `🐄 소가 "${key}" 했어?\n통역 결과: ${t}\n\n소는 감정이 풍부한 동물이야! 기쁠 때 뛰어다니고, 슬플 때 눈물도 흘려~ 🐮💚`;
      }
    }
    return '소 얘기! 🐄💚 소는 감정이 아주 풍부해~ "음메", "음매" 같은 소리나 행동을 알려줘! 아미가 통역해줄게~ 🐮';
  }

  // ── 돼지 통역 ──
  function translatePig(msg) {
    const m = msg.toLowerCase();
    for (const [key, vals] of Object.entries(PET_TRANSLATIONS.pig.translations)) {
      if (m.includes(key)) {
        const t = vals[Math.floor(Math.random() * vals.length)];
        return `🐷 돼지가 "${key}" 했어?\n통역 결과: ${t}\n\n돼지는 IQ가 강아지보다 높대! 똑똑한 친구야~ 🐽✨`;
      }
    }
    return '돼지 얘기! 🐷✨ 돼지는 진짜 똑똑해! 강아지보다 IQ가 높대~ "꿀꿀", "끼이" 소리나 행동 알려줘! 🐽💕';
  }

  // ── 오리 통역 ──
  function translateDuck(msg) {
    const m = msg.toLowerCase();
    for (const [key, vals] of Object.entries(PET_TRANSLATIONS.duck.translations)) {
      if (m.includes(key)) {
        const t = vals[Math.floor(Math.random() * vals.length)];
        return `🦆 오리가 "${key}" 했어?\n통역 결과: ${t}\n\n오리는 물놀이를 제일 좋아해! 깃털에 기름이 있어서 물에 안 젖어~ 🦆💦`;
      }
    }
    return '오리 얘기! 🦆💦 오리는 물놀이 대장이야~ "꽥꽥", "뿍뿍" 소리나 행동 알려줘! 통역해줄게! 🐥';
  }

  // ── 병아리 통역 ──
  function translateChick(msg) {
    const m = msg.toLowerCase();
    for (const [key, vals] of Object.entries(PET_TRANSLATIONS.chick.translations)) {
      if (m.includes(key)) {
        const t = vals[Math.floor(Math.random() * vals.length)];
        return `🐥 병아리가 "${key}" 했어?\n통역 결과: ${t}\n\n병아리는 태어나자마자 엄마를 찾아~ 세상에서 제일 귀여운 아기야! 🐣💛`;
      }
    }
    return '병아리 얘기! 🐥💛 삐약삐약~ 세상에서 제일 귀여운 아기! "삐약삐약", "짹짹" 소리 알려줘! 아미가 통역! 🐣';
  }

  // ── 원숭이 통역 ──
  function translateMonkey(msg) {
    const m = msg.toLowerCase();
    for (const [key, vals] of Object.entries(PET_TRANSLATIONS.monkey.translations)) {
      if (m.includes(key)) {
        const t = vals[Math.floor(Math.random() * vals.length)];
        return `🐵 원숭이가 "${key}" 했어?\n통역 결과: ${t}\n\n원숭이는 도구도 쓰고, 표정으로 감정도 표현해! 진짜 똑똑해~ 🙊✨`;
      }
    }
    return '원숭이 얘기! 🐵✨ 원숭이는 표정이 진짜 풍부해! "끼끼", "우끼끼" 소리나 행동 알려줘~ 🙈💕';
  }

  // ── 염소 통역 ──
  function translateGoat(msg) {
    const m = msg.toLowerCase();
    for (const [key, vals] of Object.entries(PET_TRANSLATIONS.goat.translations)) {
      if (m.includes(key)) {
        const t = vals[Math.floor(Math.random() * vals.length)];
        return `🐐 염소가 "${key}" 했어?\n통역 결과: ${t}\n\n염소는 높은 곳을 좋아하는 모험가야! 절벽도 쉽게 올라가~ 🏔️✨`;
      }
    }
    return '염소 얘기! 🐐✨ 염소는 높은 곳을 좋아하는 모험가~ "매애", "메에" 소리나 행동 알려줘! 통역해줄게! 🏔️';
  }

  const HANDLERS = {
    translateDog,
    translateCat,
    translateCow,
    translatePig,
    translateDuck,
    translateChick,
    translateMonkey,
    translateGoat
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

      // 춤/이야기 등 액션이 있으면 아미 춤추기
      if (rule.action === 'dance') {
        triggerAmiDance();
      }

      // 프리미엄 자연 유도 (N턴마다)
      if (turnCount % PREMIUM_NUDGE_INTERVAL === 0 && rule.category !== 'premium') {
        return resp + '\n\n💡 참! 프리미엄이면 우리 아이 전용 분석도 돼~ 궁금하면 "프리미엄" 이라고 해봐! 💎';
      }

      return resp;
    }

    // 매칭 실패 — 폴백 응답
    const fallbacks = [
      '음~ 아미가 아직 잘 모르는 거야! 🤔 PetCTT 기능이나 우리 아이 이야기 해줄래? 🐰💜',
      '어려운 질문이야! 😵‍💫 아미는 반려동물 전문이야~ 동물 8종 통역 가능! 소리나 기능 물어봐! 🐾✨',
      '그건 아미한테 좀 어려워~ 🙈 대신 이건 어때?\n🐶멍멍 🐱야옹 🐄음메 🐷꿀꿀\n🦆꽥꽥 🐥삐약 🐵끼끼 🐐매애\n❓ "PetCTT" — 서비스 소개! 💜',
      '아미가 열심히 공부 중이야! 📚🐰 동물 8종 통역이랑 PetCTT 안내 전문! 뭐 궁금해? 💜'
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
  // 8-B. 아미 춤추기 트리거
  // ─────────────────────────────────────
  function triggerAmiDance() {
    try {
      var svg = document.getElementById('ami-svg');
      if (svg) {
        svg.classList.add('ami-dancing');
        // 4초 후 춤 중단
        setTimeout(function() {
          svg.classList.remove('ami-dancing');
        }, 4000);
      }
      // 춤 버튼 활성화 표시
      var btn = document.getElementById('ami-dance-btn');
      if (btn) {
        btn.classList.add('ami-act');
        setTimeout(function() {
          btn.classList.remove('ami-act');
        }, 4000);
      }
      // 말풍선도 표시 (있으면)
      if (typeof window.showAmiBubble === 'function') {
        window.showAmiBubble('신나!! 💃🕺 따라해봐~!', 3000);
      }
    } catch(e) {
      // 춤 트리거 실패해도 응답은 정상 진행
    }
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
      version: '2.0.0',
      mode: 'offline-smart' // Phase 2에서 'gemma4-local'로 전환
    };

    console.log('🐰 아미 브레인 v2.0 로드 완료! (8종 동물 통역 · 오프라인 스마트 모드)');
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
