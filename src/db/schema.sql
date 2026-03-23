-- NetAdmin ISP Management System - Database Schema
-- PostgreSQL 14+ required

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- COMPANIES (Multi-tenant root)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  document VARCHAR(20) UNIQUE NOT NULL, -- CNPJ
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS (Auth + Roles)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PLANS
-- ============================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  download_speed INTEGER NOT NULL, -- Mbps
  upload_speed INTEGER NOT NULL,   -- Mbps
  monthly_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  sla_uptime DECIMAL(5,2) DEFAULT 99.5,
  data_cap INTEGER, -- GB, NULL = unlimited
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'descontinuado')),
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTS (CRM)
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  document VARCHAR(20), -- CPF or CNPJ
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  plan_id UUID REFERENCES plans(id),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'cancelado', 'pendente')),
  payment_method VARCHAR(20) DEFAULT 'boleto' CHECK (payment_method IN ('boleto', 'pix', 'cartao', 'debito')),
  due_day INTEGER DEFAULT 10 CHECK (due_day BETWEEN 1 AND 28),
  churn_score INTEGER DEFAULT 0 CHECK (churn_score BETWEEN 0 AND 100),
  ltv DECIMAL(12,2) DEFAULT 0,
  install_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'pending')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  monthly_price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICES (Faturas)
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_number VARCHAR(20),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  payment_method VARCHAR(20),
  barcode VARCHAR(100),
  pix_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TICKETS (Suporte)
-- ============================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  ticket_number VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'critica')),
  status VARCHAR(30) DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado')),
  category VARCHAR(50),
  assignee_id UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TICKET COMMENTS
-- ============================================
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OLTs (Network Equipment)
-- ============================================
CREATE TABLE olts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  ip_address VARCHAR(45) NOT NULL,
  port VARCHAR(20),
  location TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'warning', 'maintenance')),
  uptime_seconds BIGINT DEFAULT 0,
  last_check TIMESTAMPTZ DEFAULT NOW(),
  signal_quality DECIMAL(5,2),
  max_clients INTEGER DEFAULT 256,
  firmware_version VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ONUs (Client Equipment)
-- ============================================
CREATE TABLE onus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  olt_id UUID NOT NULL REFERENCES olts(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  serial_number VARCHAR(50),
  model VARCHAR(100),
  mac_address VARCHAR(17),
  signal_rx DECIMAL(6,2), -- dBm
  signal_tx DECIMAL(6,2), -- dBm
  status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'warning')),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NETWORK INCIDENTS
-- ============================================
CREATE TABLE network_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  olt_id UUID REFERENCES olts(id),
  type VARCHAR(30) NOT NULL CHECK (type IN ('offline', 'degradation', 'maintenance', 'fiber_cut')),
  description TEXT,
  clients_affected INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  auto_tickets_created BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUTOMATIONS
-- ============================================
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL, -- 'olt_down', 'invoice_overdue', 'churn_risk', 'nps', 'welcome'
  action_type VARCHAR(50) NOT NULL,  -- 'whatsapp', 'sms', 'email', 'ticket', 'suspend'
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  executions_count INTEGER DEFAULT 0,
  last_execution TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUTOMATION RUNS
-- ============================================
CREATE TABLE automation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- REPORTS
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'financial', 'network', 'clients', 'churn', 'custom'
  parameters JSONB DEFAULT '{}',
  generated_data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- ============================================
-- AI CONVERSATIONS
-- ============================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  channel VARCHAR(30) DEFAULT 'chat', -- 'chat', 'whatsapp', 'email'
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
  resolved_by_ai BOOLEAN DEFAULT FALSE,
  satisfaction_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI MESSAGES
-- ============================================
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMER PORTAL SESSIONS
-- ============================================
CREATE TABLE customer_portal_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PLAN MIGRATION HISTORY
-- ============================================
CREATE TABLE plan_migrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  from_plan_id UUID REFERENCES plans(id),
  to_plan_id UUID REFERENCES plans(id),
  reason TEXT,
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (20+)
-- ============================================

-- Users
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

