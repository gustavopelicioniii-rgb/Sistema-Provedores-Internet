// Mock data for the ISP management system
import type { Client, Invoice, Ticket, Plan, Equipment, Automation, ChartDataPoint } from "@/types";

const mockPlans: Record<string, Plan> = {
  "1": { id: "1", name: "Básico 50", downloadSpeed: 50, uploadSpeed: 25, price: 59.90, clientCount: 842, status: "ativo" },
  "2": { id: "2", name: "Padrão 100", downloadSpeed: 100, uploadSpeed: 50, price: 99.90, clientCount: 1856, status: "ativo" },
  "3": { id: "3", name: "Turbo 200", downloadSpeed: 200, uploadSpeed: 100, price: 149.90, clientCount: 1245, status: "ativo" },
  "4": { id: "4", name: "Ultra 300", downloadSpeed: 300, uploadSpeed: 150, price: 199.90, clientCount: 623, status: "ativo" },
  "5": { id: "5", name: "Empresarial 500", downloadSpeed: 500, uploadSpeed: 250, price: 399.90, clientCount: 306, status: "ativo" },
};

export const mockClients: Client[] = [
  {
    id: "1",
    name: "Carlos Alberto Silva",
    document: "123.456.789-00",
    documentType: "cpf",
    plan: mockPlans["2"],
    status: "ativo",
    city: "São Paulo",
    lastPayment: "2026-03-15",
    email: "carlos@email.com",
    phone: "(11) 98765-4321",
    address: "Rua das Flores, 123 - Vila Mariana",
    installDate: "2024-01-10",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2026-03-21T00:00:00Z",
  },
  {
    id: "2",
    name: "Maria Fernanda Oliveira",
    document: "987.654.321-00",
    documentType: "cpf",
    plan: mockPlans["3"],
    status: "ativo",
    city: "Campinas",
    lastPayment: "2026-03-12",
    email: "maria@email.com",
    phone: "(19) 99876-5432",
    address: "Av. Brasil, 456 - Centro",
    installDate: "2024-03-05",
    createdAt: "2024-03-05T00:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "3",
    name: "Tech Solutions LTDA",
    document: "12.345.678/0001-90",
    documentType: "cnpj",
    plan: mockPlans["5"],
    status: "ativo",
    city: "Guarulhos",
    lastPayment: "2026-03-10",
    email: "contato@techsol.com",
    phone: "(11) 3456-7890",
    address: "Rua Industrial, 789 - Distrito",
    installDate: "2023-06-20",
    createdAt: "2023-06-20T00:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "4",
    name: "Ana Paula Santos",
    document: "456.789.123-00",
    documentType: "cpf",
    plan: mockPlans["1"],
    status: "suspenso",
    city: "Osasco",
    lastPayment: "2026-02-01",
    email: "ana@email.com",
    phone: "(11) 97654-3210",
    address: "Rua Paraná, 321 - Jd. América",
    installDate: "2024-08-15",
    createdAt: "2024-08-15T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "5",
    name: "João Pedro Costa",
    document: "321.654.987-00",
    documentType: "cpf",
    plan: mockPlans["2"],
    status: "ativo",
    city: "São Paulo",
    lastPayment: "2026-03-18",
    email: "joao@email.com",
    phone: "(11) 96543-2109",
    address: "Av. Paulista, 1000 - Bela Vista",
    installDate: "2023-11-01",
    createdAt: "2023-11-01T00:00:00Z",
    updatedAt: "2026-03-18T00:00:00Z",
  },
  {
    id: "6",
    name: "Restaurante Sabor & Cia",
    document: "98.765.432/0001-10",
    documentType: "cnpj",
    plan: mockPlans["3"],
    status: "ativo",
    city: "Santo André",
    lastPayment: "2026-03-14",
    email: "contato@saborecia.com",
    phone: "(11) 4321-0987",
    address: "Rua das Palmeiras, 55 - Centro",
    installDate: "2024-04-12",
    createdAt: "2024-04-12T00:00:00Z",
    updatedAt: "2026-03-14T00:00:00Z",
  },
  {
    id: "7",
    name: "Fernanda Lima",
    document: "654.321.987-00",
    documentType: "cpf",
    plan: mockPlans["2"],
    status: "cancelado",
    city: "São Bernardo",
    lastPayment: "2025-12-20",
    email: "fernanda@email.com",
    phone: "(11) 95432-1098",
    address: "Rua São João, 88 - Nova Petrópolis",
    installDate: "2024-02-03",
    createdAt: "2024-02-03T00:00:00Z",
    updatedAt: "2025-12-20T00:00:00Z",
  },
  {
    id: "8",
    name: "Roberto Almeida",
    document: "789.123.456-00",
    documentType: "cpf",
    plan: mockPlans["4"],
    status: "ativo",
    city: "Mogi das Cruzes",
    lastPayment: "2026-03-16",
    email: "roberto@email.com",
    phone: "(11) 94321-0987",
    address: "Av. Voluntários, 200 - Centro",
    installDate: "2023-09-28",
    createdAt: "2023-09-28T00:00:00Z",
    updatedAt: "2026-03-16T00:00:00Z",
  },
  {
    id: "9",
    name: "Clínica Bem Estar",
    document: "45.678.901/0001-23",
    documentType: "cnpj",
    plan: mockPlans["5"],
    status: "ativo",
    city: "Barueri",
    lastPayment: "2026-03-11",
    email: "clinica@bemestar.com",
    phone: "(11) 4567-8901",
    address: "Rua Alfa, 150 - Alphaville",
    installDate: "2024-07-07",
    createdAt: "2024-07-07T00:00:00Z",
    updatedAt: "2026-03-11T00:00:00Z",
  },
  {
    id: "10",
    name: "Luciana Martins",
    document: "234.567.890-00",
    documentType: "cpf",
    plan: mockPlans["1"],
    status: "suspenso",
    city: "Itaquaquecetuba",
    lastPayment: "2026-01-05",
    email: "luciana@email.com",
    phone: "(11) 93210-9876",
    address: "Rua 7 de Setembro, 42 - Jd. Primavera",
    installDate: "2024-05-19",
    createdAt: "2024-05-19T00:00:00Z",
    updatedAt: "2026-01-05T00:00:00Z",
  },
];

