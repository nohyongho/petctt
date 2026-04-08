/**
 * PetCTT 아미 글로벌 시스템 v6
 * - 모든 페이지에서 동작
 * - X/O 토글 (숨기기/보이기)
 * - PetCTT 전체 사용설명 대화
 * - 페이지별 맥락 인식
 * - 재밌는 대화 + 감정표현
 */
(function(){
  'use strict';

  // 이미 로드됐으면 중복 방지
  if(window._amiGlobalLoaded) return;
  window._amiGlobalLoaded = true;

  var STORAGE_KEY = 'ami-visible';
  var isVisible = localStorage.getItem(STORAGE_KEY) !== 'false';
  var chatOpen = false;
  var bubbleTimer = null;
  var moveTimer = null;
  var idleTimer = null;
  var ax = 80; // 아미 X 위치
  var facing = 1;

  // ===== 페이지 감지 =====
  var path = location.pathname.toLowerCase();
  function getPageName(){
    if(path.includes('scan') || path.includes('ai')) return 'ai-scan';
    if(path.includes('restaurant') || path.includes('pet-restaurant')) return 'restaurant';
    if(path.includes('market') || path.includes('coupon')) return 'market';
    if(path.includes('contest')) return 'contest';
    if(path.includes('live-match') || path.includes('sogyeting')) return 'match';
    if(path.includes('resident') || path.includes('card')) return 'resident';
    if(path.includes('glasses') || path.includes('glass')) return 'glasses';
    if(path.includes('broadcast')) return 'broadcast';
    if(path.includes('guide') || path.includes('help')) return 'guide';
    if(path.includes('admin') || path.includes('settlement')) return 'admin';
    if(path.includes('pricing') || path.includes('subscribe')) return 'pricing';
    if(path.includes('mypage') || path.includes('profile')) return 'mypage';
    return 'main';
  }

  // ===== PetCTT 지식 (확장판) =====
  var PETCTT_FAQ = {
    'petctt': 'PetCTT는 반려동물 AI 플랫폼이야!\nAI 통역, 위치 추적, 건강 체크,\n주민등록증 발급, 소개팅, 콘테스트까지\n반려동물과 함께하는 모든 것!',
    '통역': 'AI 통역은 반려동물의 소리와 행동을\n분석해서 감정을 알려줘!\n카메라+음성 AI로 실시간 양방향 소통!\n\n짖는 소리, 울음, 몸짓까지 분석해서\n"배고파", "놀아줘", "불안해" 같은\n감정을 알려줘!',
    '위치': '위치 추적으로 우리 아이가\n어디 있는지 실시간으로 확인!\nGPS 기반 + 안심 영역 설정 가능!\n\n영역 벗어나면 즉시 알림!',
    '건강': '건강 체크 기능으로\n반려동물 상태를 기록하고 관리해!\n\n기록 가능한 것:\n- 식사량/시간\n- 배변 상태\n- 체중 변화\n- 기분/행동\n- 병원 방문\n- 약 복용',
    '주민등록': '반려동물 주민등록증을 발급받을 수 있어!\n사진, 이름, 생년월일, 품종,\n마이크로칩 번호까지 등록!\n\n분실 시 찾기에도 도움이 돼!',
    '소개팅': '라이브 소개팅으로\n반려동물 친구를 만들어줘!\n\n성격, 크기, 나이를 매칭해서\n잘 맞는 친구를 추천!\n영상으로 먼저 만나볼 수 있어!',
    '콘테스트': '매주 펫 콘테스트가 열려!\n\n참여 방법:\n1. 우리 아이 사진/영상 올리기\n2. 다른 참가자 투표하기\n3. 아미 심사위원장 특별상!\n\n우승하면 선물도 있어!',
    '구독': '요금제 안내:\n\n무료: 기본 기능 + 하루 10회 대화\nPro: AI 통역 강화 + 무제한 대화 + 건강기록\nPremium: 전체 기능 + 우선 지원 + 전문 상담\n\n지금은 무료로도 충분히 써볼 수 있어!',
    '쿠폰': '쿠폰 받는 방법:\n1. AR 게임에서 떨어지는 쿠폰 잡기\n2. 주변 매장 위치 기반 자동 발견\n3. 이벤트/콘테스트 참여 보상\n4. 친구 초대 보상\n\n쿠폰은 매장에서 QR로 사용!',
    '매장': '매장입점 혜택:\n- 쿠폰 직접 발급 & 관리\n- 매출/정산 실시간 확인\n- 고객 데이터 분석\n- 반려동물 친화 매장 인증\n- AR 게임 노출로 고객 유치!',
    '글래스': '스마트 AR 글래스로\n반려동물 정보를 실시간 확인!\n\n산책 중 건강 데이터 체크,\n주변 펫 매장/병원 AR 표시,\n다른 반려동물 정보도 볼 수 있어!',
    '사용법': 'PetCTT 시작하기:\n\n1. 대화시작 → AI 통역 체험\n2. 쿠폰 찾기 → 할인 쿠폰 획득\n3. 매장입점 → 사업자 등록\n4. 더 알아보기 → 전체 기능 안내\n\n궁금한 기능 이름을 말해봐!',
    '방송': '라이브 방송으로\n우리 아이를 전국에 보여줘!\n\n실시간 채팅으로 소통하고\n팬들과 교류할 수 있어!\n인기 방송은 메인에 노출!',
    '공동구매': '공동구매로 사료, 간식, 용품을\n최대 42% 할인으로 구매!\n\n함께 사면 더 싸져!\n반려동물 프리미엄 제품을\n합리적인 가격에!',
  };

  // ===== 페이지별 인사말 =====
  var PAGE_GREETINGS = {
    'main': ['안녕! 나 아미야! PetCTT에 온 걸 환영해!', '반가워! 뭐 궁금한 거 있어?', '오늘 우리 아이 기분은 어때?'],
    'ai-scan': ['여기서 반려동물 AI 스캔을 할 수 있어!', '카메라를 켜면 AI가 분석해줘!'],
    'restaurant': ['반려동물 동반 맛집을 찾고 있구나!', '주변에 좋은 펫 레스토랑 있어!'],
    'market': ['쿠폰이랑 마켓 구경 왔구나!', '좋은 상품 많아! 둘러봐!'],
    'contest': ['펫 콘테스트야! 우리 아이 출전시켜봐!', '이번 주 특별상이 뭔지 알아?'],
    'match': ['소개팅 페이지야! 친구 만들어줄까?', '우리 아이 성격에 맞는 친구 찾아줄게!'],
    'resident': ['주민등록증 발급 페이지야!', '우리 아이 이름이랑 사진 넣어봐!'],
    'glasses': ['스마트 글래스 체험 페이지야!', 'AR로 반려동물 정보를 확인해봐!'],
    'guide': ['도움말 페이지야! 뭐든 물어봐!', '사용법 알려줄게!'],
    'admin': ['관리자 페이지에요!', '정산 내역 확인해보세요!'],
    'pricing': ['구독 요금제를 확인해봐!', 'Pro 구독하면 AI 통역 무제한!'],
    'mypage': ['마이페이지야! 내 정보 확인해봐!', '반려동물 등록도 여기서!'],
    'broadcast': ['라이브 방송 페이지야!', '실시간으로 반려동물 방송을 볼 수 있어!'],
  };

  // ===== 대화 응답 (확장판) =====
  function getReply(msg){
    var q = msg.toLowerCase();

    // PetCTT FAQ 키워드 매칭
    var faqKeys = Object.keys(PETCTT_FAQ);
    for(var i=0; faqKeys.length>i; i++){
      if(q.includes(faqKeys[i])) return PETCTT_FAQ[faqKeys[i]];
    }

    // === 인사/감정 ===
    if(match(q,['안녕','하이','hi','hello','헬로'])) return pick(['안녕! 나 아미! 오늘 하루 어때?','반가워! 나한테 뭐든 물어봐!','어서와! 오늘 우리 아이는 잘 있어?']);
    if(match(q,['고마','감사','땡큐','thank'])) return pick(['헤헤! 도움이 됐다니 기뻐!','별말씀을! 또 궁금한 거 있으면 말해!','나도 고마워! 우리 아이 건강하길!']);
    if(match(q,['사랑','좋아','최고','귀엽','예뻐'])) return pick(['어머! 나도 좋아!','칭찬 받으니까 기분 좋아! 폴짝!','고마워! 우리 아이도 예쁘지?']);
    if(match(q,['심심','놀자','뭐해','지루'])) return pick(['나랑 놀래? 쿠폰 게임 하러 가자!','반려동물 퀴즈 풀어볼래?\n강아지 코는 왜 촉촉할까?\n정답: 냄새를 더 잘 맡으려고!','심심하면 콘테스트에 우리 아이 올려봐!']);
    if(match(q,['ㅋㅋ','ㅎㅎ','웃겨','재밌'])) return pick(['ㅎㅎ 나도 웃겨!','기분 좋을 때가 최고지!','웃는 날엔 산책 가기 딱 좋아!']);
    if(match(q,['슬퍼','우울','힘들'])) return '힘든 날이구나.. 반려동물이 옆에 있으면\n기분이 좀 나아질 거야!\n우리 아이한테 안아달라고 해봐!';
    if(match(q,['잘자','바이','안녕히'])) return '잘 자! 내일 또 만나! 우리 아이도 꿀잠 자길!';

    // === 강아지 품종 ===
    if(match(q,['말티즈'])) return '말티즈! 하얀 솜사탕 같은 아이!\n\n특징: 활발하고 애교 많음\n체중: 2~3kg\n수명: 12~15년\n주의: 눈물자국, 관절 관리\n\n작지만 용감한 친구야!';
    if(match(q,['푸들','토이푸들'])) return '푸들! 영리한 곱슬머리!\n\n특징: 매우 똑똑하고 훈련 잘 됨\n체중: 토이 2~3kg / 미니 5~8kg\n수명: 12~15년\n주의: 미용 주기적으로, 귀 관리\n\n지능 순위 2위인 천재견!';
    if(match(q,['골든','리트리버'])) return '골든리트리버! 대형견의 천사!\n\n특징: 온순하고 사람 좋아함\n체중: 25~35kg\n수명: 10~12년\n주의: 관절, 비만 관리\n\n가족견으로 최고!';
    if(match(q,['시바','시바견'])) return '시바이누! 도도한 매력쟁이!\n\n특징: 독립적이고 깨끗함\n체중: 8~11kg\n수명: 13~16년\n주의: 털 빠짐 많음, 고집\n\n밈으로도 유명한 견종!';
    if(match(q,['포메','포메라니안'])) return '포메라니안! 작은 여우 같은 아이!\n\n특징: 활발하고 경계심 강함\n체중: 1.5~3kg\n수명: 12~16년\n주의: 슬개골, 치아 관리\n\n풍성한 털이 매력!';
    if(match(q,['진돗개','진도'])) return '진돗개! 한국의 자랑!\n\n특징: 충성심 강하고 용감\n체중: 15~25kg\n수명: 12~15년\n주의: 주인 외 낯가림, 운동량 많음\n\n천연기념물 제53호!';
    if(match(q,['웰시코기','코기'])) return '웰시코기! 짧은 다리의 매력!\n\n특징: 밝고 활발, 목양견 출신\n체중: 10~14kg\n수명: 12~15년\n주의: 허리 관리, 비만 주의\n\n엉덩이가 하트 모양!';
    if(match(q,['비숑','비숑프리제'])) return '비숑프리제! 솜사탕 뭉치!\n\n특징: 붙임성 좋고 활발\n체중: 3~5kg\n수명: 12~15년\n주의: 눈물자국, 미용 관리\n\n알레르기 적은 저자극견!';

    // === 고양이 품종 ===
    if(match(q,['러시안블루','러시안'])) return '러시안블루! 은빛 귀족 고양이!\n\n특징: 조용하고 예민, 주인에게 충성\n체중: 3~5kg\n수명: 15~20년\n주의: 스트레스에 약함\n\n에메랄드 눈이 매력!';
    if(match(q,['페르시안','페르샨'])) return '페르시안! 고양이계의 공주!\n\n특징: 온순하고 느긋\n체중: 3~5kg\n수명: 12~17년\n주의: 매일 빗질, 눈/코 관리\n\n긴 털이 정말 우아해!';
    if(match(q,['스코티쉬','폴드'])) return '스코티쉬폴드! 접힌 귀의 매력!\n\n특징: 온순하고 사교적\n체중: 3~5kg\n수명: 11~15년\n주의: 관절 유전질환 체크\n\n동그란 얼굴이 귀여워!';
    if(match(q,['브리티쉬','숏헤어'])) return '브리티쉬숏헤어! 동글동글 뭉치!\n\n특징: 느긋하고 독립적\n체중: 4~7kg\n수명: 12~17년\n주의: 비만 주의\n\n회색 털 + 금색 눈 조합이 최고!';
    if(match(q,['랙돌'])) return '랙돌! 인형처럼 순한 고양이!\n\n특징: 안기는 걸 좋아함, 매우 온순\n체중: 5~9kg\n수명: 12~17년\n주의: 털 관리\n\n이름 뜻이 "봉제인형"!';
    if(match(q,['코리안숏헤어','코숏','길고양이'])) return '코리안숏헤어! 우리나라 토종 고양이!\n\n특징: 건강하고 적응력 좋음\n체중: 3~5kg\n수명: 15~20년\n장점: 면역력 강함, 영리함\n\n고등어, 치즈, 턱시도 등 다양한 무늬!';

    // === 반려동물 건강/행동 상세 ===
    if(match(q,['구토','토하','게워'])) return '구토 증상이 있구나.. 걱정되지?\n\n일시적일 수 있지만 이럴 땐 병원 가봐:\n- 반복적으로 토할 때\n- 피가 섞여 있을 때\n- 기력이 없을 때\n- 2일 이상 지속될 때\n\n정확한 원인은 수의사만 판단 가능해!';
    if(match(q,['설사'])) return '설사를 하는구나..\n\n가능한 원인:\n- 음식이 안 맞았을 때\n- 스트레스\n- 감염/기생충\n- 알레르기\n\n2일 이상 지속되거나\n피가 섞이면 바로 병원 가봐!\n수분 보충도 중요해!';
    if(match(q,['안 먹','안먹','식욕','밥 안'])) return '밥을 안 먹는구나..\n\n가능한 이유:\n- 스트레스/환경 변화\n- 사료가 안 맞을 수 있어\n- 치아/구강 문제\n- 소화기 문제\n- 날씨가 더울 때\n\n1~2일 이상 안 먹으면\n꼭 수의사 상담 받아봐!';
    if(match(q,['짖','울','소리','하울'])) return '짖거나 소리를 내는 이유:\n\n- 관심을 끌고 싶을 때\n- 불안하거나 무서울 때\n- 영역 보호 본능\n- 아플 때\n- 외로울 때\n\n상황/빈도를 관찰하고\n지속되면 행동 전문가 상담도 좋아!';
    if(match(q,['긁','가려','피부','탈모'])) return '피부 문제가 있구나!\n\n가능한 원인:\n- 알레르기 (음식/환경)\n- 벼룩/진드기\n- 피부 감염\n- 건조한 환경\n\n심하게 긁거나 탈모가 있으면\n수의사 진료 받아봐!\n참고 정보니까 꼭 전문가에게!';
    if(match(q,['예방접종','접종','백신'])) return '예방접종 가이드:\n\n강아지:\n- 6~8주: 종합백신 1차\n- 2~4주 간격 3~5회 추가\n- 매년 추가 접종\n- 광견병: 3개월 이후\n\n고양이:\n- 6~8주: 종합백신 1차\n- 3~4주 간격 추가\n\n정확한 일정은 수의사와 상담!';
    if(match(q,['중성화','수술'])) return '중성화 수술 안내:\n\n적정 시기: 생후 6~12개월\n\n장점:\n- 질병 예방 (자궁축농증 등)\n- 행동 안정\n- 길고양이 번식 방지\n\n수의사와 시기를 상담해봐!\n참고 정보니까 전문가에게 확인!';
    if(match(q,['이빨','치아','양치','구취'])) return '치아 관리 중요해!\n\n- 매일 양치가 가장 좋아 (전용 칫솔)\n- 덴탈껌/장난감도 도움\n- 구취가 심하면 치석일 수 있어\n- 1년 1회 스케일링 추천\n\n치아 문제는 전신 건강에도 영향!';
    if(match(q,['목욕','씻기','샤워'])) return '목욕 가이드:\n\n- 강아지: 2~4주에 1회\n- 고양이: 필요할 때만 (보통 안 해도 됨)\n- 전용 샴푸 사용 (사람 샴푸 X)\n- 귀에 물 안 들어가게 조심\n- 완전히 말려주기!\n\n너무 자주 씻기면 피부 건조해져!';
    if(match(q,['미용','트리밍','그루밍'])) return '미용/그루밍 팁:\n\n- 빗질: 주 2~3회 (장모종은 매일)\n- 발톱: 2~3주마다\n- 귀 청소: 주 1회\n- 눈물자국: 매일 닦기\n- 항문낭: 미용 시 함께\n\n전문 미용실 정기 방문 추천!';
    if(match(q,['체중','살','비만','다이어트'])) return '체중 관리 팁:\n\n적정 체중 확인:\n- 갈비뼈가 만져지는 정도가 적당\n- 위에서 볼 때 허리 라인 보이면 OK\n\n비만 관리:\n- 사료량 10~20% 줄이기\n- 간식 줄이기\n- 운동량 늘리기\n- 수의사 식단 상담 추천!';
    if(match(q,['더위','열사병','여름'])) return '여름 더위 주의!\n\n- 한낮 산책 피하기 (아스팔트 뜨거움)\n- 항상 물 준비\n- 에어컨/선풍기 (직접 바람 X)\n- 차 안에 절대 두지 말기!\n- 헐떡거림이 심하면 열사병 의심\n\n시원한 곳에서 쉬게 해줘!';
    if(match(q,['추위','겨울','방한'])) return '겨울 추위 대비!\n\n- 소형견/노견은 옷 입히기\n- 산책 시간 짧게\n- 발바닥 보호 (제설제 주의)\n- 실내 온도 적당히 유지\n- 건조하면 수분 보충\n\n따뜻하게 지내게 해줘!';

    // === 사료/음식 상세 ===
    if(match(q,['사료','밥','간식','먹'])) return '사료 선택 가이드:\n\n- 나이에 맞게: 퍼피/어덜트/시니어\n- 크기에 맞게: 소형/중형/대형\n- 성분표 확인 (육류 1순위 좋음)\n- 간식은 전체 식사의 10% 이내\n\n위험한 음식:\n- 초콜릿, 포도, 양파, 마늘\n- 자일리톨, 카페인, 알코올';
    if(match(q,['산책','운동'])) return '산책 가이드:\n\n- 소형견: 하루 20~30분\n- 중형견: 하루 30~60분\n- 대형견: 하루 60분 이상\n\n팁:\n- 아침/저녁 선선할 때\n- 리드줄 꼭 착용\n- 배변봉투 준비\n- 산책 후 발 씻기\n- 다른 개와 인사는 천천히!';

    // === 위치/지도 ===
    if(match(q,['여기','어디','위치','지도','찾아'])) return '내가 도와줄게!\n\n찾을 수 있는 것:\n- 동물병원\n- 반려동물 약국\n- 펫카페/펫레스토랑\n- 미용실/호텔\n- 반려동물 용품점\n- 산책 코스/공원\n\nPetCTT 위치 추적 기능 써봐!';
    if(match(q,['병원 찾','동물병원'])) return '동물병원 찾기!\n\nPetCTT에서 주변 동물병원을\n찾을 수 있어!\n\n응급상황이면:\n- 24시간 응급 동물병원 검색\n- 119 (동물 응급은 지역별 다름)\n\n정기 검진은 가까운 병원 등록해두면 좋아!';

    // === 페이지 안내 ===
    if(match(q,['뭐 할 수','기능','메뉴','뭐가 있','할 수 있'])) return getPageHelp();

    // === 아미 소개 ===
    if(match(q,['아미','너 누구','이름','몇살','몇 살'])) return '나는 아미! PetCTT의 AI 토끼 친구야!\n\n나이: 영원히 5살!\n좋아하는 것: 당근, 산책, 친구\n특기: PetCTT 사용법 설명, 반려동물 상식\n꿈: 모든 반려동물이 행복한 세상!\n\n뭐든 물어봐! 도와줄게!';

    // === 재미/퀴즈 ===
    if(match(q,['퀴즈','문제','맞춰'])) return pick([
      '퀴즈! 강아지의 코가 촉촉한 이유는?\n\nA. 물을 많이 마셔서\nB. 냄새를 잘 맡으려고\nC. 원래 그런 거야\n\n정답: B! 촉촉한 코가 냄새 분자를 더 잘 잡아!',
      '퀴즈! 고양이가 골골거리는 이유는?\n\nA. 배가 고파서\nB. 기분이 좋아서\nC. 아파서\n\n정답: B가 대부분이지만,\n아플 때도 골골거려! 상황을 잘 봐야 해!',
      '퀴즈! 강아지가 꼬리를 흔드는 건\n항상 기뻐서일까?\n\n정답: 아니야!\n오른쪽으로 흔들면 기쁨,\n왼쪽으로 흔들면 불안일 수 있어!',
    ]);
    if(match(q,['재밌는','웃긴','농담','joke'])) return pick([
      '강아지가 좋아하는 과목은?\n정답: 멍문학! ㅎㅎ',
      '고양이가 제일 싫어하는 요일은?\n정답: 물요일! (목욕 싫어!)',
      '강아지가 좋아하는 음악은?\n정답: 비틀즈! (비글즈?)',
    ]);

    // === 날씨/계절 ===
    if(match(q,['날씨','비','우산'])) return '비 오는 날 산책 팁:\n- 레인코트 입히기\n- 짧게 다녀오기\n- 발 깨끗이 닦기\n- 완전히 말려주기\n\n비 싫어하는 아이는 실내 놀이로!';

    // === 훈련 ===
    if(match(q,['훈련','교육','앉아','기다려','가르치'])) return '기본 훈련 팁:\n\n1. 앉아: 간식 들고 코 위로 올리기\n2. 기다려: 앉은 상태에서 손바닥 보여주기\n3. 이리와: 이름 부르며 간식 보여주기\n\n핵심: 칭찬 + 간식 보상!\n짧게 (5~10분) 반복하는 게 효과적!';

    // === 입양 ===
    if(match(q,['입양','분양','데려오','키우'])) return '반려동물 입양 체크리스트:\n\n- 10~15년 함께할 수 있는지\n- 경제적 여유 (병원비/사료비)\n- 충분한 시간과 공간\n- 가족 동의\n- 알레르기 확인\n\n유기동물 보호소 입양도 고려해봐!\n생명을 구하는 아름다운 선택!';

    // === 기본 응답 (더 풍부하게) ===
    return pick([
      '음.. 그건 내가 아직 잘 모르겠어!\n\n이런 건 물어볼 수 있어:\n- PetCTT 사용법/기능\n- 강아지/고양이 품종 정보\n- 건강/사료/산책 상식\n- 쿠폰/매장/공동구매\n- 재밌는 퀴즈!\n\n다시 물어봐줄래?',
      '그건 아직 공부 중이야!\n\n대신 이런 건 잘 알아:\n- 반려동물 건강 관리\n- 품종별 특징 (말티즈, 푸들 등)\n- PetCTT 전체 기능\n- 예방접종/중성화 정보\n\n뭐가 궁금해?',
    ]);
  }

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function getPageHelp(){
    var p = getPageName();
    var helps = {
      'main': '메인에서 할 수 있는 것:\n\n- 대화시작: AI 통역 체험\n- 쿠폰 찾기: 할인 쿠폰 획득\n- 매장입점: 사업자 등록\n- 더 알아보기: 핵심 기능\n\n아래로 스크롤하면 더 많은 기능!',
      'ai-scan': '여기서는 AI 스캔으로\n반려동물의 감정과 상태를\n분석할 수 있어!\n\n카메라를 켜면 AI가\n표정과 행동을 읽어줘!',
      'market': '마켓에서 할 수 있는 것:\n- 주변 매장 상품 둘러보기\n- 쿠폰으로 할인 받기\n- 공동구매 참여\n- 리뷰 확인',
      'contest': '콘테스트 참여 방법:\n1. 우리 아이 사진/영상 올리기\n2. 다른 참가자 투표\n3. 아미 심사위원장 특별상!\n\n우승하면 선물도 있어!',
      'match': '반려동물 소개팅:\n- 성격/크기/나이 매칭\n- 영상으로 먼저 만남\n- 산책 약속 잡기\n\n우리 아이 친구 만들어주자!',
      'resident': '주민등록증 발급:\n- 사진 등록\n- 이름/생일/품종 입력\n- 마이크로칩 번호\n\n예쁜 신분증이 나와!',
      'restaurant': '반려동물 동반 레스토랑:\n- 주변 펫 맛집 검색\n- 메뉴/리뷰 확인\n- 예약하기',
      'glasses': 'AR 스마트 글래스:\n- 산책 중 건강 데이터 확인\n- 주변 펫 시설 AR 표시\n- 반려동물 감정 실시간 분석',
      'guide': '도움말 페이지야!\n\n- PetCTT 전체 기능 안내\n- 사용법 설명\n- 자주 묻는 질문\n- 문의하기\n\n뭐든 물어봐!',
      'pricing': '구독 요금제:\n\n무료: 기본 기능 + 하루 10회 대화\nPro: AI 통역 강화 + 무제한\nPremium: 전체 기능 + 전문 상담\n\n지금은 무료로 충분히 체험!',
      'admin': '관리자 페이지:\n- 정산 내역 확인\n- 매출 통계\n- 공동구매 관리\n- 셀러 관리',
      'mypage': '마이페이지:\n- 내 정보 수정\n- 반려동물 등록/관리\n- 구독 상태 확인\n- 알림 설정',
      'broadcast': '라이브 방송:\n- 실시간 펫 방송\n- 채팅으로 소통\n- 인기 방송 메인 노출',
    };
    return helps[p] || '이 페이지에서 할 수 있는 것을\n알려줄게! 뭐가 궁금해?';
  }

  function match(text, keywords){
    for(var i=0; keywords.length>i; i++){
      if(text.includes(keywords[i])) return true;
    }
    return false;
  }

  // ===== 아미 표시/숨기기 (!important로 v3 오버라이드) =====
  function toggleAmiDisplay(show){
    // CSS 클래스로 강제 숨기기 (v3의 setPos가 inline style로 다시 켜도 이김)
    var style = document.getElementById('ami-hide-style');
    if(!style){
      style = document.createElement('style');
      style.id = 'ami-hide-style';
      document.head.appendChild(style);
    }
    if(show){
      window._amiHidden = false;
      style.textContent = '';
      // ami-root 다시 보이게
      var r = document.getElementById('ami-root');
      if(r){ r.style.setProperty('display','block','important'); r.style.setProperty('visibility','visible','important'); r.style.setProperty('opacity','1','important'); }
      var c = document.getElementById('ami-particle-canvas');
      if(c){ c.style.setProperty('display','block','important'); }
    } else {
      window._amiHidden = true;
      // 소리 완전 정지
      if(window.speechSynthesis) speechSynthesis.cancel();
      style.textContent = '#ami-root,#ami-particle-canvas,#ami-chat,#ami-injected,#ami-global-bubble,#ami-chat-global{display:none!important;visibility:hidden!important;opacity:0!important}';
      // inline style도 강제 제거
      var r2 = document.getElementById('ami-root');
      if(r2){ r2.style.setProperty('display','none','important'); r2.style.setProperty('visibility','hidden','important'); }
      var c2 = document.getElementById('ami-particle-canvas');
      if(c2){ c2.style.setProperty('display','none','important'); }
      // 채팅도 닫기
      chatOpen = false;
      var panel = document.getElementById('ami-chat-global');
      if(panel) panel.style.display = 'none';
    }
  }

  // ===== X/O 토글 버튼 =====
  function createToggle(){
    var btn = document.createElement('button');
    btn.id = 'ami-toggle';
    btn.className = 'notranslate';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:950;width:52px;height:52px;border-radius:50%;border:2.5px solid rgba(255,255,255,.3);cursor:pointer;font-size:18px;font-weight:900;transition:all .3s;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);';
    updateToggle(btn);
    btn.onclick = function(){
      isVisible = !isVisible;
      localStorage.setItem(STORAGE_KEY, isVisible);
      updateToggle(btn);
      toggleAmiDisplay(isVisible);
      if(isVisible) setTimeout(function(){ showBubble('다시 왔어! 뭐 도와줄까?'); }, 500);
    };
    document.body.appendChild(btn);
  }

  function updateToggle(btn){
    if(isVisible){
      btn.innerHTML = '&#x2716;';
      btn.style.background = 'rgba(30,30,50,.7)';
      btn.style.color = 'rgba(255,255,255,.7)';
      btn.style.boxShadow = '0 2px 10px rgba(0,0,0,.3)';
      btn.title = '아미 숨기기';
    } else {
      btn.innerHTML = '&#x1F430;';
      btn.style.background = 'linear-gradient(135deg,#fbbf24,#ec4899)';
      btn.style.color = '#fff';
      btn.style.boxShadow = '0 0 20px rgba(255,180,60,.5),0 0 40px rgba(236,72,153,.2)';
      btn.title = '아미 보이기';
    }
  }

  // ===== 채팅 패널 =====
  function createChat(){
    var panel = document.createElement('div');
    panel.id = 'ami-chat-global';
    panel.className = 'notranslate';
    panel.style.cssText = 'display:none;position:fixed;bottom:180px;right:12px;width:280px;max-height:380px;background:#0d0d1a;border:1.5px solid rgba(255,180,220,.3);border-radius:20px;z-index:940;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.5);font-family:"Noto Sans KR",sans-serif;';
    panel.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:between;padding:10px 14px;background:linear-gradient(135deg,rgba(255,180,220,.15),rgba(139,92,246,.15));border-bottom:1px solid rgba(255,255,255,.1)">' +
        '<span style="font-size:16px;margin-right:6px">🐰</span>' +
        '<span style="font-size:13px;font-weight:700;color:#f1f5f9;flex:1">아미</span>' +
        '<span id="ami-chat-count" style="font-size:10px;padding:2px 6px;border-radius:10px;background:rgba(34,197,94,.15);color:#4ade80;margin-right:8px">10/10</span>' +
        '<button id="ami-chat-close" style="background:none;border:none;color:#94a3b8;font-size:14px;cursor:pointer;padding:4px">X</button>' +
      '</div>' +
      '<div id="ami-quick-btns" style="display:flex;gap:4px;padding:6px 10px;overflow-x:auto;border-bottom:1px solid rgba(255,255,255,.05)">' +
        '<button class="ami-qk" data-q="PetCTT 사용법">사용법</button>' +
        '<button class="ami-qk" data-q="쿠폰">쿠폰</button>' +
        '<button class="ami-qk" data-q="반려동물 건강">건강</button>' +
        '<button class="ami-qk" data-q="AI 통역">통역</button>' +
        '<button class="ami-qk" data-q="구독 요금">구독</button>' +
      '</div>' +
      '<div id="ami-chat-log" style="min-height:160px;max-height:220px;overflow-y:auto;padding:10px"></div>' +
      '<div style="display:flex;gap:6px;padding:8px 10px;border-top:1px solid rgba(255,255,255,.1)">' +
        '<input id="ami-chat-input" placeholder="아미한테 물어봐!" style="flex:1;padding:8px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#f1f5f9;font-size:12px;outline:none">' +
        '<button id="ami-chat-send" style="width:32px;height:32px;border-radius:50%;border:none;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;cursor:pointer;font-size:12px;font-weight:bold">></button>' +
      '</div>';

    // 스타일 주입
    var style = document.createElement('style');
    style.textContent = '.ami-qk{flex-shrink:0;padding:4px 8px;border-radius:12px;border:none;background:rgba(255,180,220,.1);color:#f9a8d4;font-size:10px;cursor:pointer;font-family:inherit;transition:background .2s}.ami-qk:hover{background:rgba(255,180,220,.2)}.ami-msg{margin-bottom:8px;max-width:85%;font-size:12px;line-height:1.5;padding:8px 12px;border-radius:14px;word-break:break-word;white-space:pre-wrap}.ami-msg-ami{background:rgba(255,255,255,.08);color:#e2e8f0;border-bottom-left-radius:4px;margin-right:auto}.ami-msg-user{background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;border-bottom-right-radius:4px;margin-left:auto}';
    document.head.appendChild(style);
    document.body.appendChild(panel);

    // 이벤트
    document.getElementById('ami-chat-close').onclick = toggleChat;
    document.getElementById('ami-chat-send').onclick = sendChat;
    document.getElementById('ami-chat-input').onkeydown = function(e){
      if(e.key==='Enter' && !e.isComposing) sendChat();
    };
    panel.querySelectorAll('.ami-qk').forEach(function(btn){
      btn.onclick = function(){ sendMsg(btn.dataset.q); };
    });

    // 초기 메시지
    addMsg('ami', '안녕! 나 아미야! 🐰\nPetCTT에 대해 뭐든 물어봐!');
  }

  function toggleChat(){
    chatOpen = !chatOpen;
    var panel = document.getElementById('ami-chat-global');
    if(panel) panel.style.display = chatOpen ? 'flex' : 'none';
    if(panel) panel.style.flexDirection = 'column';
  }

  function addMsg(role, text){
    var log = document.getElementById('ami-chat-log');
    if(!log) return;
    var div = document.createElement('div');
    div.className = 'ami-msg ami-msg-' + role;
    if(role==='ami') div.innerHTML = '🐰 ' + text.replace(/\n/g,'<br>');
    else div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function sendMsg(text){
    if(!text) return;
    addMsg('user', text);
    var inp = document.getElementById('ami-chat-input');
    if(inp) inp.value = '';

    // 타이핑 표시
    var log = document.getElementById('ami-chat-log');
    var dots = document.createElement('div');
    dots.className = 'ami-msg ami-msg-ami';
    dots.innerHTML = '🐰 ...';
    dots.id = 'ami-typing';
    if(log){ log.appendChild(dots); log.scrollTop = log.scrollHeight; }

    setTimeout(function(){
      var typing = document.getElementById('ami-typing');
      if(typing) typing.remove();
      var reply = getReply(text);
      addMsg('ami', reply);
    }, 500 + Math.random() * 500);
  }

  function sendChat(){
    var inp = document.getElementById('ami-chat-input');
    if(inp && inp.value.trim()) sendMsg(inp.value.trim());
  }

  // ===== 말풍선 =====
  function showBubble(text, duration){
    if(!isVisible) return;
    var root = document.getElementById('ami-root');
    var inj = document.getElementById('ami-injected');
    var target = root || inj;
    if(!target) return;

    var existing = document.getElementById('ami-global-bubble');
    if(existing) existing.remove();

    var bub = document.createElement('div');
    bub.id = 'ami-global-bubble';
    bub.className = 'notranslate';
    bub.style.cssText = 'position:absolute;bottom:115px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,248,230,.95));border:2px solid rgba(255,200,80,.5);border-radius:16px;padding:8px 14px;font-size:12px;color:#333;text-align:center;white-space:pre-wrap;font-family:"Noto Sans KR",sans-serif;box-shadow:0 0 20px rgba(255,200,100,.25),0 4px 12px rgba(0,0,0,.1);pointer-events:none;animation:ami-bpop .25s cubic-bezier(.34,1.56,.64,1) both;max-width:200px;line-height:1.5;z-index:910';
    bub.textContent = text;
    target.appendChild(bub);

    if(bubbleTimer) clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function(){
      if(bub.parentNode) bub.remove();
    }, duration || 4000);
  }

  // ===== 유휴 행동 =====
  function startIdleBehavior(){
    var greetings = PAGE_GREETINGS[getPageName()] || PAGE_GREETINGS['main'];
    var idx = Math.floor(Math.random() * greetings.length);

    // 첫 인사 (3초 후)
    setTimeout(function(){
      if(isVisible) showBubble(greetings[idx], 5000);
    }, 3000);

    // 주기적 행동 (20~40초 간격)
    function scheduleIdle(){
      var delay = 20000 + Math.random() * 20000;
      idleTimer = setTimeout(function(){
        if(!isVisible || chatOpen){ scheduleIdle(); return; }
        var actions = [
          function(){ showBubble('나한테 물어봐! 뭐든 알려줄게!'); },
          function(){ showBubble('PetCTT 사용법 궁금하면 터치해!'); },
          function(){ showBubble('오늘 우리 아이 기분은 어때?'); },
          function(){ showBubble('쿠폰 게임 해볼래? 재밌어!'); },
          function(){ showBubble('꾸벅.. 졸려..zzZ'); },
          function(){ showBubble('폴짝! 심심해!'); },
        ];
        actions[Math.floor(Math.random()*actions.length)]();
        scheduleIdle();
      }, delay);
    }
    scheduleIdle();
  }

  // ===== 아미 클릭 이벤트 =====
  function attachClick(){
    var root = document.getElementById('ami-root');
    var inj = document.getElementById('ami-injected');
    var target = root || inj;
    if(!target) return;

    // 기존 클릭은 유지하고 더블클릭으로 채팅 열기
    target.addEventListener('dblclick', function(e){
      e.preventDefault();
      e.stopPropagation();
      toggleChat();
    });

    // 싱글 클릭 시 말풍선
    var origClick = target.onclick;
    target.addEventListener('click', function(){
      if(!chatOpen){
        var msgs = ['나 터치했어? 반가워!','대화하려면 두번 터치해!','뭐 궁금한 거 있어?','폴짝!','깡총깡총!'];
        showBubble(msgs[Math.floor(Math.random()*msgs.length)], 3000);
      }
    });
  }

  // ===== 초기화 =====
  function initGlobal(){
    createToggle();
    createChat();

    // X/O 상태 적용
    if(!isVisible){
      toggleAmiDisplay(false);
    }

    // 클릭 이벤트 연결 (아미가 로드된 후)
    setTimeout(function(){ attachClick(); }, 2000);

    // 유휴 행동 시작
    startIdleBehavior();
  }

  // DOM 준비 후 실행
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(initGlobal, 500);
  } else {
    window.addEventListener('DOMContentLoaded', function(){ setTimeout(initGlobal, 500); });
  }

})();
