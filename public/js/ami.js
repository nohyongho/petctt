// PetCTT 아미 토끼 v3 + 브레인 v1.0
(function(){
  'use strict';

  // ═══════════════════════════════════════════════════
  //  🐰 아미 브레인 v1.0 — 인라인 임베드 (IIFE 없음)
  // ═══════════════════════════════════════════════════

  var AMI_PET_TRANSLATIONS = {
    dog: {
      '멍멍': ['밥 줘! 배고파~ 🍖', '놀아줘! 심심해~ 🎾', '누가 왔어! 알려줘야지! 🚪', '사랑해 집사! 💕'],
      '왈왈': ['경고야! 조심해! ⚠️', '나 여기 있어! 👋', '산책 가자! 🏃'],
      '낑낑': ['외로워... 같이 있어줘 🥺', '아파... 걱정돼 😢', '간식 주면 안 돼? 🍪'],
      '꼬리 흔들': ['너무 행복해! 최고야! 😆', '반가워! 사랑해! 💖'],
      '배 보여': ['나 믿어! 쓰다듬어줘~ 🫄', '너무 편해~ 행복해 💤'],
      '핥': ['사랑한다는 뜻이야! 💋', '짠맛 나! 맛있어 😋'],
      '킁킁': ['뭔가 냄새 나! 조사 중~ 🔍', '누구 왔다 갔어? 🐾']
    },
    cat: {
      '야옹': ['밥! 지금! 당장! 🍽️', '문 열어줘~ 🚪', '관심 좀 줘봐 👀'],
      '냐옹': ['심심해~ 놀아줘 🧶', '어디 갔었어? 보고싶었어 💜'],
      '그르르': ['기분 좋아~ 계속해줘 😌', '최고의 집사야! ⭐'],
      '골골': ['너무 행복해... 천국이야 😴💕', '안전하다고 느껴~ 🏠'],
      '하악': ['건들지 마! 화났어! 😾', '무서워! 가까이 오지 마! 🙀'],
      '머리 비비': ['내꺼! 마킹 완료! 😤💜', '사랑해 집사~ 🥰'],
      '꾹꾹이': ['엄마 생각나~ 편안해 🍼', '여기 내 자리! 폭신해~ 💤'],
      '박치기': ['관심 줘! 나한테 집중! 😼', '사랑의 박치기! 💥💕']
    }
  };

  var AMI_RULES = [
    {kw:['안녕','하이','hi','hello','반가','처음'], rr:['안녕! 나는 아미야~ 🐰✨ PetCTT의 우주대스타 가이드! 뭐든 물어봐~','반가워!! 🐰💜 나 아미! 우리 아이 이야기 해줄래~?','하이하이~ 아미 등장! 🌟 PetCTT 궁금한 거 다 알려줄게!']},
    {kw:['petctt','펫쿠폰','이게 뭐','뭐하는','서비스','소개','설명','알려줘','뭐야'], rr:['PetCTT는 반려동물 AI 플랫폼이야! 🐾 AI 통역, 건강체크, 소개팅, 콘테스트까지~ 우리 아이를 위한 모든 것! 💜','여기는 PetCTT! 🐰✨ 반려동물 AI 통역도 하고, 주민등록증도 만들고, 구름장터에서 쇼핑도 해! 궁금한 거 더 물어봐~']},
    {kw:['통역','번역','말','이해','무슨 뜻','뭐라고'], rr:['아미가 통역해줄게! 🗣️✨ 우리 아이가 뭐라고 했어? 멍멍? 야옹? 알려줘~!','AI 통역 기능이야! 🐾 강아지 멍멍, 고양이 야옹 다 통역해줘! 💜']},
    {kw:['gps','위치','추적','어디','찾기','잃어버'], rr:['GPS 추적으로 우리 아이 위치를 실시간 확인! 📍✨ 프리미엄 기능이야~ 무료 체험 먼저 해볼래? 💜']},
    {kw:['건강','아파','병원','체크','진단'], rr:['AI 건강 체크! 💚 우리 아이 상태를 AI가 분석해줘~ 프리미엄 기능이야! 💜']},
    {kw:['주민등록','신분증','카드','등록증','id'], rr:['우리 아이 주민등록증! 🪪✨ 세상에 하나뿐인 특별한 신분증! 무료야! 🐾']},
    {kw:['소개팅','매칭','친구','만남'], rr:['소개팅! 💕 우리 아이 친구 찾아줄게~ 라이브 매칭으로! 🐾✨']},
    {kw:['콘테스트','대회','자랑','투표','우승'], rr:['우리 아이 자랑 대회! 🏆✨ 사진 올리고 투표 받고~ 참여해볼래? 🐾']},
    {kw:['장터','마켓','구름','쇼핑','용품'], rr:['구름장터! 🛒✨ 반려동물 용품 사고팔기~ 구경해볼래? 🐾']},
    {kw:['맛집','레스토랑','식당','카페','동반'], rr:['펫 맛집! 🍽️✨ 우리 아이랑 같이 갈 수 있는 맛집 찾아줄게~ 🐾']},
    {kw:['글래스','안경','ar','스마트','증강'], rr:['AI 스마트 글래스! 🕶️✨ AR로 우리 아이 정보를 실시간 확인! 곧 만나! 💜']},
    {kw:['스캔','사진','분석','찍어'], rr:['스캔 기능! 📸✨ 우리 아이 사진 찍으면 AI가 분석해줘~ 해볼래? 💜']},
    {kw:['프리미엄','유료','구독','가격','얼마','결제','무료','pro','업그레이드'], rr:['프리미엄은 월 4,900원! 💎 개체별 분석, 맞춤 학습, 기록 저장, 행동 추적까지! 무료 체험 먼저 해볼래? 🐰✨','무료로도 기본 통역, 주민등록증, 소개팅, 콘테스트 다 돼! 🎉 프리미엄은 우리 아이 전용 분석 추가~ 💜']},
    {kw:['아미','너 누구','누구야','자기소개','이름'], rr:['나? 아미! 🐰✨ PetCTT의 우주대스타 AR 가이드야! 반려동물 세상의 모든 걸 안내해줄게~ 💜']},
    {kw:['발로레','회사','만든','대표','airctt','에어쿠폰'], rr:['PetCTT는 주식회사 발로레에서 만들었어! 🏢 AIRCTT라는 자매 서비스도 있어~ 상생 공존 마켓! 💜✨']},
    {kw:['사랑','좋아','예뻐','귀여','최고','고마워','감사'], rr:['으앙 고마워!! 🥹💜 아미도 사랑해~! 🐾✨','헤헤~ 칭찬 좋아! 💕🐰 더 열심히 안내해줄게! ✨']},
    {kw:['심심','놀자','놀아','재미','뭐해'], rr:['심심해? 🐰 통역 체험 해볼래? "멍멍" 이나 "야옹" 입력해봐! 🎮✨']},
    {kw:['도움','도와','모르','어떻게','사용법','방법'], rr:['아미가 도와줄게! 🐰✨ 🗣️통역 | 🪪주민등록증 | 💕소개팅 | 🏆콘테스트 뭐가 궁금해? 💜']}
  ];

  var amiBrainTurn = 0;

  function amiBrainTranslate(msg, pet) {
    var m = msg.toLowerCase();
    var dict = AMI_PET_TRANSLATIONS[pet];
    for (var key in dict) {
      if (m.indexOf(key) !== -1) {
        var arr = dict[key];
        var t = arr[Math.floor(Math.random() * arr.length)];
        var emoji = pet === 'dog' ? '🐶' : '🐱';
        return emoji + ' "' + key + '" 통역 결과: ' + t + '\n\n더 정확한 개체별 분석은 프리미엄에서! 💎';
      }
    }
    return null;
  }

  function amiBrainRespond(msg) {
    amiBrainTurn++;
    var m = msg.toLowerCase().replace(/\s+/g, '');

    // 강아지 통역
    var dogKeys = ['멍멍','왈왈','낑낑','강아지','개','댕댕이','퍼피','꼬리','핥','킁킁'];
    for (var di = 0; di < dogKeys.length; di++) {
      if (m.indexOf(dogKeys[di]) !== -1) {
        var dr = amiBrainTranslate(msg, 'dog');
        if (dr) return dr;
        return '강아지 얘기! 🐶💕 무슨 소리 냈어? "멍멍", "왈왈" 알려줘~ 통역해줄게! 🗣️';
      }
    }

    // 고양이 통역
    var catKeys = ['야옹','냐옹','고양이','냥이','골골','하악','꾹꾹이','박치기','머리 비비'];
    for (var ci = 0; ci < catKeys.length; ci++) {
      if (m.indexOf(catKeys[ci]) !== -1) {
        var cr = amiBrainTranslate(msg, 'cat');
        if (cr) return cr;
        return '냥이 얘기! 🐱💜 무슨 소리 냈어? "야옹", "골골" 알려줘~ 통역해줄게! 🗣️';
      }
    }

    // 룰 매칭
    var bestRule = null, bestScore = 0;
    for (var ri = 0; ri < AMI_RULES.length; ri++) {
      var rule = AMI_RULES[ri];
      var score = 0;
      for (var ki = 0; ki < rule.kw.length; ki++) {
        if (m.indexOf(rule.kw[ki].toLowerCase().replace(/\s+/g,'')) !== -1) {
          score += rule.kw[ki].length;
        }
      }
      if (score > bestScore) { bestScore = score; bestRule = rule; }
    }

    if (bestRule) {
      var resp = bestRule.rr[Math.floor(Math.random() * bestRule.rr.length)];
      if (amiBrainTurn % 5 === 0) {
        resp += '\n\n💡 프리미엄이면 우리 아이 전용 분석도 돼~ "프리미엄" 이라고 해봐! 💎';
      }
      return resp;
    }

    // 폴백
    var fb = [
      '음~ 아미가 아직 잘 모르는 거야! 🤔 PetCTT 기능이나 우리 아이 이야기 해줄래? 🐰💜',
      '어려운 질문이야! 😵‍💫 "멍멍" 통역이나 기능 설명은 잘 해! 🐾✨',
      '아미가 열심히 공부 중! 📚🐰 반려동물 통역이랑 PetCTT 안내 전문! 뭐 궁금해? 💜'
    ];
    return fb[Math.floor(Math.random() * fb.length)];
  }

  window.__amiBrain = {
    call: function(msg) {
      return new Promise(function(resolve) {
        var delay = 300 + Math.random() * 500;
        setTimeout(function() {
          resolve(amiBrainRespond(msg));
        }, delay);
      });
    },
    version: '1.0.0',
    mode: 'offline-smart'
  };

  console.log('🐰 아미 브레인 v1.0 로드 완료! (인라인 모드)');


  // DOM 준비 확인
  function init(){
    var root = document.getElementById('ami-root');
    var canvas = document.getElementById('ami-particle-canvas');
    if(!root || !canvas){ return; }

    // ===== 파티클 =====
    var px = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', function(){
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    var parts = [];

    function Pt(x,y,t){
      this.x=x; this.y=y; this.t=t; this.life=1;
      if(t==='f'){
        this.vx=(Math.random()-.5)*10; this.vy=-(Math.random()*8+3);
        this.decay=.012; this.size=Math.random()*16+6;
        var em=['💨','💫','✨','⭐','🌟','💥','🎉','🌈'];
        this.em=em[Math.floor(Math.random()*em.length)];
      } else {
        this.vx=(Math.random()-.5)*6; this.vy=-(Math.random()*6+1);
        this.decay=.022; this.size=Math.random()*5+2;
        this.hue=270+Math.floor(Math.random()*80);
      }
    }
    Pt.prototype.update=function(){ this.x+=this.vx; this.y+=this.vy; this.vy+=.2; this.life-=this.decay; };
    Pt.prototype.draw=function(){
      if(this.life<=0) return;
      if(this.t==='f'){
        px.save(); px.globalAlpha=this.life*.9;
        px.font=this.size*1.4+'px serif'; px.textAlign='center';
        px.fillText(this.em, this.x, this.y); px.restore();
      } else {
        px.save(); px.globalAlpha=this.life*.8;
        px.beginPath(); px.arc(this.x,this.y,this.size,0,Math.PI*2);
        var g=px.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size);
        g.addColorStop(0,'#fff'); g.addColorStop(1,'hsl('+this.hue+',100%,70%)');
        px.fillStyle=g; px.fill(); px.restore();
      }
    };

    (function pLoop(){
      px.clearRect(0,0,canvas.width,canvas.height);
      parts = parts.filter(function(p){ return p.life>0; });
      parts.forEach(function(p){ p.update(); p.draw(); });
      requestAnimationFrame(pLoop);
    })();

    function fart(x,y,n){
      n=n||18;
      for(var i=0;i<n;i++){
        (function(i){ setTimeout(function(){ parts.push(new Pt(x,y,'f')); }, i*30); })(i);
      }
      for(var j=0;j<10;j++) parts.push(new Pt(x+(Math.random()-.5)*25,y,'j'));
    }
    function dust(x,y){
      for(var i=0;i<8;i++) parts.push(new Pt(x+(Math.random()-.5)*20,y,'j'));
    }

    // ===== 아미 상태 =====
    var ax = Math.round(window.innerWidth/2); // 현재 X 위치
    var tx = ax;  // 목표 X
    var jOffset=0, jVel=0, jumping=false;
    var facing=1;
    var moveTimer=60, layTimer=0, stt='idle', clickN=0;
    var bT=0, eT=0, tT=0, blkT=0, blkV=0;
    var mouthV=0, happyV=0, fartT=0;
    var soundOn=false, chatOpen=false;
    var hist=[], lastTap=0;

    // 아미 위치 초기 설정 (개별 setProperty로 !important 적용)
    root.style.setProperty('position','fixed','important');
    if(!window._amiHidden){
      if(!window._amiHidden){
        root.style.setProperty('display','block','important');
        root.style.setProperty('visibility','visible','important');
      }
      root.style.setProperty('opacity','1','important');
    }
    root.style.setProperty('z-index','99990','important');
    root.style.setProperty('bottom','28px','important');
    root.style.setProperty('left', ax+'px','important');
    root.style.setProperty('transform','translateX(-50%)','important');
    root.style.setProperty('cursor','pointer','important');
    root.style.setProperty('pointer-events','auto','important');

    function setPos(){
      root.style.setProperty('left', ax+'px','important');
      root.style.setProperty('bottom','28px','important');
      root.style.setProperty('transform','translateX(-50%) scaleX('+facing+') translateY('+jOffset+'px)','important');
      if(!window._amiHidden){
        root.style.setProperty('display','block','important');
        root.style.setProperty('visibility','visible','important');
      }
    }

    function g(id){ return document.getElementById(id); }

    // ===== 애니 루프 =====
    function animLoop(){
      bT+=.04; eT+=.07; tT+=.055; fartT++;
      blkT++;
      if(blkT>220){ blkV=1; if(blkT>232){ blkV=0; blkT=0; } }

      var sc=1+Math.sin(bT)*.015;
      var ew=Math.sin(eT)*5;
      var tw=Math.sin(tT)*6;

      var svg=g('ami-svg');
      if(svg){
        if(stt==='lay')      svg.style.transform='rotate('+(facing>0?78:-78)+'deg) scale('+sc+')';
        else if(stt==='sleep') svg.style.transform='rotate(90deg) scale('+sc+')';
        else if(stt==='hang')  svg.style.transform='rotate(-20deg) scale('+sc+')';
        else if(stt==='stand') svg.style.transform='scale('+sc+') translateY(-8px)';
        else                   svg.style.transform='scale('+sc+')';
      }

      var eL=g('ami-ear-l'), eR=g('ami-ear-r'), tl=g('ami-tail');
      if(eL) eL.setAttribute('transform','rotate('+(-ew)+',25,38)');
      if(eR) eR.setAttribute('transform','rotate('+(ew)+',63,38)');
      if(tl) tl.setAttribute('cx',73+tw);

      var bo=blkV?'0.9':'0';
      if(g('ami-blink-l')) g('ami-blink-l').setAttribute('opacity',bo);
      if(g('ami-blink-r')) g('ami-blink-r').setAttribute('opacity',bo);
      if(g('ami-eye-l'))   g('ami-eye-l').setAttribute('opacity',blkV?'0':'1');
      if(g('ami-eye-r'))   g('ami-eye-r').setAttribute('opacity',blkV?'0':'1');
      if(g('ami-hl'))      g('ami-hl').setAttribute('opacity',happyV);
      if(g('ami-hr'))      g('ami-hr').setAttribute('opacity',happyV);
      if(happyV>.1){
        if(g('ami-eye-l')) g('ami-eye-l').setAttribute('opacity','0');
        if(g('ami-eye-r')) g('ami-eye-r').setAttribute('opacity','0');
      }

      var mo=mouthV;
      if(g('ami-mouth-n'))  g('ami-mouth-n').setAttribute('opacity',mo>0?'0':'1');
      if(g('ami-mouth-o'))  g('ami-mouth-o').setAttribute('opacity',mo>0?'.9':'0');
      if(g('ami-mouth-oi')) g('ami-mouth-oi').setAttribute('opacity',mo>0?'.8':'0');
      if(g('ami-t1'))       g('ami-t1').setAttribute('opacity',mo>0?'1':'0');
      if(g('ami-t2'))       g('ami-t2').setAttribute('opacity',mo>0?'1':'0');
      if(mo>0){
        var ry=(Math.sin(Date.now()/75)*2+3.8)+'';
        if(g('ami-mouth-o'))  g('ami-mouth-o').setAttribute('ry',ry);
        if(g('ami-mouth-oi')) g('ami-mouth-oi').setAttribute('ry',(parseFloat(ry)*.65)+'');
      }
      var fu=jumping?Math.abs(jVel)*.6:0;
      if(g('ami-fl')) g('ami-fl').setAttribute('cy',''+(103-fu*.3));
      if(g('ami-fr')) g('ami-fr').setAttribute('cy',''+(103-fu*.3));

      // 자동 방구 💨
      if(fartT > 280+Math.random()*230){
        fartT=0; doFart();
      }
      requestAnimationFrame(animLoop);
    }
    animLoop();

    // ===== 물리 루프 =====
    function physLoop(){
      // 점프
      if(jumping){
        jVel+=.75; jOffset+=jVel;
        if(jOffset>=0){
          jOffset=0; jVel=0; jumping=false;
          if(stt==='jump') stt='idle';
          var r=root.getBoundingClientRect();
          dust(r.left+r.width/2, r.bottom);
        }
        setPos();
      }

      // 이동 타이머
      moveTimer--;
      if(moveTimer<=0){
        moveTimer=55+Math.floor(Math.random()*110);
        tx = 70+Math.random()*(window.innerWidth-140);
        var rnd=Math.random();
        if(rnd<.38)       { stt='idle'; doJump(); }
        else if(rnd<.50)  { stt='idle'; doJump(); setTimeout(doJump,500); }
        else if(rnd<.62)  { stt='lay';   layTimer=80+Math.floor(Math.random()*60); }
        else if(rnd<.72)  { stt='sleep'; layTimer=110+Math.floor(Math.random()*70); }
        else if(rnd<.82)  { stt='hang';  layTimer=70+Math.floor(Math.random()*50); }
        else if(rnd<.90)  { stt='stand'; layTimer=60+Math.floor(Math.random()*50); }
        else              { stt='idle'; doJump(); setTimeout(doJump,400); }

        if(Math.random()>.75){
          var mm=['뿡~ 💨','나 여기 있어! 🐰','안녕~! ✨','폴짝!','쿠폰 받을래? 🎟️'];
          showBubble(mm[Math.floor(Math.random()*mm.length)], 2200);
        }
      }

      if((stt==='lay'||stt==='sleep'||stt==='hang'||stt==='stand')&&layTimer>0){
        layTimer--;
        if(layTimer<=0) stt='idle';
      }

      if(stt!=='lay'&&stt!=='sleep'){
        var dx=tx-ax;
        ax+=dx*.036;
        if(Math.abs(dx)>8) facing=(dx>0?1:-1);
      }
      ax=Math.max(60,Math.min(window.innerWidth-60,ax));
      setPos();
      requestAnimationFrame(physLoop);
    }
    physLoop();

    function doJump(){
      if(jumping) return;
      jumping=true; jVel=-(12+Math.random()*5); stt='jump';
      var r=root.getBoundingClientRect();
      dust(r.left+r.width/2, r.bottom);
    }

    // ===== 방구 💨 =====
    function doFart(){
      if(window._amiHidden) return;
      var r=root.getBoundingClientRect();
      var cx=r.width>0 ? r.left+r.width/2 : window.innerWidth/2;
      var cy=r.height>0 ? r.top+r.height/2 : window.innerHeight-100;
      fart(cx, cy);
      var fi=g('ami-fi');
      if(fi){ fi.setAttribute('opacity','1'); setTimeout(function(){ fi.setAttribute('opacity','0'); },700); }
      var msgs=['뿡!! 💨 실수야~','앗 방귀!! 😳💨','뿡뿡~! 🙊','으앗! 💨 ㅎㅎ','뿡!! 쏴리~ 💨'];
      var m=msgs[Math.floor(Math.random()*msgs.length)];
      showBubble(m, 2800);
      if(soundOn) speak(m);
    }

    // ===== 클릭 =====
    root.addEventListener('click', function(e){
      if(e.target.closest && e.target.closest('.ami-cb')) return;
      var now=Date.now();
      if(now-lastTap<350){ toggleChat(); lastTap=0; return; }
      lastTap=now;
      clickN++;
      var r=root.getBoundingClientRect();
      for(var i=0;i<8;i++) parts.push(new Pt(r.left+r.width/2+(Math.random()-.5)*20, r.top+r.height/2,'j'));
      if(clickN%5===0){ doFart(); doJump(); return; }
      doJump(); stt='idle';
      var msgs=['안녕!! 나 아미야~ 🐰','폴짝폴짝~! ✨','간질간질해!! 🌸','또 눌렀어? 😏','나랑 놀자! 💜','🔊버튼 누르면 목소리!','더블탭 = 채팅! 💬'];
      var msg=msgs[Math.floor(Math.random()*msgs.length)];
      showBubble(msg, 2800);
      if(soundOn) speak(msg);
      happyV=1; setTimeout(function(){ happyV=0; },2200);
    });

    // ===== 말풍선 =====
    var bub=g('ami-bubble'), bubTimer=null;
    function showBubble(txt,dur){
      if(window._amiHidden) return;
      if(!bub) return;
      bub.textContent=txt; bub.className='on';
      clearTimeout(bubTimer);
      if(dur>0) bubTimer=setTimeout(function(){ bub.className=''; },dur);
    }

    // ===== 소리 =====
    function updateSoundUI(){
      var sb=g('ami-sbtn-side');
      if(sb){ sb.textContent=soundOn?'🔊':'🔇'; sb.className='ami-cb '+(soundOn?'ami-act':'ami-muted'); }
      var stb=g('ami-stbtn');
      if(stb){ stb.textContent=soundOn?'ON':'OFF'; stb.className=soundOn?'on':'off'; }
      var stxt=g('ami-stxt');
      if(stxt) stxt.textContent=soundOn?'켜짐 — 목소리로 대화':'꺼짐 — 말풍선으로 표시';
    }
    function toggleSound(){
      soundOn=!soundOn; updateSoundUI();
      if(soundOn){ showBubble('소리 켰어!! 🔊',3000); doJump(); setTimeout(function(){ speak('소리 켰어!'); },300); }
      else { showBubble('조용 모드~ 🤫',2500); if(window.speechSynthesis) speechSynthesis.cancel(); doJump(); }
    }
    if(window.speechSynthesis) speechSynthesis.onvoiceschanged=function(){ speechSynthesis.getVoices(); };
    function speak(txt){
      if(window._amiHidden||!soundOn||!txt||!window.speechSynthesis) return;
      speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(txt.replace(/[\u{1F000}-\u{1FFFF}]/gu,''));
      u.lang='ko-KR'; u.pitch=2.0; u.rate=1.18; u.volume=.95;
      var vv=speechSynthesis.getVoices();
      for(var i=0;i<vv.length;i++){ if(vv[i].lang.indexOf('ko')>=0){ u.voice=vv[i]; break; } }
      u.onstart=function(){ mouthV=1; }; u.onend=function(){ mouthV=0; };
      speechSynthesis.speak(u);
    }

    // ===== 채팅 =====
    function toggleChat(){
      chatOpen=!chatOpen;
      var panel=g('ami-chat');
      if(panel) panel.classList.toggle('open',chatOpen);
      var btn=g('ami-chat-btn');
      if(btn) btn.classList.toggle('ami-act',chatOpen);
      if(chatOpen){ if(bub) bub.className=''; setTimeout(function(){ var inp=g('ami-inp'); if(inp) inp.focus(); },400); }
    }

    // ===== Claude API =====
    var SYS='당신은 아미(Ami)예요! PetCTT의 귀여운 흰토끼 AI 친구. 6~7살 소녀처럼 말함. 짧고 귀엽게, 이모지 많이! 2~3문장 이내. 한국어. PetCTT 쿠폰게임, 구름장터, AI통역, 매장입점 안내.';
    async function callAmi(msg){
      if(window.PAYWALL&&!PAYWALL.canUse('chat')){ PAYWALL.showPopup('chat'); return '아미가 오늘 너무 많이 대화했어~ Pro로 업그레이드하면 무제한! ⚡'; }
      if(window.PAYWALL) PAYWALL.addCount('chat');
      hist.push({role:'user',content:msg});
      // 🐰 아미 브레인 우선 사용!
      if(window.__amiBrain && window.__amiBrain.call){
        try{
          var r = await window.__amiBrain.call(msg);
          hist.push({role:'assistant',content:r}); return r;
        }catch(e){ console.warn('amiBrain err',e); }
      }
      // 폴백
      try{
        var res=await fetch('https://api.anthropic.com/v1/messages',{
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:SYS,messages:hist.slice(-10)})
        });
        var d=await res.json();
        var r2=(d.content&&d.content[0]&&d.content[0].text)||'앗 잠깐 연결 이상해~ 🙊';
        hist.push({role:'assistant',content:r2}); return r2;
      }catch(e){ return '아이고~ 잠깐 연결 끊겼어! 💜'; }
    }

    var log=g('ami-log');
    function addU(t){ if(!log) return; var d=document.createElement('div'); d.className='ami-mu'; d.textContent=t; log.appendChild(d); log.scrollTop=log.scrollHeight; }
    function addDots(){ if(!log) return null; var d=document.createElement('div'); d.className='ami-ma'; d.innerHTML='<div class="ami-ma-nm">🐰 아미</div><div class="ami-dots"><span></span><span></span><span></span></div>'; log.appendChild(d); log.scrollTop=log.scrollHeight; return d; }
    function addText(){ if(!log) return document.createElement('div'); var d=document.createElement('div'); d.className='ami-ma'; d.innerHTML='<div class="ami-ma-nm">🐰 아미</div><div></div>'; log.appendChild(d); log.scrollTop=log.scrollHeight; return d.querySelector('div:last-child'); }

    async function send(){
      var inp=g('ami-inp'); if(!inp) return;
      var t=inp.value.trim(); if(!t) return; inp.value='';
      if(!chatOpen) toggleChat();
      addU(t); doJump();
      if(Math.random()>.68) setTimeout(doFart,600);
      var dots=addDots();
      var rep=await callAmi(t);
      if(dots) dots.remove();
      var td=addText();
      showBubble(rep.substring(0,50)+(rep.length>50?'…':''), 5500);
      mouthV=soundOn?1:0; happyV=1;
      var ii=0;
      var ti=setInterval(function(){
        if(ii<rep.length){ td.textContent+=rep[ii++]; if(log) log.scrollTop=log.scrollHeight; }
        else{ clearInterval(ti); mouthV=0; setTimeout(function(){ happyV=0; },2500); }
      },20);
      speak(rep);
    }

    // ===== 전역 노출 =====
    window.amiToggleSound = toggleSound;
    window.amiToggleMic   = function(){ showBubble('마이크 기능 준비 중이야~ 🎤',2500); };
    window.amiToggleChat  = toggleChat;
    window.amiSend        = send;
    window.amiQ           = function(q){ var i=g('ami-inp'); if(i){ i.value=q; send(); } };
    window.amiDoFart      = doFart;
    window.amiDoJump      = doJump;
    window.activateAmi    = function(){ doJump(); doFart(); };

    // ===== 🌟 등장! =====
    doJump();
    fart(ax, window.innerHeight-100, 18);
    setTimeout(function(){
      showBubble('안녕!! 나 아미야~ 🐰💜\n🔊누르면 목소리도 나와!', 6000);
      happyV=1; setTimeout(function(){ happyV=0; },3000);
      if(log){
        var td=addText();
        var full='안녕!! 나 아미야~ 🐰💜 뭐든 물어봐!';
        var ii=0;
        var ti=setInterval(function(){ if(ii<full.length) td.textContent+=full[ii++]; else clearInterval(ti); },28);
      }
    },500);
  }

  // DOM 준비 후 실행 (외부 스크립트는 DOMContentLoaded 놓칠 수 있음)
  // readyState 체크 + 여러 fallback
  function tryInit(){
    if(document.getElementById('ami-root') && document.getElementById('ami-particle-canvas')){
      init();
    } else {
      // DOM 아직 준비 안됨 → 재시도
      setTimeout(tryInit, 50);
    }
  }
  tryInit();

})();
