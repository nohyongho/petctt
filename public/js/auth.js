// ========== 발로레 통합 인증 v1 ==========
// petctt.com + airctt.com 공통 세션 관리
// Google / Kakao / Naver 통합

(function(){
'use strict';

var SUPABASE_URL = 'https://nlsiwrwiyozpiofrmzxa.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sc2l3cndpeW96cGlvZnJtenhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTc4NzcsImV4cCI6MjA3NjczMzg3N30.hurd7QNUJ-JVppETyDnCwU97F1Z3jkWszYRM9NhSUAg';

// 통합 세션 키
var KEYS = {
  unified: 'petctt_unified_auth',      // 메인 세션
  airctt:  'airctt_consumer_user',      // AIRCTT 호환
  session: 'airctt_consumer_session'   // AIRCTT 세션 호환
};

// ===== 세션 읽기/쓰기 =====
function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.unified) || 'null');
  } catch(e) { return null; }
}

function setUser(user) {
  if (!user) return;
  var data = JSON.stringify(user);
  // 양쪽 키에 동시 저장
  localStorage.setItem(KEYS.unified, data);
  localStorage.setItem(KEYS.airctt, data);
  localStorage.setItem(KEYS.session, JSON.stringify({
    access_token: user.token || '',
    user: user
  }));
}

function clearUser() {
  Object.values(KEYS).forEach(function(k){ localStorage.removeItem(k); });
  // 추가 정리
  localStorage.removeItem('petctt_user');
  localStorage.removeItem('petctt_theme'); // 테마는 유지하지 않음
}

function isLoggedIn() {
  return getUser() !== null;
}

// ===== Supabase REST 호출 =====
function sbFetch(path, opts) {
  opts = opts || {};
  opts.headers = Object.assign({
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
  }, opts.headers || {});
  return fetch(SUPABASE_URL + path, opts);
}

// Supabase에서 유저 정보 동기화
async function syncUserFromSupabase(userId) {
  try {
    var res = await sbFetch('/rest/v1/users?id=eq.' + userId + '&select=*');
    var rows = await res.json();
    if (rows && rows.length > 0) return rows[0];
  } catch(e) {}
  return null;
}

// Supabase에 유저 저장/업데이트
async function upsertUser(userData) {
  try {
    await sbFetch('/rest/v1/users', {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal,resolution=merge-duplicates' },
      body: JSON.stringify({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture || '',
        provider: userData.provider || 'unknown',
        plan_id: userData.plan_id || 'free',
        updated_at: new Date().toISOString()
      })
    });
  } catch(e) {}
}

// ===== 카카오 로그인 =====
async function loginWithKakao() {
  return new Promise(function(resolve, reject) {
    if (!window.Kakao || !Kakao.isInitialized()) {
      reject(new Error('Kakao SDK 없음'));
      return;
    }
    Kakao.Auth.login({
      success: async function(authObj) {
        try {
          Kakao.API.request({
            url: '/v2/user/me',
            success: async function(res) {
              var kakaoAccount = res.kakao_account || {};
              var profile = kakaoAccount.profile || {};
              var user = {
                id: 'kakao_' + res.id,
                email: kakaoAccount.email || '',
                name: profile.nickname || '카카오 사용자',
                picture: profile.profile_image_url || '',
                provider: 'kakao',
                plan_id: 'free',
                token: authObj.access_token,
                logged_at: new Date().toISOString()
              };
              // Supabase 동기화
              var sbUser = await syncUserFromSupabase(user.id);
              if (sbUser) {
                user.plan_id = sbUser.plan_id || 'free';
                user.name = sbUser.name || user.name;
              } else {
                await upsertUser(user);
              }
              setUser(user);
              resolve(user);
            },
            fail: function(e) { reject(e); }
          });
        } catch(e) { reject(e); }
      },
      fail: function(e) { reject(e); }
    });
  });
}

