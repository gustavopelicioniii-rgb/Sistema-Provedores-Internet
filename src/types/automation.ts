export type AutomationTrigger =
  | "fatura_vencida"
  | "olt_offline"
  | "ticket_aberto"
  | "cliente_sem_acesso"
  | "cliente_sem_consumo"
  | "cliente_alto_risco_churn"
  | "cliente_recém_ativado"
  | "sinal_degradado"
  | "pagamento_recebido"
  | "cliente_elegivel_upgrade";

export type AutomationAction =
  | "enviar_whatsapp"
  | "enviar_email"
  | "enviar_sms"
  | "abrir_ticket"
  | "suspender_cliente"
  | "reativar_cliente"
  | "oferecer_upgrade"
  | "notificar_tecnico"
  | "criar_tarefa"
  | "disparar_campanha";

export interface Automation {
  id: string;
  name: string;
  description: string;
  icon: string;            // Lucide icon name
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  impactBadge: string;     // "Reduz tickets em até 60%"
  metric: {
    label: string;
    value: string;
  };
  config: AutomationConfig;
  stats?: AutomationStats;
}

export interface AutomationConfig {
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  channels?: ("whatsapp" | "sms" | "email")[];
  messageTemplate?: string;
  sendWindow?: { start: string; end: string };
  frequency?: string;
  maxExecutionsPerDay?: number;
}

export interface AutomationCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "in";
  value: string | number | string[];
}

export interface AutomationStats {
  totalExecutions: number;
  successRate: number;     // percentage
  ticketsAvoided?: number;
  churnReduced?: number;   // percentage
  estimatedROI?: number;   // BRL
  estimatedSavings?: number; // hours
  messagesQueued?: number;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: "cobranca" | "reativacao" | "onboarding" | "suporte" | "marketing";
  config: AutomationConfig;
}
