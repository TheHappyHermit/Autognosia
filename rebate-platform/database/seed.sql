-- Seed data for the rebate platform (development only)
-- Password hashes are for 'password' using bcrypt

-- Admin user (password: admin123)
INSERT INTO users (email, full_name, password_hash, role, email_verified)
VALUES (
    'admin@findyourvpn.com',
    'Platform Admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin',
    TRUE
);

-- Merchant owner demo user (password: merchant123)
INSERT INTO users (email, full_name, password_hash, role, email_verified)
VALUES (
    'owner@merchant-demo.test',
    'Merchant Owner',
    '$2a$10$3k4Z5qL0yA81vPqF4CfQeeYQT3z.i0.nCwGj6OOE2RNWlJ5hX4qGq',
    'merchant_admin',
    TRUE
);

-- Demo VPN merchant
INSERT INTO merchants (merchant_id, name, brand, category, description, website, status, owner_user_id, contact_email, approved_at, approved_by)
VALUES (
    uuid_generate_v4(),
    'NordWind VPN',
    'NordWind',
    'vpn',
    'A demo merchant for FindYourVPN rebate platform.',
    'https://example.nordwindvpn.test',
    'active',
    (SELECT user_id FROM users WHERE email = 'owner@merchant-demo.test'),
    'partner@merchant-demo.test',
    NOW(),
    (SELECT user_id FROM users WHERE email = 'admin@findyourvpn.com')
);

-- Standard user (password: user123)
INSERT INTO users (email, full_name, password_hash, role, email_verified)
VALUES (
    'demo@findyourvpn.com',
    'Demo User',
    '$2a$10$4Vz2UQ3lI7tkXX7A1Ij3DeQlP6AUwz6HlC1Mq/9/q4P1yxqRsSOQq',
    'user',
    TRUE
);

SELECT 'Seed data inserted successfully.' AS status;