// ===== 네이버 로그인 =====
function loginWithNaver() {
  // 네이버는 redirect 방식 → 결과는 URL 파라미터로 받음
  var clientId = 'YOUR_NAVER_CLIENT_ID'; // 설정 필요
  var redirectUri = encodeURIComponent(window.location.origin + '/auth/naver/callback');
  var state = Math.random().toString(36).substring(2);
  localStorage.setItem('naver_state', state);
  window.location.href = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + clientId + '&redirect_uri=' + redirectUri + '&state=' + state;
}

// ===== 구글 로그인 (Supabase OAuth - 직접 redirect) =====
function loginWithGoogle() {
  // Supabase OAuth 직접 redirect (fetch 불필요, 403 해결)
  var redirectTo = window.location.origin;
  // petctt.com 또는 airctt.com 감지
  if (window.location.hostname.includes('airctt')) {
    redirectTo = 'https://www.airctt.com';
  } else {
    redirectTo = 'https://www.petctt.com';
  }
  var oauthUrl = SUPABASE_URL + '/auth/v1/authorize' +
    '?provider=google' +
    '&redirect_to=' + encodeURIComponent(redirectTo) +
    '&scopes=email+profile';
  window.location.href = oauthUrl;
}

// ===== OAuth 콜백 처리 (URL 파라미터) =====
async function handleOAuthCallback() {
  var params = new URLSearchParams(window.location.search);
  var hash = new URLSearchParams(window.location.hash.substring(1));

  // Supabase OAuth 콜백 (hash에 access_token)
  var accessToken = hash.get('access_token');
  if (accessToken) {
    try {
      var res = await fetch(SUPABASE_URL + '/auth/v1/user', {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + accessToken
        }
      });
      var sbUser = await res.json();
      if (sbUser && sbUser.id) {
        var meta = sbUser.user_metadata || {};
        var user = {
          id: sbUser.id,
          email: sbUser.email || '',
          name: meta.full_name || meta.name || sbUser.email,
          picture: meta.avatar_url || meta.picture || '',
          provider: sbUser.app_metadata && sbUser.app_metadata.provider || 'google',
          plan_id: 'free',
          token: accessToken,
          logged_at: new Date().toISOString()
        };
        // DB에서 plan_id 가져오기
        var dbUser = await syncUserFromSupabase(user.id);
        if (dbUser) {
          user.plan_id = dbUser.plan_id || 'free';
        } else {
          await upsertUser(user);
        }
        setUser(user);
        // URL 정리 후 이동
        window.history.replaceState({}, document.title, window.location.pathname);
        return user;
      }
    } catch(e) { console.error('OAuth 콜백 오류:', e); }
  }

  // 기존 Cloudflare Worker 방식 (user 파라미터)
  var userParam = params.get('user');
  if (userParam) {
    try {
      var user = JSON.parse(decodeURIComponent(userParam));
      if (user && user.id) {
        user.logged_at = new Date().toISOString();
        var dbUser = await syncUserFromSupabase(user.id);
        if (dbUser) {
          user.plan_id = dbUser.plan_id || 'free';
        } else {
          await upsertUser(user);
        }
        setUser(user);
        window.history.replaceState({}, document.title, window.location.pathname);
        return user;
      }
    } catch(e) {}
  }

  return null;
}

// ===== 로그아웃 =====
function logout(redirectUrl) {
  // 카카오 로그아웃
  try {
    if (window.Kakao && Kakao.isInitialized() && Kakao.Auth.getAccessToken()) {
      Kakao.Auth.logout();
    }
  } catch(e) {}
  // 세션 삭제
  clearUser();
  // 리다이렉트
  if (redirectUrl) {
    window.location.href = redirectUrl;
  } else {
    window.location.reload();
  }
}

// ===== 페이지 접근 제한 =====
function requireLogin(redirectUrl) {
  if (!isLoggedIn()) {
    var target = redirectUrl || window.location.href;
    localStorage.setItem('auth_redirect', target);
    // 로그인 페이지로 이동 (또는 팝업)
    showLoginRequired();
    return false;
  }
  return true;
}

