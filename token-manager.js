/**
 * PetCTT Token Management System
 * 토큰 절약 & 구독 모델 백엔드 로직
 * 
 * 파일: token-manager.js
 * 위치: petctt-backend/services/token-manager.js
 */

// ============================================
// 1. 요금제 설정
// ============================================
const PLANS = {
  free: {
    name: 'Free',
    dailyTokens: 50,
    maxProfiles: 1,
    aiAnalysisLimit: 5,      // 일 5회
    ttsEnabled: false,
    bioScanEnabled: false,
    gpsAdvanced: false,
    tokenCarryOver: false,
    offlineModel: false,
    apiAccess: false,
    price: { monthly: 0, yearly: 0 }
  },
  pro: {
    name: 'Pro',
    dailyTokens: 500,
    maxProfiles: 5,
    aiAnalysisLimit: -1,     // 무제한
    ttsEnabled: true,
    bioScanEnabled: true,
    gpsAdvanced: true,
    tokenCarryOver: true,
    carryOverDays: 7,
    offlineModel: true,
    apiAccess: false,
    price: { monthly: 9900, yearly: 7900 }
  },
  premium: {
    name: 'Premium',
    dailyTokens: 2000,
    maxProfiles: -1,         // 무제한
    aiAnalysisLimit: -1,
    ttsEnabled: true,
    bioScanEnabled: true,
    gpsAdvanced: true,
    tokenCarryOver: true,
    carryOverDays: -1,       // 무제한 이월
    offlineModel: true,
    apiAccess: true,
    price: { monthly: 29900, yearly: 23900 }
  }
};

// ============================================
// 2. 토큰 비용 테이블
// ============================================
const TOKEN_COSTS = {
  ai_analysis: 5,        // AI 감정분석
  tts_voice: 10,         // TTS 음성 통역
  bio_scan: 15,          // 생체분석 세션
  gps_advanced: 3,       // GPS 고급 기능
  live_broadcast: 20,    // 라이브 방송 (30분 당)
  market_ai_recommend: 3, // 구름장터 AI 추천
  coupon_game: 2,        // 쿠폰톡톡 게임
};

// ============================================
// 3. TokenManager 클래스
// ============================================
class TokenManager {
  constructor(db) {
    this.db = db;
    this.cache = new Map(); // 캐싱 시스템
  }

  /**
   * 사용자 토큰 잔액 조회
   */
  async getBalance(userId) {
    const [rows] = await this.db.execute(
      'SELECT tokens_balance, tokens_bonus, plan, daily_reset_at, carry_over_tokens FROM user_tokens WHERE user_id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      // 신규 사용자 초기화
      await this.initializeUser(userId);
      return { balance: PLANS.free.dailyTokens, bonus: 0, plan: 'free', carryOver: 0 };
    }

    const user = rows[0];
    
    // 일일 리셋 체크
    if (this.shouldResetDaily(user.daily_reset_at)) {
      return await this.dailyReset(userId, user);
    }

    return {
      balance: user.tokens_balance,
      bonus: user.tokens_bonus,
      plan: user.plan,
      carryOver: user.carry_over_tokens,
      total: user.tokens_balance + user.tokens_bonus + user.carry_over_tokens
    };
  }

  /**
   * 신규 사용자 토큰 초기화
   */
  async initializeUser(userId, plan = 'free') {
    const planConfig = PLANS[plan];
    await this.db.execute(
      `INSERT INTO user_tokens (user_id, plan, tokens_balance, tokens_bonus, carry_over_tokens, daily_reset_at, created_at) 
       VALUES (?, ?, ?, 0, 0, NOW(), NOW())`,
      [userId, plan, planConfig.dailyTokens]
    );
  }

