import { z } from 'zod';

// ============ AUTH ============
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  companyName: z.string().min(2, 'Nome da empresa obrigatório'),
  companyDocument: z.string().min(14, 'CNPJ inválido'),
});

// ============ PLANS ============
export const createPlanSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  download_speed: z.number().int().positive('Velocidade de download obrigatória'),
  upload_speed: z.number().int().positive('Velocidade de upload obrigatória'),
  monthly_price: z.number().positive('Preço mensal obrigatório'),
  description: z.string().optional(),
  sla_uptime: z.number().min(0).max(100).optional(),
  data_cap: z.number().int().positive().optional().nullable(),
  status: z.enum(['ativo', 'inativo', 'descontinuado']).optional(),
  features: z.array(z.string()).optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

// ============ CLIENTS ============
export const createClientSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  document: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zip_code: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  plan_id: z.string().uuid('ID do plano inválido').optional(),
  status: z.enum(['ativo', 'suspenso', 'cancelado', 'pendente']).optional(),
  payment_method: z.enum(['boleto', 'pix', 'cartao', 'debito']).optional(),
  due_day: z.number().int().min(1).max(28).optional(),
  install_date: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

// ============ INVOICES ============
export const createInvoiceSchema = z.object({
  client_id: z.string().uuid(),
  subscription_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  due_date: z.string(),
  status: z.enum(['pendente', 'pago', 'atrasado', 'cancelado']).optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

// ============ TICKETS ============
export const createTicketSchema = z.object({
  client_id: z.string().uuid().optional(),
  subject: z.string().min(1, 'Assunto obrigatório'),
  description: z.string().optional(),
  priority: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
  category: z.string().optional(),
  assignee_id: z.string().uuid().optional(),
});

export const updateTicketSchema = z.object({
  subject: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
  status: z.enum(['aberto', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado']).optional(),
  category: z.string().optional(),
  assignee_id: z.string().uuid().optional(),
});

export const createTicketCommentSchema = z.object({
  content: z.string().min(1, 'Conteúdo obrigatório'),
  is_internal: z.boolean().optional(),
});

// ============ NETWORK ============
export const createOLTSchema = z.object({
  name: z.string().min(1),
  model: z.string().optional(),
  ip_address: z.string().min(1),
  port: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  max_clients: z.number().int().positive().optional(),
  firmware_version: z.string().optional(),
});

export const updateOLTSchema = createOLTSchema.partial().extend({
  status: z.enum(['online', 'offline', 'warning', 'maintenance']).optional(),
});

export const createIncidentSchema = z.object({
  olt_id: z.string().uuid().optional(),
  type: z.enum(['offline', 'degradation', 'maintenance', 'fiber_cut']),
  description: z.string().optional(),
  clients_affected: z.number().int().min(0).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

// ============ AUTOMATIONS ============
export const createAutomationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger_type: z.string().min(1),
  action_type: z.string().min(1),
  config: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
});

export const updateAutomationSchema = createAutomationSchema.partial();

// ============ SUBSCRIPTIONS ============
export const createSubscriptionSchema = z.object({
  client_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  monthly_price: z.number().positive(),
  discount: z.number().min(0).optional(),
  start_date: z.string().optional(),
});

// ============ PAGINATION ============
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateOLTInput = z.infer<typeof createOLTSchema>;
export type UpdateOLTInput = z.infer<typeof updateOLTSchema>;
