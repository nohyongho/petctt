const sequelize = require('../config/database');
const helpers = require('../middleware/helpers');

const CouponController = {
  // 주변 쿠폰 조회
  getNearby: async (req, res) => {
    try {
      const { lat, lng, radius = 5000 } = req.query;

      if (!lat || !lng) {
        return helpers.error(res, '위치 정보(lat, lng)가 필요합니다.');
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusMeters = parseInt(radius);

      // 주변 쿠폰 조회 (반경 기반)
      const [coupons] = await sequelize.query(`
        SELECT 
          c.id as coupon_id,
          c.coupon_name,
          c.coupon_type,
          c.percent_off,
          c.amount,
          c.remaining_coupons,
          c.valid_till,
          c.description,
          o.id as outlet_id,
          o.outlet_name,
          o.latitude,
          o.longitude,
          o.lp_url,
          b.brand_name
        FROM coupon c
        JOIN outlet o ON c.outlet_id = o.id
        JOIN brand b ON c.brand_id = b.id
        WHERE c.status = 'available'
          AND c.is_deleted = false
          AND c.remaining_coupons > 0
          AND c.valid_till > NOW()
        ORDER BY c.createdAt DESC
      `);

      // 거리 계산 및 필터링
      const nearbyCoupons = coupons
        .map(coupon => {
          const distance = helpers.calculateDistance(
            latitude, longitude,
            parseFloat(coupon.latitude), parseFloat(coupon.longitude)
          );
          return { ...coupon, distance_meters: Math.round(distance) };
        })
        .filter(coupon => coupon.distance_meters <= radiusMeters)
        .sort((a, b) => a.distance_meters - b.distance_meters);

      return helpers.success(res, nearbyCoupons, `${nearbyCoupons.length}개의 쿠폰을 찾았습니다.`);

    } catch (error) {
      console.error('Get nearby coupons error:', error);
      return helpers.error(res, '쿠폰 조회 중 오류가 발생했습니다.', 500);
    }
  },

  // 쿠폰 발행 (관리자)
  issueCoupon: async (req, res) => {
    try {
      const {
        outlet_id, coupon_name, coupon_type = 'radius_based',
        total_coupons, percent_off, amount,
        valid_from, valid_till, description, radius_meters = 1000
      } = req.body;

      if (!outlet_id || !coupon_name || !total_coupons) {
        return helpers.error(res, '필수 정보가 누락되었습니다.');
      }

      // Outlet 정보 조회
      const [outlets] = await sequelize.query(
        'SELECT id, brand_id FROM outlet WHERE id = ?',
        { replacements: [outlet_id] }
      );

      if (outlets.length === 0) {
        return helpers.error(res, '존재하지 않는 상점입니다.', 404);
      }

      const outlet = outlets[0];

      // 쿠폰 생성
      const [result] = await sequelize.query(`
        INSERT INTO coupon (
          outlet_id, brand_id, coupon_name, coupon_type,
          total_coupons, remaining_coupons, amount, percent_off,
          valid_from, valid_till, description, radius_meters, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
      `, {
        replacements: [
          outlet_id, outlet.brand_id, coupon_name, coupon_type,
          total_coupons, total_coupons, amount || 0, percent_off || 0,
          valid_from || new Date(), valid_till, description || '', radius_meters
        ]
      });

      return helpers.success(res, {
        coupon_id: result,
        remaining_coupons: total_coupons
      }, '쿠폰 발행 완료!');

    } catch (error) {
      console.error('Issue coupon error:', error);
      return helpers.error(res, '쿠폰 발행 중 오류가 발생했습니다.', 500);
    }
  }
};

module.exports = CouponController;