-- Clients
CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_clients_status ON clients(company_id, status);
CREATE INDEX idx_clients_plan ON clients(plan_id);
CREATE INDEX idx_clients_city ON clients(company_id, city);
CREATE INDEX idx_clients_churn ON clients(company_id, churn_score DESC);
CREATE INDEX idx_clients_document ON clients(document);

-- Plans
CREATE INDEX idx_plans_company ON plans(company_id);
CREATE INDEX idx_plans_status ON plans(company_id, status);

-- Subscriptions
CREATE INDEX idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(company_id, status);

-- Invoices
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(company_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(company_id, due_date);

-- Tickets
CREATE INDEX idx_tickets_client ON tickets(client_id);
CREATE INDEX idx_tickets_status ON tickets(company_id, status);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_priority ON tickets(company_id, priority);

-- OLTs
CREATE INDEX idx_olts_company ON olts(company_id);
CREATE INDEX idx_olts_status ON olts(company_id, status);

-- ONUs
CREATE INDEX idx_onus_olt ON onus(olt_id);
CREATE INDEX idx_onus_client ON onus(client_id);

-- Network Incidents
CREATE INDEX idx_incidents_olt ON network_incidents(olt_id);
CREATE INDEX idx_incidents_company ON network_incidents(company_id);
CREATE INDEX idx_incidents_date ON network_incidents(company_id, started_at DESC);

-- Automations
CREATE INDEX idx_automations_company ON automations(company_id);

-- AI
CREATE INDEX idx_ai_conversations_client ON ai_conversations(client_id);
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);

-- Plan Migrations
CREATE INDEX idx_plan_migrations_client ON plan_migrations(client_id);
CREATE INDEX idx_plan_migrations_plans ON plan_migrations(from_plan_id, to_plan_id);

-- ============================================
-- ROW LEVEL SECURITY (Multi-tenant)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE olts ENABLE ROW LEVEL SECURITY;
ALTER TABLE onus ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_migrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (application-level enforcement via company_id in JWT)
-- These are enforced at the API middleware level, not DB level for this setup

-- ============================================
-- SEED DATA (Demo Company)
-- ============================================

-- Insert demo company
INSERT INTO companies (id, name, document, email, phone, city, state) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'NetAdmin Telecom', '12.345.678/0001-90', 'admin@netadmin.com', '(11) 3000-0000', 'São Paulo', 'SP');

-- Insert demo admin user (password: admin123)
INSERT INTO users (id, company_id, name, email, password_hash, role) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Administrador', 'admin@provedor.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert demo plans
INSERT INTO plans (id, company_id, name, download_speed, upload_speed, monthly_price, description, status) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Básico 50', 50, 25, 59.90, 'Plano ideal para uso básico', 'ativo'),
  ('c1000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Padrão 100', 100, 50, 99.90, 'Navegação rápida para toda família', 'ativo'),
  ('c1000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Turbo 200', 200, 100, 149.90, 'Alta velocidade para streaming e jogos', 'ativo'),
  ('c1000000-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ultra 300', 300, 150, 199.90, 'Velocidade ultra para home office', 'ativo'),
  ('c1000000-0000-0000-0000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Empresarial 500', 500, 250, 399.90, 'Solução corporativa com SLA', 'ativo'),
  ('c1000000-0000-0000-0000-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Gamer 400', 400, 200, 249.90, 'Plano descontinuado', 'inativo');

