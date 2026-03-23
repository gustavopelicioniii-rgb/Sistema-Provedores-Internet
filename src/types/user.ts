export type UserRole = "admin" | "operador" | "financeiro" | "suporte" | "gerente";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface UserPermissions {
  userId: string;
  canViewDashboard: boolean;
  canManageClients: boolean;
  canManageFinance: boolean;
  canManageTickets: boolean;
  canManageNetwork: boolean;
  canManageAutomations: boolean;
  canManagePlans: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
}
