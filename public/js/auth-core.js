/**
 * PetCTT Auth Core v1.0
 * 모든 페이지 공통 인증 모듈
 * <script src="/public/js/auth-core.js"></script>
 * PetCTTAuth.init();
 */
const PetCTTAuth = (function() {
    'use strict';
    const WORKER = 'https://petctt-auth.zeus1404.workers.dev';
    const TK = 'petctt_token';
    const UK = 'petctt_user';
    let _user = null;
    let _cbs = [];

                      function _save(token, user, refresh) {
                            try { localStorage.setItem(TK, token); localStorage.setItem(UK, JSON.stringify(user)); if(refresh) localStorage.setItem('petctt_refresh_token', refresh); } catch(e) {}
                      }
    function _clear() {
          try { localStorage.removeItem(TK); localStorage.removeItem(UK); } catch(e) {}
          _user = null;
    }
    function _token() { try { return localStorage.getItem(TK); } catch(e) { return null; } }
    function _fire(u) { _cbs.forEach(fn => { try { fn(u); } catch(e) {} }); }

                      function _consumeUrl() {
                            const p = new URLSearchParams(location.search);
                            if (p.get('login') === 'success' && p.get('token')) {
                                    try {
                                              const payload = JSON.parse(atob(p.get('token').split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
                                              _user = { id:payload.id, email:payload.email, name:payload.name||'', picture:payload.picture||'', provider:payload.provider||'google', plan_id:payload.plan_id||'free', exp:payload.exp };
                                              _save(p.get('token'), _user);
                                    } catch(e) {}
                                    history.replaceState({}, '', location.pathname);
                                    return true;
                            }
                            if (p.get('login') === 'fail') history.replaceState({}, '', location.pathname);
                            return false;
                      }

                      async function _verify(token) {
                            try {
                                    const r = await fetch(`${WORKER}/api/auth/me`, { headers:{ Authorization:`Bearer ${token}` }, signal:AbortSignal.timeout(5000) });
                                    if (!r.ok) return null;
                                    const d = await r.json();
                                    return d.user || null;
                            } catch(e) { return null; }
                      }

                      async function init() {
                            _consumeUrl();
                            const token = _token();
                            if (!token) { _fire(null); return null; }
                            try { const c = localStorage.getItem(UK); if(c) { _user=JSON.parse(c); _fire(_user); } } catch(e){}
                            const sv = await _verify(token);
                            if (sv) { _user=sv; localStorage.setItem(UK,JSON.stringify(sv)); _fire(_user); }
                            else if (!_user) { _clear(); _fire(null); }
                            return _user;
                      }

                      function getUser() { return _user; }
    function getToken() { return _token(); }
    function onChange(cb) { _cbs.push(cb); if(_user) cb(_user); }
    function login(provider) { location.href = `${WORKER}/api/auth/${provider||'google'}`; }
    function logout() { _clear(); _fire(null); }

                      function requireLogin() {
                            if (_user) return true;
                            _showModal(); return false;
                      }

                      async function apiFetch(path, opts={}) {
                            const t = _token();
                            const h = { 'Content-Type':'application/json', ...(opts.headers||{}), ...(t?{Authorization:`Bearer ${t}`}:{}) };
                            const r = await fetch(`${WORKER}${path}`, {...opts, headers:h});
                            if (r.status===401) { _clear(); _fire(null); }
                            return r;
                      }

                      function _showModal() {
                            if (document.getElementById('plm')) return;
                            const d = document.createElement('div'); d.id='plm';
                            d.innerHTML = `<div style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center"><div class="plm-bg" style="position:absolute;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px)"></div><div style="position:relative;background:#0d0d1a;border:1px solid rgba(139,92,246,.3);border-radius:24px;padding:40px 32px;width:min(360px,90vw);text-align:center;box-shadow:0 0 60px rgba(139,92,246,.2)"><div style="font-size:32px;margin-bottom:12px">🐾 PetCTT</div><h2 style="font-size:20px;font-weight:700;color:#f1f5f9;margin-bottom:8px">로그인이 필요해요</h2><p style="font-size:14px;color:#94a3b8;margin-bottom:28px">반려동물과 대화하려면 로그인하세요</p><button onclick="PetCTTAuth.login('google')" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;border-radius:12px;border:none;font-size:15px;font-weight:600;cursor:pointer;background:#fff;color:#1a1a1a;margin-bottom:12px">🔵 Google로 계속하기</button><button onclick="PetCTTAuth.login('kakao')" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;border-radius:12px;border:none;font-size:15px;font-weight:600;cursor:pointer;background:#FEE500;color:#1a1a1a">💬 카카오로 계속하기</button><button onclick="document.getElementById('plm').remove()" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,.08);border:none;color:#94a3b8;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px">✕</button></div></div>`;
                            document.body.appendChild(d);
                            d.querySelector('.plm-bg').onclick = () => d.remove();
                      }

                      function renderHeader(user) {
                            const s = document.getElementById('auth-slot');
                            if (!s) return;
                            if (user) {
                                    s.innerHTML = `<div id="auth-chip" style="display:flex;align-items:center;gap:8px;padding:5px 12px 5px 6px;background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.3);border-radius:20px;cursor:pointer;position:relative"><img src="${user.picture||''}" onerror="this.style.display='none'" style="width:28px;height:28px;border-radius:50%;object-fit:cover"><span style="font-size:13px;font-weight:600;color:#c4b5fd">${(user.name||'').split(' ')[0]||'User'}</span></div><div id="auth-dd" style="display:none;position:absolute;top:calc(100%+8px);right:0;background:#0f0f1e;border:1px solid rgba(139,92,246,.2);border-radius:12px;padding:8px;min-width:160px;z-index:200;box-shadow:0 8px 32px rgba(0,0,0,.5)"><a href="/pages/pricing.html" style="display:block;padding:9px 12px;color:#cbd5e1;font-size:13px;text-decoration:none;border-radius:8px">⚡ 요금제</a><hr style="border:none;border-top:1px solid rgba(255,255,255,.06);margin:4px 0"><button onclick="PetCTTAuth.logout();location.reload()" style="display:block;width:100%;padding:9px 12px;color:#cbd5e1;font-size:13px;background:none;border:none;text-align:left;cursor:pointer;border-radius:8px">🚪 로그아웃</button></div>`;
                                    document.getElementById('auth-chip').onclick = (e) => { e.stopPropagation(); const dd=document.getElementById('auth-dd'); dd.style.display=dd.style.display==='none'?'block':'none'; };
                                    document.addEventListener('click', () => { const dd=document.getElementById('auth-dd'); if(dd) dd.style.display='none'; });
                            } else {
                                                s.innerHTML = '';
                                                s.style.cssText = 'position:relative;display:inline-block;';
                                                var lBtn = document.createElement('button');
                                                lBtn.innerHTML = '🔑 로그인 <span style="font-size:0.7em">▼</span>';
                                                lBtn.style.cssText = 'padding:8px 18px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;border-radius:20px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;';
                                                var lMenu = document.createElement('div');
                                                lMenu.style.cssText = 'display:none;position:absolute;top:110%;right:0;background:rgba(20,20,30,0.95);border:1px solid rgba(139,92,246,0.3);border-radius:12px;overflow:hidden;min-width:200px;z-index:9999;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.5);';
                                                [{icon:'🔵',label:'Google로 계속하기',provider:'google',bg:'#fff',color:'#1a1a1a'},{icon:'💬',label:'카카오로 계속하기',provider:'kakao',bg:'#FEE500',color:'#1a1a1a'},{icon:'🟢',label:'네이버로 계속하기',provider:'naver',bg:'#03C75A',color:'#fff'}].forEach(function(p){
                                                                        var item = document.createElement('button');
                                                                        item.textContent = p.icon + ' ' + p.label;
                                                                        item.style.cssText = 'display:block;width:100%;padding:12px 16px;border:none;font-size:14px;font-weight:600;cursor:pointer;background:'+p.bg+';color:'+p.color+';border-bottom:1px solid rgba(255,255,255,0.06);';
                                                                        item.onmouseover = function(){ this.style.opacity='0.85'; };
                                                                        item.onmouseout = function(){ this.style.opacity='1'; };
                                                                        item.onclick = function(e){ e.stopPropagation(); PetCTTAuth.login(p.provider); };
                                                                        lMenu.appendChild(item);
                                                });
                                                lBtn.onclick = function(e){ e.stopPropagation(); lMenu.style.display = lMenu.style.display==='none'?'block':'none'; };
                                                document.addEventListener('click', function(){ lMenu.style.display='none'; });
                                                s.appendChild(lBtn);
                                                s.appendChild(lMenu);
                            }
                      }

                      function _autoInit() {
                            onChange(renderHeader);
                            if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
                            else init();
                      }
    _autoInit();

    // === 토큰 자동 갱신 v1 ===
    var _refreshing = false;
    async function _refreshToken() {
          if(_refreshing) return false;
          _refreshing = true;
          try {
                var rt = null; try { rt = localStorage.getItem('petctt_refresh_token'); } catch(e){}
                if(!rt) { _refreshing=false; return false; }
                var r = await fetch(WORKER+'/api/auth/refresh', {
                      method:'POST', headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({refreshToken:rt}), signal:AbortSignal.timeout(8000)
                });
                if(!r.ok) { _refreshing=false; _clear(); _fire(null); return false; }
                var d = await r.json();
                if(d.accessToken) {
                      _save(d.accessToken, d.user||_user, d.refreshToken||rt);
                      if(d.user) { _user=d.user; _fire(_user); }
                      _refreshing=false; return true;
                }
                _refreshing=false; return false;
          } catch(e) { _refreshing=false; return false; }
    }

    var _refreshInterval = null;
    function _startAutoRefresh() {
          if(_refreshInterval) return;
          _refreshInterval = setInterval(function(){ if(_token()) _refreshToken(); }, 45*60*1000);
    }

    // apiFetch 401 자동 갱신 래퍼
    var _origApiFetch = apiFetch;
    async function _smartApiFetch(path, opts) {
          var r = await _origApiFetch(path, opts);
          if(r.status === 401) {
                var ok = await _refreshToken();
                if(ok) return _origApiFetch(path, opts);
          }
          return r;
    }

    // init 후 자동 갱신 시작
    var _origInit = init;
    async function _smartInit() {
          var u = await _origInit();
          _startAutoRefresh();
          return u;
    }

                      return { init:_smartInit, getUser, getToken, onChange, login, logout, requireLogin, apiFetch:_smartApiFetch, renderHeader, refreshToken:_refreshToken };
})();
