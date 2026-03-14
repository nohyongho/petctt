// PetCTT Auth Worker v3.0
// Cloudflare Worker - JWT Auth + AI Talk + Usage Control + Subscription
// 계좌/사업자 정보는 환경변수(env)로만 관리 - 코드 하드코딩 없음

const FRONTEND_URL = "https://petctt.com";
const WORKER_BASE  = "https://petctt-auth.zeus1404.workers.dev";

// =====================================================
// CORS
// =====================================================
const CORS = {
    'Access-Control-Allow-Origin': FRONTEND_URL,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
};

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json', ...CORS }
    });
}

// =====================================================
// DB 초기화 (첫 배포 시 1회 실행)
// =====================================================
async function initDB(env) {
    const sqls = [
          `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                      email TEXT UNIQUE NOT NULL,
                            name TEXT, phone TEXT, picture TEXT,
                                  login_provider TEXT DEFAULT 'google',
                                        status TEXT DEFAULT 'active',
                                              created_at TEXT DEFAULT (datetime('now')),
                                                    updated_at TEXT DEFAULT (datetime('now'))
                                                        )`,
          `CREATE TABLE IF NOT EXISTS plans (
                id TEXT PRIMARY KEY,
                      name TEXT NOT NULL,
                            price_monthly INTEGER DEFAULT 0,
                                  price_yearly INTEGER DEFAULT 0,
                                        max_ai_calls_per_day INTEGER DEFAULT 5,
                                              max_ai_calls_per_month INTEGER DEFAULT 50,
                                                    max_live_minutes_per_day INTEGER DEFAULT 10,
                                                          max_camera_analysis INTEGER DEFAULT 3,
                                                                max_pet_profiles INTEGER DEFAULT 1,
                                                                      features_json TEXT DEFAULT '{}',
                                                                            is_active INTEGER DEFAULT 1,
                                                                                  created_at TEXT DEFAULT (datetime('now'))
                                                                                      )`,
          `CREATE TABLE IF NOT EXISTS subscriptions (
                id TEXT PRIMARY KEY,
                      user_id TEXT NOT NULL,
                            plan_id TEXT NOT NULL,
                                  status TEXT DEFAULT 'active',
                                        billing_cycle TEXT DEFAULT 'monthly',
                                              started_at TEXT DEFAULT (datetime('now')),
                                                    expires_at TEXT,
                                                          auto_renew INTEGER DEFAULT 1,
                                                                payment_method TEXT,
                                                                      created_at TEXT DEFAULT (datetime('now')),
                                                                            updated_at TEXT DEFAULT (datetime('now'))
                                                                                )`,
          `CREATE TABLE IF NOT EXISTS payments (
                id TEXT PRIMARY KEY,
                      user_id TEXT NOT NULL,
                            subscription_id TEXT,
                                  amount INTEGER NOT NULL,
                                        currency TEXT DEFAULT 'KRW',
                                              payment_provider TEXT,
                                                    payment_status TEXT DEFAULT 'pending',
                                                          paid_at TEXT,
                                                                receipt_url TEXT,
                                                                      bank_transfer_ref TEXT,
                                                                            created_at TEXT DEFAULT (datetime('now'))
                                                                                )`,
          `CREATE TABLE IF NOT EXISTS usage_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                      user_id TEXT NOT NULL,
                            feature_type TEXT NOT NULL,
                                  provider TEXT DEFAULT 'gemini',
                                        model TEXT,
                                              request_count INTEGER DEFAULT 1,
                                                    token_estimate INTEGER DEFAULT 0,
                                                          cost_estimate REAL DEFAULT 0,
                                                                date_key TEXT,
                                                                      created_at TEXT DEFAULT (datetime('now'))
                                                                          )`,
          `CREATE TABLE IF NOT EXISTS user_tokens (
                user_id TEXT PRIMARY KEY,
                      plan_id TEXT DEFAULT 'free',
                            daily_used INTEGER DEFAULT 0,
                                  monthly_used INTEGER DEFAULT 0,
                                        live_minutes_used INTEGER DEFAULT 0,
                                              camera_used INTEGER DEFAULT 0,
                                                    last_reset_date TEXT DEFAULT (date('now')),
                                                          last_month_key TEXT DEFAULT (strftime('%Y-%m','now')),
                                                                updated_at TEXT DEFAULT (datetime('now'))
                                                                    )`,
          `CREATE TABLE IF NOT EXISTS bank_transfer_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                      user_id TEXT,
                            requested_plan TEXT NOT NULL,
                                  billing_cycle TEXT DEFAULT 'monthly',
                                        depositor_name TEXT NOT NULL,
                                              deposit_amount INTEGER NOT NULL,
                                                    deposit_time TEXT,
                                                          verification_status TEXT DEFAULT 'pending',
                                                                admin_note TEXT,
                                                                      created_at TEXT DEFAULT (datetime('now')),
                                                                            updated_at TEXT DEFAULT (datetime('now'))
                                                                                )`,
          `INSERT OR IGNORE INTO plans VALUES ('free','무료 Free',0,0,5,50,10,3,1,'{"resident_card":false,"live_match":false,"contest":true,"health_basic":true,"health_report":false,"gps_basic":true,"gps_advanced":false}',1,datetime('now'))`,
          `INSERT OR IGNORE INTO plans VALUES ('standard','스탠다드',9900,7900,50,500,60,20,3,'{"resident_card":true,"live_match":true,"contest":true,"health_basic":true,"health_report":false,"gps_basic":true,"gps_advanced":true}',1,datetime('now'))`,
          `INSERT OR IGNORE INTO plans VALUES ('premium','프리미엄',29900,23900,200,2000,180,100,10,'{"resident_card":true,"live_match":true,"contest":true,"health_basic":true,"health_report":true,"gps_basic":true,"gps_advanced":true,"glasses":true}',1,datetime('now'))`
        ];
    for (const sql of sqls) {
          try { await env.DB.prepare(sql).run(); } catch(e) {}
    }
}

