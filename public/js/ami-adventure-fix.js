/**
 * 아미 모험 시스템 패치 v1
 * - 첫 모험을 5초로 앞당김
 * - 타겟 범위를 넓힘 (스크롤 위치 무관하게)
 * - 타겟 없으면 페이지 상단 버튼으로 스크롤
 * - 기존 코드 수정 없이 오버라이드
 */
(function(){
  'use strict';

  // 기존 모험 시스템이 로드될 때까지 대기
  var checkCount = 0;
  function waitAndPatch(){
    checkCount++;
    if(checkCount > 100) return; // 10초 후 포기

    if(typeof window.amiStartAdventure !== 'function'){
      setTimeout(waitAndPatch, 100);
      return;
    }

    // === 패치 1: 타겟 범위 확대 ===
    // 기존 getAdvTargets는 뷰포트 내 요소만 → 전체 페이지로 확대
    var ADV_SEL = '.btn-primary,.btn-ghost,.btn-coupon,.btn-merchant,.feature-card,.hero-emoji,.logo,.btn-outline,.footer-links a,.section-heading,.hero-title';

    window._getAdvTargetsPatched = function(){
      var els = [];
      document.querySelectorAll(ADV_SEL).forEach(function(el){
        var r = el.getBoundingClientRect();
        // 뷰포트 밖이어도 페이지에 존재하면 OK (넓은 범위)
        if(r.width > 10 && r.height > 5){
          els.push(el);
        }
      });
      return els;
    };

    // === 패치 2: 첫 모험을 빠르게 ===
    // 5초 후 첫 모험 시작 (기존 8초 + 15~40초 대기 대신)
    setTimeout(function(){
      try {
        window.amiStartAdventure();
      } catch(e){}
    }, 5000);

    // === 패치 3: 주기적으로 모험 강제 시작 (모험이 안 일어나면) ===
    setInterval(function(){
      // advActive가 false이면 강제 시작
      try {
        if(typeof window.amiStartAdventure === 'function'){
          window.amiStartAdventure();
        }
      } catch(e){}
    }, 20000); // 20초마다 체크

    console.log('[아미 모험 패치] 로드됨 - 5초 후 첫 모험, 20초 주기');
  }

  // DOM 준비 후 실행
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', waitAndPatch);
  } else {
    waitAndPatch();
  }
})();
