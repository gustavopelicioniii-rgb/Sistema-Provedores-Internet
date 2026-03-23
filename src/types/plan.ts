export type PlanStatus = "ativo" | "inativo";

export interface Plan {
  id: string;
  name: string;
  downloadSpeed: number;   // Mbps
  uploadSpeed: number;     // Mbps
  price: number;           // BRL
  clientCount: number;
  status: PlanStatus;
  description?: string;
  features?: string[];
}

export interface PlanKPI {
  id: string;
  planName: string;
  adhesion: number;        // percentage
  churn: number;           // percentage
  defaulting: number;      // percentage
  estimatedMargin: number; // percentage
  profitability: number;   // percentage
  upgradeDowngrades: number;
}

export interface PlanMigration {
  id: string;
  clientId: string;
  clientName: string;
  fromPlan: string;
  toPlan: string;
  migratedAt: string;
}