// =====================================================
// JWT 유틸
// =====================================================
function b64uEncode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function b64uDecode(str) {
    str = str.replace(/-/g,'+').replace(/_/g,'/');
    while (str.length % 4) str += '=';
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}
function bufToB64u(buf) {
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function b64uToBuf(str) {
    str = str.replace(/-/g,'+').replace(/_/g,'/');
    while (str.length%4) str+='=';
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    return bytes;
}

async function createJWT(user, secret) {
    const header  = b64uEncode(JSON.stringify({alg:'HS256',typ:'JWT'}));
    const payload = b64uEncode(JSON.stringify({...user, exp: Math.floor(Date.now()/1e3)+86400*7}));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${payload}`));
    return `${header}.${payload}.${bufToB64u(sig)}`;
}

async function verifyJWT(token, secret) {
    try {
          const [header, payload, signature] = token.split('.');
          const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['verify']);
          const valid = await crypto.subtle.verify('HMAC', key, b64uToBuf(signature), new TextEncoder().encode(`${header}.${payload}`));
          if (!valid) return null;
          const data = JSON.parse(b64uDecode(payload));
          if (data.exp < Math.floor(Date.now()/1e3)) return null;
          return data;
    } catch { return null; }
}

// =====================================================
// 사용자 인증 미들웨어
// =====================================================
async function authenticate(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ','');
    return await verifyJWT(token, env.JWT_SECRET || 'petctt-default-secret-2026');
}

// =====================================================
// 사용량 통제 핵심 함수
// =====================================================
async function checkAndLogUsage(env, userId, featureType, model = 'gemini-flash') {
    const COST = { 'gemini-flash':0.00015, 'gemini-pro':0.00125, 'claude-haiku':0.00025 };
    const today = new Date().toISOString().split('T')[0];
    const monthKey = today.substring(0,7);

  // user_tokens 없으면 초기화
  let ut = await env.DB.prepare(
        `SELECT ut.*, p.max_ai_calls_per_day, p.max_ai_calls_per_month,
                    p.max_live_minutes_per_day, p.max_camera_analysis
                         FROM user_tokens ut JOIN plans p ON ut.plan_id=p.id WHERE ut.user_id=?`
      ).bind(userId).first();

  if (!ut) {
        await env.DB.prepare(
                `INSERT OR IGNORE INTO user_tokens (user_id,plan_id,last_reset_date,last_month_key) VALUES (?,?datetime('now'),?)`
              ).bind(userId,'free',today,monthKey).run();
        ut = { daily_used:0, monthly_used:0, max_ai_calls_per_day:5, max_ai_calls_per_month:50 };
  }

  // 일일 리셋
  if (ut.last_reset_date !== today) {
        await env.DB.prepare(
                `UPDATE user_tokens SET daily_used=0,live_minutes_used=0,camera_used=0,last_reset_date=? WHERE user_id=?`
              ).bind(today, userId).run();
        ut.daily_used = 0;
  }
    // 월간 리셋
  if (ut.last_month_key !== monthKey) {
        await env.DB.prepare(
                `UPDATE user_tokens SET monthly_used=0,last_month_key=? WHERE user_id=?`
              ).bind(monthKey, userId).run();
        ut.monthly_used = 0;
  }

  // 한도 체크
  if (ut.daily_used >= ut.max_ai_calls_per_day) {
        return { allowed:false, reason:'DAILY_LIMIT',
                      message:`오늘 AI 사용 한도(${ut.max_ai_calls_per_day}회)를 초과했습니다.`,
                      upgrade_url:`${FRONTEND_URL}/pages/pricing.html`,
                      remaining_daily:0 };
  }
    if (ut.monthly_used >= ut.max_ai_calls_per_month) {
          return { allowed:false, reason:'MONTHLY_LIMIT',
                        message:'이번달 AI 사용 한도를 초과했습니다.',
                        upgrade_url:`${FRONTEND_URL}/pages/pricing.html`,
                        remaining_monthly:0 };
    }

  // 사용량 기록
  await env.DB.batch([
        env.DB.prepare(`UPDATE user_tokens SET daily_used=daily_used+1,monthly_used=monthly_used+1,updated_at=datetime('now') WHERE user_id=?`).bind(userId),
        env.DB.prepare(`INSERT INTO usage_logs (user_id,feature_type,provider,model,request_count,cost_estimate,date_key) VALUES (?,?,'gemini',?,1,?,?)`).bind(userId,featureType,model,COST[model]||0,today)
      ]);

  return {
        allowed: true,
        remaining_daily: ut.max_ai_calls_per_day - ut.daily_used - 1,
        remaining_monthly: ut.max_ai_calls_per_month - ut.monthly_used - 1
  };
}

// =====================================================
// 사용자 플랜 조회 헬퍼
// =====================================================
async function getUserPlan(env, userId) {
    const sub = await env.DB.prepare(
          `SELECT s.plan_id, s.status, s.expires_at, s.billing_cycle, s.auto_renew,
                      p.name, p.max_ai_calls_per_day, p.max_ai_calls_per_month,
                                  p.max_live_minutes_per_day, p.max_camera_analysis, p.features_json
                                       FROM subscriptions s JOIN plans p ON s.plan_id=p.id
                                            WHERE s.user_id=? AND s.status='active'
                                                 ORDER BY s.created_at DESC LIMIT 1`
        ).bind(userId).first();
    if (sub) return sub;
    // 구독 없으면 free
  const freePlan = await env.DB.prepare(`SELECT * FROM plans WHERE id='free'`).first();
    return { plan_id:'free', status:'active', expires_at:null, ...freePlan };
}

// =====================================================
// 메인 라우터
// =====================================================
export default {
    async fetch(request, env) {
          const url  = new URL(request.url);
          const path = url.pathname;

      if (request.method === 'OPTIONS') {
              return new Response(null, { status:204, headers:CORS });
      }

      try {
              // ── DB 초기화 엔드포인트 (관리자 1회 실행용)
            if (path === '/api/admin/init-db' && request.method === 'POST') {
                      const adminKey = request.headers.get('X-Admin-Key');
                      if (adminKey !== (env.ADMIN_SECRET || 'petctt-admin-2026')) {
                                  return json({ error:'Forbidden' }, 403);
                      }
                      await initDB(env);
                      return json({ success:true, message:'DB initialized' });
            }

            // ── 플랜 목록
            if (path === '/api/plans' && request.method === 'GET') {
                      const plans = await env.DB.prepare(`SELECT * FROM plans WHERE is_active=1`).all();
                      return json({ success:true, data: plans.results });
            }

            // ── Google OAuth
            if (path === '/api/auth/google') {
                      const params = new URLSearchParams({
                                  client_id: env.GOOGLE_CLIENT_ID,
                                  redirect_uri: `${WORKER_BASE}/api/auth/google/callback`,
                                  response_type: 'code',
                                  scope: 'openid email profile',
                                  access_type: 'offline'
                      });
                      return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
            }

            if (path === '/api/auth/google/callback') {
                      const code = url.searchParams.get('code');
                      if (!code) return Response.redirect(`${FRONTEND_URL}?login=fail&msg=no_code`);

                const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                            method:'POST',
                            headers:{'Content-Type':'application/x-www-form-urlencoded'},
                            body: new URLSearchParams({
                                          code, client_id: env.GOOGLE_CLIENT_ID,
                                          client_secret: env.GOOGLE_CLIENT_SECRET,
                                          redirect_uri: `${WORKER_BASE}/api/auth/google/callback`,
                                          grant_type: 'authorization_code'
                            })
                });
                      const tokenData = await tokenRes.json();
                      if (tokenData.error) return Response.redirect(`${FRONTEND_URL}?login=fail&msg=${encodeURIComponent(tokenData.error)}`);

                const userRes  = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers:{ Authorization:`Bearer ${tokenData.access_token}` }
                });
                      const user = await userRes.json();

                // DB upsert
                await env.DB.prepare(
                            `INSERT INTO users (id,email,name,picture,login_provider,updated_at)
                                       VALUES (?,?,?,?,'google',datetime('now'))
                                                  ON CONFLICT(id) DO UPDATE SET name=excluded.name,picture=excluded.picture,updated_at=datetime('now')`
                          ).bind(user.id, user.email, user.name, user.picture).run();

                // user_tokens 초기화 (없으면)
                await env.DB.prepare(
                            `INSERT OR IGNORE INTO user_tokens (user_id,plan_id) VALUES (?,'free')`
                          ).bind(user.id).run();

                // 플랜 조회
                const planInfo = await getUserPlan(env, user.id);

                const jwt = await createJWT({
                            id: user.id, email: user.email, name: user.name,
                            picture: user.picture, provider: 'google',
                            plan_id: planInfo.plan_id || 'free'
                }, env.JWT_SECRET || 'petctt-default-secret-2026');

                // URL에서 토큰 노출 최소화: 짧은 파라미터만
                return Response.redirect(
                            `${FRONTEND_URL}?login=success&token=${jwt}&provider=google`
                          );
            }

            // ── Kakao OAuth
            if (path === '/api/auth/kakao') {
                      const params = new URLSearchParams({
                                  client_id: env.KAKAO_CLIENT_ID,
                                  redirect_uri: `${WORKER_BASE}/api/auth/kakao/callback`,
                                  response_type: 'code'
                      });
                      return Response.redirect(`https://kauth.kakao.com/oauth/authorize?${params}`);
            }

            if (path === '/api/auth/kakao/callback') {
                      const code = url.searchParams.get('code');
                      if (!code) return Response.redirect(`${FRONTEND_URL}?login=fail&msg=no_code`);

                const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
                            method:'POST',
                            headers:{'Content-Type':'application/x-www-form-urlencoded'},
                            body: new URLSearchParams({
                                          grant_type:'authorization_code', client_id: env.KAKAO_CLIENT_ID,
                                          redirect_uri:`${WORKER_BASE}/api/auth/kakao/callback`, code
                            })
                });
                      const tokenData = await tokenRes.json();
                      if (!tokenData.access_token) return Response.redirect(`${FRONTEND_URL}?login=fail&msg=kakao_token_fail`);

                const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
                            headers:{ Authorization:`Bearer ${tokenData.access_token}` }
                });
                      const kakaoUser = await userRes.json();
                      const kakaoId   = String(kakaoUser.id);
                      const kakaoName = kakaoUser.kakao_account?.profile?.nickname || '';
                      const kakaoPic  = kakaoUser.kakao_account?.profile?.profile_image_url || '';
                      const kakaoEmail= kakaoUser.kakao_account?.email || `${kakaoId}@kakao.local`;

                await env.DB.prepare(
                            `INSERT INTO users (id,email,name,picture,login_provider,updated_at)
                                       VALUES (?,?,?,?,'kakao',datetime('now'))
                                                  ON CONFLICT(id) DO UPDATE SET name=excluded.name,picture=excluded.picture,updated_at=datetime('now')`
                          ).bind(kakaoId, kakaoEmail, kakaoName, kakaoPic).run();

                await env.DB.prepare(
                            `INSERT OR IGNORE INTO user_tokens (user_id,plan_id) VALUES (?,'free')`
                          ).bind(kakaoId).run();

                const planInfo = await getUserPlan(env, kakaoId);

                const jwt = await createJWT({
                            id:kakaoId, email:kakaoEmail, name:kakaoName,
                            picture:kakaoPic, provider:'kakao',
                            plan_id: planInfo.plan_id || 'free'
                }, env.JWT_SECRET || 'petctt-default-secret-2026');

                return Response.redirect(`${FRONTEND_URL}?login=success&token=${jwt}&provider=kakao`);
            }

            // ── 내 정보 조회 (plan_id 포함)
            if (path === '/api/auth/me') {
                      const userData = await authenticate(request, env);
                      if (!userData) return json({ error:'Unauthorized' }, 401);

                const dbUser = await env.DB.prepare(`SELECT * FROM users WHERE id=?`).bind(userData.id).first();
                      if (!dbUser) return json({ error:'User not found' }, 404);

                const planInfo = await getUserPlan(env, userData.id);
                      const tokens   = await env.DB.prepare(`SELECT * FROM user_tokens WHERE user_id=?`).bind(userData.id).first();

                return json({
                            success: true,
                            user: {
                                          id:       dbUser.id,
                                          email:    dbUser.email,
                                          name:     dbUser.name,
                                          picture:  dbUser.picture,
                                          provider: dbUser.login_provider,
                                          status:   dbUser.status,
                                          plan_id:  planInfo.plan_id || 'free',
                                          plan_name:planInfo.name || '무료 Free',
                                          plan_features: planInfo.features_json ? JSON.parse(planInfo.features_json) : {},
                                          usage: tokens ? {
                                                          daily_used:   tokens.daily_used,
                                                          monthly_used: tokens.monthly_used,
                                                          daily_limit:  planInfo.max_ai_calls_per_day,
                                                          monthly_limit:planInfo.max_ai_calls_per_month,
                                                          live_minutes_used: tokens.live_minutes_used,
                                                          live_minutes_limit: planInfo.max_live_minutes_per_day
                                          } : null
                            }
                });
            }

            // ── 로그아웃
            if (path === '/api/auth/logout' && request.method === 'POST') {
                      return json({ success:true, message:'로그아웃 되었습니다' });
            }

            // ── 내 구독 상태
            if (path === '/api/subscription' && request.method === 'GET') {
                      const userData = await authenticate(request, env);
                      if (!userData) return json({ error:'Unauthorized' }, 401);
                      const planInfo = await getUserPlan(env, userData.id);
                      return json({ success:true, data: planInfo });
            }

            // ── 오늘 사용량
            if (path === '/api/usage/today' && request.method === 'GET') {
                      const userData = await authenticate(request, env);
                      if (!userData) return json({ error:'Unauthorized' }, 401);
                      const tokens = await env.DB.prepare(`SELECT * FROM user_tokens WHERE user_id=?`).bind(userData.id).first();
                      const plan   = await getUserPlan(env, userData.id);
                      return json({ success:true, data:{
                                  daily_used:   tokens?.daily_used || 0,
                                  daily_limit:  plan.max_ai_calls_per_day,
                                  monthly_used: tokens?.monthly_used || 0,
                                  monthly_limit:plan.max_ai_calls_per_month,
                                  live_minutes_used:  tokens?.live_minutes_used || 0,
                                  live_minutes_limit: plan.max_live_minutes_per_day,
                                  camera_used:  tokens?.camera_used || 0,
                                  camera_limit: plan.max_camera_analysis,
                                  plan_id:      tokens?.plan_id || 'free'
                      }});
            }

            // ── 사용량 한도 체크 (AI 기능 호출 전 프론트에서 확인)
            if (path === '/api/usage/check' && request.method === 'POST') {
                      const userData = await authenticate(request, env);
                      if (!userData) return json({ error:'Unauthorized' }, 401);
                      const body = await request.json();
                      const result = await checkAndLogUsage(env, userData.id, body.feature_type || 'live_chat', body.model || 'gemini-flash');
                      return json(result, result.allowed ? 200 : 429);
            }

            // ── AI 동물 대화 (사용량 통제 포함)
            if (path === '/api/talk' && request.method === 'POST') {
                      const userData = await authenticate(request, env);
                      if (!userData) return json({ error:'Unauthorized - 로그인이 필요합니다' }, 401);

                // 사용량 체크
                const usageCheck = await checkAndLogUsage(env, userData.id, 'live_chat', 'gemini-flash');
                      if (!usageCheck.allowed) {
                                  return json({ error: usageCheck.message, reason: usageCheck.reason, upgrade_url: usageCheck.upgrade_url }, 429);
                      }

                const { message, animal = 'dog', provider = 'gemini' } = await request.json();
                      if (!message) return json({ error:'메시지가 없어요' }, 400);

                const animalNames = { dog:'강아지', cat:'고양이', cow:'소', pig:'돼지', duck:'오리', chick:'병아리', monkey:'원숭이', goat:'염소', hamster:'햄스터', rabbit:'토끼', parrot:'앵무새', turtle:'거북이' };
                      const animalName = animalNames[animal] || '강아지';
                      const systemPrompt = `당신은 ${animalName}입니다. 사람의 말을 듣고 ${animalName}의 관점에서 한국어로 자연스럽게 반응하세요. 동물의 본능과 감정을 반영하고, 2-3문장으로 짧게 답하세요. 감정 상태도 포함하세요.`;

                let reply = null;

                // Gemini 시도
                if (!reply && provider === 'gemini' && env.GEMINI_API_KEY) {
                            try {
                                          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
                                                          method:'POST',
                                                          headers:{'Content-Type':'application/json'},
                                                          body: JSON.stringify({ contents:[{ parts:[{ text:`${systemPrompt}\n\n사람: ${message}` }] }], generationConfig:{ maxOutputTokens:200 } })
                                          });
                                          const data = await res.json();
                                          reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                            } catch(e) {}
                }

                // Anthropic fallback
                if (!reply && env.ANTHROPIC_API_KEY) {
                            try {
                                          const res = await fetch('https://api.anthropic.com/v1/messages', {
                                                          method:'POST',
                                                          headers:{'Content-Type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},
                                                          body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:200, system:systemPrompt, messages:[{ role:'user', content:message }] })
                                          });
                                          const data = await res.json();
                                          reply = data?.content?.[0]?.text;
                            } catch(e) {}
                }

                // OpenAI fallback
                if (!reply && env.OPENAI_API_KEY) {
                            try {
                                          const res = await fetch('https://api.openai.com/v1/chat/completions', {
                                                          method:'POST',
                                                          headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.OPENAI_API_KEY}`},
                                                          body: JSON.stringify({ model:'gpt-4o-mini', max_tokens:200, messages:[{ role:'system',content:systemPrompt },{ role:'user',content:message }] })
                                          });
                                          const data = await res.json();
                                          reply = data?.choices?.[0]?.message?.content;
                            } catch(e) {}
                }

                // 최후 기본 응답
                if (!reply) {
                            const defaults = { dog:'멍멍! 꼬리 흔들흔들~ 🐶', cat:'나옹~ 생각해볼게 냥 🐱', cow:'음머~ 알겠어요 🐄', pig:'꿀꿀~ 🐷', duck:'꽥꽥! 🦆', chick:'삐약 삐약~ 🐤' };
                            reply = defaults[animal] || '... 🐾';
                }

                return json({
                            reply, provider, animal,
                            usage: { remaining_daily: usageCheck.remaining_daily, remaining_monthly: usageCheck.remaining_monthly }
                });
            }

            // ── 계좌이체 요청 (B2B/수동입금)
            if (path === '/api/payment/bank-transfer' && request.method === 'POST') {
                      const userData = await authenticate(request, env);
                      if (!userData) return json({ error:'Unauthorized' }, 401);
                      const body = await request.json();
                      if (!body.depositor_name || !body.deposit_amount || !body.requested_plan) {
                                  return json({ error:'필수 항목이 누락됐습니다' }, 400);
                      }
                      await env.DB.prepare(
                                  `INSERT INTO bank_transfer_requests (user_id,requested_plan,billing_cycle,depositor_name,deposit_amount,deposit_time)
                                             VALUES (?,?,?,?,?,?)`
                                ).bind(userData.id, body.requested_plan, body.billing_cycle||'monthly', body.depositor_name, body.deposit_amount, body.deposit_time||null).run();

                // 계좌정보는 환경변수에서만
                return json({
                            success: true,
                            message: '입금 요청이 접수됐습니다. 확인 후 1-2 영업일 내 활성화됩니다.',
                            bank_info: {
                                          bank:    env.BANK_NAME    || '확인 필요',
                                          account: env.BANK_ACCOUNT || '확인 필요',
                                          holder:  env.BANK_HOLDER  || '확인 필요'
                            }
                });
            }

            // ── 결제 내역
            if (path === '/api/payment/history' && request.method === 'GET') {
                      const userData = await authenticate(request, env);
                      if (!userData) return json({ error:'Unauthorized' }, 401);
                      const payments = await env.DB.prepare(
                                  `SELECT * FROM payments WHERE user_id=? ORDER BY created_at DESC LIMIT 20`
                                ).bind(userData.id).all();
                      return json({ success:true, data: payments.results });
            }

            // ── 관리자: 계좌이체 목록
            if (path === '/api/admin/bank-transfers' && request.method === 'GET') {
                      const adminKey = request.headers.get('X-Admin-Key');
                      if (adminKey !== (env.ADMIN_SECRET || 'petctt-admin-2026')) return json({ error:'Forbidden' }, 403);
                      const list = await env.DB.prepare(`SELECT * FROM bank_transfer_requests ORDER BY created_at DESC`).all();
                      return json({ success:true, data: list.results });
            }

            // ── 관리자: 계좌이체 승인
            if (path.startsWith('/api/admin/bank-transfers/') && path.endsWith('/verify') && request.method === 'POST') {
                      const adminKey = request.headers.get('X-Admin-Key');
                      if (adminKey !== (env.ADMIN_SECRET || 'petctt-admin-2026')) return json({ error:'Forbidden' }, 403);
                      const id = path.split('/')[4];
                      const body = await request.json();
                      const req = await env.DB.prepare(`SELECT * FROM bank_transfer_requests WHERE id=?`).bind(id).first();
                      if (!req) return json({ error:'Not found' }, 404);

                await env.DB.prepare(`UPDATE bank_transfer_requests SET verification_status='verified',admin_note=?,updated_at=datetime('now') WHERE id=?`).bind(body.note||'승인',id).run();

                // 구독 활성화
                const subId = crypto.randomUUID();
                      const expires = new Date(); expires.setMonth(expires.getMonth()+1);
                      await env.DB.prepare(
                                  `INSERT INTO subscriptions (id,user_id,plan_id,status,billing_cycle,expires_at,payment_method)
                                             VALUES (?,?,?,'active',?,'bank_transfer')`
                                ).bind(subId, req.user_id, req.requested_plan, req.billing_cycle||'monthly', expires.toISOString()).run();

                await env.DB.prepare(
                            `INSERT OR REPLACE INTO user_tokens (user_id,plan_id,updated_at) VALUES (?,?,datetime('now'))`
                          ).bind(req.user_id, req.requested_plan).run();

                return json({ success:true, message:'구독이 활성화됐습니다' });
            }

            // ── 관리자: 사용량 요약
            if (path === '/api/admin/usage/summary' && request.method === 'GET') {
                      const adminKey = request.headers.get('X-Admin-Key');
                      if (adminKey !== (env.ADMIN_SECRET || 'petctt-admin-2026')) return json({ error:'Forbidden' }, 403);
                      const today = new Date().toISOString().split('T')[0];
                      const summary = await env.DB.prepare(
                                  `SELECT date_key, feature_type, model, COUNT(*) as calls, SUM(cost_estimate) as total_cost
                                             FROM usage_logs WHERE date_key >= date('now','-30 days')
                                                        GROUP BY date_key, feature_type, model ORDER BY date_key DESC`
                                ).all();
                      return json({ success:true, data: summary.results });
            }

            return json({ error:'Not found' }, 404);

      } catch(err) {
              console.error('Worker error:', err);
              return json({ error: err.message || 'Internal server error' }, 500);
      }
    }
};
