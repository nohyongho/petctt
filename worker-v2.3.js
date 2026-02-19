// PetCTT Auth Worker v2.3 - UTF-8 Safe JWT + Animal Talk AI

const FRONTEND_URL = "https://petctt.com";
const WORKER_BASE = "https://petctt-auth.zeus1404.workers.dev";

function base64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function bufferToBase64url(buf) {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64urlToBuffer(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
      if (path === "/api/auth/status") {
        return json({ status: "ok", message: "PetCTT Auth Worker v2.3 - Animal Talk AI Ready!" }, corsHeaders);
      }

      // ===== 동물대화 AI API =====
      if (path === "/api/animal-talk" && request.method === "POST") {
        const { message, provider = 'gemini', animal = 'dog' } = await request.json();
        if (!message) return json({ error: '메시지가 없어요!' }, corsHeaders, 400);

        const animalNames = { dog:'강아지', cat:'고양이', cow:'소', pig:'돼지', duck:'오리', chick:'병아리', monkey:'원숭이', goat:'염소' };
        const animalName = animalNames[animal] || '강아지';
        const systemPrompt = `당신은 ${animalName}입니다. 사람의 말을 ${animalName}의 시각으로 귀엽고 재미있게 해석해서 짧게 답해주세요. 한국어로 2-3문장 이내로 답해주세요.`;

        let reply = null;

        if (env.GEMINI_API_KEY) {
          try {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
              method: 'POST', headers: {'Content-Type':'application/json'},
              body: JSON.stringify({ contents:[{parts:[{text: systemPrompt + '\n\n사람: ' + message}]}], generationConfig:{maxOutputTokens:200,temperature:0.9} })
            });
            const d = await r.json();
            reply = d?.candidates?.[0]?.content?.parts?.[0]?.text || null;
          } catch(e) { console.warn('Gemini 실패:', e); }
        }

        if (!reply && env.OPENAI_API_KEY) {
          try {
            const r = await fetch('https://api.openai.com/v1/chat/completions', {
              method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.OPENAI_API_KEY}`},
              body: JSON.stringify({ model:'gpt-4o-mini', messages:[{role:'system',content:systemPrompt},{role:'user',content:message}], max_tokens:200 })
            });
            const d = await r.json();
            reply = d?.choices?.[0]?.message?.content || null;
          } catch(e) { console.warn('OpenAI 실패:', e); }
        }

        if (!reply && env.ANTHROPIC_API_KEY) {
          try {
            const r = await fetch('https://api.anthropic.com/v1/messages', {
              method:'POST', headers:{'Content-Type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},
              body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:200, system:systemPrompt, messages:[{role:'user',content:message}] })
            });
            const d = await r.json();
            reply = d?.content?.[0]?.text || null;
          } catch(e) { console.warn('Anthropic 실패:', e); }
        }

        if (!reply) {
          const defaults = { dog:'멍멍! 꼬리 흔들흔들~ 🐶', cat:'냐옹~ 생각해볼게 냥. 🐱', cow:'음메~ 알겠어요! 🐮', pig:'꿀꿀~ 오케이! 🐷', duck:'꽥꽥! 🦆', chick:'삐약! 🐥', monkey:'우끼끼! 🐵', goat:'매애~ 🐐' };
          reply = defaults[animal] || '...🐾';
        }
        return json({ reply, provider, animal }, corsHeaders);
      }

      // === Google OAuth ===
      if (path === "/api/auth/google") {
        const params = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: WORKER_BASE+"/api/auth/google/callback", response_type:"code", scope:"openid email profile", access_type:"offline" });
        return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
      }
      if (path === "/api/auth/google/callback") {
        const code = url.searchParams.get("code");
        if (!code) return json({ error: "No code" }, corsHeaders, 400);
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body: new URLSearchParams({ code, client_id:env.GOOGLE_CLIENT_ID, client_secret:env.GOOGLE_CLIENT_SECRET, redirect_uri:WORKER_BASE+"/api/auth/google/callback", grant_type:"authorization_code" }) });
        const tokenData = await tokenRes.json();
        if (tokenData.error) return Response.redirect(`${FRONTEND_URL}?login=error&msg=${encodeURIComponent(tokenData.error)}`);
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers:{Authorization:`Bearer ${tokenData.access_token}`} });
        const user = await userRes.json();
        try { await env.DB.prepare(`INSERT OR REPLACE INTO users (id, email, name, picture, provider, created_at, updated_at) VALUES (?, ?, ?, ?, 'google', datetime('now'), datetime('now'))`).bind(user.id, user.email, user.name, user.picture).run(); } catch(e) {}
        const jwt = await createJWT({ id:user.id, email:user.email, name:user.name, picture:user.picture }, env.JWT_SECRET || "petctt-default-secret-2026");
        return Response.redirect(`${FRONTEND_URL}?login=success&token=${jwt}&name=${encodeURIComponent(user.name)}&picture=${encodeURIComponent(user.picture||"")}&provider=google`);
      }

      // === Kakao OAuth ===
      if (path === "/api/auth/kakao") {
        const params = new URLSearchParams({ client_id:env.KAKAO_CLIENT_ID, redirect_uri:WORKER_BASE+"/api/auth/kakao/callback", response_type:"code" });
        return Response.redirect(`https://kauth.kakao.com/oauth/authorize?${params}`);
      }
      if (path === "/api/auth/kakao/callback") {
        const code = url.searchParams.get("code");
        if (!code) return json({ error: "No code" }, corsHeaders, 400);
        const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body: new URLSearchParams({ grant_type:"authorization_code", client_id:env.KAKAO_CLIENT_ID, redirect_uri:WORKER_BASE+"/api/auth/kakao/callback", code }) });
        const tokenData = await tokenRes.json();
        if (tokenData.error) return Response.redirect(`${FRONTEND_URL}?login=error&msg=${encodeURIComponent(tokenData.error)}`);
        const userRes = await fetch("https://kapi.kakao.com/v2/user/me", { headers:{Authorization:`Bearer ${tokenData.access_token}`} });
        const kakaoUser = await userRes.json();
        const user = { id:"kakao_"+kakaoUser.id, email:kakaoUser.kakao_account?.email||"", name:kakaoUser.properties?.nickname||"Kakao User", picture:kakaoUser.properties?.profile_image||"" };
        try { await env.DB.prepare(`INSERT OR REPLACE INTO users (id, email, name, picture, provider, created_at, updated_at) VALUES (?, ?, ?, ?, 'kakao', datetime('now'), datetime('now'))`).bind(user.id, user.email, user.name, user.picture).run(); } catch(e) {}
        const jwt = await createJWT(user, env.JWT_SECRET || "petctt-default-secret-2026");
        return Response.redirect(`${FRONTEND_URL}?login=success&token=${jwt}&name=${encodeURIComponent(user.name)}&picture=${encodeURIComponent(user.picture||"")}&provider=kakao`);
      }

      // === Naver OAuth ===
      if (path === "/api/auth/naver") {
        const state = Math.random().toString(36).substring(2);
        const params = new URLSearchParams({ response_type:"code", client_id:env.NAVER_CLIENT_ID, redirect_uri:WORKER_BASE+"/api/auth/naver/callback", state });
        return Response.redirect(`https://nid.naver.com/oauth2.0/authorize?${params}`);
      }
      if (path === "/api/auth/naver/callback") {
        const code = url.searchParams.get("code"), state = url.searchParams.get("state");
        if (!code) return json({ error: "No code" }, corsHeaders, 400);
        const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body: new URLSearchParams({ grant_type:"authorization_code", client_id:env.NAVER_CLIENT_ID, client_secret:env.NAVER_CLIENT_SECRET, code, state }) });
        const tokenData = await tokenRes.json();
        if (tokenData.error) return Response.redirect(`${FRONTEND_URL}?login=error&msg=${encodeURIComponent(tokenData.error)}`);
        const userRes = await fetch("https://openapi.naver.com/v1/nid/me", { headers:{Authorization:`Bearer ${tokenData.access_token}`} });
        const naverData = await userRes.json();
        const naverUser = naverData.response;
        const user = { id:"naver_"+naverUser.id, email:naverUser.email||"", name:naverUser.name||naverUser.nickname||"Naver User", picture:naverUser.profile_image||"" };
        try { await env.DB.prepare(`INSERT OR REPLACE INTO users (id, email, name, picture, provider, created_at, updated_at) VALUES (?, ?, ?, ?, 'naver', datetime('now'), datetime('now'))`).bind(user.id, user.email, user.name, user.picture).run(); } catch(e) {}
        const jwt = await createJWT(user, env.JWT_SECRET || "petctt-default-secret-2026");
        return Response.redirect(`${FRONTEND_URL}?login=success&token=${jwt}&name=${encodeURIComponent(user.name)}&picture=${encodeURIComponent(user.picture||"")}&provider=naver`);
      }

      if (path === "/api/auth/verify") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return json({ error: "No token" }, corsHeaders, 401);
        const data = await verifyJWT(authHeader.replace("Bearer ",""), env.JWT_SECRET||"petctt-default-secret-2026");
        if (!data) return json({ error: "Invalid token" }, corsHeaders, 401);
        return json({ user: data }, corsHeaders);
      }

      if (path === "/api/user/profile" && request.method === "GET") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return json({ error: "Unauthorized" }, corsHeaders, 401);
        const data = await verifyJWT(authHeader.replace("Bearer ",""), env.JWT_SECRET||"petctt-default-secret-2026");
        if (!data) return json({ error: "Invalid token" }, corsHeaders, 401);
        const result = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(data.id).first();
        if (!result) return json({ error: "User not found" }, corsHeaders, 404);
        return json({ user: result }, corsHeaders);
      }

      return json({ error: "Not found" }, corsHeaders, 404);
    } catch (err) {
      return json({ error: err.message }, corsHeaders, 500);
    }
  }
};

async function createJWT(user, secret) {
  const header = base64urlEncode(JSON.stringify({ alg:"HS256", typ:"JWT" }));
  const payload = base64urlEncode(JSON.stringify({ ...user, exp: Math.floor(Date.now()/1e3)+86400*7 }));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${payload}`));
  return `${header}.${payload}.${bufferToBase64url(sig)}`;
}

async function verifyJWT(token, secret) {
  try {
    const [header, payload, signature] = token.split(".");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, base64urlToBuffer(signature), new TextEncoder().encode(`${header}.${payload}`));
    if (!valid) return null;
    const data = JSON.parse(base64urlDecode(payload));
    if (data.exp < Math.floor(Date.now()/1e3)) return null;
    return data;
  } catch { return null; }
}

function json(data, corsHeaders, status=200) {
  return new Response(JSON.stringify(data), { status, headers: {"Content-Type":"application/json",...corsHeaders} });
}
