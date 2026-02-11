-- ============================================
-- PetCTT Database Schema (MySQL)
-- 생성일: 2026-02-06
-- ============================================

-- 문자셋 설정
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- 1. 사용자 (Users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  nickname VARCHAR(100),
  name VARCHAR(100),
  phone VARCHAR(20),
  profile_image VARCHAR(500),
  role ENUM('user', 'store_owner', 'admin') DEFAULT 'user',
  provider ENUM('local', 'google', 'kakao', 'naver') DEFAULT 'local',
  provider_id VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_provider (provider, provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. 매장 (Stores) - 구름장터 입점 매장
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_id BIGINT NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE,
  description TEXT,
  category VARCHAR(100),
  phone VARCHAR(20),
  address VARCHAR(500),
  address_detail VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  logo_image VARCHAR(500),
  banner_image VARCHAR(500),
  business_number VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. 상품 (Products) - 구름장터 상품
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  store_id BIGINT NOT NULL,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  price INT NOT NULL DEFAULT 0,
  sale_price INT,
  stock INT DEFAULT 0,
  category VARCHAR(100),
  image_url VARCHAR(500),
  images JSON,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_store (store_id),
  INDEX idx_category (category),
  INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. 쿠폰 (Coupons) - 쿠폰톡톡
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  store_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed') DEFAULT 'fixed',
  discount_value INT NOT NULL DEFAULT 0,
  min_purchase INT DEFAULT 0,
  max_discount INT,
  total_quantity INT DEFAULT 100,
  remaining_quantity INT DEFAULT 100,
  rarity ENUM('common', 'rare', 'epic', 'legendary', 'mythic') DEFAULT 'common',
  image_url VARCHAR(500),
  start_date DATETIME,
  end_date DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_store (store_id),
  INDEX idx_rarity (rarity),
  INDEX idx_active_dates (is_active, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. 쿠폰 지갑 (Coupon Wallet) - 사용자 보유 쿠폰
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_wallet (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  coupon_id BIGINT NOT NULL,
  status ENUM('active', 'used', 'expired') DEFAULT 'active',
  acquired_method ENUM('game', 'purchase', 'gift', 'event') DEFAULT 'game',
  acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME,
  order_id BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_coupon (coupon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. 주문 (Orders) - 구름장터 주문
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  store_id BIGINT NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
  total_amount INT NOT NULL DEFAULT 0,
  discount_amount INT DEFAULT 0,
  final_amount INT NOT NULL DEFAULT 0,
  coupon_wallet_id BIGINT,
  shipping_address VARCHAR(500),
  shipping_memo VARCHAR(200),
  paid_at DATETIME,
  shipped_at DATETIME,
  delivered_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_wallet_id) REFERENCES coupon_wallet(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_store (store_id),
  INDEX idx_status (status),
  INDEX idx_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. 주문 상품 (Order Items)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price INT NOT NULL DEFAULT 0,
  total_price INT NOT NULL DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. 게임 기록 (Game Records) - 쿠폰톡톡 게임
-- ============================================
CREATE TABLE IF NOT EXISTS game_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  game_type ENUM('coupon_catch', 'ar_hunt', 'daily_spin') DEFAULT 'coupon_catch',
  score INT DEFAULT 0,
  coupons_caught INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_game_type_score (game_type, score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. 반려동물 (Pets) - PetCTT 핵심
-- ============================================
CREATE TABLE IF NOT EXISTS pets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  species ENUM('dog', 'cat', 'bird', 'fish', 'hamster', 'rabbit', 'other') DEFAULT 'dog',
  breed VARCHAR(100),
  birth_date DATE,
  gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
  weight DECIMAL(5, 2),
  profile_image VARCHAR(500),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. 세션/리프레시 토큰
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token(255)),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 초기 데이터 (선택사항)
-- ============================================

-- 관리자 계정 (비밀번호: admin123 → bcrypt 해시로 변경 필요)
-- INSERT INTO users (email, password_hash, nickname, name, role)
-- VALUES ('admin@petctt.com', '$2b$10$xxxxx', '관리자', 'PetCTT Admin', 'admin');

SELECT '✅ PetCTT 데이터베이스 스키마 생성 완료!' AS status;
SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = 'petctt';