function showLoginRequired() {
  var old = document.getElementById('auth-required-popup');
  if (old) old.remove();

  var overlay = document.createElement('div');
  overlay.id = 'auth-required-popup';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px)';

  var box = document.createElement('div');
  box.style.cssText = 'background:#0a0020;border:1.5px solid rgba(99,102,241,.4);border-radius:24px;padding:32px 24px;width:min(360px,100%);text-align:center;box-shadow:0 0 60px rgba(99,102,241,.2)';
  box.innerHTML = [
    '<div style="font-size:48px;margin-bottom:12px">🔐</div>',
    '<div style="font-size:18px;font-weight:700;color:#f1f5f9;margin-bottom:8px">로그인이 필요해요</div>',
    '<div style="font-size:13px;color:#94a3b8;margin-bottom:24px;line-height:1.6">이 기능을 사용하려면<br>로그인해 주세요</div>',
    '<button onclick="ValoreAuth.loginWithKakao().then(function(){location.reload()})" style="width:100%;padding:13px;border-radius:14px;border:none;background:#FEE500;color:#3A1D1D;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:8px;font-family:inherit">',
    '💬 카카오로 로그인</button>',
    '<button onclick="ValoreAuth.loginWithGoogle()" style="width:100%;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#f1f5f9;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:8px;font-family:inherit">',
    'G Google로 로그인</button>',
    '<button onclick="document.getElementById(\'auth-required-popup\').remove()" style="width:100%;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:transparent;color:#64748b;font-size:12px;cursor:pointer;font-family:inherit">',
    '나중에 할게요</button>'
  ].join('');

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) overlay.remove();
  });
}

// ===== 초기화 =====
async function init() {
  // OAuth 콜백 처리 (Supabase는 hash로 access_token 반환)
  var needsCallback = 
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('error=') ||
    window.location.search.includes('user=') ||
    window.location.search.includes('code=');

  if (needsCallback) {
    var user = await handleOAuthCallback();
    if (user) {
      console.log('[ValoreAuth] 로그인 성공:', user.name, '/', user.provider);
      // 로그인 성공 시 hash 제거
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title,
          window.location.pathname + window.location.search);
      }
    }
  }
  // 로그인 상태 UI 업데이트 이벤트
  window.dispatchEvent(new CustomEvent('auth:ready', { detail: getUser() }));
}

// 전역 노출
window.ValoreAuth = {
  getUser: getUser,
  isLoggedIn: isLoggedIn,
  loginWithKakao: loginWithKakao,
  loginWithNaver: loginWithNaver,
  loginWithGoogle: loginWithGoogle,
  logout: logout,
  requireLogin: requireLogin,
  handleOAuthCallback: handleOAuthCallback,
  syncUserFromSupabase: syncUserFromSupabase
};

// 초기화 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();

// ===== 아미 토끼 강제 부활 =====
(function fixAmi(){
  function show(){
    var root = document.getElementById('ami-root');
    if(!root) return;
    // 강제 표시
    root.style.setProperty('position','fixed','important');
    root.style.setProperty('display','block','important');
    root.style.setProperty('visibility','visible','important');
    root.style.setProperty('opacity','1','important');
    root.style.setProperty('z-index','99990','important');
    root.style.setProperty('bottom','24px','important');
    root.style.setProperty('pointer-events','auto','important');
    root.style.setProperty('width','88px','important');
    root.style.setProperty('height','108px','important');
    // left가 0이면 중앙으로 보정
    var rect = root.getBoundingClientRect();
    if(rect.left <= 0 || rect.right <= 0 || rect.width === 0){
      root.style.setProperty('left','50%','important');
      root.style.setProperty('transform','translateX(-50%)','important');
    }
    console.log('[AmiFixByAuth] 아미 강제 표시 완료', rect.width+'x'+rect.height);
  }
  // 여러 타이밍에 시도
  setTimeout(show, 500);
  setTimeout(show, 1500);
  setTimeout(show, 3000);
  setTimeout(show, 5000);
})();
