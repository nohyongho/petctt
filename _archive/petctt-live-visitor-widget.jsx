import { useState, useEffect } from "react";

export default function PetCTTVisitorWidget() {
  const [count, setCount] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [todayTotal, setTodayTotal] = useState(23);

  // Simulate visitors coming and going
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.random() > 0.4 ? 1 : -1;
        const next = Math.max(0, Math.min(15, prev + change));
        if (next !== prev) {
          setAnimating(true);
          setTimeout(() => setAnimating(false), 300);
        }
        return next;
      });
      setTodayTotal(prev => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 2000);
    
    // Start with initial count
    setTimeout(() => setCount(3), 500);
    
    return () => clearInterval(interval);
  }, []);

  const pages = [
    { path: "/", name: "🏠 메인", visitors: Math.max(1, Math.floor(count * 0.4)) },
    { path: "/market.html", name: "☁️ 구름장터", visitors: Math.max(0, Math.floor(count * 0.3)) },
    { path: "/ami.html", name: "🐾 아미 AI", visitors: Math.max(0, Math.floor(count * 0.2)) },
    { path: "/pricing.html", name: "💎 요금제", visitors: Math.max(0, count - Math.floor(count * 0.4) - Math.floor(count * 0.3) - Math.floor(count * 0.2)) },
  ];

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* PetCTT 사이트 배경 (간략화) */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black" />
      
      {/* 헤더 */}
      <div className="relative z-10 px-4 py-3 flex items-center justify-between border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-white font-bold text-lg">PetCTT</span>
          <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Pro</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <span>🌐 KO</span>
          <span>🛒 쇼핑</span>
        </div>
      </div>

      {/* 사이트 콘텐츠 (배경용) */}
      <div className="relative z-10 p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🐶</div>
            <h1 className="text-white text-xl font-bold mb-2">반려동물 양방향 통역</h1>
            <p className="text-gray-400 text-sm">AI가 감정을 읽고, 음성으로 대화하는 세상</p>
          </div>
          
          {/* 기능 카드들 */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {["🎙️ LIVE", "❤️ 건강", "🗺️ 찾기", "🛒 쇼핑"].map((item, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
                <div className="text-sm">{item}</div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/30 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span>🐾</span>
              <span className="text-white text-sm font-medium">통역할 동물을 선택하세요</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["🐶", "🐱", "🐮", "🐷"].map((emoji, i) => (
                <div key={i} className={`rounded-xl p-3 text-center text-2xl ${i === 0 ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-gray-700/30'}`}>
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          {/* 하단 영역 */}
          <div className="text-center text-gray-500 text-xs">
            특허출원 10-2025-0217020 | 주식회사 발로레
          </div>
        </div>
      </div>

      {/* ✨ 실시간 접속자 위젯 ✨ */}
      <div
        onClick={() => setShowDetail(!showDetail)}
        className="fixed bottom-20 left-4 z-50 cursor-pointer"
        style={{ animation: "slideIn 0.5s ease-out" }}
      >
        {/* 메인 위젯 */}
        <div 
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            boxShadow: showDetail 
              ? "0 6px 25px rgba(0, 200, 150, 0.25)" 
              : "0 4px 20px rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* 펄스 인디케이터 */}
          <div className="relative">
            <div 
              className="w-2 h-2 rounded-full bg-emerald-400"
              style={{ 
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div 
              className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400"
              style={{ 
                animation: "pulseRing 1.5s ease-in-out infinite",
              }}
            />
          </div>
          
          <span className="text-base">🐾</span>
          
          <div>
            <div 
              className="text-emerald-400 font-bold text-lg leading-none transition-transform duration-200"
              style={{ transform: animating ? "scale(1.3)" : "scale(1)" }}
            >
              {count}
            </div>
            <div className="text-white/50 text-xs mt-0.5">접속중</div>
          </div>
        </div>

        {/* 상세 패널 */}
        {showDetail && (
          <div 
            className="mt-2 rounded-2xl border border-white/10 p-4 w-64"
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(10px)",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <div className="text-white/80 text-xs font-medium mb-3 flex items-center gap-1.5">
              <span className="text-emerald-400">●</span> 실시간 현황
            </div>
            
            {/* 오늘 총 방문자 */}
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
              <span className="text-white/50 text-xs">오늘 방문자</span>
              <span className="text-white font-bold text-sm">{todayTotal}명</span>
            </div>
            
            {/* 페이지별 접속자 */}
            <div className="space-y-2">
              {pages.map((p, i) => (
                p.visitors > 0 && (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">{p.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 rounded-full bg-emerald-400/30 w-12 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (p.visitors / Math.max(1, count)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-white/80 text-xs font-medium w-5 text-right">{p.visitors}</span>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* 푸터 */}
            <div className="mt-3 pt-2 border-t border-white/5 text-center">
              <span className="text-white/30 text-xs">🐾 PetCTT Live Tracker</span>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
