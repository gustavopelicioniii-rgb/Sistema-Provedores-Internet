-- Missing tables created via Supabase Management API

-- billing_rules table
CREATE TABLE IF NOT EXISTS billing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- sla_configs table
CREATE TABLE IF NOT EXISTS sla_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    response_time_minutes INTEGER DEFAULT 60,
    resolution_time_hours INTEGER DEFAULT 24,
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ftth_nodes table (FTTH network nodes)
CREATE TABLE IF NOT EXISTS ftth_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    node_type TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    capacity INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notification_alerts table
CREATE TABLE IF NOT EXISTS notification_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    user_id UUID,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    channel TEXT DEFAULT 'in_app',
    reference_id UUID,
    reference_type TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_billing_rules_org ON billing_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_sla_configs_org ON sla_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_ftth_nodes_org ON ftth_nodes(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_alerts_org ON notification_alerts(organization_id);
