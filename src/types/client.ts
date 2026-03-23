import type { Plan } from "./plan";

export type ClientStatus = "ativo" | "suspenso" | "cancelado";

export interface Client {
  id: string;
  name: string;
  document: string;        // CPF ou CNPJ
  documentType: "cpf" | "cnpj";
  email: string;
  phone: string;
  plan: Plan;
  status: ClientStatus;
  city: string;
  address: string;
  installDate: string;     // ISO date
  lastPayment: string;     // ISO date
  createdAt: string;
  updatedAt: string;
}

export interface ClientDetail extends Client {
  contractValue: number;
  monthlyBill: number;
  churnRisk: number;       // 0-100
  supportTickets: number;
  lastServiceDate: string;
}
