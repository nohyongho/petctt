// ========== 아미 구독 페이월 v1 ==========
// 사용처: scan.html, index.html (Claude 대화)
// 무료: 스캔3회/일, 대화10회/일
// Pro: 무제한 ₩9,900/월
// Premium: 무제한+스마트글래스 ₩29,900/월

const PAYWALL = {
  LIMITS: { free: { scan: 3, chat: 10 }, pro: { scan: 9999, chat: 9999 }, premium: { scan: 9999, chat: 9999 } },

  // 현재 플랜 가져오기
  getPlan() {
    try {
      const u = JSON.parse(localStorage.getItem('petctt_user') || 'null');
      return u?.plan_id || 'free';
    } catch { return 'free'; }
  },

  // 오늘 사용 횟수
  getCount(type) {
    const key = `petctt_usage_${type}_${new Date().toDateString()}`;
    return parseInt(localStorage.getItem(key) || '0');
  },

  // 횟수 증가
  addCount(type) {
    const key = `petctt_usage_${type}_${new Date().toDateString()}`;
    localStorage.setItem(key, this.getCount(type) + 1);
  },

  // 사용 가능 여부 체크
  canUse(type) {
    const plan = this.getPlan();
    const limit = this.LIMITS[plan]?.[type] ?? 3;
    return this.getCount(type) < limit;
  },

  // 남은 횟수
  remaining(type) {
    const plan = this.getPlan();
    const limit = this.LIMITS[plan]?.[type] ?? 3;
    if (limit >= 9999) return '무제한';
    return Math.max(0, limit - this.getCount(type)) + '회';
  },

  // 팝업 표시
  showPopup(type, onSuccess) {
    // 이미 팝업 있으면 제거
    const old = document.getElementById('paywall-popup');
    if (old) old.remove();

    const plan = this.getPlan();
    const limit = this.LIMITS['free'][type];
    const typeLabel = type === 'scan' ? '스캔 AI' : 'AI 대화';

    const popup = document.createElement('div');
    popup.id = 'paywall-popup';
    popup.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      display:flex;align-items:center;justify-content:center;
      padding:16px;background:rgba(0,0,0,0.82);
      backdrop-filter:blur(8px);
      animation:pwFadeIn .25s ease;
    `;

    popup.innerHTML = `
      <style>
        @keyframes pwFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pwSlideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
        #paywall-box{animation:pwSlideUp .3s cubic-bezier(.34,1.2,.64,1)}
      </style>
      <div id="paywall-box" style="
        background:#0a0020;border:1.5px solid rgba(191,95,255,.35);
        border-radius:24px;padding:28px 24px;
        width:min(380px,100%);text-align:center;
        box-shadow:0 0 60px rgba(191,95,255,.2);
      ">
        <!-- 아미 -->
        <div style="font-size:48px;margin-bottom:8px">🐰</div>
        <div style="font-size:11px;background:rgba(255,100,100,.15);border:1px solid rgba(255,100,100,.3);color:#ff8080;padding:4px 12px;border-radius:10px;display:inline-block;margin-bottom:14px">
          무료 ${typeLabel} ${limit}회 모두 사용
        </div>
        <div style="font-size:18px;font-weight:900;color:#f1f5f9;margin-bottom:6px">
          아미랑 더 놀고 싶어? 💜
        </div>
        <div style="font-size:13px;color:#94a3b8;margin-bottom:22px;line-height:1.6">
          Pro로 업그레이드하면<br>무제한으로 함께할 수 있어~! 🌟
        </div>

        <!-- 플랜 카드들 -->
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">

          <!-- Free (현재) -->
          <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;opacity:.6">
            <div style="text-align:left">
              <div style="font-size:13px;font-weight:700;color:#94a3b8">🆓 Free</div>
              <div style="font-size:11px;color:#475569;margin-top:2px">스캔 3회·대화 10회/일</div>
            </div>
            <div style="font-size:13px;font-weight:700;color:#475569">현재</div>
          </div>

          <!-- Pro -->
          <div onclick="PAYWALL.goToPricing('pro')" style="
            background:linear-gradient(135deg,rgba(99,102,241,.2),rgba(139,92,246,.15));
            border:1.5px solid rgba(99,102,241,.5);
            border-radius:14px;padding:12px 14px;
            display:flex;justify-content:space-between;align-items:center;
            cursor:pointer;transition:all .2s;
          " onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='rgba(99,102,241,.5)'">
            <div style="text-align:left">
              <div style="font-size:13px;font-weight:700;color:#a5b4fc">⚡ Pro</div>
              <div style="font-size:11px;color:#818cf8;margin-top:2px">무제한 스캔·대화·쿠폰</div>
            </div>
            <div>
              <div style="font-size:15px;font-weight:900;color:#a5b4fc">₩9,900</div>
              <div style="font-size:10px;color:#6366f1">/월</div>
            </div>
          </div>

          <!-- Premium -->
          <div onclick="PAYWALL.goToPricing('premium')" style="
            background:linear-gradient(135deg,rgba(255,171,64,.15),rgba(255,107,53,.1));
            border:1.5px solid rgba(255,171,64,.4);
            border-radius:14px;padding:12px 14px;
            display:flex;justify-content:space-between;align-items:center;
            cursor:pointer;transition:all .2s;
          " onmouseover="this.style.borderColor='#ffab40'" onmouseout="this.style.borderColor='rgba(255,171,64,.4)'">
            <div style="text-align:left">
              <div style="font-size:13px;font-weight:700;color:#ffab40">👑 Premium</div>
              <div style="font-size:11px;color:#f59e0b;margin-top:2px">Pro + 스마트글래스·매장연동</div>
            </div>
            <div>
              <div style="font-size:15px;font-weight:900;color:#ffab40">₩29,900</div>
              <div style="font-size:10px;color:#f59e0b">/월</div>
            </div>
          </div>
        </div>

        <!-- 버튼들 -->
        <button onclick="PAYWALL.goToPricing('pro')" style="
          width:100%;padding:14px;border-radius:14px;border:none;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:#fff;font-size:14px;font-weight:700;
          cursor:pointer;margin-bottom:8px;
          box-shadow:0 4px 20px rgba(99,102,241,.4);
          font-family:'Noto Sans KR',sans-serif;
          transition:transform .15s;
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          ⚡ Pro 시작하기
        </button>
        <button onclick="document.getElementById('paywall-popup').remove()" style="
          width:100%;padding:10px;border-radius:12px;
          border:1px solid rgba(255,255,255,.1);
          background:transparent;color:#64748b;
          font-size:12px;cursor:pointer;
          font-family:'Noto Sans KR',sans-serif;
        ">
          나중에 할게요
        </button>

        <!-- 하단 안내 -->
        <div style="font-size:11px;color:#334155;margin-top:12px;line-height:1.5">
          내일 자정에 무료 횟수 리셋돼요 🌙<br>
          구독은 언제든 취소 가능해요
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    // 배경 클릭으로 닫기
    popup.addEventListener('click', e => { if(e.target === popup) popup.remove(); });
  },

  // 프라이싱 페이지로 이동
  goToPricing(plan) {
    document.getElementById('paywall-popup')?.remove();
    const base = location.pathname.includes('/pages/') ? '../pages/pricing.html' : 'pages/pricing.html';
    location.href = base + '#' + plan;
  },

  // 사용 전 체크 (메인 함수)
  check(type, onAllow, onBlock) {
    if (this.canUse(type)) {
      this.addCount(type);
      if (onAllow) onAllow();
    } else {
      this.showPopup(type, onAllow);
      if (onBlock) onBlock();
    }
  },

  // 남은 횟수 배지 렌더링
  renderBadge(type, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const plan = this.getPlan();
    const rem = this.remaining(type);
    const isPro = plan !== 'free';
    el.innerHTML = isPro
      ? `<span style="color:#00e676;font-size:11px">✨ ${plan === 'premium' ? 'Premium' : 'Pro'} — 무제한</span>`
      : `<span style="color:${parseInt(rem) <= 1 ? '#ff5050' : '#ffab40'};font-size:11px">남은 횟수: ${rem}</span>`;
  }
};

window.PAYWALL = PAYWALL;
