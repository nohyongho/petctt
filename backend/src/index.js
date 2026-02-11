export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS 헤더
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://petctt.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 상태 체크
      if (path === '/api/auth/status') {
        return json({ status: 'ok', message: 'PetCTT Auth Worker Running!' }, corsHeaders);
      }

      // Google 로그인 시작
      if (path === '/api/auth/google') {
        const params = new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID,
          redirect_uri: env.GOOGLE_CALLBACK_URL,
          response_type: 'code',
          scope: 'openid email profile',
          access_type: 'offline',
        });
        return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
      }

      // Google 콜백
      if (path === '/api/auth/google/callback') {
        const code = url.searchParams.get('code');
        if (!code) return json({ error: 'No code provided' }, corsHeaders, 400);

        // 토큰 교환
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: env.GOOGLE_CALLBACK_URL,
            grant_type: 'authorization_code',
          }),
        });
        const tokens = await tokenRes.json();

        // 사용자 정보
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser = await userRes.json();

        // DB 저장
        const user = await saveUser(env.DB, googleUser.email, googleUser.name, 'google', googleUser.id);

        // JWT 생성
        const token = await createJWT(user, env.JWT_SECRET);

        // 프론트로 리다이렉트
        return Response.redirect(`https://petctt.com/auth/callback?token=${token}`);
      }

      // Kakao 로그인 시작
      if (path === '/api/auth/kakao') {
        const params = new URLSearchParams({
          client_id: env.KAKAO_JAVASCRIPT_KEY,
          redirect_uri: env.KAKAO_CALLBACK_URL,
          response_type: 'code',
        });
        return Response.redirect(`https://kauth.kakao.com/oauth/authorize?${params}`);
      }

      // Kakao 콜백
      if (path === '/api/auth/kakao/callback') {
        const code = url.searchParams.get('code');
        if (!code) return json({ error: 'No code provided' }, corsHeaders, 400);

        const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: env.KAKAO_JAVASCRIPT_KEY,
            redirect_uri: env.KAKAO_CALLBACK_URL,
            code,
          }),
        });
        const tokens = await tokenRes.json();

        const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const kakaoUser = await userRes.json();

        const email = kakaoUser.kakao_account?.email || `kakao_${kakaoUser.id}@petctt.com`;
        const name = kakaoUser.properties?.nickname || 'PetCTT User';

        const user = await saveUser(env.DB, email, name, 'kakao', String(kakaoUser.id));
        const token = await createJWT(user, env.JWT_SECRET);

        return Response.redirect(`https://petctt.com/auth/callback?token=${token}`);
      }

      // 사용자 정보 조회
      if (path === '/api/auth/me') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return json({ error: 'No token' }, corsHeaders, 401);

        const token = authHeader.replace('Bearer ', '');
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload) return json({ error: 'Invalid token' }, corsHeaders, 401);

        return json({ user: payload }, corsHeaders);
      }

      return json({ error: 'Not found' }, corsHeaders, 404);

    } catch (err) {
      return json({ error: err.message }, corsHeaders, 500);
    }
  }
};

// DB에 사용자 저장/업데이트
async function saveUser(db, email, name, provider, providerId) {
  const existing = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  
  if (existing) {
    return existing;
  }

  await db.prepare(
    'INSERT INTO users (email, name, provider, provider_id) VALUES (?, ?, ?, ?)'
  ).bind(email, name, provider, providerId).run();

  return await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
}

// JWT 생성
async function createJWT(user, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
  }));
  
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${payload}`));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));
  
  return `${header}.${payload}.${signature}`;
}

// JWT 검증
async function verifyJWT(token, secret) {
  try {
    const [header, payload, signature] = token.split('.');
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBuf = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBuf, new TextEncoder().encode(`${header}.${payload}`));
    
    if (!valid) return null;
    
    const data = JSON.parse(atob(payload));
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    
    return data;
  } catch { return null; }
}

function json(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}