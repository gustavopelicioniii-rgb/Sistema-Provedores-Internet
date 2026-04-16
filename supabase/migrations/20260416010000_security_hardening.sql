-- Security Hardening Migration
-- Creates tables for rate limiting and security logging

-- Rate Limits Table (for persistent rate limiting)
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    requests INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Security Logs Table (for audit trail)
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_org ON security_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_user ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_action ON security_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_logs_created ON security_logs(created_at);

-- Automatic cleanup of old rate limits (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic cleanup of old security logs (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM security_logs WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS to new tables
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage rate_limits
CREATE POLICY "Service role full access to rate_limits"
    ON rate_limits FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Users can only read their own org's security logs
CREATE POLICY "Users can view org security logs"
    ON security_logs FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT public.get_user_organization_id(auth.uid())
        )
    );

-- Policy: Service role can do everything on security_logs
CREATE POLICY "Service role full access to security_logs"
    ON security_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rate_limits_updated_at
    BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