export const mockInvoices: Invoice[] = [
  { id: "INV-001", clientId: "1", clientName: "Carlos Alberto Silva", amount: 99.90, dueDate: "2026-03-20", status: "pago", paidAt: "2026-03-20", createdAt: "2026-03-01T00:00:00Z" },
  { id: "INV-002", clientId: "2", clientName: "Maria Fernanda Oliveira", amount: 149.90, dueDate: "2026-03-20", status: "pendente", createdAt: "2026-03-01T00:00:00Z" },
  { id: "INV-003", clientId: "3", clientName: "Tech Solutions LTDA", amount: 399.90, dueDate: "2026-03-15", status: "pago", paidAt: "2026-03-15", createdAt: "2026-03-01T00:00:00Z" },
  { id: "INV-004", clientId: "4", clientName: "Ana Paula Santos", amount: 59.90, dueDate: "2026-02-10", status: "atrasado", daysOverdue: 40, createdAt: "2026-02-01T00:00:00Z" },
  { id: "INV-005", clientId: "5", clientName: "João Pedro Costa", amount: 99.90, dueDate: "2026-03-20", status: "pago", paidAt: "2026-03-20", createdAt: "2026-03-01T00:00:00Z" },
  { id: "INV-006", clientId: "6", clientName: "Restaurante Sabor & Cia", amount: 149.90, dueDate: "2026-03-18", status: "pago", paidAt: "2026-03-18", createdAt: "2026-03-01T00:00:00Z" },
  { id: "INV-007", clientId: "7", clientName: "Fernanda Lima", amount: 99.90, dueDate: "2025-12-20", status: "cancelado", createdAt: "2025-12-01T00:00:00Z" },
  { id: "INV-008", clientId: "8", clientName: "Roberto Almeida", amount: 199.90, dueDate: "2026-03-20", status: "pendente", createdAt: "2026-03-01T00:00:00Z" },
  { id: "INV-009", clientId: "9", clientName: "Clínica Bem Estar", amount: 399.90, dueDate: "2026-03-15", status: "pago", paidAt: "2026-03-15", createdAt: "2026-03-01T00:00:00Z" },
  { id: "INV-010", clientId: "10", clientName: "Luciana Martins", amount: 59.90, dueDate: "2026-01-10", status: "atrasado", daysOverdue: 72, createdAt: "2026-01-01T00:00:00Z" },
];