  /**
   * 일일 토큰 리셋 (매일 자동)
   */
  async dailyReset(userId, userData) {
    const plan = PLANS[userData.plan] || PLANS.free;
    let carryOver = 0;

    // 이월 토큰 계산
    if (plan.tokenCarryOver && userData.tokens_balance > 0) {
      if (plan.carryOverDays === -1) {
        // Premium: 무제한 이월
        carryOver = userData.carry_over_tokens + userData.tokens_balance;
      } else {
        // Pro: 최대 7일치 이월
        const maxCarryOver = plan.dailyTokens * plan.carryOverDays;
        carryOver = Math.min(userData.carry_over_tokens + userData.tokens_balance, maxCarryOver);
      }
    }

    await this.db.execute(
      `UPDATE user_tokens 
       SET tokens_balance = ?, carry_over_tokens = ?, daily_reset_at = NOW()
       WHERE user_id = ?`,
      [plan.dailyTokens, carryOver, userId]
    );

    return {
      balance: plan.dailyTokens,
      bonus: userData.tokens_bonus,
      plan: userData.plan,
      carryOver: carryOver,
      total: plan.dailyTokens + userData.tokens_bonus + carryOver
    };
  }

  /**
   * 토큰 사용 (핵심 로직)
   */
  async useTokens(userId, action, metadata = {}) {
    // 1. 비용 확인
    const cost = TOKEN_COSTS[action];
    if (!cost) throw new Error(`Unknown action: ${action}`);

    // 2. 캐시 체크 (토큰 절약!)
    const cacheKey = this.getCacheKey(userId, action, metadata);
    if (this.cache.has(cacheKey)) {
      console.log(`[TokenSaver] Cache hit! Saved ${cost} tokens for ${action}`);
      return {
        success: true,
        cached: true,
        tokenUsed: 0,
        result: this.cache.get(cacheKey)
      };
    }

    // 3. 잔액 확인
    const balance = await this.getBalance(userId);
    
    // 4. 플랜 기능 체크
    const planCheck = this.checkPlanPermission(balance.plan, action);
    if (!planCheck.allowed) {
      return {
        success: false,
        error: planCheck.error,
        requiredPlan: planCheck.requiredPlan
      };
    }

    // 5. 토큰 차감 (우선순위: 보너스 → 이월 → 기본)
    if (balance.total < cost) {
      return {
        success: false,
        error: 'INSUFFICIENT_TOKENS',
        balance: balance.total,
        required: cost,
        message: '토큰이 부족합니다. 요금제를 업그레이드하거나 내일 충전을 기다려주세요.'
      };
    }

    await this.deductTokens(userId, cost);

    // 6. 사용 로그 기록
    await this.logUsage(userId, action, cost, metadata);

    return {
      success: true,
      cached: false,
      tokenUsed: cost,
      remainingBalance: balance.total - cost
    };
  }

  /**
   * 토큰 차감 (보너스 → 이월 → 기본 순서)
   */
  async deductTokens(userId, cost) {
    const [rows] = await this.db.execute(
      'SELECT tokens_balance, tokens_bonus, carry_over_tokens FROM user_tokens WHERE user_id = ?',
      [userId]
    );
    
    let { tokens_bonus, carry_over_tokens, tokens_balance } = rows[0];
    let remaining = cost;

    // 보너스 토큰 먼저 사용
    if (tokens_bonus > 0) {
      const bonusUse = Math.min(remaining, tokens_bonus);
      tokens_bonus -= bonusUse;
      remaining -= bonusUse;
    }

    // 이월 토큰
    if (remaining > 0 && carry_over_tokens > 0) {
      const carryUse = Math.min(remaining, carry_over_tokens);
      carry_over_tokens -= carryUse;
      remaining -= carryUse;
    }

    // 기본 토큰
    if (remaining > 0) {
      tokens_balance -= remaining;
    }

    await this.db.execute(
      `UPDATE user_tokens 
       SET tokens_balance = ?, tokens_bonus = ?, carry_over_tokens = ?
       WHERE user_id = ?`,
      [tokens_balance, tokens_bonus, carry_over_tokens, userId]
    );
  }

  /**
   * 캐시 키 생성 (토큰 절약 핵심!)
   */
  getCacheKey(userId, action, metadata) {
    // AI 분석의 경우: 동일 동물 + 동일 행동 패턴 = 캐시 히트
    if (action === 'ai_analysis') {
      return `${userId}:${action}:${metadata.animalType}:${metadata.behavior}`;
    }
    // TTS: 동일 텍스트 = 캐시 히트
    if (action === 'tts_voice') {
      return `${userId}:${action}:${metadata.text?.substring(0, 100)}`;
    }
    // 기본: 캐시하지 않음
    return null;
  }

