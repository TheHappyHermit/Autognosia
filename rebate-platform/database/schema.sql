-- ============================================================
-- Rebate Platform Database Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles / Users
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32) UNIQUE,
    full_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'user', -- user | merchant_admin | admin
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE merchants (
    merchant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(128), -- vpn, hosting, etc
    description TEXT,
    website VARCHAR(512),
    logo_url VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending | active | suspended
    owner_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(32),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(user_id)
);

-- Rebate campaigns
CREATE TABLE campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(64) NOT NULL, -- cashback | discount | referral_bonus
    status VARCHAR(32) NOT NULL DEFAULT 'draft', -- draft | active | paused | expired | completed
    priority INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    terms TEXT,
    approval_status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending | approved | rejected
    approved_by UUID REFERENCES users(user_id),
    approved_at TIMESTAMPTZ,
    merchant_account_details JSONB DEFAULT '{}'::jsonb,
    created_by UUID NOT NULL REFERENCES users(user_id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rebate rules / scenarios
CREATE TABLE campaign_rebate_rules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    scenario VARCHAR(128) NOT NULL, -- default, qualifying, tier1, tier2
    eligibility JSONB NOT NULL DEFAULT '{}'::jsonb,
    rebate JSONB NOT NULL, -- {type: fixed, percentage}, value, currency, cap, min_amount, max_amount
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User rebate applications
CREATE TABLE rebate_applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending | approved | rejected | paid | rejected
    source_transaction_id VARCHAR(255),
    proof_data JSONB DEFAULT '{}'::jsonb,
    decision_reason TEXT,
    decision_by UUID REFERENCES users(user_id),
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_rebate_applications_user_campaign_transaction
    ON rebate_applications(user_id, campaign_id, source_transaction_id)
    WHERE source_transaction_id IS NOT NULL;

-- Transactions for finance + evidence
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(campaign_id),
    merchant_id UUID NOT NULL REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL, -- purchase | rebate_payout | refund | fee | penalty
    amount NUMERIC(12,4) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'USD',
    method VARCHAR(32), -- auto_sync | manual_upload | cross_service
    source_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE redemptions (
    redemption_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES rebate_applications(application_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    amount NUMERIC(12,4) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(64) NOT NULL, -- paypal | bank_transfer | gift_card
    status VARCHAR(32) NOT NULL DEFAULT 'processing', -- processing | completed | failed | cancelled
    external_ref VARCHAR(255),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log (immutable)
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_type VARCHAR(32) NOT NULL, -- user | merchant_admin | system
    actor_id UUID,
    action VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL, -- campaign | rebate | transaction | redemption
    target_type VARCHAR(64),
    target_id UUID,
    before JSONB,
    after JSONB,
    delta JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_audit_logs_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX ix_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX ix_audit_logs_category_time ON audit_logs(category, occurred_at DESC);

-- Admin config
CREATE TABLE platform_settings (
    setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(64) NOT NULL,
    key VARCHAR(128) NOT NULL,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Rebate finance: merchant settlements
CREATE TABLE settlements (
    settlement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'USD',
    amount NUMERIC(12,4) NOT NULL,
    fee NUMERIC(12,4) DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending | paid | failed
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(merchant_id, period_start, period_end)
);

-- Indexes
CREATE INDEX ix_campaigns_merchant ON campaigns(merchant_id);
CREATE INDEX ix_campaigns_status ON campaigns(status, approval_status);
CREATE INDEX ix_transactions_user_campaign ON transactions(user_id, campaign_id);
CREATE INDEX ix_transactions_merchant ON transactions(merchant_id);
CREATE INDEX ix_rebate_applications_user ON rebate_applications(user_id);
CREATE INDEX ix_rebate_applications_campaign ON rebate_applications(campaign_id);
CREATE INDEX ix_redemptions_user ON redemptions(user_id);
CREATE INDEX ix_redemptions_campaign ON redemptions(campaign_id);
CREATE INDEX ix_settlements_merchant ON settlements(merchant_id);

-- Triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER merchants_set_updated_at
BEFORE UPDATE ON merchants
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER campaigns_set_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER rebate_applications_set_updated_at
BEFORE UPDATE ON rebate_applications
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER redemptions_set_updated_at
BEFORE UPDATE ON redemptions
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Row level security (disable for bc UUID handling is required)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE merchants DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_rebate_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE rebate_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE settlements DISABLE ROW LEVEL SECURITY;
