-- PetCTT MVP Database Schema
-- MySQL 8.0+
-- 실행 방법: mysql -u petctt_user -p petctt_mvp < schema.sql

USE petctt_mvp;

-- 기존 테이블 삭제 (개발용 - 프로덕션 주의!)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS collected_coupon;
DROP TABLE IF EXISTS coupon;
DROP TABLE IF EXISTS outlet;
DROP TABLE IF EXISTS brand;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS role;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Role 테이블 (사용자 권한)
CREATE TABLE role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기본 역할 추가
INSERT INTO role (role_name) VALUES ('user'), ('merchant'), ('admin');

-- 2. User 테이블
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(50),
  contact_no VARCHAR(20) UNIQUE,
  age INT,
  gender VARCHAR(12),
  is_email_verified BOOLEAN DEFAULT false,
  user_status ENUM('active', 'blocked') DEFAULT 'active',
  isDeleted BOOLEAN DEFAULT false,
  login_status BOOLEAN DEFAULT false,
  login_time DATETIME,
  role_id INT DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES role(id),
  INDEX idx_email (email),
  INDEX idx_contact (contact_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Brand 테이블
CREATE TABLE brand (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand_name VARCHAR(100) NOT NULL,
  brand_logo VARCHAR(500),
  status BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_brand_name (brand_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Outlet 테이블 (구름장터 LP URL 포함)
CREATE TABLE outlet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand_id INT,
  outlet_name VARCHAR(100) NOT NULL,
  latitude VARCHAR(255),
  longitude VARCHAR(255),
  address VARCHAR(255),
  postal_code VARCHAR(10),
  phone_number VARCHAR(20),
  lp_url VARCHAR(500) COMMENT '구름장터 LP URL',
  nearby_couponrange DOUBLE DEFAULT 1000 COMMENT '반경 쿠폰 범위 (m)',
  status BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brand(id) ON DELETE SET NULL,
  INDEX idx_location (latitude, longitude),
  INDEX idx_brand (brand_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Coupon 테이블 (반경 쿠폰)
CREATE TABLE coupon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outlet_id INT,
  brand_id INT,
  coupon_name VARCHAR(100) NOT NULL,
  coupon_type ENUM('common', 'random', 'user_location', 'radius_based') DEFAULT 'radius_based',
  total_coupons INT DEFAULT 0,
  remaining_coupons INT DEFAULT 0,
  amount DECIMAL(8,2) DEFAULT 0 COMMENT '할인 금액',
  percent_off INT COMMENT '할인 퍼센트',
  max_discount DECIMAL(8,2) COMMENT '최대 할인 금액',
  valid_from DATETIME,
  valid_till DATETIME,
  description VARCHAR(255),
  coupon_image VARCHAR(500),
  per_user INT DEFAULT 1 COMMENT '사용자당 획득 가능 수',
  radius_meters INT DEFAULT 1000 COMMENT '반경 쿠폰 범위 (m)',
  status ENUM('available', 'pending', 'expired') DEFAULT 'available',
  is_deleted BOOLEAN DEFAULT false,
  is_countrywide BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlet(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brand(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_valid_till (valid_till),
  INDEX idx_outlet (outlet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. CollectedCoupon 테이블 (사용자 지갑)
CREATE TABLE collected_coupon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  coupon_id INT NOT NULL,
  location POINT COMMENT '획득 위치 (lat, lng)',
  hash VARCHAR(64) COMMENT '보안 해시',
  is_coupon ENUM('COLLECTED', 'REDEEMED', 'HIDDEN') DEFAULT 'COLLECTED',
  is_deleted BOOLEAN DEFAULT false,
  redeemed_at DATETIME COMMENT '사용 일시',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_id) REFERENCES coupon(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_coupon (coupon_id),
  INDEX idx_status (is_coupon),
  SPATIAL INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 샘플 데이터 (개발/테스트용)
-- Brand
INSERT INTO brand (brand_name, brand_logo, status) VALUES
('스타벅스', 'https://example.com/starbucks.png', true),
('투썸플레이스', 'https://example.com/twosome.png', true),
('맥도날드', 'https://example.com/mcdonalds.png', true);

-- Outlet
INSERT INTO outlet (brand_id, outlet_name, latitude, longitude, address, lp_url, nearby_couponrange) VALUES
(1, '스타벅스 강남점', '37.5012345', '127.0398765', '서울시 강남구 테헤란로 123', 'https://example.com/shop/starbucks-gangnam', 1000),
(2, '투썸플레이스 홍대점', '37.5562345', '126.9222765', '서울시 마포구 양화로 456', 'https://example.com/shop/twosome-hongdae', 800),
(3, '맥도날드 신촌점', '37.5592345', '126.9392765', '서울시 서대문구 신촌로 789', 'https://example.com/shop/mcdonalds-sinchon', 1200);

-- Coupon
INSERT INTO coupon (outlet_id, brand_id, coupon_name, coupon_type, total_coupons, remaining_coupons, percent_off, valid_from, valid_till, description, radius_meters, status) VALUES
(1, 1, '아메리카노 50% 할인', 'radius_based', 100, 100, 50, '2026-02-04 00:00:00', '2026-02-28 23:59:59', '스타벅스 강남점 전용 쿠폰', 1000, 'available'),
(2, 2, '케이크 30% 할인', 'radius_based', 50, 50, 30, '2026-02-04 00:00:00', '2026-02-14 23:59:59', '투썸플레이스 발렌타인 특가', 800, 'available'),
(3, 3, '빅맥세트 20% 할인', 'radius_based', 200, 200, 20, '2026-02-04 00:00:00', '2026-03-31 23:59:59', '맥도날드 신촌점 3월 이벤트', 1200, 'available');

-- 테스트 사용자 (비밀번호: test1234)
-- 주의: 실제로는 bcrypt 해시 사용 필요
INSERT INTO user (email, password, full_name, contact_no, is_email_verified, user_status, role_id) VALUES
('test@petctt.com', '$2b$10$YourHashedPasswordHere', '테스트유저', '010-1234-5678', true, 'active', 1);

-- 완료 메시지
SELECT 'PetCTT MVP Database Schema created successfully! 🎉' AS status;
