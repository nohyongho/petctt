/**
 * PetCTT 아미 음성 대화 시스템 v1.0
 * SPRINT #3 Task B-1~B-5
 * STT(듣기) → AI(생각) → TTS(말하기) + 표정 변화
 */
(function(){
  'use strict';
  if(window._amiVoiceLoaded) return;
  window._amiVoiceLoaded = true;

  // ===== 설정 =====
  var STT_LANG = 'ko-KR';
  var TTS_RATE = 1.1;
  var TTS_PITCH = 1.3; // 귀여운 높은 톤
  var isListening = false;
  var recognition = null;

  // ===== B-5: 감정 상태 6종 =====
  var EMOTIONS = {
    happy:    { eyes: 'happy',  mouth: 'smile', ears: 'perk',  color: '#FFD700' },
    sad:      { eyes: 'closed', mouth: 'frown', ears: 'droop', color: '#6B8AFF' },
    excited:  { eyes: 'wide',   mouth: 'open',  ears: 'perk',  color: '#FF69B4' },
    thinking: { eyes: 'squint', mouth: 'hmm',   ears: 'tilt',  color: '#9B59B6' },
    sleepy:   { eyes: 'closed', mouth: 'yawn',  ears: 'droop', color: '#87CEEB' },
    neutral:  { eyes: 'normal', mouth: 'smile', ears: 'normal', color: '#FFB3D9' }
  };

  // ===== B-5: 감정 감지 =====
  function detectEmotion(text) {
    var t = text.toLowerCase();
    if (/사랑|좋아|예뻐|귀여|최고|고마워|감사|행복|기쁘/.test(t)) return 'happy';
    if (/슬퍼|아파|우울|힘들|외로|걱정|무서/.test(t)) return 'sad';
    if (/와|대박|신나|놀라|멋|짱|레전드|ㅋㅋ|ㅎㅎ/.test(t)) return 'excited';
    if (/생각|음|글쎄|어떻게|뭐지|왜|모르/.test(t)) return 'thinking';
    if (/자|졸|피곤|잘래|굿나잇|안녕/.test(t)) return 'sleepy';
    return 'neutral';
  }

  // ===== B-5: 표정 애니메이션 적용 =====
  function applyEmotion(emotion) {
    var emo = EMOTIONS[emotion] || EMOTIONS.neutral;
    var root = document.getElementById('ami-root');
    if (!root) return;

    // SVG 아미 눈 변화
    var happyL = document.getElementById('ami-hl');
    var happyR = document.getElementById('ami-hr');
    var eyeL = document.getElementById('ami-eye-l');
    var eyeR = document.getElementById('ami-eye-r');

    if (emotion === 'happy' || emotion === 'excited') {
      if (happyL) happyL.setAttribute('opacity', '1');
      if (happyR) happyR.setAttribute('opacity', '1');
      if (eyeL) eyeL.setAttribute('opacity', '0');
      if (eyeR) eyeR.setAttribute('opacity', '0');
    } else if (emotion === 'sad' || emotion === 'sleepy') {
      if (happyL) happyL.setAttribute('opacity', '0');
      if (happyR) happyR.setAttribute('opacity', '0');
      if (eyeL) { eyeL.setAttribute('opacity', '0.5'); }
      if (eyeR) { eyeR.setAttribute('opacity', '0.5'); }
    } else {
      if (happyL) happyL.setAttribute('opacity', '0');
      if (happyR) happyR.setAttribute('opacity', '0');
      if (eyeL) eyeL.setAttribute('opacity', '1');
      if (eyeR) eyeR.setAttribute('opacity', '1');
    }

    // 귀 움직임
    var earL = document.getElementById('ami-ear-l');
    var earR = document.getElementById('ami-ear-r');
    if (emo.ears === 'perk' && earL && earR) {
      earL.setAttribute('transform', 'rotate(-15,25,38)');
      earR.setAttribute('transform', 'rotate(15,63,38)');
    } else if (emo.ears === 'droop' && earL && earR) {
      earL.setAttribute('transform', 'rotate(10,25,38)');
      earR.setAttribute('transform', 'rotate(-10,63,38)');
    }

    // 글로우 이펙트
    root.style.filter = 'drop-shadow(0 0 12px ' + emo.color + ')';
    setTimeout(function() { root.style.filter = ''; }, 2000);
  }

  // ===== B-1: STT 음성 인식 =====
  function initSTT() {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('[AMI Voice] STT 미지원 브라우저');
      return null;
    }

    recognition = new SpeechRecognition();
    recognition.lang = STT_LANG;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
      isListening = true;
      updateMicButton(true);
      applyEmotion('thinking'); // 귀 쫑긋
      showListeningBubble();
    };

    recognition.onresult = function(event) {
      var transcript = '';
      var isFinal = false;
      for (var i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }

      // 실시간 표시
      updateListeningBubble(transcript + (isFinal ? '' : '...'));

      if (isFinal && transcript.trim()) {
        hideListeningBubble();
        processVoiceInput(transcript.trim());
      }
    };

    recognition.onerror = function(event) {
      console.log('[AMI Voice] STT 에러:', event.error);
      isListening = false;
      updateMicButton(false);
      hideListeningBubble();
      if (event.error === 'not-allowed') {
        showAmiBubble('마이크 권한이 필요해! 🎤\n브라우저 설정에서 허용해줘~', 3000);
      }
    };

    recognition.onend = function() {
      isListening = false;
      updateMicButton(false);
    };

    return recognition;
  }

  function startListening() {
    if (window._amiHidden) return;
    if (!recognition) initSTT();
    if (!recognition) {
      showAmiBubble('이 브라우저에서는 음성 인식이 안 돼 😢\nChrome을 사용해봐!', 3000);
      return;
    }
    if (isListening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch(e) {
      console.log('[AMI Voice] STT 시작 실패:', e);
    }
  }

  // ===== B-2: AI 응답 생성 (기존 amiBrainRespond 연결) =====
  function processVoiceInput(text) {
    // 채팅 로그에 사용자 메시지 추가
    addChatMessage(text, 'user');

    // 감정 감지 + 표정 적용
    var emotion = detectEmotion(text);
    applyEmotion(emotion);

    // AI 응답 생성 (기존 ami-brain 활용)
    var response = '';
    if (typeof window.amiBrainRespond === 'function') {
      response = window.amiBrainRespond(text);
    } else if (typeof amiBrainRespond === 'function') {
      response = amiBrainRespond(text);
    }

    if (!response) {
      response = '잘 못 들었어~ 다시 말해줄래? 🐰';
    }

    // 응답 감정 감지
    var responseEmotion = detectEmotion(response);

    // 약간의 딜레이 후 응답 (자연스럽게)
    setTimeout(function() {
      applyEmotion(responseEmotion);
      addChatMessage(response, 'ami');
      showAmiBubble(response.substring(0, 60) + (response.length > 60 ? '...' : ''), 3000);
      speakTTS(response);
    }, 500);
  }

  // ===== B-3: TTS 음성 합성 =====
  function speakTTS(text) {
    if (window._amiHidden) return;
    if (!window.speechSynthesis) return;

    // 이모지 제거 (TTS가 읽지 않도록)
    var cleanText = text.replace(/[\u{1F300}-\u{1FBFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}-\u{27B0}\u{E0020}-\u{E007F}]/gu, '')
      .replace(/\n/g, '. ')
      .trim();

    if (!cleanText) return;

    // 기존 말하기 중단
    speechSynthesis.cancel();

    var utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = STT_LANG;
    utterance.rate = TTS_RATE;
    utterance.pitch = TTS_PITCH;
    utterance.volume = 0.9;

    // 한국어 음성 찾기
    var voices = speechSynthesis.getVoices();
    var koVoice = voices.find(function(v) { return v.lang.startsWith('ko'); });
    if (koVoice) utterance.voice = koVoice;

    // 말하기 중 입 움직임
    utterance.onstart = function() {
      window._amiSpeaking = true;
      animateMouth(true);
    };
    utterance.onend = function() {
      window._amiSpeaking = false;
      animateMouth(false);
      applyEmotion('neutral');
    };

    speechSynthesis.speak(utterance);
  }

  // 입 모양 애니메이션
  function animateMouth(speaking) {
    var mouthN = document.getElementById('ami-mouth-n');
    var mouthO = document.getElementById('ami-mouth-o');
    if (speaking) {
      if (mouthN) mouthN.setAttribute('opacity', '0');
      if (mouthO) mouthO.setAttribute('opacity', '1');
    } else {
      if (mouthN) mouthN.setAttribute('opacity', '1');
      if (mouthO) mouthO.setAttribute('opacity', '0');
    }
  }

  // ===== UI 헬퍼 =====
  function showAmiBubble(text, duration) {
    // ami-global의 showBubble 함수 호출
    if (typeof window.amiShowBubble === 'function') {
      window.amiShowBubble(text, duration);
    } else {
      var bub = document.getElementById('ami-global-bubble');
      if (bub) {
        bub.textContent = text;
        bub.className = 'on';
        setTimeout(function() { bub.className = ''; }, duration || 3000);
      }
    }
  }

  function showListeningBubble() {
    showAmiBubble('🎤 듣고 있어...', 10000);
  }

  function updateListeningBubble(text) {
    var bub = document.getElementById('ami-global-bubble');
    if (bub && bub.className === 'on') {
      bub.textContent = '🎤 ' + text;
    }
  }

  function hideListeningBubble() {
    var bub = document.getElementById('ami-global-bubble');
    if (bub) bub.className = '';
  }

  function updateMicButton(active) {
    var mic = document.getElementById('ami-mic-btn');
    if (!mic) return;
    if (active) {
      mic.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
      mic.style.animation = 'ami-mic-pulse 1s infinite';
      mic.innerHTML = '&#x23F9;'; // ⏹
    } else {
      mic.style.background = 'linear-gradient(135deg,#10b981,#059669)';
      mic.style.animation = '';
      mic.innerHTML = '&#x1F3A4;'; // 🎤
    }
  }

  function addChatMessage(text, sender) {
    var log = document.getElementById('ami-chat-log');
    if (!log) return;
    var div = document.createElement('div');
    div.className = 'ami-msg ami-msg-' + sender;
    div.textContent = (sender === 'ami' ? '🐰 ' : '') + text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  // ===== B-4: 마이크 버튼 삽입 =====
  function injectMicButton() {
    // 채팅 패널의 입력 영역에 마이크 버튼 추가
    var interval = setInterval(function() {
      var sendBtn = document.getElementById('ami-chat-send');
      if (!sendBtn) return;
      clearInterval(interval);

      // 이미 있으면 스킵
      if (document.getElementById('ami-mic-btn')) return;

      var mic = document.createElement('button');
      mic.id = 'ami-mic-btn';
      mic.style.cssText = 'width:32px;height:32px;border-radius:50%;border:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;cursor:pointer;font-size:14px;flex-shrink:0;transition:all .3s';
      mic.innerHTML = '&#x1F3A4;'; // 🎤
      mic.title = '음성으로 말하기';
      mic.onclick = function(e) {
        e.preventDefault();
        startListening();
      };

      // 전송 버튼 앞에 삽입
      sendBtn.parentNode.insertBefore(mic, sendBtn);
    }, 500);

    // X/O 토글 옆에 플로팅 마이크도 추가
    setTimeout(function() {
      var toggle = document.getElementById('ami-toggle');
      if (!toggle || document.getElementById('ami-float-mic')) return;

      var fmic = document.createElement('button');
      fmic.id = 'ami-float-mic';
      fmic.style.cssText = 'position:fixed;bottom:80px;right:20px;z-index:951;width:44px;height:44px;border-radius:50%;border:2px solid rgba(16,185,129,.4);background:rgba(16,185,129,.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;cursor:pointer;font-size:18px;transition:all .3s;display:flex;align-items:center;justify-content:center';
      fmic.innerHTML = '🎤';
      fmic.title = '아미에게 말하기';
      fmic.onclick = function(e) {
        e.preventDefault();
        startListening();
      };
      document.body.appendChild(fmic);
    }, 1500);
  }

  // ===== 스타일 주입 =====
  var style = document.createElement('style');
  style.textContent = '@keyframes ami-mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 12px rgba(239,68,68,0)}}';
  document.head.appendChild(style);

  // ===== 초기화 =====
  initSTT();
  injectMicButton();

  // voices 로드 대기 (Chrome)
  if (window.speechSynthesis) {
    speechSynthesis.onvoiceschanged = function() {
      speechSynthesis.getVoices();
    };
  }

  // 글로벌 노출
  window.amiStartListening = startListening;
  window.amiSpeakTTS = speakTTS;
  window.amiApplyEmotion = applyEmotion;

  console.log('[AMI Voice] v1.0 로드 완료 🎤🐰');
})();
