-- ============================================================================
-- BILLING AUTOMATION - Tabelas e Configurações
-- ============================================================================

-- Tabela de configuração de billing por organização
CREATE TABLE IF NOT EXISTS billing_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Configurações de notificação
    notify_before_days INTEGER[] DEFAULT ARRAY[7, 3, 1],
    whatsapp_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    
    -- Configurações de suspensão
    suspend_after_days INTEGER DEFAULT 7,
    
    -- Configurações de reativação
    reactivate_after_payment BOOLEAN DEFAULT true,
    
    -- Horário de execução (formato 24h)
    execution_time TIME DEFAULT '06:00',
    
    -- Status
    enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id)
);

-- Índice para busca por organização
CREATE INDEX IF NOT EXISTS idx_billing_config_org ON billing_configurations(organization_id);

-- Tabela de log de execuções da automation
CREATE TABLE IF NOT EXISTS billing_automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Resultados
    invoices_generated INTEGER DEFAULT 0,
    notifications_sent INTEGER DEFAULT 0,
    customers_suspended INTEGER DEFAULT 0,
    customers_reactivated INTEGER DEFAULT 0,
    
    -- Status e erros
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    
    -- Metadados
    execution_time_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para relatórios
CREATE INDEX IF NOT EXISTS idx_billing_logs_org_date ON billing_automation_logs(organization_id, created_at);

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Tipo de notificação
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    language VARCHAR(5) DEFAULT 'pt-BR',
    
    -- Conteúdo
    subject VARCHAR(200),
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    
    -- Status
    enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados padrão de templates (pt-BR)
INSERT INTO notification_templates (type, channel, title, body) VALUES
    ('due_reminder_7', 'whatsapp', '📅 Lembrete', 'Olá {{customer_name}}! Sua fatura de {{amount}} vence em {{days}} dias ({{due_date}}). Pague em dia para evitar suspensão.'),
    ('due_reminder_3', 'whatsapp', '⚠️ Atenção', 'Olá {{customer_name}}! Sua fatura de {{amount}} vence em {{days}} dias. Não deixe vencer!'),
    ('due_reminder_1', 'whatsapp', '🚨 URGENTE', 'Olá {{customer_name}}! SUA FATURA DE {{amount}} VENCE {{days == 0 ? "HOJE" : "AMANHÃ"}}! Pague agora para não ser suspenso!'),
    ('overdue', 'whatsapp', '⚠️ Vencido', 'Olá {{customer_name}}! Sua fatura de {{amount}} está vencida desde {{due_date}}. Efetue o pagamento para evitar a suspensão do serviço.'),
    ('suspended', 'whatsapp', '⚠️ Suspenso', 'Olá {{customer_name}}! Seu serviço foi suspenso por inadimplência. Efetue o pagamento e entre em contato para reativar.'),
    ('reactivated', 'whatsapp', '✅ Reativado', 'Olá {{customer_name}}! Seu pagamento foi confirmado e o serviço foi reativado. Obrigado!');

-- Tabela de controle de notificações (evita duplicação)
CREATE TABLE IF NOT EXISTS notification_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id UUID NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    last_sent_at TIMESTAMPTZ DEFAULT NOW(),
    send_count INTEGER DEFAULT 1,
    UNIQUE(reference_id, reference_type, notification_type, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_control_lookup ON notification_control(reference_id, reference_type, notification_type);

-- ============================================================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para billing_configurations
DROP TRIGGER IF EXISTS update_billing_configurations_updated_at ON billing_configurations;
CREATE TRIGGER update_billing_configurations_updated_at
    BEFORE UPDATE ON billing_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para notification_templates
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS - Row Level Security
-- ============================================================================

ALTER TABLE billing_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_control ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas service_role pode gerenciar (Edge Functions usam service key)
CREATE POLICY "Service role can manage all billing_config" ON billing_configurations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all billing_logs" ON billing_automation_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all templates" ON notification_templates
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all notification_control" ON notification_control
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- CRON JOB: Agendar execução diária às 6h
-- ============================================================================

-- Primeiro, ativar a extensão pg_cron se não estiver ativa
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar o billing-automation para rodar todo dia às 6h da manhã
SELECT cron.schedule(
    'billing-automation-daily',
    '0 6 * * *',
    $$
    SELECT supabase_functions.invoke(
        'billing-automation',
        '{"body": {}}'::json
    );
    $$
);

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE billing_configurations IS 'Configurações de billing automation por organização';
COMMENT ON TABLE billing_automation_logs IS 'Log de execuções da automation de billing';
COMMENT ON TABLE notification_templates IS 'Templates de mensagens de notificação';
COMMENT ON TABLE notification_control IS 'Controle de notificações para evitar duplicatas';
