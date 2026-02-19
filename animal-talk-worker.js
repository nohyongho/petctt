// PetCTT 동물대화 AI API Worker
// Cloudflare Worker - /api/animal-talk

export default {
  async fetch(request, env) {
    // CORS 헤더
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const { message, provider = 'gemini', animal = 'dog' } = await request.json();

      if (!message) {
        return new Response(JSON.stringify({ error: '메시지가 없어요!' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const animalNames = {
        dog: '강아지', cat: '고양이', cow: '소', pig: '돼지',
        duck: '오리', chick: '병아리', monkey: '원숭이', goat: '염소'
      };
      const animalName = animalNames[animal] || '강아지';

      const systemPrompt = `당신은 ${animalName}입니다. 
사람의 말을 ${animalName}의 시각으로 귀엽고 재미있게 해석해서 짧게 답해주세요.
${animalName}의 특성과 소리를 살려서 표현해주세요.
한국어로 답하고, 2-3문장 이내로 짧게 답해주세요.`;

      let reply = null;

      // Gemini 호출
      if (provider === 'gemini' && env.GEMINI_API_KEY) {
        const geminiRes = await fetch(
          \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${env.GEMINI_API_KEY}\`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt + '\n\n사람: ' + message }] }],
              generationConfig: { maxOutputTokens: 200, temperature: 0.9 }
            })
          }
        );
        const geminiData = await geminiRes.json();
        reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
      }

      // OpenAI 호출
      if (!reply && provider === 'openai' && env.OPENAI_API_KEY) {
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${env.OPENAI_API_KEY}\`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 200
          })
        });
        const openaiData = await openaiRes.json();
        reply = openaiData?.choices?.[0]?.message?.content;
      }

      // Anthropic 호출
      if (!reply && provider === 'anthropic' && env.ANTHROPIC_API_KEY) {
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 200,
            system: systemPrompt,
            messages: [{ role: 'user', content: message }]
          })
        });
        const anthropicData = await anthropicRes.json();
        reply = anthropicData?.content?.[0]?.text;
      }

      // 기본 응답 (API 키 없을 때)
      if (!reply) {
        const defaults = {
          dog: '멍멍! 꼬리 흔들흔들~ 좋아좋아! 🐶',
          cat: '냐옹~ 흠, 생각해볼게 냥. 🐱',
          cow: '음메~ 알겠어요! 🐮',
          pig: '꿀꿀~ 오케이! 🐷',
          duck: '꽥꽥! 알겠어! 🦆',
          chick: '삐약삐약! 네네! 🐥'
        };
        reply = defaults[animal] || '...🐾';
      }

      return new Response(JSON.stringify({ reply, provider, animal }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