  /**
   * 캐시에 결과 저장
   */
  cacheResult(userId, action, metadata, result) {
    const key = this.getCacheKey(userId, action, metadata);
    if (key) {
      this.cache.set(key, { ...result, cachedAt: Date.now() });
      // 30분 후 자동 만료
      setTimeout(() => this.cache.delete(key), 30 * 60 * 1000);
    }
  }

  /**
   * 배치 분석 (토큰 절약 40%)
   */
  async batchAnalysis(userId, analyses) {
    const totalIndividualCost = analyses.length * TOKEN_COSTS.ai_analysis;
    const batchCost = Math.ceil(totalIndividualCost * 0.6); // 40% 할인
    const savedTokens = totalIndividualCost - batchCost;

    const balance = await this.getBalance(userId);
    if (balance.total < batchCost) {
      return {
        success: false,
        error: 'INSUFFICIENT_TOKENS',
        required: batchCost,
        individualCost: totalIndividualCost,
        saved: savedTokens
      };
    }

    await this.deductTokens(userId, batchCost);
    await this.logUsage(userId, 'batch_analysis', batchCost, { count: analyses.length });

    return {
      success: true,
      tokenUsed: batchCost,
      individualCost: totalIndividualCost,
      saved: savedTokens,
      message: `배치 분석으로 ${savedTokens} 토큰을 절약했습니다!`
    };
  }

  /**
   * 출석 체크 보너스
   */
  async dailyCheckIn(userId) {
    const [rows] = await this.db.execute(
      `SELECT consecutive_days, last_checkin FROM user_checkins WHERE user_id = ?`,
      [userId]
    );

    let consecutiveDays = 1;
    let bonusTokens = 10; // 기본 보너스

    if (rows.length > 0) {
      const lastCheckin = new Date(rows[0].last_checkin);
      const today = new Date();
      const diffDays = Math.floor((today - lastCheckin) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return { success: false, message: '오늘 이미 출석했습니다!' };
      } else if (diffDays === 1) {
        consecutiveDays = rows[0].consecutive_days + 1;
      }
      // diffDays > 1이면 연속 출석 리셋

      // 연속 출석 보너스 (최대 50)
      bonusTokens = Math.min(10 + (consecutiveDays - 1) * 5, 50);
    }

    // 보너스 토큰 지급
    await this.db.execute(
      `UPDATE user_tokens SET tokens_bonus = tokens_bonus + ? WHERE user_id = ?`,
      [bonusTokens, userId]
    );

    // 출석 기록
    await this.db.execute(
      `INSERT INTO user_checkins (user_id, consecutive_days, last_checkin, bonus_earned) 
       VALUES (?, ?, NOW(), ?)
       ON DUPLICATE KEY UPDATE consecutive_days = ?, last_checkin = NOW(), bonus_earned = bonus_earned + ?`,
      [userId, consecutiveDays, bonusTokens, consecutiveDays, bonusTokens]
    );

    return {
      success: true,
      consecutiveDays,
      bonusTokens,
      message: `${consecutiveDays}일 연속 출석! 🎉 ${bonusTokens} 보너스 토큰 획득!`
    };
  }

  /**
   * 친구 초대 리워드
   */
  async referralReward(inviterId, inviteeId) {
    const rewardTokens = 100;

    // 양쪽 모두에게 지급
    await this.db.execute(
      `UPDATE user_tokens SET tokens_bonus = tokens_bonus + ? WHERE user_id IN (?, ?)`,
      [rewardTokens, inviterId, inviteeId]
    );

    await this.db.execute(
      `INSERT INTO referral_log (inviter_id, invitee_id, reward_tokens, created_at)
       VALUES (?, ?, ?, NOW())`,
      [inviterId, inviteeId, rewardTokens]
    );

    return {
      success: true,
      reward: rewardTokens,
      message: `초대 성공! 🎁 ${rewardTokens} 보너스 토큰이 지급되었습니다!`
    };
  }