export const mockEquipments: Equipment[] = [
  { id: "1", name: "OLT Huawei MA5800-X7", ip: "10.0.1.1", port: "0/1/0", clientCount: 256, status: "online", uptime: "45d 12h", signalStrength: -24, manufacturer: "Huawei", model: "MA5800-X7" },
  { id: "2", name: "OLT Huawei MA5800-X2", ip: "10.0.1.2", port: "0/1/0", clientCount: 128, status: "online", uptime: "32d 8h", signalStrength: -23, manufacturer: "Huawei", model: "MA5800-X2" },
  { id: "3", name: "Mikrotik CCR1036 - Core", ip: "10.0.0.1", port: "-", clientCount: 0, status: "online", uptime: "90d 3h", manufacturer: "Mikrotik", model: "CCR1036" },
  { id: "4", name: "OLT ZTE C320", ip: "10.0.1.3", port: "0/1/0", clientCount: 198, status: "online", uptime: "15d 20h", signalStrength: -25, manufacturer: "ZTE", model: "C320" },
  { id: "5", name: "OLT Huawei MA5608T", ip: "10.0.1.4", port: "0/1/0", clientCount: 64, status: "alerta", uptime: "2d 4h", signalStrength: -28, manufacturer: "Huawei", model: "MA5608T" },
  { id: "6", name: "Mikrotik CCR2004 - Borda", ip: "10.0.0.2", port: "-", clientCount: 0, status: "online", uptime: "60d 1h", manufacturer: "Mikrotik", model: "CCR2004" },
  { id: "7", name: "Switch Huawei S5720", ip: "10.0.2.1", port: "-", clientCount: 0, status: "offline", uptime: "0d 0h", manufacturer: "Huawei", model: "S5720" },
  { id: "8", name: "OLT Nokia G-240W-F", ip: "10.0.1.5", port: "0/1/0", clientCount: 312, status: "online", uptime: "28d 16h", signalStrength: -22, manufacturer: "Nokia", model: "G-240W-F" },
];

