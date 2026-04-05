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

  // ===== PetCTT 지식 =====
  var PETCTT_FAQ = {
    'petctt': 'PetCTT는 반려동물 AI 플랫폼이야!\nAI 통역, 위치 추적, 건강 체크,\n주민등록증 발급, 소개팅, 콘테스트까지\n반려동물과 함께하는 모든 것!',
    '통역': 'AI 통역은 반려동물의 소리와 행동을\n분석해서 감정을 알려줘!\n카메라+음성 AI로 실시간 양방향 소통!',
    '위치': '위치 추적으로 우리 아이가\n어디 있는지 실시간으로 확인할 수 있어!\nGPS 기반으로 정확하게!',
    '건강': '건강 체크 기능으로\n반려동물 상태를 기록하고 관리해!\n식사, 배변, 기분, 병원 기록까지!',
    '주민등록': '반려동물 주민등록증을 발급받을 수 있어!\n우리 아이만의 특별한 신분증!',
    '소개팅': '라이브 소개팅으로\n반려동물 친구를 만들어줘!\n영상으로 만나서 서로 인사!',
    '콘테스트': '매주 펫 콘테스트 열려!\n우리 아이를 스타로 만들어봐!\n아미 심사위원장 특별상도 있어!',
    '구독': '무료: 기본 기능\nPro: AI 통역 강화 + 무제한 대화\nPremium: 전체 기능 + 우선 지원',
    '쿠폰': '쿠폰 찾기로 주변 매장 할인 쿠폰을\n받을 수 있어! AR 게임으로 잡거나\n위치 기반으로 자동 발견!',
    '매장': '매장입점하면 쿠폰 발급, 매출 관리,\n정산까지 한번에!\n반려동물 친화 매장으로 등록하세요!',
    '글래스': '스마트 AR 글래스로\n반려동물 정보를 실시간 확인!\n산책하면서 건강 데이터도 체크!',
    '사용법': '1. 대화시작 버튼으로 AI 통역 시작\n2. 쿠폰 찾기로 할인 쿠폰 획득\n3. 매장입점으로 비즈니스 시작\n4. 주민등록증으로 우리 아이 등록!',
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

  // ===== 대화 응답 =====
  function getReply(msg){
    var q = msg.toLowerCase();

    // PetCTT FAQ 키워드 매칭
    var faqKeys = Object.keys(PETCTT_FAQ);
    for(var i=0; faqKeys.length>i; i++){
      if(q.includes(faqKeys[i])) return PETCTT_FAQ[faqKeys[i]];
    }

    // 인사
    if(match(q,['안녕','하이','hi','hello'])) return '안녕! 나 아미! 뭐든 물어봐! 다 알려줄게!';
    if(match(q,['고마','감사','땡큐'])) return '헤헤! 도움이 됐다니 기뻐! 또 물어봐!';
    if(match(q,['사랑','좋아','최고','귀엽'])) return '어머! 나도 좋아! 우리 친구하자!';
    if(match(q,['심심','놀자','뭐해'])) return '나랑 놀래? 쿠폰 게임 하러 가자!\n아니면 반려동물 이야기 해줘!';

    // 반려동물
    if(match(q,['강아지','개','멍멍','댕댕'])) return '강아지! 어떤 종류야?\n건강, 사료, 산책 관련 물어봐!';
    if(match(q,['고양이','냥이','야옹'])) return '고양이! 츄르 좋아하지?\n건강이나 행동 관련 물어봐!';
    if(match(q,['아파','병원','아픈'])) return '아이가 아프구나 걱정되지..\n증상을 자세히 말해주면\n참고 정보를 알려줄게!\n정확한 건 꼭 수의사에게!';
    if(match(q,['사료','밥','간식','먹'])) return '사료는 나이/크기에 맞게 골라야 해!\n간식은 전체 식사의 10% 이내로!\n사람 음식은 위험한 게 있으니 조심!';
    if(match(q,['산책','운동'])) return '산책은 하루 30분 이상 추천!\n날씨 너무 덥거나 추우면 조심!\n산책 후 발 씻기 잊지 마!';

    // 위치/지도
    if(match(q,['여기','어디','위치','지도','찾아'])) return '내가 도와줄게!\n주변 반려동물 병원, 약국,\n펫카페, 미용실을 찾아볼 수 있어!';
    if(match(q,['병원 찾','동물병원'])) return '주변 동물병원을 찾고 있구나!\nPetCTT 메인에서 "위치 추적"을\n확인해봐!';

    // 페이지 안내
    if(match(q,['뭐 할 수','기능','메뉴'])) return getPageHelp();

    // 아미 소개
    if(match(q,['아미','너 누구','이름','몇살'])) return '나는 아미! PetCTT의 AI 친구야!\n반려동물 이야기도 하고\nPetCTT 사용법도 알려줘!\n뭐든 물어봐!';

    // 기본
    return '음.. 그건 내가 아직 잘 모르겠어!\n\n이런 건 물어볼 수 있어:\n- PetCTT 사용법\n- 반려동물 건강/사료/산책\n- 쿠폰/매장 정보\n- AI 통역 안내\n\n다시 물어봐줄래?';
  }

  function getPageHelp(){
    var p = getPageName();
    var helps = {
      'main': '메인에서 할 수 있는 것:\n- 대화시작: AI 통역\n- 쿠폰 찾기: 할인 쿠폰\n- 매장입점: 사업자 등록\n- 더 알아보기: 핵심 기능 소개',
      'ai-scan': '여기서는 AI 스캔으로\n반려동물의 감정과 상태를\n분석할 수 있어!',
      'market': '마켓에서는 주변 매장 상품을\n둘러보고 쿠폰으로 할인받을 수 있어!',
      'contest': '콘테스트에 우리 아이 사진을\n올리면 투표도 받고 상품도 받아!',
      'match': '반려동물 소개팅으로\n성격 맞는 친구를 찾아줘!',
    };
    return helps[p] || '이 페이지에서 할 수 있는 것을\n알려줄게! 뭐가 궁금해?';
  }

  function match(text, keywords){
    for(var i=0; keywords.length>i; i++){
      if(text.includes(keywords[i])) return true;
    }
    return false;
  }

  // ===== X/O 토글 버튼 =====
  function createToggle(){
    var btn = document.createElement('button');
    btn.id = 'ami-toggle';
    btn.className = 'notranslate';
    btn.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:99999;width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,.2);cursor:pointer;font-size:14px;font-weight:bold;transition:all .3s;display:flex;align-items:center;justify-content:center;';
    updateToggle(btn);
    btn.onclick = function(){
      isVisible = !isVisible;
      localStorage.setItem(STORAGE_KEY, isVisible);
      updateToggle(btn);
      var ami = document.getElementById('ami-root');
      var canvas = document.getElementById('ami-particle-canvas');
      if(ami) ami.style.display = isVisible ? 'block' : 'none';
      if(canvas) canvas.style.display = isVisible ? 'block' : 'none';
      // ami-injected도 처리
      var inj = document.getElementById('ami-injected');
      if(inj) inj.style.display = isVisible ? 'block' : 'none';
      if(isVisible) showBubble('다시 왔어! 뭐 도와줄까?');
    };
    document.body.appendChild(btn);
  }

  function updateToggle(btn){
    if(isVisible){
      btn.textContent = 'X';
      btn.style.background = 'rgba(0,0,0,.5)';
      btn.style.color = 'rgba(255,255,255,.6)';
      btn.title = '아미 숨기기';
    } else {
      btn.textContent = 'O';
      btn.style.background = 'linear-gradient(135deg,#fbbf24,#ec4899)';
      btn.style.color = '#fff';
      btn.style.boxShadow = '0 0 15px rgba(255,180,60,.4)';
      btn.title = '아미 보이기';
    }
  }

  // ===== 채팅 패널 =====
  function createChat(){
    var panel = document.createElement('div');
    panel.id = 'ami-chat-global';
    panel.className = 'notranslate';
    panel.style.cssText = 'display:none;position:fixed;bottom:180px;right:12px;width:280px;max-height:380px;background:#0d0d1a;border:1.5px solid rgba(255,180,220,.3);border-radius:20px;z-index:99995;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.5);font-family:"Noto Sans KR",sans-serif;';
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
    bub.style.cssText = 'position:absolute;bottom:115px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,248,230,.95));border:2px solid rgba(255,200,80,.5);border-radius:16px;padding:8px 14px;font-size:12px;color:#333;text-align:center;white-space:pre-wrap;font-family:"Noto Sans KR",sans-serif;box-shadow:0 0 20px rgba(255,200,100,.25),0 4px 12px rgba(0,0,0,.1);pointer-events:none;animation:ami-bpop .25s cubic-bezier(.34,1.56,.64,1) both;max-width:200px;line-height:1.5;z-index:99991';
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
      var ami = document.getElementById('ami-root');
      var canvas = document.getElementById('ami-particle-canvas');
      var inj = document.getElementById('ami-injected');
      if(ami) ami.style.display = 'none';
      if(canvas) canvas.style.display = 'none';
      if(inj) inj.style.display = 'none';
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