-- Insert demo clients
INSERT INTO clients (id, company_id, name, document, email, phone, address, city, state, plan_id, status, churn_score, install_date, latitude, longitude) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carlos Alberto Silva', '123.456.789-00', 'carlos@email.com', '(11) 98765-4321', 'Rua das Flores, 123 - Vila Mariana', 'São Paulo', 'SP', 'c1000000-0000-0000-0000-000000000002', 'ativo', 15, '2024-01-10', -23.5880, -46.6360),
  ('d1000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Maria Fernanda Oliveira', '987.654.321-00', 'maria@email.com', '(19) 99876-5432', 'Av. Brasil, 456 - Centro', 'Campinas', 'SP', 'c1000000-0000-0000-0000-000000000003', 'ativo', 10, '2024-03-05', -22.9064, -47.0616),
  ('d1000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tech Solutions LTDA', '12.345.678/0001-90', 'contato@techsol.com', '(11) 3456-7890', 'Rua Industrial, 789 - Distrito', 'Guarulhos', 'SP', 'c1000000-0000-0000-0000-000000000005', 'ativo', 5, '2023-06-20', -23.4538, -46.5333),
  ('d1000000-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ana Paula Santos', '456.789.123-00', 'ana@email.com', '(11) 97654-3210', 'Rua Paraná, 321 - Jd. América', 'Osasco', 'SP', 'c1000000-0000-0000-0000-000000000001', 'suspenso', 85, '2024-08-15', -23.5325, -46.7917),
  ('d1000000-0000-0000-0000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'João Pedro Costa', '321.654.987-00', 'joao@email.com', '(11) 96543-2109', 'Av. Paulista, 1000 - Bela Vista', 'São Paulo', 'SP', 'c1000000-0000-0000-0000-000000000002', 'ativo', 65, '2023-11-01', -23.5613, -46.6559),
  ('d1000000-0000-0000-0000-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Restaurante Sabor & Cia', '98.765.432/0001-10', 'contato@saborecia.com', '(11) 4321-0987', 'Rua das Palmeiras, 55 - Centro', 'Santo André', 'SP', 'c1000000-0000-0000-0000-000000000003', 'ativo', 20, '2024-04-12', -23.6737, -46.5432),
  ('d1000000-0000-0000-0000-000000000007', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fernanda Lima', '654.321.987-00', 'fernanda@email.com', '(11) 95432-1098', 'Rua São João, 88 - Nova Petrópolis', 'São Bernardo do Campo', 'SP', 'c1000000-0000-0000-0000-000000000002', 'cancelado', 92, '2024-02-03', -23.6914, -46.5646),
  ('d1000000-0000-0000-0000-000000000008', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Roberto Almeida', '789.123.456-00', 'roberto@email.com', '(11) 94321-0987', 'Av. Voluntários, 200 - Centro', 'Mogi das Cruzes', 'SP', 'c1000000-0000-0000-0000-000000000004', 'ativo', 72, '2023-09-28', -23.5228, -46.1878),
  ('d1000000-0000-0000-0000-000000000009', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Clínica Bem Estar', '45.678.901/0001-23', 'clinica@bemestar.com', '(11) 4567-8901', 'Rua Alfa, 150 - Alphaville', 'Barueri', 'SP', 'c1000000-0000-0000-0000-000000000005', 'ativo', 8, '2024-07-07', -23.5107, -46.8754),
  ('d1000000-0000-0000-0000-000000000010', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Luciana Martins', '234.567.890-00', 'luciana@email.com', '(11) 93210-9876', 'Rua 7 de Setembro, 42 - Jd. Primavera', 'Itaquaquecetuba', 'SP', 'c1000000-0000-0000-0000-000000000001', 'suspenso', 78, '2024-05-19', -23.4868, -46.3487);

-- Insert demo OLTs
INSERT INTO olts (id, company_id, name, model, ip_address, port, status, uptime_seconds, signal_quality, max_clients, latitude, longitude) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'OLT Huawei MA5800-X7', 'MA5800-X7', '10.0.1.1', '0/1/0', 'online', 3931200, 95.5, 512, -23.5505, -46.6333),
  ('e1000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'OLT Huawei MA5800-X2', 'MA5800-X2', '10.0.1.2', '0/1/0', 'online', 2764800, 92.0, 256, -23.5320, -46.6280),
  ('e1000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mikrotik CCR1036 - Core', 'CCR1036', '10.0.0.1', '-', 'online', 7776000, 98.0, 0, -23.5550, -46.6400),
  ('e1000000-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'OLT ZTE C320', 'C320', '10.0.1.3', '0/1/0', 'online', 1382400, 90.0, 256, -23.4600, -46.5400),
  ('e1000000-0000-0000-0000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'OLT Huawei MA5608T', 'MA5608T', '10.0.1.4', '0/1/0', 'warning', 190080, 75.0, 128, -23.6800, -46.5600),
  ('e1000000-0000-0000-0000-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mikrotik CCR2004 - Borda', 'CCR2004', '10.0.0.2', '-', 'online', 5184000, 97.0, 0, -23.5480, -46.6350),
  ('e1000000-0000-0000-0000-000000000007', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Switch Huawei S5720', 'S5720', '10.0.2.1', '-', 'offline', 0, 0, 0, -23.5700, -46.6500),
  ('e1000000-0000-0000-0000-000000000008', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'OLT Nokia G-240W-F', 'G-240W-F', '10.0.1.5', '0/1/0', 'online', 2488320, 88.0, 512, -23.5100, -46.8700);

-- Insert demo tickets
INSERT INTO tickets (id, company_id, client_id, ticket_number, subject, description, priority, status, assignee_id, created_at) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000001', 'TK-1042', 'Lentidão na conexão', 'Cliente relata lentidão frequente desde ontem', 'alta', 'aberto', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '2 hours'),
  ('f1000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000003', 'TK-1041', 'Queda intermitente', 'Conexão cai a cada 30 minutos', 'critica', 'em_andamento', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '1 day'),
  ('f1000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000002', 'TK-1040', 'Troca de roteador', 'Solicitação de troca do roteador', 'media', 'aberto', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '1 day'),
  ('f1000000-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000006', 'TK-1039', 'Instalação ponto extra', 'Novo ponto de rede no segundo andar', 'baixa', 'resolvido', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '2 days'),
  ('f1000000-0000-0000-0000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000008', 'TK-1038', 'Sem conexão', 'Cliente sem acesso à internet', 'alta', 'em_andamento', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '2 days');

-- Insert demo network incidents
INSERT INTO network_incidents (id, company_id, olt_id, type, description, clients_affected, started_at, severity) VALUES
  ('g1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e1000000-0000-0000-0000-000000000005', 'degradation', 'Sinal degradado na OLT MA5608T', 64, NOW() - INTERVAL '4 hours', 'high'),
  ('g1000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e1000000-0000-0000-0000-000000000007', 'offline', 'Switch S5720 offline', 0, NOW() - INTERVAL '6 hours', 'medium');

-- Insert demo invoices
INSERT INTO invoices (company_id, client_id, invoice_number, amount, due_date, status, paid_date) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000001', 'INV-001', 99.90, '2026-03-20', 'pago', '2026-03-15'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000002', 'INV-002', 149.90, '2026-03-20', 'pendente', NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000003', 'INV-003', 399.90, '2026-03-15', 'pago', '2026-03-10'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000004', 'INV-004', 59.90, '2026-02-10', 'atrasado', NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000005', 'INV-005', 99.90, '2026-03-20', 'pago', '2026-03-18'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1000000-0000-0000-0000-000000000010', 'INV-010', 59.90, '2026-01-10', 'atrasado', NULL);

-- Insert demo automations
INSERT INTO automations (company_id, name, description, trigger_type, action_type, is_active, executions_count) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Notificação de Queda', 'Dispara WhatsApp automático para clientes afetados quando uma OLT cai', 'olt_down', 'whatsapp', TRUE, 328),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cobrança Inteligente', 'Escalonamento automático de lembretes antes e depois do vencimento', 'invoice_overdue', 'whatsapp', TRUE, 1247),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Reativação de Churn', 'Contato automático com clientes que cancelaram', 'churn_risk', 'whatsapp', TRUE, 12),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Boas-vindas', 'Mensagem automática de boas-vindas após ativação', 'welcome', 'whatsapp', TRUE, 89),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pesquisa NPS', 'Envio periódico de pesquisa pós-atendimento', 'nps', 'whatsapp', FALSE, 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Monitoramento de Velocidade', 'Testa velocidade dos clientes e alerta quando abaixo do contratado', 'speed_check', 'ticket', TRUE, 47);