export const mockTickets: Ticket[] = [
  { id: "TK-1042", number: "TK-1042", clientId: "1", clientName: "Carlos Alberto Silva", subject: "Lentidão na conexão", description: "Cliente relata velocidade abaixo do contratado", priority: "alta", status: "aberto", origin: "telefone", assignee: "Lucas Técnico", assigneeId: "tech-001", createdAt: "2026-03-21T12:00:00Z", updatedAt: "2026-03-21T12:00:00Z" },
  { id: "TK-1041", number: "TK-1041", clientId: "3", clientName: "Tech Solutions LTDA", subject: "Queda intermitente", description: "Múltiplas quedas de conexão", priority: "critica", status: "em_andamento", origin: "portal", assignee: "Rafael Técnico", assigneeId: "tech-002", createdAt: "2026-03-20T08:00:00Z", updatedAt: "2026-03-21T06:00:00Z" },
  { id: "TK-1040", number: "TK-1040", clientId: "2", clientName: "Maria Fernanda Oliveira", subject: "Troca de roteador", description: "Roteador com defeito", priority: "media", status: "aberto", origin: "whatsapp", assignee: "Lucas Técnico", assigneeId: "tech-001", createdAt: "2026-03-20T14:00:00Z", updatedAt: "2026-03-20T14:00:00Z" },
  { id: "TK-1039", number: "TK-1039", clientId: "6", clientName: "Restaurante Sabor & Cia", subject: "Instalação ponto extra", description: "Solicitação de novo ponto de internet", priority: "baixa", status: "resolvido", origin: "email", assignee: "André Técnico", assigneeId: "tech-003", createdAt: "2026-03-19T10:00:00Z", updatedAt: "2026-03-20T16:00:00Z", resolvedAt: "2026-03-20T16:00:00Z" },
  { id: "TK-1038", number: "TK-1038", clientId: "8", clientName: "Roberto Almeida", subject: "Sem conexão", description: "Cliente sem internet", priority: "alta", status: "em_andamento", origin: "telefone", assignee: "Rafael Técnico", assigneeId: "tech-002", createdAt: "2026-03-19T09:00:00Z", updatedAt: "2026-03-21T11:00:00Z" },
  { id: "TK-1037", number: "TK-1037", clientId: "9", clientName: "Clínica Bem Estar", subject: "Upgrade de plano", description: "Solicitação de mudança para plano superior", priority: "baixa", status: "resolvido", origin: "portal", assignee: "Lucas Técnico", assigneeId: "tech-001", createdAt: "2026-03-18T13:00:00Z", updatedAt: "2026-03-19T14:00:00Z", resolvedAt: "2026-03-19T14:00:00Z" },
  { id: "TK-1036", number: "TK-1036", clientId: "5", clientName: "João Pedro Costa", subject: "Configuração Wi-Fi", description: "Cliente com dúvida na configuração", priority: "media", status: "aguardando", origin: "email", assignee: "André Técnico", assigneeId: "tech-003", createdAt: "2026-03-18T11:00:00Z", updatedAt: "2026-03-20T09:00:00Z" },
  { id: "TK-1035", number: "TK-1035", clientId: "10", clientName: "Luciana Martins", subject: "Reativação de serviço", description: "Cliente deseja reativar serviço suspenso", priority: "media", status: "aberto", origin: "telefone", assignee: "Lucas Técnico", assigneeId: "tech-001", createdAt: "2026-03-17T10:00:00Z", updatedAt: "2026-03-17T10:00:00Z" },
  { id: "TK-1034", number: "TK-1034", clientId: "4", clientName: "Ana Paula Santos", subject: "Segunda via de boleto", description: "Cliente solicitou segunda via", priority: "baixa", status: "resolvido", origin: "email", assignee: "André Técnico", assigneeId: "tech-003", createdAt: "2026-03-17T15:00:00Z", updatedAt: "2026-03-17T16:00:00Z", resolvedAt: "2026-03-17T16:00:00Z" },
  { id: "TK-1033", number: "TK-1033", clientId: "7", clientName: "Fernanda Lima", subject: "Cancelamento", description: "Cliente solicitou cancelamento do serviço", priority: "media", status: "resolvido", origin: "telefone", assignee: "Rafael Técnico", assigneeId: "tech-002", createdAt: "2026-03-16T12:00:00Z", updatedAt: "2026-03-16T14:00:00Z", resolvedAt: "2026-03-16T14:00:00Z" },
];

export interface ConnectionIssue {
  clientId: string;
  clientName: string;
  equipmentId: string;
  equipmentName: string;
  signalStrength: number;
  lastDowntimeStart: string;
  downtimeDuration: string;
}

export const mockConnectionIssues: ConnectionIssue[] = [
  { clientId: "1", clientName: "Carlos Alberto Silva", equipmentId: "1", equipmentName: "OLT Huawei MA5800-X7", signalStrength: -24.5, lastDowntimeStart: "2026-03-21T14:30:00Z", downtimeDuration: "15 min" },
  { clientId: "4", clientName: "Ana Paula Santos", equipmentId: "5", equipmentName: "OLT Huawei MA5608T", signalStrength: -28.1, lastDowntimeStart: "2026-03-21T10:15:00Z", downtimeDuration: "2h 30min" },
  { clientId: "8", clientName: "Roberto Almeida", equipmentId: "4", equipmentName: "OLT ZTE C320", signalStrength: -26.8, lastDowntimeStart: "2026-03-20T22:45:00Z", downtimeDuration: "45 min" },
  { clientId: "10", clientName: "Luciana Martins", equipmentId: "5", equipmentName: "OLT Huawei MA5608T", signalStrength: -29.3, lastDowntimeStart: "2026-03-20T18:00:00Z", downtimeDuration: "1h" },
  { clientId: "5", clientName: "João Pedro Costa", equipmentId: "1", equipmentName: "OLT Huawei MA5800-X7", signalStrength: -23.2, lastDowntimeStart: "2026-03-19T08:20:00Z", downtimeDuration: "5 min" },
];

