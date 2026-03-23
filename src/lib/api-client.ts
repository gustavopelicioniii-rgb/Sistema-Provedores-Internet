import { ApiResponse } from '@/types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('netadmin_token', token);
    } else {
      localStorage.removeItem('netadmin_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('netadmin_token');
    }
    return this.token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${window.location.origin}${API_BASE}${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Erro desconhecido',
        response.status,
        data.code || 'UNKNOWN_ERROR',
        data.details
      );
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    const res = await this.request<{ token: string; user: any }>('POST', '/auth/login', { email, password });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async register(data: { name: string; email: string; password: string; companyName: string; companyDocument: string }) {
    const res = await this.request<{ token: string; user: any }>('POST', '/auth/register', data);
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async getMe() {
    return this.request('GET', '/auth/me');
  }

  async refreshToken() {
    return this.request<{ token: string }>('POST', '/auth/refresh');
  }

  // Plans
  async getPlans(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    return this.request('GET', '/plans', undefined, params);
  }

  async getPlan(id: string) {
    return this.request('GET', `/plans/${id}`);
  }

  async getPlanKPIs(id: string) {
    return this.request('GET', `/plans/${id}/kpis`);
  }

  async getPlanMigrationHistory(id: string) {
    return this.request('GET', `/plans/${id}/migration-history`);
  }

  async getPlansComparison() {
    return this.request('GET', '/plans/comparison');
  }

  async createPlan(data: any) {
    return this.request('POST', '/plans', data);
  }

  async updatePlan(id: string, data: any) {
    return this.request('PATCH', `/plans/${id}`, data);
  }

  async deletePlan(id: string) {
    return this.request('DELETE', `/plans/${id}`);
  }

  // Clients
  async getClients(params?: { page?: number; limit?: number; status?: string; city?: string; search?: string; plan_id?: string }) {
    return this.request('GET', '/clients', undefined, params);
  }

  async getClient(id: string) {
    return this.request('GET', `/clients/${id}`);
  }

  async createClient(data: any) {
    return this.request('POST', '/clients', data);
  }

  async updateClient(id: string, data: any) {
    return this.request('PATCH', `/clients/${id}`, data);
  }

  async calculateChurnScore(id: string) {
    return this.request('POST', `/clients/${id}/churn-score`);
  }

  async getClientHistory(id: string) {
    return this.request('GET', `/clients/${id}/history`);
  }

  // Network
  async getOLTs(params?: { page?: number; limit?: number; status?: string }) {
    return this.request('GET', '/network/olts', undefined, params);
  }

  async getOLT(id: string) {
    return this.request('GET', `/network/olts/${id}`);
  }

  async getOLTHealth(id: string) {
    return this.request('GET', `/network/olts/${id}/health`);
  }

  async getOLTClients(id: string) {
    return this.request('GET', `/network/olts/${id}/clients`);
  }

  async getOLTIncidents(id: string) {
    return this.request('GET', `/network/olts/${id}/incidents`);
  }

  async createOLT(data: any) {
    return this.request('POST', '/network/olts', data);
  }

  async updateOLT(id: string, data: any) {
    return this.request('PATCH', `/network/olts/${id}`, data);
  }

  async getSignalQualityByOLT() {
    return this.request('GET', '/network/signal-quality-by-olt');
  }

  async getClientsAtRisk(threshold?: number) {
    return this.request('GET', '/network/clients-at-risk', undefined, { threshold });
  }

  async getNetworkHeatmap() {
    return this.request('GET', '/network/heatmap');
  }

  async getNetworkIncidents(params?: { page?: number; limit?: number; dateFrom?: string; dateTo?: string }) {
    return this.request('GET', '/network/incidents', undefined, params);
  }

  async createIncident(data: any) {
    return this.request('POST', '/network/olt-incident', data);
  }

  // Tickets
  async getTickets(params?: { page?: number; limit?: number; status?: string; priority?: string }) {
    return this.request('GET', '/tickets', undefined, params);
  }

  async createTicket(data: any) {
    return this.request('POST', '/tickets', data);
  }

  async updateTicket(id: string, data: any) {
    return this.request('PATCH', `/tickets/${id}`, data);
  }

  // Invoices
  async getInvoices(params?: { page?: number; limit?: number; status?: string; client_id?: string }) {
    return this.request('GET', '/invoices', undefined, params);
  }

  async createInvoice(data: any) {
    return this.request('POST', '/invoices', data);
  }

  async updateInvoice(id: string, data: any) {
    return this.request('PATCH', `/invoices/${id}`, data);
  }

  // Reports
  async getDashboardKPIs() {
    return this.request('GET', '/reports/dashboard-kpis');
  }

  async getRevenueChart() {
    return this.request('GET', '/reports/revenue-chart');
  }

  async getClientsByPlan() {
    return this.request('GET', '/reports/clients-by-plan');
  }

  // Automations
  async getAutomations(params?: { page?: number; limit?: number }) {
    return this.request('GET', '/automations', undefined, params);
  }

  async createAutomation(data: any) {
    return this.request('POST', '/automations', data);
  }

  async updateAutomation(id: string, data: any) {
    return this.request('PATCH', `/automations/${id}`, data);
  }

  logout() {
    this.setToken(null);
  }
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: any[];

  constructor(message: string, status: number, code: string, details?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
