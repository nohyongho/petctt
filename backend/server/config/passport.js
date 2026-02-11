// server/config/passport.js
// Passport 소셜 로그인 전략 - Google, Kakao, Naver

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const NaverStrategy = require('passport-naver-v2').Strategy;
const { findOrCreateUser } = require('../middleware/auth');

// ===== Google =====
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    scope: ['profile', 'email'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser({
        provider: 'google',
        providerId: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        nickname: profile.displayName,
        profileImage: profile.photos?.[0]?.value,
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
  console.log('  ✅ Google OAuth 전략 등록');
}

// ===== Kakao =====
if (process.env.KAKAO_JAVASCRIPT_KEY || process.env.KAKAO_CLIENT_ID) {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_JAVASCRIPT_KEY || process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    callbackURL: process.env.KAKAO_CALLBACK_URL || '/api/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const kakaoAccount = profile._json?.kakao_account;
      const user = await findOrCreateUser({
        provider: 'kakao',
        providerId: String(profile.id),
        email: kakaoAccount?.email,
        name: profile.displayName || kakaoAccount?.profile?.nickname,
        nickname: profile.displayName || kakaoAccount?.profile?.nickname,
        profileImage: kakaoAccount?.profile?.profile_image_url,
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
  console.log('  ✅ Kakao OAuth 전략 등록');
}

// ===== Naver =====
if (process.env.NAVER_CLIENT_ID) {
  passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: process.env.NAVER_CALLBACK_URL || '/api/auth/naver/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser({
        provider: 'naver',
        providerId: profile.id,
        email: profile.email,
        name: profile.name || profile.nickname,
        nickname: profile.nickname || profile.name,
        profileImage: profile.profileImage,
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
  console.log('  ✅ Naver OAuth 전략 등록');
}

// Serialize/Deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

module.exports = passport;