export const mockChartClients: ChartDataPoint[] = [
  { label: "Abr", value: 4120 }, { label: "Mai", value: 4210 },
  { label: "Jun", value: 4350 }, { label: "Jul", value: 4420 },
  { label: "Ago", value: 4510 }, { label: "Set", value: 4580 },
  { label: "Out", value: 4650 }, { label: "Nov", value: 4700 },
  { label: "Dez", value: 4750 }, { label: "Jan", value: 4790 },
  { label: "Fev", value: 4830 }, { label: "Mar", value: 4872 },
];

export interface RevenueData {
  month: string;
  revenue: number;
  overdue: number;
}

export const mockChartRevenue: RevenueData[] = [
  { month: "Out", revenue: 215000, overdue: 18500 },
  { month: "Nov", revenue: 222000, overdue: 16800 },
  { month: "Dez", revenue: 228000, overdue: 21200 },
  { month: "Jan", revenue: 232000, overdue: 19400 },
  { month: "Fev", revenue: 238000, overdue: 17600 },
  { month: "Mar", revenue: 243600, overdue: 15800 },
];

export interface CashflowData {
  month: string;
  inflow: number;
  outflow: number;
}

export const mockCashflow: CashflowData[] = [
  { month: "Out", inflow: 215000, outflow: 145000 },
  { month: "Nov", inflow: 222000, outflow: 152000 },
  { month: "Dez", inflow: 228000, outflow: 168000 },
  { month: "Jan", inflow: 232000, outflow: 155000 },
  { month: "Fev", inflow: 238000, outflow: 149000 },
  { month: "Mar", inflow: 243600, outflow: 158000 },
];

export interface PlanDistributionData {
  name: string;
  value: number;
  color: string;
}

export const mockPlanDistribution: PlanDistributionData[] = [
  { name: "Básico 50", value: 842, color: "#60A5FA" },
  { name: "Padrão 100", value: 1856, color: "#2563EB" },
  { name: "Turbo 200", value: 1245, color: "#8B5CF6" },
  { name: "Ultra 300", value: 623, color: "#10B981" },
  { name: "Empresarial 500", value: 306, color: "#F59E0B" },
];

export interface ChurnActivationData {
  month: string;
  activations: number;
  cancellations: number;
  netGrowth: number;
}

export const mockChurnActivations: ChurnActivationData[] = [
  { month: "Out", activations: 180, cancellations: 92, netGrowth: 88 },
  { month: "Nov", activations: 210, cancellations: 78, netGrowth: 132 },
  { month: "Dez", activations: 165, cancellations: 105, netGrowth: 60 },
  { month: "Jan", activations: 195, cancellations: 85, netGrowth: 110 },
  { month: "Fev", activations: 220, cancellations: 72, netGrowth: 148 },
  { month: "Mar", activations: 240, cancellations: 68, netGrowth: 172 },
];

// Weekly heatmap data (7 days x 24 hours)
export interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
}

const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const mockHeatmapData: HeatmapCell[] = [];
days.forEach((day) => {
  for (let h = 0; h < 24; h++) {
    let base = 2;
    if (h >= 8 && h <= 18) base = 8;
    if (h >= 10 && h <= 14) base = 15;
    if (h >= 19 && h <= 22) base = 12;
    if (day === "Seg") base = Math.round(base * 1.3);
    if (day === "Sáb" || day === "Dom") base = Math.round(base * 0.5);
    const value = Math.max(0, Math.round(base + (Math.random() - 0.5) * base * 0.6));
    mockHeatmapData.push({ day, hour: h, value });
  }
});

