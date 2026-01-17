(function() {
    'use strict';
    
    // ==========================================
    // 상태 관리
    // ==========================================
    var STATE = {
        live: false,
        isRecording: false,
        recognizing: false,
        speaking: false,
        healthActive: false,
        motionRunning: false
    };
    
    var selectedAnimal = 'dog';
    var recordingTimer = null;
    var timerInterval = null;
    var healthInterval = null;
    var recognition = null;
    var motionSamples = [];
    var learningData = JSON.parse(localStorage.getItem('petctt_learning') || '{"count":0,"accuracy":12.5}');
    var healthData = { samples: [], startTime: 0, currentResult: null };
    var lastTranslation = '';
    
    // 동물 정보
    var ANIMALS = {
        dog: { 
            icon: '🐶', 
            name: '강아지',
            sounds: ['멍멍!', '왈왈!', '낑낑~', '으르렁', '킁킁'],
            pitch: 1.0
        },
        cat: { 
            icon: '🐱', 
            name: '고양이',
            sounds: ['야옹~', '냐옹!', '그르릉', '하악!', '미야~'],
            pitch: 1.3
        },
        chick: { 
            icon: '🐥', 
            name: '병아리',
            sounds: ['삐약삐약!', '삐삐!', '삐이익~', '쪼쪼쪼'],
            pitch: 1.6
        }
    };
    
    var ANIMAL_TO_HUMAN = {
        dog: {
            happy: ['너무 좋아요! 신나요!', '사랑해요 보호자님!', '놀아주세요!'],
            hungry: ['배고파요... 밥 주세요', '간식 먹고 싶어요!'],
            anxious: ['무서워요... 곁에 있어주세요', '불안해요...'],
            alert: ['누가 왔어요!', '조심하세요!', '지킬게요!'],
            love: ['보호자님 좋아해요~', '쓰다듬어 주세요', '행복해요!']
        },
        cat: {
            happy: ['기분 좋아요~', '그르릉... 행복해', '놀아줘요~'],
            hungry: ['밥 주세요 냥', '간식 시간이에요', '배고파요 냥'],
            anxious: ['무서워요... 숨을 곳 필요해요', '불안해요 냥...'],
            alert: ['저거 뭐야?', '내 영역이야!', '접근하지 마!'],
            love: ['같이 있고 싶어요 냥~', '사랑해요 집사님', '그르릉~']
        },
        chick: {
            happy: ['삐약! 신나요!', '따뜻해서 좋아요!', '친구들이랑 놀고 싶어요!'],
            hungry: ['배고파요 삐약!', '모이 주세요~'],
            anxious: ['엄마 어디있어요?', '무서워요 삐약...', '혼자 두지 마세요'],
            alert: ['위험해요!', '하늘에서 뭔가 와요!'],
            love: ['따뜻해요~', '같이 있고 싶어요', '보호자님 좋아요 삐약!']
        }
    };
    
    var HUMAN_KEYWORDS = {
        '괜찮아': { emotion: 'comfort', responses: { dog: '꼬리 살랑살랑~ (안심했어요!)', cat: '그르릉~ (알겠어요 냥)', chick: '삐약~ (안심이에요!)' }},
        '사랑해': { emotion: 'love', responses: { dog: '꼬리 흔들흔들~ 멍! (나도요!)', cat: '그르릉그르릉... (나도 냥)', chick: '삐삐삐~ (좋아요!)' }},
        '밥': { emotion: 'food', responses: { dog: '멍멍! 꼬리 팡팡! (밥이다!)', cat: '냐옹! 냐옹! (밥이다 냥!)', chick: '삐약! 삐이익! (모이다!)' }},
        '간식': { emotion: 'treat', responses: { dog: '왈왈! 눈 반짝 (간식 좋아!)', cat: '야옹~ 꼬리 세움 (기대된다 냥)', chick: '삐약삐약! (맛있겠다!)' }},
        '산책': { emotion: 'walk', responses: { dog: '왈왈왈! 뛰어다님 (산책 좋아!)', cat: '...흥 (귀찮다 냥)', chick: '삐약? (밖이요?)' }},
        '잘했어': { emotion: 'praise', responses: { dog: '꼬리 흔들흔들~ 낑낑 (기뻐요!)', cat: '그르릉~ (당연하지 냥)', chick: '삐삐! (고마워요!)' }},
        '놀자': { emotion: 'play', responses: { dog: '멍! 왈왈! 뛰어다님 (신나!)', cat: '냐앙~ 눈 동그래짐 (놀아줘 냥!)', chick: '삐약삐약! (같이 놀아요!)' }},
        '예뻐': { emotion: 'compliment', responses: { dog: '꼬리 살랑~ (고마워요!)', cat: '그르릉 (알고 있어 냥)', chick: '삐~ (기뻐요!)' }},
        '이리와': { emotion: 'come', responses: { dog: '달려옴~ 멍! (가요!)', cat: '...천천히 걸어옴 (귀찮지만 냥)', chick: '삐약삐약! 달려옴 (가요!)' }}
    };
    
    // DOM 캐싱
    var DOM = {};
    
    function cacheDOMElements() {
        DOM.statusBadge = document.getElementById('statusBadge');
        DOM.statusText = document.getElementById('statusText');
        DOM.btnStart = document.getElementById('btnStart');
        DOM.btnStop = document.getElementById('btnStop');
        DOM.btnHumanMic = document.getElementById('btnHumanMic');
        DOM.btnAnimalMic = document.getElementById('btnAnimalMic');
        DOM.waveform = document.getElementById('waveform');
        DOM.timer = document.getElementById('timer');
        DOM.panelStatus = document.getElementById('panelStatus');
        DOM.chatContainer = document.getElementById('chatContainer');
        DOM.animalIcon = document.getElementById('animalIcon');
        DOM.animalLabel = document.getElementById('animalLabel');
        DOM.learningPercent = document.getElementById('learningPercent');
        DOM.learningProgress = document.getElementById('learningProgress');
        DOM.toast = document.getElementById('toast');
        DOM.settingsModal = document.getElementById('settingsModal');
        DOM.speechRate = document.getElementById('speechRate');
        DOM.speechPitch = document.getElementById('speechPitch');
        DOM.speechVolume = document.getElementById('speechVolume');
        DOM.healthMeterFill = document.getElementById('healthMeterFill');
        DOM.healthState = document.getElementById('healthState');
        DOM.healthTime = document.getElementById('healthTime');
        DOM.healthAvg = document.getElementById('healthAvg');
        DOM.healthPeaks = document.getElementById('healthPeaks');
        DOM.healthSilence = document.getElementById('healthSilence');
        DOM.healthStrength = document.getElementById('healthStrength');
        DOM.healthResult = document.getElementById('healthResult');
        DOM.btnHealthStart = document.getElementById('btnHealthStart');
        DOM.btnHealthStop = document.getElementById('btnHealthStop');
        DOM.btnSaveHealth = document.getElementById('btnSaveHealth');
        DOM.recordsList = document.getElementById('recordsList');
    }
    
    // 초기화
    document.addEventListener('DOMContentLoaded', function() {
        cacheDOMElements();
        initSpeechRecognition();
        updateLearningUI();
        loadSettings();
        setupTabNav();
        loadRecords();
        
        // 마이크 권한 요청 안내
        addBubble('system', '💡 마이크 권한을 허용하면 모든 기능이 작동합니다. Chrome: 주소창 자물쇠 → 마이크 허용');
    });
    
    // 탭 네비게이션
    function setupTabNav() {
        document.querySelectorAll('.tab-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var tab = this.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
                document.getElementById(tab).classList.add('active');
                if (tab === 'records') loadRecords();
            });
        });
    }
    
    // 음성 인식 초기화
    function initSpeechRecognition() {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.onstart = function() { STATE.recognizing = true; };
        recognition.onend = function() { STATE.recognizing = false; };
    }
    
    // 상태 업데이트
    function updateStatusBadge(status) {
        DOM.statusBadge.className = 'status-badge ' + status;
        DOM.statusText.textContent = status === 'live' ? 'LIVE 활성' : status === 'recording' ? '녹음 중...' : 'LIVE 준비';
    }
    
    function setWaveformActive(active) {
        DOM.waveform.classList.toggle('inactive', !active);
        DOM.waveform.classList.toggle('active', active);
    }
    
    function showTimer(show) {
        DOM.timer.classList.toggle('hidden', !show);
    }
    
    function updateTimer(seconds) {
        DOM.timer.textContent = seconds.toFixed(1);
    }
    
    // LIVE 시작
    async function handleStart() {
        if (STATE.live) return;
        
        try {
            STATE.live = true;
            DOM.btnStart.disabled = true;
            DOM.btnStop.disabled = false;
            DOM.btnHumanMic.disabled = false;
            DOM.btnAnimalMic.disabled = false;
            
            updateStatusBadge('live');
            DOM.panelStatus.textContent = '마이크 버튼을 눌러 통역을 시작하세요';
            
            addBubble('system', '🐾 LIVE 모드 시작! 마이크 버튼으로 양방향 통역하세요.');
            showToast('🐾 동물대화 LIVE 모드 시작!', 'success');
        } catch (err) {
            console.error('Start error:', err);
            showToast('시작 중 오류가 발생했습니다', 'error');
            handleStop();
        }
    }
    
    window.handleStart = handleStart;
    
    // LIVE 중지
    function handleStop() {
        STATE.live = false;
        STATE.isRecording = false;
        
        if (recordingTimer) clearTimeout(recordingTimer);
        if (timerInterval) clearInterval(timerInterval);
        if (recognition) try { recognition.abort(); } catch(e) {}
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        
        DOM.btnStart.disabled = false;
        DOM.btnStop.disabled = true;
        DOM.btnHumanMic.disabled = true;
        DOM.btnAnimalMic.disabled = true;
        DOM.btnHumanMic.classList.remove('recording');
        DOM.btnAnimalMic.classList.remove('recording');
        
        updateStatusBadge('ready');
        DOM.panelStatus.textContent = '마이크 버튼을 눌러 통역을 시작하세요';
        setWaveformActive(false);
        showTimer(false);
        
        addBubble('system', '⏹ LIVE 모드 종료. 다시 시작하려면 버튼을 눌러주세요.');
    }
    
    window.handleStop = handleStop;
    
    // 사람 → 동물 통역
    async function handleHumanToAnimal() {
        if (!STATE.live || STATE.isRecording) return;
        
        STATE.isRecording = true;
        DOM.btnHumanMic.classList.add('recording');
        DOM.btnHumanMic.disabled = true;
        DOM.btnAnimalMic.disabled = true;
        
        updateStatusBadge('recording');
        DOM.panelStatus.textContent = '🎤 말씀하세요! (3초간 녹음)';
        setWaveformActive(true);
        showTimer(true);
        
        var seconds = 3.0;
        updateTimer(seconds);
        timerInterval = setInterval(function() {
            seconds -= 0.1;
            updateTimer(Math.max(0, seconds));
        }, 100);
        
        var recognizedText = null;
        
        if (recognition) {
            try {
                recognizedText = await new Promise(function(resolve) {
                    var timeout = setTimeout(function() {
                        try { recognition.stop(); } catch(e) {}
                        resolve(null);
                    }, 3500);
                    
                    recognition.onresult = function(e) {
                        clearTimeout(timeout);
                        resolve(e.results[0][0].transcript);
                    };
                    
                    recognition.onerror = function() {
                        clearTimeout(timeout);
                        resolve(null);
                    };
                    
                    recognition.start();
                });
            } catch (err) {
                console.warn('Recognition failed:', err);
            }
        }
        
        clearInterval(timerInterval);
        
        if (!recognizedText) {
            showToast('🎤 음성 인식 실패. 텍스트로 입력해주세요.', 'info');
            recognizedText = prompt('음성 인식 실패.\n직접 입력하세요:', '괜찮아, 사랑해');
        }
        
        if (recognizedText) {
            addBubble('human', recognizedText);
            var animalResponse = translateToAnimal(recognizedText);
            lastTranslation = animalResponse;
            
            setTimeout(function() {
                var animal = ANIMALS[selectedAnimal];
                addBubbleWithPlay('animal', animal.icon + ' ' + animal.name + ': ' + animalResponse, animalResponse);
                speakText(animalResponse, animal.pitch);
                updateLearning();
            }, 500);
        }
        
        STATE.isRecording = false;
        DOM.btnHumanMic.classList.remove('recording');
        DOM.btnHumanMic.disabled = false;
        DOM.btnAnimalMic.disabled = false;
        updateStatusBadge('live');
        setWaveformActive(false);
        showTimer(false);
    }
    
    window.handleHumanToAnimal = handleHumanToAnimal;
    
    // 동물 → 사람 통역
    async function handleAnimalToHuman() {
        if (!STATE.live || STATE.isRecording) return;
        
        STATE.isRecording = true;
        DOM.btnAnimalMic.classList.add('recording');
        DOM.btnHumanMic.disabled = true;
        DOM.btnAnimalMic.disabled = true;
        
        var animal = ANIMALS[selectedAnimal];
        updateStatusBadge('recording');
        DOM.panelStatus.textContent = '🐾 ' + animal.name + ' 소리를 듣고 있어요... (3초)';
        setWaveformActive(true);
        showTimer(true);
        
        var seconds = 3.0;
        updateTimer(seconds);
        timerInterval = setInterval(function() {
            seconds -= 0.1;
            updateTimer(Math.max(0, seconds));
        }, 100);
        
        await new Promise(function(r) { setTimeout(r, 3000); });
        clearInterval(timerInterval);
        
        var sounds = animal.sounds;
        var animalSound = sounds[Math.floor(Math.random() * sounds.length)];
        addBubble('animal', animal.icon + ' ' + animal.name + ': ' + animalSound);
        
        var emotions = ['happy', 'hungry', 'anxious', 'alert', 'love'];
        var emotion = emotions[Math.floor(Math.random() * emotions.length)];
        var translations = ANIMAL_TO_HUMAN[selectedAnimal][emotion];
        var humanTranslation = translations[Math.floor(Math.random() * translations.length)];
        lastTranslation = humanTranslation;
        
        setTimeout(function() {
            addBubbleWithPlay('translation', '🗣️ 통역: "' + humanTranslation + '"', humanTranslation);
            speakText(humanTranslation, 1.0);
            updateLearning();
        }, 600);
        
        STATE.isRecording = false;
        DOM.btnAnimalMic.classList.remove('recording');
        DOM.btnHumanMic.disabled = false;
        DOM.btnAnimalMic.disabled = false;
        updateStatusBadge('live');
        setWaveformActive(false);
        showTimer(false);
    }
    
    window.handleAnimalToHuman = handleAnimalToHuman;
    
    // 사람말 → 동물어 통역
    function translateToAnimal(text) {
        for (var keyword in HUMAN_KEYWORDS) {
            if (text.includes(keyword)) {
                return HUMAN_KEYWORDS[keyword].responses[selectedAnimal];
            }
        }
        var defaultResponses = {
            dog: '멍! 꼬리 흔들~ (알겠어요!)',
            cat: '냐옹~ (알았다 냥)',
            chick: '삐약! (네!)'
        };
        return defaultResponses[selectedAnimal];
    }
    
    // TTS 음성 출력
    function speakText(text, basePitch) {
        if (!('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = parseFloat(DOM.speechRate.value) || 1;
        utterance.pitch = (parseFloat(DOM.speechPitch.value) || 1) * basePitch;
        utterance.volume = parseFloat(DOM.speechVolume.value) || 1;
        speechSynthesis.speak(utterance);
    }
    
    window.playLastTranslation = function(text) {
        speakText(text, selectedAnimal === 'dog' ? 1.0 : selectedAnimal === 'cat' ? 1.3 : 1.6);
    };
    
    // 동물 선택
    function selectAnimal(btn) {
        document.querySelectorAll('.animal-btn').forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        selectedAnimal = btn.dataset.animal;
        
        var animal = ANIMALS[selectedAnimal];
        DOM.animalIcon.textContent = animal.icon;
        DOM.animalLabel.textContent = animal.name;
        showToast(animal.icon + ' ' + animal.name + ' 선택!', 'success');
    }
    
    window.selectAnimal = selectAnimal;
    
    // 채팅 버블
    function addBubble(type, content) {
        var div = document.createElement('div');
        div.className = 'bubble ' + type;
        var header = '';
        if (type === 'human') header = '<div class="bubble-header">👤 보호자</div>';
        else if (type === 'animal') header = '<div class="bubble-header">🐾 동물</div>';
        else if (type === 'translation') header = '<div class="bubble-header">🗣️ 통역 결과</div>';
        div.innerHTML = header + '<div class="bubble-content">' + escapeHtml(content) + '</div>';
        DOM.chatContainer.appendChild(div);
        DOM.chatContainer.scrollTop = DOM.chatContainer.scrollHeight;
    }
    
    function addBubbleWithPlay(type, content, textToPlay) {
        var div = document.createElement('div');
        div.className = 'bubble ' + type;
        var header = '';
        if (type === 'human') header = '<div class="bubble-header">👤 보호자</div>';
        else if (type === 'animal') header = '<div class="bubble-header">🐾 동물</div>';
        else if (type === 'translation') header = '<div class="bubble-header">🗣️ 통역 결과</div>';
        div.innerHTML = header + 
            '<div class="bubble-content">' + escapeHtml(content) + '</div>' +
            '<button class="play-btn" onclick="playLastTranslation(\'' + escapeHtml(textToPlay).replace(/'/g, "\\'") + '\')">🔊 다시 재생</button>';
        DOM.chatContainer.appendChild(div);
        DOM.chatContainer.scrollTop = DOM.chatContainer.scrollHeight;
    }
    
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 학습 업데이트
    function updateLearning() {
        learningData.count++;
        learningData.accuracy = Math.min(95, 12.5 + (learningData.count * 0.8));
        localStorage.setItem('petctt_learning', JSON.stringify(learningData));
        updateLearningUI();
    }
    
    function updateLearningUI() {
        DOM.learningPercent.textContent = learningData.accuracy.toFixed(1) + '%';
        DOM.learningProgress.style.width = learningData.accuracy + '%';
    }
    
    // 토스트
    function showToast(message, type) {
        DOM.toast.textContent = message;
        DOM.toast.className = 'toast show ' + (type || 'info');
        setTimeout(function() {
            DOM.toast.className = 'toast';
        }, 3000);
    }
    
    // 설정 모달
    window.openSettings = function() {
        DOM.settingsModal.classList.add('show');
    };
    
    window.closeSettings = function() {
        DOM.settingsModal.classList.remove('show');
        saveSettings();
    };
    
    window.updateRateValue = function() {
        document.getElementById('rateValue').textContent = DOM.speechRate.value + 'x';
    };
    
    window.updatePitchValue = function() {
        document.getElementById('pitchValue').textContent = DOM.speechPitch.value;
    };
    
    window.updateVolumeValue = function() {
        document.getElementById('volumeValue').textContent = Math.round(DOM.speechVolume.value * 100) + '%';
    };
    
    function saveSettings() {
        localStorage.setItem('petctt_settings', JSON.stringify({
            rate: DOM.speechRate.value,
            pitch: DOM.speechPitch.value,
            volume: DOM.speechVolume.value
        }));
    }
    
    function loadSettings() {
        var saved = localStorage.getItem('petctt_settings');
        if (saved) {
            var s = JSON.parse(saved);
            DOM.speechRate.value = s.rate || 1;
            DOM.speechPitch.value = s.pitch || 1;
            DOM.speechVolume.value = s.volume || 1;
            window.updateRateValue();
            window.updatePitchValue();
            window.updateVolumeValue();
        }
    }
    
    // ==========================================
    // 건강체크
    // ==========================================
    var mediaStream = null;
    var audioContext = null;
    var analyser = null;
    
    async function initAudio() {
        if (mediaStream) return;
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') await audioContext.resume();
            
            var source = audioContext.createMediaStreamSource(mediaStream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
        } catch (err) {
            showToast('마이크 접근 실패. 브라우저 권한을 확인해주세요.', 'error');
            throw err;
        }
    }
    
    function releaseAudio() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        analyser = null;
    }
    
    function getRMS() {
        if (!analyser) return 0;
        var data = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(data);
        var sum = 0;
        for (var i = 0; i < data.length; i++) {
            var norm = (data[i] - 128) / 128;
            sum += norm * norm;
        }
        return Math.sqrt(sum / data.length);
    }
    
    async function handleHealthStart() {
        if (STATE.healthActive) return;
        
        try {
            await initAudio();
            STATE.healthActive = true;
            DOM.btnHealthStart.disabled = true;
            DOM.btnHealthStop.disabled = false;
            DOM.btnSaveHealth.disabled = true;
            
            healthData = { samples: [], startTime: Date.now(), currentResult: null };
            DOM.healthState.textContent = '측정 중';
            DOM.healthResult.innerHTML = '<div style="color: var(--text-muted);">측정 중...</div>';
            
            healthLoop();
        } catch (err) {
            console.error('Health start error:', err);
        }
    }
    
    window.handleHealthStart = handleHealthStart;
    
    function healthLoop() {
        if (!STATE.healthActive) return;
        
        var rms = getRMS();
        var level = Math.min(1, rms * 5);
        DOM.healthMeterFill.style.width = (level * 100) + '%';
        
        var elapsed = (Date.now() - healthData.startTime) / 1000;
        var remaining = Math.max(0, 30 - elapsed);
        
        healthData.samples.push(rms);
        if (rms < 0.04) healthData.silenceCount = (healthData.silenceCount || 0) + 1;
        if (rms > 0.10 && healthData.samples.length > 1 && rms > healthData.samples[healthData.samples.length - 2]) {
            healthData.peakCount = (healthData.peakCount || 0) + 1;
        }
        
        DOM.healthTime.textContent = Math.ceil(remaining) + 's';
        
        var avgLevel = healthData.samples.length > 0 ? healthData.samples.reduce((a, b) => a + b, 0) / healthData.samples.length : 0;
        DOM.healthAvg.textContent = avgLevel.toFixed(3);
        DOM.healthPeaks.textContent = String(healthData.peakCount || 0);
        
        var silenceRatio = Math.round(((healthData.silenceCount || 0) / healthData.samples.length) * 100);
        DOM.healthSilence.textContent = silenceRatio + '%';
        
        var strength = 'N/A';
        if (avgLevel > 0.05) strength = '중간';
        if (avgLevel > 0.10) strength = '높음';
        DOM.healthStrength.textContent = strength;
        
        if (elapsed < 30) {
            healthInterval = requestAnimationFrame(healthLoop);
        } else {
            finishHealth();
        }
    }
    
    function finishHealth() {
        var avgLevel = healthData.samples.length > 0 ? healthData.samples.reduce((a, b) => a + b, 0) / healthData.samples.length : 0;
        var silenceRatio = healthData.samples.length > 0 ? (healthData.silenceCount || 0) / healthData.samples.length : 0;
        
        var score = 100;
        score -= silenceRatio * 40;
        score -= Math.max(0, avgLevel - 0.12) * 100;
        score = Math.max(0, Math.min(100, score));
        
        var status = 'N/A';
        if (score >= 70) status = '좋음';
        else if (score >= 40) status = '보통';
        else status = '주의';
        
        healthData.currentResult = {
            timestamp: new Date().toLocaleString('ko-KR'),
            duration: 30,
            avgLevel: avgLevel,
            silenceRatio: silenceRatio,
            peakCount: healthData.peakCount || 0,
            score: Math.round(score),
            status: status,
            animal: selectedAnimal
        };
        
        STATE.healthActive = false;
        releaseAudio();
        DOM.btnHealthStart.disabled = false;
        DOM.btnHealthStop.disabled = true;
        DOM.healthState.textContent = '완료';
        DOM.healthMeterFill.style.width = '0%';
        
        DOM.healthResult.innerHTML = `
            <div style="line-height: 1.8;">
                <div><strong>✓ 측정 완료</strong></div>
                <div style="margin-top: 12px; font-size: 0.9rem;">
                    <div>평균 레벨: <span style="font-family: monospace;">${avgLevel.toFixed(3)}</span></div>
                    <div>무음 비율: <span style="font-family: monospace;">${Math.round(silenceRatio * 100)}%</span></div>
                    <div>피크 감지: <span style="font-family: monospace;">${healthData.peakCount || 0}</span></div>
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(16, 185, 129, 0.3);">
                        <strong>평가: ${status}</strong> (점수: ${Math.round(score)}/100)
                    </div>
                </div>
            </div>
        `;
        
        DOM.btnSaveHealth.disabled = false;
        showToast('✓ 건강체크 완료!', 'success');
    }
    
    window.handleHealthStop = function() {
        STATE.healthActive = false;
        releaseAudio();
        DOM.btnHealthStart.disabled = false;
        DOM.btnHealthStop.disabled = true;
        DOM.healthState.textContent = '중지됨';
        DOM.healthMeterFill.style.width = '0%';
    };
    
    // ==========================================
    // 기록 저장/관리
    // ==========================================
    const STORAGE_KEY = 'petctt_records_v2';
    
    function loadRecords() {
        try {
            var records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            renderRecords(records);
        } catch {
            DOM.recordsList.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 40px 20px;">아직 저장된 기록이 없습니다.</div>';
        }
    }
    
    function renderRecords(records) {
        if (records.length === 0) {
            DOM.recordsList.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 40px 20px;">아직 저장된 기록이 없습니다.</div>';
            return;
        }
        
        DOM.recordsList.innerHTML = records.map((rec, idx) => `
            <div class="record-item">
                <div class="record-info">
                    <div class="record-time">${rec.timestamp} · ${rec.animal}</div>
                    <div class="record-value">평가: <strong>${rec.status}</strong> | 점수: ${rec.score}/100</div>
                </div>
                <div class="record-actions">
                    <button onclick="deleteRecord(${idx})" style="color: #f87171;">🗑️</button>
                </div>
            </div>
        `).join('');
    }
    
    window.saveHealthRecord = function() {
        if (!healthData.currentResult) return;
        var records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        records.unshift(healthData.currentResult);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 100)));
        DOM.btnSaveHealth.disabled = true;
        showToast('✓ 결과 저장 완료!', 'success');
        loadRecords();
    };
    
    window.deleteRecord = function(idx) {
        var records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        records.splice(idx, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        loadRecords();
    };
    
    window.clearAllRecords = function() {
        if (confirm('저장된 모든 기록을 삭제할까요?')) {
            localStorage.removeItem(STORAGE_KEY);
            loadRecords();
            showToast('✓ 모든 기록 삭제됨', 'success');
        }
    };
    
    window.exportJSON = function() {
        var records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        var blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
        downloadFile('petctt_records.json', blob);
    };
    
    window.exportCSV = function() {
        var records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (records.length === 0) { showToast('내보낼 기록이 없습니다.', 'error'); return; }
        
        var headers = ['timestamp', 'animal', 'duration', 'avgLevel', 'silenceRatio', 'peakCount', 'score', 'status'];
        var csv = [headers.join(',')];
        records.forEach(r => {
            csv.push(headers.map(h => {
                var v = r[h];
                if (typeof v === 'string') return `"${v.replace(/"/g, '""')}"`;
                return v;
            }).join(','));
        });
        
        var blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8' });
        downloadFile('petctt_records.csv', blob);
    };
    
    function downloadFile(filename, blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
})();
