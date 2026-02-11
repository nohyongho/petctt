const sequelize = require('../config/database');
const helpers = require('../middleware/helpers');
const { generateToken } = require('../middleware/auth');

const AuthController = {
  // 회원가입
  register: async (req, res) => {
    try {
      const { email, password, full_name, contact_no } = req.body;

      // 유효성 검사
      if (!email || !password) {
        return helpers.error(res, '이메일과 비밀번호는 필수입니다.');
      }

      // 이메일 중복 체크
      const [existingUsers] = await sequelize.query(
        'SELECT id FROM user WHERE email = ? OR contact_no = ?',
        { replacements: [email, contact_no || null] }
      );

      if (existingUsers.length > 0) {
        return helpers.error(res, '이미 사용 중인 이메일 또는 전화번호입니다.');
      }

      // 비밀번호 해시
      const hashedPassword = await helpers.hashPassword(password);

      // 사용자 생성
      const [result] = await sequelize.query(
        `INSERT INTO user (email, password, full_name, contact_no, is_email_verified, user_status, role_id) 
         VALUES (?, ?, ?, ?, true, 'active', 1)`,
        { replacements: [email, hashedPassword, full_name || null, contact_no || null] }
      );

      return helpers.success(res, {
        user_id: result,
        email
      }, '회원가입 성공!');

    } catch (error) {
      console.error('Register error:', error);
      return helpers.error(res, '회원가입 중 오류가 발생했습니다.', 500);
    }
  },

  // 로그인
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return helpers.error(res, '이메일과 비밀번호를 입력하세요.');
      }

      // 사용자 조회
      const [users] = await sequelize.query(
        'SELECT id, email, password, full_name, user_status, role_id FROM user WHERE email = ? AND isDeleted = false',
        { replacements: [email] }
      );

      if (users.length === 0) {
        return helpers.error(res, '이메일 또는 비밀번호가 일치하지 않습니다.', 401);
      }

      const user = users[0];

      // 비밀번호 확인
      const isMatch = await helpers.comparePassword(password, user.password);
      if (!isMatch) {
        return helpers.error(res, '이메일 또는 비밀번호가 일치하지 않습니다.', 401);
      }

      // 차단된 사용자 체크
      if (user.user_status === 'blocked') {
        return helpers.error(res, '차단된 계정입니다.', 403);
      }

      // JWT 토큰 생성
      const token = generateToken({
        user_id: user.id,
        email: user.email,
        role_id: user.role_id
      });

      // 로그인 시간 업데이트
      await sequelize.query(
        'UPDATE user SET login_status = true, login_time = NOW() WHERE id = ?',
        { replacements: [user.id] }
      );

      return helpers.success(res, {
        token,
        user: {
          user_id: user.id,
          email: user.email,
          full_name: user.full_name,
          user_status: user.user_status
        }
      }, '로그인 성공!');

    } catch (error) {
      console.error('Login error:', error);
      return helpers.error(res, '로그인 중 오류가 발생했습니다.', 500);
    }
  },

  // 프로필 조회
  getProfile: async (req, res) => {
    try {
      const userId = req.user.user_id;

      const [users] = await sequelize.query(
        'SELECT id, email, full_name, contact_no, age, gender, is_email_verified, user_status, createdAt FROM user WHERE id = ?',
        { replacements: [userId] }
      );

      if (users.length === 0) {
        return helpers.error(res, '사용자를 찾을 수 없습니다.', 404);
      }

      return helpers.success(res, users[0]);

    } catch (error) {
      console.error('Get profile error:', error);
      return helpers.error(res, '프로필 조회 중 오류가 발생했습니다.', 500);
    }
  }
};

module.exports = AuthController;