export const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Notificação de Queda",
    icon: "Wifi",
    description: "Dispara WhatsApp/SMS automático para clientes afetados quando uma OLT cai.",
    isActive: true,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-03-21T00:00:00Z",
    impactBadge: "Reduz tickets em até 60%",
    metric: { label: "Envios este mês", value: "328" },
    config: {
      trigger: "olt_offline",
      actions: ["enviar_whatsapp", "enviar_sms"],
      channels: ["whatsapp", "sms"],
      messageTemplate: "Detectamos uma queda de conexão...",
    },
    stats: {
      totalExecutions: 328,
      successRate: 96,
      ticketsAvoided: 45,
      estimatedSavings: 180,
    },
  },
  {
    id: "2",
    name: "Cobrança Inteligente",
    icon: "CreditCard",
    description: "Escalonamento automático de lembretes antes e depois do vencimento via WhatsApp.",
    isActive: true,
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-03-21T00:00:00Z",
    impactBadge: "Reduz inadimplência em 40%",
    metric: { label: "Mensagens enviadas", value: "1.247" },
    config: {
      trigger: "fatura_vencida",
      actions: ["enviar_whatsapp", "enviar_email"],
      channels: ["whatsapp", "email"],
      messageTemplate: "Sua fatura está vencida...",
      frequency: "daily",
    },
    stats: {
      totalExecutions: 1247,
      successRate: 94,
      estimatedROI: 125000,
      estimatedSavings: 420,
    },
  },
  {
    id: "3",
    name: "Reativação de Churn",
    icon: "UserPlus",
    description: "Contato automático com clientes que cancelaram, oferecendo condições especiais.",
    isActive: true,
    createdAt: "2026-01-20T00:00:00Z",
    updatedAt: "2026-03-21T00:00:00Z",
    impactBadge: "ROI de 340%",
    metric: { label: "Reativações este mês", value: "12" },
    config: {
      trigger: "cliente_alto_risco_churn",
      actions: ["oferecer_upgrade", "enviar_email"],
      channels: ["email", "whatsapp"],
      messageTemplate: "Oferecemos uma condição especial para você...",
    },
    stats: {
      totalExecutions: 89,
      successRate: 13.5,
      estimatedROI: 85000,
    },
  },
  {
    id: "4",
    name: "Boas-vindas",
    icon: "Heart",
    description: "Mensagem automática de boas-vindas + tutorial após ativação do serviço.",
    isActive: true,
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: "2026-03-21T00:00:00Z",
    impactBadge: "95% de abertura",
    metric: { label: "Envios este mês", value: "89" },
    config: {
      trigger: "cliente_recém_ativado",
      actions: ["enviar_email", "enviar_whatsapp"],
      channels: ["email", "whatsapp"],
      messageTemplate: "Bem-vindo ao NetAdmin...",
    },
    stats: {
      totalExecutions: 89,
      successRate: 95,
      estimatedSavings: 30,
    },
  },
  {
    id: "5",
    name: "Pesquisa de Satisfação (NPS)",
    icon: "Star",
    description: "Envio periódico de pesquisa pós-atendimento para medir satisfação.",
    isActive: false,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-15T00:00:00Z",
    impactBadge: "Identifica problemas cedo",
    metric: { label: "NPS atual", value: "72" },
    config: {
      trigger: "ticket_aberto",
      actions: ["enviar_email"],
      channels: ["email"],
      messageTemplate: "Como foi sua experiência?...",
    },
  },
  {
    id: "6",
    name: "Monitoramento de Velocidade",
    icon: "Gauge",
    description: "Testa velocidade dos clientes e alerta quando está muito abaixo do contratado.",
    isActive: true,
    createdAt: "2026-01-25T00:00:00Z",
    updatedAt: "2026-03-21T00:00:00Z",
    impactBadge: "Identifica problemas antes do cliente reclamar",
    metric: { label: "Alertas este mês", value: "47" },
    config: {
      trigger: "sinal_degradado",
      actions: ["enviar_whatsapp", "abrir_ticket"],
      channels: ["whatsapp"],
      messageTemplate: "Detectamos degradação de velocidade...",
    },
    stats: {
      totalExecutions: 47,
      successRate: 89,
      ticketsAvoided: 8,
    },
  },
];

