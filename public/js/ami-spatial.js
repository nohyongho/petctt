/**
 * PetCTT 아미 공간 인지 + 자율 행동 v1.0
 * SPRINT #3 Task C-1~C-3
 * 공간 맵 → 걸어가기 → 음성 명령 이동 → 자율 행동
 */
(function(){
  'use strict';
  if(window._amiSpatialLoaded) return;
  window._amiSpatialLoaded = true;

  // ===== C-1: 공간 맵 시스템 =====
  // petctt.com의 주요 UI 영역을 좌표로 매핑
  var SPACE_MAP = {
    'home':      { selector: '.hero-title, .hero-section, h1', label: '홈', emoji: '🏠' },
    'talk':      { selector: '[onclick*="대화시작"], .btn-primary', label: '대화시작', emoji: '🗣️' },
    'coupon':    { selector: '[onclick*="쿠폰"], [href*="coupon"]', label: '쿠폰', emoji: '🎟️' },
    'store':     { selector: '[onclick*="매장"], [href*="merchant"]', label: '매장입점', emoji: '🏪' },
    'health':    { selector: '[class*="health"], .health-section', label: '건강체크', emoji: '❤️' },
    'contest':   { selector: '[href*="contest"]', label: '콘테스트', emoji: '🏆' },
    'market':    { selector: '[href*="market"]', label: '구름장터', emoji: '🛒' },
    'glasses':   { selector: '[href*="glasses"]', label: '스마트글래스', emoji: '🕶️' },
    'translate': { selector: '[href*="scan"], .ai-section', label: 'AI통역', emoji: '🗣️' },
    'login':     { selector: '#auth-slot, [onclick*="login"]', label: '로그인', emoji: '🔑' },
    'top':       { selector: 'header, nav', label: '상단', emoji: '⬆️' },
    'bottom':    { selector: 'footer', label: '하단', emoji: '⬇️' },
  };

  // 키워드 → 공간 매핑 (음성 명령용)
  var KEYWORD_MAP = {
    '홈': 'home', '메인': 'home', '처음': 'home',
    '대화': 'talk', '통역': 'translate', '말': 'talk',
    '쿠폰': 'coupon', '할인': 'coupon', '게임': 'coupon',
    '매장': 'store', '입점': 'store', '사장님': 'store', '가게': 'store',
    '건강': 'health', '체크': 'health', '아파': 'health', '병원': 'health',
    '콘테스트': 'contest', '대회': 'contest', '자랑': 'contest',
    '장터': 'market', '쇼핑': 'market', '마켓': 'market', '구름': 'market',
    '글래스': 'glasses', '안경': 'glasses', 'ar': 'glasses',
    '로그인': 'login', '가입': 'login',
    '위로': 'top', '위': 'top', '올라가': 'top',
    '아래': 'bottom', '밑': 'bottom', '내려가': 'bottom',
  };

  var isWalking = false;
  var walkTarget = null;

  // 공간에서 요소 위치 찾기
  function findElementPosition(spaceName) {
    var space = SPACE_MAP[spaceName];
    if (!space) return null;

    var selectors = space.selector.split(',');
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i].trim());
      if (el) {
        var rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          bottom: window.innerHeight - rect.bottom + rect.height / 2,
          element: el,
          label: space.label,
          emoji: space.emoji
        };
      }
    }
    return null;
  }

  // ===== C-1: 걸어가기 애니메이션 =====
  function walkTo(spaceName, callback) {
    if (window._amiHidden) return;
    if (isWalking) return;

    var pos = findElementPosition(spaceName);
    if (!pos) {
      if (typeof window.amiShowBubble === 'function') {
        window.amiShowBubble('그 위치를 못 찾겠어~ 🐰💦', 2000);
      }
      return;
    }

    isWalking = true;
    walkTarget = spaceName;

    var root = document.getElementById('ami-root');
    if (!root) { isWalking = false; return; }

    // 걸어가기 전 말풍선
    if (typeof window.amiShowBubble === 'function') {
      window.amiShowBubble(pos.emoji + ' ' + pos.label + '(으)로 갈게!', 2000);
    }

    // 표정: 흥분
    if (typeof window.amiApplyEmotion === 'function') {
      window.amiApplyEmotion('excited');
    }

    // 요소가 화면에 보이게 스크롤
    if (pos.element) {
      pos.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 현재 위치
    var currentRect = root.getBoundingClientRect();
    var startX = currentRect.left + currentRect.width / 2;
    var targetX = Math.max(40, Math.min(window.innerWidth - 40, pos.x));

    // 걸어가기 애니메이션 (부드러운 이동)
    var duration = Math.min(2000, Math.abs(targetX - startX) * 2 + 500);
    var startTime = Date.now();

    // 걷기 바운스 효과
    root.style.transition = 'none';

    function walkStep() {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(1, elapsed / duration);

      // easeInOutQuad
      var eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      var currentX = startX + (targetX - startX) * eased;

      // 걷기 바운스 (위아래 통통)
      var bounce = Math.sin(progress * Math.PI * 6) * 4 * (1 - progress);

      root.style.setProperty('left', currentX + 'px', 'important');
      root.style.setProperty('transform',
        'translateX(-50%) scaleX(' + (targetX > startX ? 1 : -1) + ') translateY(' + bounce + 'px)',
        'important');

      if (progress < 1) {
        requestAnimationFrame(walkStep);
      } else {
        // 도착!
        isWalking = false;
        walkTarget = null;
        root.style.transition = '';

        if (typeof window.amiShowBubble === 'function') {
          window.amiShowBubble('도착! ' + pos.emoji + ' ' + pos.label + '야!', 2500);
        }
        if (typeof window.amiApplyEmotion === 'function') {
          window.amiApplyEmotion('happy');
        }

        // 도착 후 해당 요소 하이라이트
        if (pos.element) {
          pos.element.style.outline = '3px solid #FFB3D9';
          pos.element.style.outlineOffset = '4px';
          pos.element.style.transition = 'outline 0.3s';
          setTimeout(function() {
            pos.element.style.outline = '';
            pos.element.style.outlineOffset = '';
          }, 2000);
        }

        if (callback) callback();
      }
    }

    requestAnimationFrame(walkStep);
  }

  // ===== C-2: 음성 명령 → 공간 이동 연동 =====
  // ami-voice.js의 processVoiceInput을 확장
  var origProcess = window.amiProcessVoiceOverride;

  window.amiSpatialCommand = function(text) {
    var t = text.toLowerCase().replace(/\s+/g, '');

    // "~~ 찾아줘", "~~ 보여줘", "~~ 가줘", "~~ 어디" 패턴 감지
    var isNavCommand = /찾아줘|보여줘|가줘|어디|알려줘|데려가|안내/.test(t);

    if (isNavCommand) {
      for (var keyword in KEYWORD_MAP) {
        if (t.indexOf(keyword.replace(/\s+/g, '')) !== -1) {
          var target = KEYWORD_MAP[keyword];
          walkTo(target);
          return true; // 처리됨
        }
      }
    }

    // "돌아와", "이리와" → 화면 중앙
    if (/돌아와|이리와|돌아|여기/.test(t)) {
      var root = document.getElementById('ami-root');
      if (root) {
        root.style.setProperty('left', (window.innerWidth / 2) + 'px', 'important');
        root.style.setProperty('bottom', '28px', 'important');
        if (typeof window.amiShowBubble === 'function') {
          window.amiShowBubble('돌아왔어! 🐰✨', 2000);
        }
      }
      return true;
    }

    return false; // 공간 명령 아님
  };

  // ===== C-3: 자율 행동 패턴 =====
  var idleSeconds = 0;
  var lastInteraction = Date.now();

  // 시간대별 인사
  function getTimeGreeting() {
    var h = new Date().getHours();
    if (h >= 5 && h < 9)  return '좋은 아침! ☀️ 오늘도 화이팅!';
    if (h >= 9 && h < 12)  return '오전이야~ 우리 아이 산책은? 🐾';
    if (h >= 12 && h < 14) return '점심 먹었어? 밥 챙겨! 🍚';
    if (h >= 14 && h < 18) return '오후야~ 간식 타임! 🍪';
    if (h >= 18 && h < 21) return '저녁이야! 우리 아이랑 놀아줘 💜';
    if (h >= 21 && h < 24) return '밤이야~ 곧 잘 시간! 🌙';
    return '새벽이야... 푹 자! 💤';
  }

  // 자율 행동 루프
  function autonomousLoop() {
    if (window._amiHidden) {
      setTimeout(autonomousLoop, 10000);
      return;
    }

    var now = Date.now();
    idleSeconds = (now - lastInteraction) / 1000;

    // 30초 무반응 → 졸기
    if (idleSeconds > 30 && idleSeconds < 35) {
      if (typeof window.amiApplyEmotion === 'function') {
        window.amiApplyEmotion('sleepy');
      }
      if (typeof window.amiShowBubble === 'function') {
        window.amiShowBubble('zzZ... 💤', 3000);
      }
    }

    // 60초 무반응 → 시간대별 인사
    if (idleSeconds > 60 && idleSeconds < 63) {
      if (typeof window.amiShowBubble === 'function') {
        window.amiShowBubble(getTimeGreeting(), 4000);
      }
      if (typeof window.amiApplyEmotion === 'function') {
        window.amiApplyEmotion('neutral');
      }
    }

    // 120초 무반응 → 랜덤 위치로 산책
    if (idleSeconds > 120 && idleSeconds < 123) {
      var spaces = Object.keys(SPACE_MAP);
      var randomSpace = spaces[Math.floor(Math.random() * spaces.length)];
      walkTo(randomSpace);
      lastInteraction = Date.now(); // 리셋
    }

    setTimeout(autonomousLoop, 5000);
  }

  // 사용자 인터랙션 감지 → idle 리셋
  document.addEventListener('click', function() { lastInteraction = Date.now(); });
  document.addEventListener('touchstart', function() { lastInteraction = Date.now(); });
  document.addEventListener('keydown', function() { lastInteraction = Date.now(); });

  // 페이지 가시성 변경 시 인사
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !window._amiHidden) {
      lastInteraction = Date.now();
      setTimeout(function() {
        if (typeof window.amiShowBubble === 'function') {
          window.amiShowBubble('돌아왔구나! 🐰✨ 보고싶었어~', 3000);
        }
        if (typeof window.amiApplyEmotion === 'function') {
          window.amiApplyEmotion('happy');
        }
      }, 1000);
    }
  });

  // ===== 초기화 =====
  setTimeout(autonomousLoop, 15000); // 15초 후 자율행동 시작

  // 글로벌 노출
  window.amiWalkTo = walkTo;
  window.amiSpatialCommand = window.amiSpatialCommand;

  console.log('[AMI Spatial] v1.0 로드 완료 🗺️🐰');
})();
