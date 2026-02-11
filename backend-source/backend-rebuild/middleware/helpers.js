const bcrypt = require('bcrypt');

const helpers = {
  // 비밀번호 해시
  hashPassword: async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  // 비밀번호 비교
  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },

  // 성공 응답
  success: (res, data, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data
    });
  },

  // 에러 응답
  error: (res, message = 'Error occurred', statusCode = 400) => {
    return res.status(statusCode).json({
      success: false,
      message
    });
  },

  // 거리 계산 (Haversine formula)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // 지구 반경 (m)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터 단위
  },

  // 랜덤 해시 생성
  generateHash: () => {
    return require('crypto').randomBytes(32).toString('hex');
  }
};

module.exports = helpers;
