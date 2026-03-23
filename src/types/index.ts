// Central type definitions for NetAdmin

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  details?: unknown[];
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  company_id: string;
  role: 'admin' | 'manager' | 'technician' | 'support' | 'viewer';
}

export interface Client {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  status: 'ativo' | 'suspenso' | 'cancelado';
  city: string;
  address: string;
  plan: string;
  lastPayment?: string;
  installDate: string;
  churnScore?: number;
}

export interface Plan {
  id: string;
  name: string;
  downloadSpeed: number;
  uploadSpeed: number;
  price: number;
  clients: number;
  status: 'ativo' | 'inativo';
  description?: string;
}

export interface Ticket {
  id: string;
  client: string;
  subject: string;
  priority: 'baixa' | 'média' | 'alta' | 'crítica';
  status: 'aberto' | 'em andamento' | 'aguardando cliente' | 'resolvido';
  assignee: string;
  date: string;
  timeAgo: string;
}

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  status: 'pago' | 'pendente' | 'atrasado' | 'cancelado';
}

export interface OLT {
  id: string;
  name: string;
  ip: string;
  port: string;
  clients: number;
  status: 'online' | 'warning' | 'offline';
  uptime: string;
  model?: string;
}

export interface ONU {
  id: string;
  client_id: string;
  olt_id: string;
  serial_number: string;
  port: string;
  signal_level?: number;
  status: 'online' | 'offline' | 'warning';
}

export interface Automation {
  id: string;
  name: string;
  icon?: string;
  description: string;
  active: boolean;
  metric: string;
  highlight?: string;
}

export interface WSMessage {
  type: string;
  data: unknown;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