  /**
   * 플랜 권한 체크
   */
  checkPlanPermission(plan, action) {
    const config = PLANS[plan] || PLANS.free;

    if (action === 'tts_voice' && !config.ttsEnabled) {
      return { allowed: false, error: 'PLAN_UPGRADE_REQUIRED', requiredPlan: 'pro', message: 'TTS 음성 통역은 Pro 이상에서 이용 가능합니다.' };
    }
    if (action === 'bio_scan' && !config.bioScanEnabled) {
      return { allowed: false, error: 'PLAN_UPGRADE_REQUIRED', requiredPlan: 'pro', message: '생체분석은 Pro 이상에서 이용 가능합니다.' };
    }
    if (action === 'gps_advanced' && !config.gpsAdvanced) {
      return { allowed: false, error: 'PLAN_UPGRADE_REQUIRED', requiredPlan: 'pro', message: 'GPS 고급 기능은 Pro 이상에서 이용 가능합니다.' };
    }

    return { allowed: true };
  }

  /**
   * 사용 로그 기록
   */
  async logUsage(userId, action, cost, metadata = {}) {
    await this.db.execute(
      `INSERT INTO token_usage_log (user_id, action, cost, metadata, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, action, cost, JSON.stringify(metadata)]
    );
  }

  /**
   * 일일 리셋 필요 여부 체크
   */
  shouldResetDaily(lastReset) {
    const now = new Date();
    const reset = new Date(lastReset);
    return now.toDateString() !== reset.toDateString();
  }

  /**
   * 사용량 통계 (대시보드용)
   */
  async getUsageStats(userId, days = 7) {
    const [rows] = await this.db.execute(
      `SELECT action, SUM(cost) as total_cost, COUNT(*) as count,
              DATE(created_at) as date
       FROM token_usage_log 
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY action, DATE(created_at)
       ORDER BY date DESC`,
      [userId, days]
    );

    return rows;
  }
}

// ============================================
// 4. DB 테이블 생성 SQL
// ============================================
const TOKEN_TABLES_SQL = `
-- 토큰 잔액 테이블
CREATE TABLE IF NOT EXISTS user_tokens (
  user_id INT PRIMARY KEY,
  plan ENUM('free', 'pro', 'premium') DEFAULT 'free',
  tokens_balance INT DEFAULT 50,
  tokens_bonus INT DEFAULT 0,
  carry_over_tokens INT DEFAULT 0,
  daily_reset_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 토큰 사용 로그
CREATE TABLE IF NOT EXISTS token_usage_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  cost INT NOT NULL,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 출석 체크
CREATE TABLE IF NOT EXISTS user_checkins (
  user_id INT PRIMARY KEY,
  consecutive_days INT DEFAULT 0,
  last_checkin DATETIME,
  bonus_earned INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 친구 초대 로그
CREATE TABLE IF NOT EXISTS referral_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inviter_id INT NOT NULL,
  invitee_id INT NOT NULL,
  reward_tokens INT DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inviter_id) REFERENCES users(id),
  FOREIGN KEY (invitee_id) REFERENCES users(id)
);

-- 구독 결제 기록
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('free', 'pro', 'premium') NOT NULL,
  billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
  amount INT NOT NULL,
  status ENUM('active', 'cancelled', 'expired', 'pending') DEFAULT 'active',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  cancelled_at DATETIME,
  payment_method VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

// ============================================
// 5. Express 라우터
// ============================================
function tokenRoutes(router, db) {
  const tokenManager = new TokenManager(db);

  // 토큰 잔액 조회
  router.get('/api/tokens/balance', async (req, res) => {
    try {
      const balance = await tokenManager.getBalance(req.user.id);
      res.json({ success: true, data: balance });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 토큰 사용
  router.post('/api/tokens/use', async (req, res) => {
    try {
      const { action, metadata } = req.body;
      const result = await tokenManager.useTokens(req.user.id, action, metadata);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 출석 체크
  router.post('/api/tokens/checkin', async (req, res) => {
    try {
      const result = await tokenManager.dailyCheckIn(req.user.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 친구 초대
  router.post('/api/tokens/referral', async (req, res) => {
    try {
      const { inviteeId } = req.body;
      const result = await tokenManager.referralReward(req.user.id, inviteeId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 사용량 통계
  router.get('/api/tokens/stats', async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const stats = await tokenManager.getUsageStats(req.user.id, days);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 요금제 정보
  router.get('/api/plans', (req, res) => {
    res.json({ success: true, data: PLANS });
  });

  return router;
}

module.exports = { TokenManager, PLANS, TOKEN_COSTS, TOKEN_TABLES_SQL, tokenRoutes };
