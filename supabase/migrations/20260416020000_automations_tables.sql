-- Automation Tables for ISP Management System

-- Automations table
CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('cobranca', 'atendimento', 'operacional')),
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('webhook', 'schedule', 'event')),
    trigger_config JSONB NOT NULL DEFAULT '{}',
    action_type TEXT NOT NULL CHECK (action_type IN ('webhook_call', 'whatsapp', 'email', 'internal')),
    action_config JSONB NOT NULL DEFAULT '{}',
    enabled BOOLEAN NOT NULL DEFAULT true,
    webhook_url TEXT,
    webhook_secret TEXT,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation logs table
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
    trigger_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOC Alerts table (if not exists)
CREATE TABLE IF NOT EXISTS noc_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    title TEXT NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type TEXT,
    channel TEXT NOT NULL DEFAULT 'in_app',
    acknowledged BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_automations_org ON automations(organization_id);
CREATE INDEX IF NOT EXISTS idx_automations_enabled ON automations(enabled);
CREATE INDEX IF NOT EXISTS idx_automation_logs_org ON automation_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_executed ON automation_logs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_noc_alerts_org ON noc_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_noc_alerts_created ON noc_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_noc_alerts_acknowledged ON noc_alerts(acknowledged);

-- Enable RLS
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE noc_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own org automations"
    ON automations FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT public.get_user_organization_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert own org automations"
    ON automations FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT public.get_user_organization_id(auth.uid())
        )
    );

CREATE POLICY "Users can update own org automations"
    ON automations FOR UPDATE
    TO authenticated
    USING (
        organization_id IN (
            SELECT public.get_user_organization_id(auth.uid())
        )
    );

CREATE POLICY "Users can delete own org automations"
    ON automations FOR DELETE
    TO authenticated
    USING (
        organization_id IN (
            SELECT public.get_user_organization_id(auth.uid())
        )
    );

-- Automation logs - service role only for inserts (cron jobs)
CREATE POLICY "Service role can insert automation logs"
    ON automation_logs FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Users can view own org automation logs"
    ON automation_logs FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT public.get_user_organization_id(auth.uid())
        )
    );

-- NOC Alerts policies
CREATE POLICY "Users can view own org noc_alerts"
    ON noc_alerts FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT public.get_user_organization_id(auth.uid())
        )
    );

CREATE POLICY "Users can update own org noc_alerts"
    ON noc_alerts FOR UPDATE
    TO authenticated
    USING (
        organization_id IN (
            SELECT public.get_user_organization_id(auth.uid())
        )
    );

CREATE POLICY "Service role can insert noc_alerts"
    ON noc_alerts FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_automations_updated_at
    BEFORE UPDATE ON automations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
