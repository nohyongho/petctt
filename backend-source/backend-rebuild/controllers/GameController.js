const sequelize = require('../config/database');
const helpers = require('../middleware/helpers');

const GameController = {
  // 게임 보상 (쿠폰 획득)
  claimReward: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { coupon_id, game_session_id, location } = req.body;

      if (!coupon_id || !location || !location.latitude || !location.longitude) {
        return helpers.error(res, '필수 정보가 누락되었습니다.');
      }

      // 쿠폰 정보 조회
      const [coupons] = await sequelize.query(`
        SELECT c.*, o.latitude as outlet_lat, o.longitude as outlet_lng
        FROM coupon c
        JOIN outlet o ON c.outlet_id = o.id
        WHERE c.id = ? AND c.status = 'available' AND c.remaining_coupons > 0 AND c.valid_till > NOW()
      `, { replacements: [coupon_id] });

      if (coupons.length === 0) {
        return helpers.error(res, '사용 가능한 쿠폰이 아닙니다.', 404);
      }

      const coupon = coupons[0];

      // 거리 확인 (반경 내에 있는지)
      const distance = helpers.calculateDistance(
        parseFloat(location.latitude), parseFloat(location.longitude),
        parseFloat(coupon.outlet_lat), parseFloat(coupon.outlet_lng)
      );

      if (distance > coupon.radius_meters) {
        return helpers.error(res, '쿠폰 획득 가능 범위를 벗어났습니다.', 400);
      }

      // 이미 보유 중인지 체크
      const [existing] = await sequelize.query(
        'SELECT id FROM collected_coupon WHERE user_id = ? AND coupon_id = ? AND is_coupon != "REDEEMED"',
        { replacements: [userId, coupon_id] }
      );

      if (existing.length >= coupon.per_user) {
        return helpers.error(res, '이미 보유 중인 쿠폰입니다.');
      }

      // 쿠폰 획득
      const hash = helpers.generateHash();
      const pointStr = `POINT(${location.latitude} ${location.longitude})`;

      const [result] = await sequelize.query(`
        INSERT INTO collected_coupon (user_id, coupon_id, location, hash, is_coupon)
        VALUES (?, ?, ST_GeomFromText(?), ?, 'COLLECTED')
      `, { replacements: [userId, coupon_id, pointStr, hash] });

      // 잔여 쿠폰 수 감소
      await sequelize.query(
        'UPDATE coupon SET remaining_coupons = remaining_coupons - 1 WHERE id = ?',
        { replacements: [coupon_id] }
      );

      return helpers.success(res, {
        collected_coupon_id: result,
        coupon_name: coupon.coupon_name,
        is_coupon: 'COLLECTED',
        hash: hash.substring(0, 16) + '...'
      }, '쿠폰 획득 성공! 지갑에 저장되었습니다. 🎉');

    } catch (error) {
      console.error('Claim reward error:', error);
      return helpers.error(res, '쿠폰 획득 중 오류가 발생했습니다.', 500);
    }
  }
};

module.exports = GameController;
