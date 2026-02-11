const sequelize = require('../config/database');
const helpers = require('../middleware/helpers');

const WalletController = {
  // 내 쿠폰 목록
  getMyCoupons: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { status = 'COLLECTED' } = req.query;

      const [coupons] = await sequelize.query(`
        SELECT 
          cc.id as collected_coupon_id,
          cc.is_coupon,
          cc.createdAt as collected_at,
          cc.redeemed_at,
          c.id as coupon_id,
          c.coupon_name,
          c.coupon_type,
          c.percent_off,
          c.amount,
          c.valid_till,
          c.description,
          o.id as outlet_id,
          o.outlet_name,
          o.lp_url,
          b.brand_name
        FROM collected_coupon cc
        JOIN coupon c ON cc.coupon_id = c.id
        JOIN outlet o ON c.outlet_id = o.id
        JOIN brand b ON c.brand_id = b.id
        WHERE cc.user_id = ? 
          AND cc.is_deleted = false
          ${status ? 'AND cc.is_coupon = ?' : ''}
        ORDER BY cc.createdAt DESC
      `, { replacements: status ? [userId, status] : [userId] });

      return helpers.success(res, coupons, `${coupons.length}개의 쿠폰이 있습니다.`);

    } catch (error) {
      console.error('Get my coupons error:', error);
      return helpers.error(res, '쿠폰 조회 중 오류가 발생했습니다.', 500);
    }
  },

  // 쿠폰 사용
  redeemCoupon: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { collected_coupon_id } = req.body;

      if (!collected_coupon_id) {
        return helpers.error(res, 'collected_coupon_id가 필요합니다.');
      }

      // 보유 쿠폰 확인
      const [coupons] = await sequelize.query(`
        SELECT cc.id, cc.is_coupon, c.valid_till, o.lp_url
        FROM collected_coupon cc
        JOIN coupon c ON cc.coupon_id = c.id
        JOIN outlet o ON c.outlet_id = o.id
        WHERE cc.id = ? AND cc.user_id = ? AND cc.is_deleted = false
      `, { replacements: [collected_coupon_id, userId] });

      if (coupons.length === 0) {
        return helpers.error(res, '존재하지 않는 쿠폰입니다.', 404);
      }

      const coupon = coupons[0];

      if (coupon.is_coupon === 'REDEEMED') {
        return helpers.error(res, '이미 사용한 쿠폰입니다.');
      }

      if (new Date(coupon.valid_till) < new Date()) {
        return helpers.error(res, '만료된 쿠폰입니다.');
      }

      // 쿠폰 사용 처리
      await sequelize.query(
        "UPDATE collected_coupon SET is_coupon = 'REDEEMED', redeemed_at = NOW() WHERE id = ?",
        { replacements: [collected_coupon_id] }
      );

      return helpers.success(res, {
        collected_coupon_id,
        is_coupon: 'REDEEMED',
        redeemed_at: new Date(),
        redirect_url: coupon.lp_url
      }, '쿠폰 사용 완료! 🎉');

    } catch (error) {
      console.error('Redeem coupon error:', error);
      return helpers.error(res, '쿠폰 사용 중 오류가 발생했습니다.', 500);
    }
  },

  // LP URL 리다이렉트
  redirectToLP: async (req, res) => {
    try {
      const { collected_id } = req.params;

      const [coupons] = await sequelize.query(`
        SELECT o.lp_url, cc.is_coupon
        FROM collected_coupon cc
        JOIN coupon c ON cc.coupon_id = c.id
        JOIN outlet o ON c.outlet_id = o.id
        WHERE cc.id = ? AND cc.is_deleted = false
      `, { replacements: [collected_id] });

      if (coupons.length === 0 || !coupons[0].lp_url) {
        return helpers.error(res, 'LP URL을 찾을 수 없습니다.', 404);
      }

      // 리다이렉트
      return res.redirect(302, coupons[0].lp_url);

    } catch (error) {
      console.error('Redirect error:', error);
      return helpers.error(res, '리다이렉트 중 오류가 발생했습니다.', 500);
    }
  }
};

module.exports = WalletController;
