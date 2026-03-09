// PetCTT 실시간 접속자 추적 Worker
// KV에 세션을 저장하고 활성 접속자 수를 반환

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const SESSION_TTL = 300; // 5분 (초)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 방문자 하트비트 (ping)
    if (url.pathname === '/ping') {
      const visitorId = url.searchParams.get('vid') || crypto.randomUUID();
      const page = url.searchParams.get('page') || '/';
      const now = Date.now();

      // KV에 세션 저장 (TTL 5분)
      await env.VISITORS.put(`session:${visitorId}`, JSON.stringify({
        page,
        timestamp: now,
        ua: request.headers.get('user-agent') || '',
      }), { expirationTtl: SESSION_TTL });

      // 현재 활성 접속자 목록 업데이트
      const activeList = JSON.parse(await env.VISITORS.get('active_sessions') || '{}');
      activeList[visitorId] = { page, timestamp: now };

      // 5분 이상 된 세션 제거
      const cutoff = now - (SESSION_TTL * 1000);
      for (const [id, data] of Object.entries(activeList)) {
        if (data.timestamp < cutoff) {
          delete activeList[id];
        }
      }

      await env.VISITORS.put('active_sessions', JSON.stringify(activeList), { expirationTtl: SESSION_TTL * 2 });

      // 총 방문 카운터 증가 (오늘 날짜별)
      const today = new Date().toISOString().split('T')[0];
      const dailyKey = `daily:${today}`;
      const dailyCount = parseInt(await env.VISITORS.get(dailyKey) || '0') + 1;
      await env.VISITORS.put(dailyKey, String(dailyCount), { expirationTtl: 86400 * 7 }); // 7일 보관

      return new Response(JSON.stringify({
        success: true,
        vid: visitorId,
        active: Object.keys(activeList).length,
        today: dailyCount,
      }), { headers: CORS_HEADERS });
    }

    // 접속자 수 조회
    if (url.pathname === '/count') {
      const activeList = JSON.parse(await env.VISITORS.get('active_sessions') || '{}');
      const now = Date.now();
      const cutoff = now - (SESSION_TTL * 1000);

      let activeCount = 0;
      const pages = {};
      for (const [id, data] of Object.entries(activeList)) {
        if (data.timestamp >= cutoff) {
          activeCount++;
          pages[data.page] = (pages[data.page] || 0) + 1;
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const dailyCount = parseInt(await env.VISITORS.get(`daily:${today}`) || '0');

      return new Response(JSON.stringify({
        active: activeCount,
        pages,
        today: dailyCount,
      }), { headers: CORS_HEADERS });
    }

    // 기본 응답
    return new Response(JSON.stringify({
      service: 'PetCTT Visitor Tracker',
      endpoints: ['/ping', '/count'],
      status: 'running 🐾',
    }), { headers: CORS_HEADERS });
  }
};
