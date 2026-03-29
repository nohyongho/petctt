// PetCTT Paywall v2 - 클린 버전
var PAYWALL = {
  LIMITS: {
    free:    { scan: 3,    chat: 10 },
    pro:     { scan: 9999, chat: 9999 },
    premium: { scan: 9999, chat: 9999 }
  },

  getPlan: function() {
    try {
      var u = JSON.parse(localStorage.getItem('petctt_user') || 'null');
      return (u && u.plan_id) ? u.plan_id : 'free';
    } catch(e) { return 'free'; }
  },

  getCount: function(type) {
    var key = 'petctt_usage_' + type + '_' + new Date().toDateString();
    return parseInt(localStorage.getItem(key) || '0');
  },

  addCount: function(type) {
    var key = 'petctt_usage_' + type + '_' + new Date().toDateString();
    localStorage.setItem(key, this.getCount(type) + 1);
  },

  canUse: function(type) {
    var plan = this.getPlan();
    var limit = (this.LIMITS[plan] && this.LIMITS[plan][type] != null)
                ? this.LIMITS[plan][type] : 3;
    return this.getCount(type) < limit;
  },

  remaining: function(type) {
    var plan = this.getPlan();
    var limit = (this.LIMITS[plan] && this.LIMITS[plan][type] != null)
                ? this.LIMITS[plan][type] : 3;
    if (limit >= 9999) return '무제한';
    return Math.max(0, limit - this.getCount(type)) + '회';
  },

  showPopup: function(type) {
    var old = document.getElementById('paywall-popup');
    if (old) old.remove();

    var typeLabel = (type === 'scan') ? '스캔 AI' : 'AI 대화';
    var limit = this.LIMITS['free'][type] || 3;

    // 애니메이션 style 주입 (style 태그를 innerHTML에 넣지 않음)
    if (!document.getElementById('pw-style')) {
      var s = document.createElement('style');
      s.id = 'pw-style';
      s.textContent = [
        '@keyframes pwUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}',
        '.pw-box{animation:pwUp .3s ease}'
      ].join('');
      document.head.appendChild(s);
    }

    // overlay
    var overlay = document.createElement('div');
    overlay.id = 'paywall-popup';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:999999',
      'display:flex', 'align-items:center', 'justify-content:center',
      'padding:16px', 'background:rgba(0,0,0,0.82)',
      'backdrop-filter:blur(8px)'
    ].join(';');

    // box
    var box = document.createElement('div');
    box.className = 'pw-box';
    box.style.cssText = [
      'background:#0a0020',
      'border:1.5px solid rgba(191,95,255,.35)',
      'border-radius:24px', 'padding:28px 24px',
      'width:min(380px,100%)', 'text-align:center',
      'box-shadow:0 0 60px rgba(191,95,255,.2)',
      'max-height:90vh', 'overflow-y:auto'
    ].join(';');

    // 내용 구성 (innerHTML 최소화 — 변수 직접 삽입)
    var freeRow = [
      '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);',
      'border-radius:14px;padding:12px 14px;display:flex;justify-content:space-between;',
      'align-items:center;margin-bottom:8px;opacity:.6">',
      '<div style="text-align:left">',
      '<div style="font-size:13px;font-weight:700;color:#94a3b8">Free</div>',
      '<div style="font-size:11px;color:#475569;margin-top:2px">',
      '스캔 3회 · 대화 10회/일</div></div>',
      '<div style="font-size:13px;font-weight:700;color:#475569">현재</div></div>'
    ].join('');

    var proRow = [
      '<div onclick="PAYWALL.goToPricing(\'pro\')" style="',
      'background:linear-gradient(135deg,rgba(99,102,241,.2),rgba(139,92,246,.15));',
      'border:1.5px solid rgba(99,102,241,.5);border-radius:14px;padding:12px 14px;',
      'display:flex;justify-content:space-between;align-items:center;',
      'cursor:pointer;margin-bottom:8px">',
      '<div style="text-align:left">',
      '<div style="font-size:13px;font-weight:700;color:#a5b4fc">⚡ Pro</div>',
      '<div style="font-size:11px;color:#818cf8;margin-top:2px">무제한 스캔 · 대화 · 쿠폰</div>',
      '</div>',
      '<div><div style="font-size:15px;font-weight:900;color:#a5b4fc">₩9,900</div>',
      '<div style="font-size:10px;color:#6366f1">/월</div></div></div>'
    ].join('');

    var premRow = [
      '<div onclick="PAYWALL.goToPricing(\'premium\')" style="',
      'background:linear-gradient(135deg,rgba(255,171,64,.15),rgba(255,107,53,.1));',
      'border:1.5px solid rgba(255,171,64,.4);border-radius:14px;padding:12px 14px;',
      'display:flex;justify-content:space-between;align-items:center;',
      'cursor:pointer;margin-bottom:8px">',
      '<div style="text-align:left">',
      '<div style="font-size:13px;font-weight:700;color:#ffab40">👑 Premium</div>',
      '<div style="font-size:11px;color:#f59e0b;margin-top:2px">Pro + 스마트글래스 · 매장연동</div>',
      '</div>',
      '<div><div style="font-size:15px;font-weight:900;color:#ffab40">₩29,900</div>',
      '<div style="font-size:10px;color:#f59e0b">/월</div></div></div>'
    ].join('');

    box.innerHTML = [
      '<div style="font-size:48px;margin-bottom:8px">🐰</div>',
      '<div style="font-size:11px;background:rgba(255,100,100,.15);',
      'border:1px solid rgba(255,100,100,.3);color:#ff8080;',
      'padding:4px 12px;border-radius:10px;display:inline-block;margin-bottom:14px">',
      '무료 ' + typeLabel + ' ' + limit + '회 모두 사용</div>',
      '<div style="font-size:18px;font-weight:900;color:#f1f5f9;margin-bottom:6px">',
      '아미랑 더 놀고 싶어? 💜</div>',
      '<div style="font-size:13px;color:#94a3b8;margin-bottom:20px;line-height:1.6">',
      'Pro로 업그레이드하면<br>무제한으로 함께할 수 있어~! 🌟</div>',
      '<div style="margin-bottom:18px">' + freeRow + proRow + premRow + '</div>',
      '<button onclick="PAYWALL.goToPricing(\'pro\')" style="',
      'width:100%;padding:14px;border-radius:14px;border:none;',
      'background:linear-gradient(135deg,#6366f1,#8b5cf6);',
      'color:#fff;font-size:14px;font-weight:700;cursor:pointer;',
      'margin-bottom:8px;font-family:inherit">⚡ Pro 시작하기</button>',
      '<button onclick="document.getElementById(\'paywall-popup\').remove()" style="',
      'width:100%;padding:10px;border-radius:12px;',
      'border:1px solid rgba(255,255,255,.1);background:transparent;',
      'color:#64748b;font-size:12px;cursor:pointer;font-family:inherit">',
      '나중에 할게요</button>',
      '<div style="font-size:11px;color:#334155;margin-top:12px;line-height:1.5">',
      '내일 자정에 무료 횟수 리셋돼요 🌙<br>구독은 언제든 취소 가능해요</div>'
    ].join('');

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
  },

  goToPricing: function(plan) {
    var el = document.getElementById('paywall-popup');
    if (el) el.remove();
    var base = location.pathname.indexOf('/pages/') >= 0
               ? '../pages/pricing.html'
               : 'pages/pricing.html';
    location.href = base + '#' + plan;
  },

  check: function(type, onAllow, onBlock) {
    if (this.canUse(type)) {
      this.addCount(type);
      if (onAllow) onAllow();
    } else {
      this.showPopup(type);
      if (onBlock) onBlock();
    }
  },

  renderBadge: function(type, elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    var plan = this.getPlan();
    var rem = this.remaining(type);
    var isPro = plan !== 'free';
    if (isPro) {
      el.innerHTML = '<span style="color:#00e676;font-size:11px">✨ ' +
        (plan === 'premium' ? 'Premium' : 'Pro') + ' — 무제한</span>';
    } else {
      var color = (rem === '0회') ? '#ff5050' : '#ffab40';
      el.innerHTML = '<span style="color:' + color + ';font-size:11px">남은 횟수: ' + rem + '</span>';
    }
  }
};

window.PAYWALL = PAYWALL;
