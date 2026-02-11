// ============================================
// 🔐 Passport OAuth Configuration
// Google, Kakao, Naver 소셜 로그인
// ============================================
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const NaverStrategy = require('passport-naver-v2').Strategy;
const User = require('../models/User');

// ===== Serialize / Deserialize =====
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ===== 🔵 Google OAuth =====
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOrCreateSocial({
        provider: 'google',
        providerId: profile.id,
        email: profile.emails?.[0]?.value || null,
        nickname: profile.displayName,
        profileImage: profile.photos?.[0]?.value || null
      });
      done(null, user);
    } catch (err) {
      console.error('❌ Google OAuth 오류:', err);
      done(err, null);
    }
  }
));

// ===== 🟡 Kakao OAuth =====
passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_JAVASCRIPT_KEY,
    callbackURL: process.env.KAKAO_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const kakaoAccount = profile._json?.kakao_account;
      const user = await User.findOrCreateSocial({
        provider: 'kakao',
        providerId: String(profile.id),
        email: kakaoAccount?.email || null,
        nickname: profile.displayName || kakaoAccount?.profile?.nickname,
        profileImage: kakaoAccount?.profile?.profile_image_url || null
      });
      done(null, user);
    } catch (err) {
      console.error('❌ Kakao OAuth 오류:', err);
      done(err, null);
    }
  }
));

// ===== 🟢 Naver OAuth =====
passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: process.env.NAVER_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOrCreateSocial({
        provider: 'naver',
        providerId: profile.id,
        email: profile.email || null,
        nickname: profile.nickname || profile.name,
        profileImage: profile.profileImage || null
      });
      done(null, user);
    } catch (err) {
      console.error('❌ Naver OAuth 오류:', err);
      done(err, null);
    }
  }
));

module.exports = passport;
