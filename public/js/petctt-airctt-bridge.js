/**
 * PetCTT ↔ AIRCTT 세션 브리지 v1.0
 * T15: 공통 user_id 매핑 + 세션 전달
 * T16: AIRCTT 발행쿠폰 → PetCTT 장터 자동 노출
 */

const BRIDGE_CONFIG = {
  SUPABASE_URL: 'https://nlsiwrwiyozpiofrmzxa.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sc2l3cndpeW96cGlvZnJtenhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTc4NzcsImV4cCI6MjA3NjczMzg3N30.hurd7QNUJ-JVppETyDnCwU97F1Z3jkWszYRM9NhSUAg',
  PETCTT_ORIGIN: 'https://petctt.com',
  AIRCTT_ORIGIN: 'https://www.airctt.com',
};

const SB = BRIDGE_CONFIG;

// ===== T15: 세션 브리지 =====

/**
 * PetCTT 사용자를 AIRCTT로 이동할 때 세션 전달
 * usage: bridgeToAirCTT('/consumer') or bridgeToAirCTT('/merchant')
 */
async function bridgeToAirCTT(path = '/consumer') {
  const user = getPetCTTUser();
  if (!user) {
    window.open(BRIDGE_CONFIG.AIRCTT_ORIGIN + path, '_blank');
    return;
  }

  try {
    // 세션 토큰 생성 (1시간 유효)
    const bridgeToken = btoa(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      plan_id: user.plan_id || 'free',
      source: 'petctt',
      exp: Math.floor(Date.now() / 1000) + 3600
    }));

    // localStorage에 airctt 세션 저장 (같은 브라우저 공유)
    localStorage.setItem('airctt_consumer_session', JSON.stringify({
      access_token: bridgeToken,
      user: user
    }));
    localStorage.setItem('airctt_consumer_user', JSON.stringify(user));

    // 브리지 토큰과 함께 이동
    const url = new URL(BRIDGE_CONFIG.AIRCTT_ORIGIN + path);
    url.searchParams.set('bridge_token', bridgeToken);
    url.searchParams.set('from', 'petctt');
    window.open(url.toString(), '_blank');

  } catch(e) {
    console.log('Bridge error:', e);
    window.open(BRIDGE_CONFIG.AIRCTT_ORIGIN + path, '_blank');
  }
}

function getPetCTTUser() {
  try {
    if (typeof PetCTTAuth !== 'undefined') {
      const u = PetCTTAuth.getUser(); if (u) return u;
    }
    return JSON.parse(
      localStorage.getItem('petctt_user') ||
      localStorage.getItem('airctt_consumer_user') || 'null'
    );
  } catch(e) { return null; }
}

// ===== T16: AIRCTT 승인쿠폰 → PetCTT 장터 실시간 연동 =====

/**
 * AIRCTT에서 APPROVED된 쿠폰을 PetCTT 장터에 자동 노출
 * (coupons 테이블을 공유하므로 approval_status=APPROVED 필터만 하면 됨)
 */
async function syncAirCTTCoupons() {
  try {
    const res = await fetch(
      `${SB.SUPABASE_URL}/rest/v1/coupons?is_active=eq.true&approval_status=eq.APPROVED&order=created_at.desc`,
      { headers: { 'apikey': SB.SUPABASE_KEY, 'Authorization': `Bearer ${SB.SUPABASE_KEY}` } }
    );
    const coupons = await res.json();
    console.log(`[Bridge] AIRCTT 승인쿠폰 ${coupons.length}건 동기화됨`);
    return coupons;
  } catch(e) {
    console.log('[Bridge] 쿠폰 동기화 오류:', e);
    return [];
  }
}

/**
 * 쿠폰찾기 버튼 → AIRCTT consumer로 세션 포함 이동
 */
function goToCouponSearch() {
  bridgeToAirCTT('/consumer');
}

/**
 * 매장입점 버튼 → AIRCTT merchant로 세션 포함 이동
 */
function goToMerchantSignup() {
  bridgeToAirCTT('/merchant');
}

// ===== 양방향 로그아웃 연동 =====
function bridgeLogout() {
  // 모든 세션 키 삭제
  var keys = [
    'petctt_unified_auth',
    'petctt_user',
    'airctt_consumer_user',
    'airctt_consumer_session',
    'airctt_merchant_user',
    'airctt_merchant_session'
  ];
  keys.forEach(function(k){ localStorage.removeItem(k); });

  // 카카오 로그아웃
  try {
    if (window.Kakao && Kakao.isInitialized && Kakao.isInitialized()) {
      if (Kakao.Auth && Kakao.Auth.getAccessToken && Kakao.Auth.getAccessToken()) {
        Kakao.Auth.logout();
      }
    }
  } catch(e) {}

  console.log('[Bridge] 양방향 로그아웃 완료');
}

// ValoreAuth.logout에 브리지 연결
function setupBridgeLogout() {
  if (window.ValoreAuth) {
    var origLogout = ValoreAuth.logout.bind(ValoreAuth);
    ValoreAuth.logout = function(redirectUrl) {
      bridgeLogout();
      origLogout(redirectUrl);
    };
  }
}

// auth:ready 이벤트에서 브리지 세션 복원
window.addEventListener('auth:ready', function(e) {
  var user = e.detail;
  if (user) {
    // PetCTT 로그인 시 AIRCTT 세션도 동기화
    var data = JSON.stringify(user);
    localStorage.setItem('airctt_consumer_user', data);
    localStorage.setItem('airctt_consumer_session', JSON.stringify({
      access_token: user.token || '',
      user: user
    }));
  }
  setupBridgeLogout();
});

// getPetCTTUser를 ValoreAuth 우선으로 업데이트
function getPetCTTUserV2() {
  try {
    if (window.ValoreAuth) {
      var u = ValoreAuth.getUser();
      if (u) return u;
    }
    return JSON.parse(
      localStorage.getItem('petctt_unified_auth') ||
      localStorage.getItem('petctt_user') ||
      localStorage.getItem('airctt_consumer_user') || 'null'
    );
  } catch(e) { return null; }
}

// 전역 노출
window.PetCTTBridge = {
  bridgeToAirCTT: bridgeToAirCTT,
  bridgeLogout: bridgeLogout,
  syncAirCTTCoupons: syncAirCTTCoupons,
  goToCouponSearch: goToCouponSearch,
  goToMerchantSignup: goToMerchantSignup,
  getPetCTTUser: getPetCTTUserV2
};

console.log('[PetCTT Bridge v2.0] 로드됨 - petctt ↔ airctt 양방향 세션 연동 완료');