export interface UptimeDataPoint {
  hour: string;
  uptime: number;
}

export const mockUptimeData: UptimeDataPoint[] = [
  { hour: "00h", uptime: 99.8 }, { hour: "02h", uptime: 99.9 }, { hour: "04h", uptime: 100 },
  { hour: "06h", uptime: 99.7 }, { hour: "08h", uptime: 99.5 }, { hour: "10h", uptime: 98.2 },
  { hour: "12h", uptime: 99.1 }, { hour: "14h", uptime: 99.8 }, { hour: "16h", uptime: 99.9 },
  { hour: "18h", uptime: 99.6 }, { hour: "20h", uptime: 99.4 }, { hour: "22h", uptime: 99.8 },
];

// Export the plans array for backward compatibility
export const mockPlansList: Plan[] = Object.values(mockPlans);

// Additional types and data
export interface Bill {
  id: string;
  supplier: string;
  amount: number;
  dueDate: string;
  status: "pago" | "pendente";
  category: string;
}

export interface NoteDocument {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  issueDate: string;
  status: "emitida" | "cancelada";
  series: string;
}

export const mockBills: Bill[] = [
  { id: "1", supplier: "Fornecedor Fibra Óptica SP", amount: 12500.00, dueDate: "2026-03-25", status: "pendente", category: "Infraestrutura" },
  { id: "2", supplier: "Aluguel Datacenter", amount: 8900.00, dueDate: "2026-04-01", status: "pendente", category: "Infraestrutura" },
  { id: "3", supplier: "Energia Elétrica", amount: 3200.00, dueDate: "2026-03-15", status: "pago", category: "Utilidades" },
  { id: "4", supplier: "Link Dedicado Tier1", amount: 18500.00, dueDate: "2026-03-10", status: "pago", category: "Conectividade" },
  { id: "5", supplier: "Equipamentos Huawei", amount: 45000.00, dueDate: "2026-03-30", status: "pendente", category: "Equipamentos" },
  { id: "6", supplier: "Salários equipe técnica", amount: 32000.00, dueDate: "2026-04-05", status: "pendente", category: "Pessoal" },
  { id: "7", supplier: "Software de gestão", amount: 890.00, dueDate: "2026-03-20", status: "pago", category: "Software" },
  { id: "8", supplier: "Contador", amount: 2500.00, dueDate: "2026-04-10", status: "pendente", category: "Serviços" },
];

export const mockNFs: NoteDocument[] = [
  { id: "NF-00142", clientId: "3", clientName: "Tech Solutions LTDA", amount: 399.90, issueDate: "2026-03-15", status: "emitida", series: "001" },
  { id: "NF-00141", clientId: "9", clientName: "Clínica Bem Estar", amount: 399.90, issueDate: "2026-03-15", status: "emitida", series: "001" },
  { id: "NF-00140", clientId: "1", clientName: "Carlos Alberto Silva", amount: 99.90, issueDate: "2026-03-15", status: "emitida", series: "001" },
  { id: "NF-00139", clientId: "6", clientName: "Restaurante Sabor & Cia", amount: 149.90, issueDate: "2026-03-14", status: "emitida", series: "001" },
  { id: "NF-00138", clientId: "5", clientName: "João Pedro Costa", amount: 99.90, issueDate: "2026-03-14", status: "emitida", series: "001" },
  { id: "NF-00137", clientId: "2", clientName: "Maria Fernanda Oliveira", amount: 149.90, issueDate: "2026-03-12", status: "cancelada", series: "001" },
  { id: "NF-00136", clientId: "8", clientName: "Roberto Almeida", amount: 199.90, issueDate: "2026-03-10", status: "emitida", series: "001" },
  { id: "NF-00135", clientId: "7", clientName: "Fernanda Lima", amount: 99.90, issueDate: "2025-12-01", status: "cancelada", series: "001" },
];

// Re-export mockPlansList as mockPlans for backward compatibility
export { mockPlansList as mockPlans };
