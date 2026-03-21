// Mock data for the ISP management system

export const mockClients = [
  { id: "1", name: "Carlos Alberto Silva", document: "123.456.789-00", plan: "100 Mega", status: "ativo" as const, city: "São Paulo", lastPayment: "15/03/2026", email: "carlos@email.com", phone: "(11) 98765-4321", address: "Rua das Flores, 123 - Vila Mariana", installDate: "10/01/2024" },
  { id: "2", name: "Maria Fernanda Oliveira", document: "987.654.321-00", plan: "200 Mega", status: "ativo" as const, city: "Campinas", lastPayment: "12/03/2026", email: "maria@email.com", phone: "(19) 99876-5432", address: "Av. Brasil, 456 - Centro", installDate: "05/03/2024" },
  { id: "3", name: "Tech Solutions LTDA", document: "12.345.678/0001-90", plan: "500 Mega", status: "ativo" as const, city: "Guarulhos", lastPayment: "10/03/2026", email: "contato@techsol.com", phone: "(11) 3456-7890", address: "Rua Industrial, 789 - Distrito", installDate: "20/06/2023" },
  { id: "4", name: "Ana Paula Santos", document: "456.789.123-00", plan: "50 Mega", status: "suspenso" as const, city: "Osasco", lastPayment: "01/02/2026", email: "ana@email.com", phone: "(11) 97654-3210", address: "Rua Paraná, 321 - Jd. América", installDate: "15/08/2024" },
  { id: "5", name: "João Pedro Costa", document: "321.654.987-00", plan: "100 Mega", status: "ativo" as const, city: "São Paulo", lastPayment: "18/03/2026", email: "joao@email.com", phone: "(11) 96543-2109", address: "Av. Paulista, 1000 - Bela Vista", installDate: "01/11/2023" },
  { id: "6", name: "Restaurante Sabor & Cia", document: "98.765.432/0001-10", plan: "200 Mega", status: "ativo" as const, city: "Santo André", lastPayment: "14/03/2026", email: "contato@saborecia.com", phone: "(11) 4321-0987", address: "Rua das Palmeiras, 55 - Centro", installDate: "12/04/2024" },
  { id: "7", name: "Fernanda Lima", document: "654.321.987-00", plan: "100 Mega", status: "cancelado" as const, city: "São Bernardo", lastPayment: "20/12/2025", email: "fernanda@email.com", phone: "(11) 95432-1098", address: "Rua São João, 88 - Nova Petrópolis", installDate: "03/02/2024" },
  { id: "8", name: "Roberto Almeida", document: "789.123.456-00", plan: "300 Mega", status: "ativo" as const, city: "Mogi das Cruzes", lastPayment: "16/03/2026", email: "roberto@email.com", phone: "(11) 94321-0987", address: "Av. Voluntários, 200 - Centro", installDate: "28/09/2023" },
  { id: "9", name: "Clínica Bem Estar", document: "45.678.901/0001-23", plan: "500 Mega", status: "ativo" as const, city: "Barueri", lastPayment: "11/03/2026", email: "clinica@bemestar.com", phone: "(11) 4567-8901", address: "Rua Alfa, 150 - Alphaville", installDate: "07/07/2024" },
  { id: "10", name: "Luciana Martins", document: "234.567.890-00", plan: "50 Mega", status: "suspenso" as const, city: "Itaquaquecetuba", lastPayment: "05/01/2026", email: "luciana@email.com", phone: "(11) 93210-9876", address: "Rua 7 de Setembro, 42 - Jd. Primavera", installDate: "19/05/2024" },
];

export const mockInvoices = [
  { id: "INV-001", client: "Carlos Alberto Silva", amount: 99.90, dueDate: "20/03/2026", status: "pago" as const },
  { id: "INV-002", client: "Maria Fernanda Oliveira", amount: 149.90, dueDate: "20/03/2026", status: "pendente" as const },
  { id: "INV-003", client: "Tech Solutions LTDA", amount: 399.90, dueDate: "15/03/2026", status: "pago" as const },
  { id: "INV-004", client: "Ana Paula Santos", amount: 59.90, dueDate: "10/02/2026", status: "atrasado" as const },
  { id: "INV-005", client: "João Pedro Costa", amount: 99.90, dueDate: "20/03/2026", status: "pago" as const },
  { id: "INV-006", client: "Restaurante Sabor & Cia", amount: 149.90, dueDate: "18/03/2026", status: "pago" as const },
  { id: "INV-007", client: "Fernanda Lima", amount: 99.90, dueDate: "20/12/2025", status: "cancelado" as const },
  { id: "INV-008", client: "Roberto Almeida", amount: 199.90, dueDate: "20/03/2026", status: "pendente" as const },
  { id: "INV-009", client: "Clínica Bem Estar", amount: 399.90, dueDate: "15/03/2026", status: "pago" as const },
  { id: "INV-010", client: "Luciana Martins", amount: 59.90, dueDate: "10/01/2026", status: "atrasado" as const },
];

export const mockBills = [
  { id: "1", supplier: "Fornecedor Fibra Óptica SP", amount: 12500.00, dueDate: "25/03/2026", status: "pendente" as const, category: "Infraestrutura" },
  { id: "2", supplier: "Aluguel Datacenter", amount: 8900.00, dueDate: "01/04/2026", status: "pendente" as const, category: "Infraestrutura" },
  { id: "3", supplier: "Energia Elétrica", amount: 3200.00, dueDate: "15/03/2026", status: "pago" as const, category: "Utilidades" },
  { id: "4", supplier: "Link Dedicado Tier1", amount: 18500.00, dueDate: "10/03/2026", status: "pago" as const, category: "Conectividade" },
  { id: "5", supplier: "Equipamentos Huawei", amount: 45000.00, dueDate: "30/03/2026", status: "pendente" as const, category: "Equipamentos" },
  { id: "6", supplier: "Salários equipe técnica", amount: 32000.00, dueDate: "05/04/2026", status: "pendente" as const, category: "Pessoal" },
  { id: "7", supplier: "Software de gestão", amount: 890.00, dueDate: "20/03/2026", status: "pago" as const, category: "Software" },
  { id: "8", supplier: "Contador", amount: 2500.00, dueDate: "10/04/2026", status: "pendente" as const, category: "Serviços" },
];

export const mockNFs = [
  { id: "NF-00142", client: "Tech Solutions LTDA", amount: 399.90, issueDate: "15/03/2026", status: "emitida" as const, serie: "001" },
  { id: "NF-00141", client: "Clínica Bem Estar", amount: 399.90, issueDate: "15/03/2026", status: "emitida" as const, serie: "001" },
  { id: "NF-00140", client: "Carlos Alberto Silva", amount: 99.90, issueDate: "15/03/2026", status: "emitida" as const, serie: "001" },
  { id: "NF-00139", client: "Restaurante Sabor & Cia", amount: 149.90, issueDate: "14/03/2026", status: "emitida" as const, serie: "001" },
  { id: "NF-00138", client: "João Pedro Costa", amount: 99.90, issueDate: "14/03/2026", status: "emitida" as const, serie: "001" },
  { id: "NF-00137", client: "Maria Fernanda Oliveira", amount: 149.90, issueDate: "12/03/2026", status: "cancelada" as const, serie: "001" },
  { id: "NF-00136", client: "Roberto Almeida", amount: 199.90, issueDate: "10/03/2026", status: "emitida" as const, serie: "001" },
  { id: "NF-00135", client: "Fernanda Lima", amount: 99.90, issueDate: "01/12/2025", status: "cancelada" as const, serie: "001" },
];

export const mockTickets = [
  { id: "TK-1042", client: "Carlos Alberto Silva", subject: "Lentidão na conexão", priority: "alta" as const, status: "aberto" as const, assignee: "Lucas Técnico", date: "21/03/2026", timeAgo: "há 2h" },
  { id: "TK-1041", client: "Tech Solutions LTDA", subject: "Queda intermitente", priority: "crítica" as const, status: "em andamento" as const, assignee: "Rafael Técnico", date: "20/03/2026", timeAgo: "há 1 dia" },
  { id: "TK-1040", client: "Maria Fernanda Oliveira", subject: "Troca de roteador", priority: "média" as const, status: "aberto" as const, assignee: "Lucas Técnico", date: "20/03/2026", timeAgo: "há 1 dia" },
  { id: "TK-1039", client: "Restaurante Sabor & Cia", subject: "Instalação ponto extra", priority: "baixa" as const, status: "resolvido" as const, assignee: "André Técnico", date: "19/03/2026", timeAgo: "há 2 dias" },
  { id: "TK-1038", client: "Roberto Almeida", subject: "Sem conexão", priority: "alta" as const, status: "em andamento" as const, assignee: "Rafael Técnico", date: "19/03/2026", timeAgo: "há 2 dias" },
  { id: "TK-1037", client: "Clínica Bem Estar", subject: "Upgrade de plano", priority: "baixa" as const, status: "resolvido" as const, assignee: "Lucas Técnico", date: "18/03/2026", timeAgo: "há 3 dias" },
  { id: "TK-1036", client: "João Pedro Costa", subject: "Configuração Wi-Fi", priority: "média" as const, status: "aguardando cliente" as const, assignee: "André Técnico", date: "18/03/2026", timeAgo: "há 3 dias" },
  { id: "TK-1035", client: "Luciana Martins", subject: "Reativação de serviço", priority: "média" as const, status: "aberto" as const, assignee: "Lucas Técnico", date: "17/03/2026", timeAgo: "há 4 dias" },
  { id: "TK-1034", client: "Ana Paula Santos", subject: "Segunda via de boleto", priority: "baixa" as const, status: "resolvido" as const, assignee: "André Técnico", date: "17/03/2026", timeAgo: "há 4 dias" },
  { id: "TK-1033", client: "Fernanda Lima", subject: "Cancelamento", priority: "média" as const, status: "resolvido" as const, assignee: "Rafael Técnico", date: "16/03/2026", timeAgo: "há 5 dias" },
];

export const mockPlans = [
  { id: "1", name: "Básico 50", downloadSpeed: 50, uploadSpeed: 25, price: 59.90, clients: 842, status: "ativo" as const, description: "Plano ideal para uso básico" },
  { id: "2", name: "Padrão 100", downloadSpeed: 100, uploadSpeed: 50, price: 99.90, clients: 1856, status: "ativo" as const, description: "Navegação rápida para toda família" },
  { id: "3", name: "Turbo 200", downloadSpeed: 200, uploadSpeed: 100, price: 149.90, clients: 1245, status: "ativo" as const, description: "Alta velocidade para streaming e jogos" },
  { id: "4", name: "Ultra 300", downloadSpeed: 300, uploadSpeed: 150, price: 199.90, clients: 623, status: "ativo" as const, description: "Velocidade ultra para home office" },
  { id: "5", name: "Empresarial 500", downloadSpeed: 500, uploadSpeed: 250, price: 399.90, clients: 306, status: "ativo" as const, description: "Solução corporativa com SLA" },
  { id: "6", name: "Gamer 400", downloadSpeed: 400, uploadSpeed: 200, price: 249.90, clients: 0, status: "inativo" as const, description: "Plano descontinuado" },
];

export const mockEquipments = [
  { id: "1", name: "OLT Huawei MA5800-X7", ip: "10.0.1.1", port: "0/1/0", clients: 256, status: "online" as const, uptime: "45d 12h" },
  { id: "2", name: "OLT Huawei MA5800-X2", ip: "10.0.1.2", port: "0/1/0", clients: 128, status: "online" as const, uptime: "32d 8h" },
  { id: "3", name: "Mikrotik CCR1036 - Core", ip: "10.0.0.1", port: "-", clients: 0, status: "online" as const, uptime: "90d 3h" },
  { id: "4", name: "OLT ZTE C320", ip: "10.0.1.3", port: "0/1/0", clients: 198, status: "online" as const, uptime: "15d 20h" },
  { id: "5", name: "OLT Huawei MA5608T", ip: "10.0.1.4", port: "0/1/0", clients: 64, status: "warning" as const, uptime: "2d 4h" },
  { id: "6", name: "Mikrotik CCR2004 - Borda", ip: "10.0.0.2", port: "-", clients: 0, status: "online" as const, uptime: "60d 1h" },
  { id: "7", name: "Switch Huawei S5720", ip: "10.0.2.1", port: "-", clients: 0, status: "offline" as const, uptime: "0d 0h" },
  { id: "8", name: "OLT Nokia G-240W-F", ip: "10.0.1.5", port: "0/1/0", clients: 312, status: "online" as const, uptime: "28d 16h" },
];

export const mockConnectionIssues = [
  { client: "Carlos Alberto Silva", equipment: "OLT Huawei MA5800-X7", signal: -24.5, lastDrop: "21/03 às 14:30", duration: "15 min" },
  { client: "Ana Paula Santos", equipment: "OLT Huawei MA5608T", signal: -28.1, lastDrop: "21/03 às 10:15", duration: "2h 30min" },
  { client: "Roberto Almeida", equipment: "OLT ZTE C320", signal: -26.8, lastDrop: "20/03 às 22:45", duration: "45 min" },
  { client: "Luciana Martins", equipment: "OLT Huawei MA5608T", signal: -29.3, lastDrop: "20/03 às 18:00", duration: "1h" },
  { client: "João Pedro Costa", equipment: "OLT Huawei MA5800-X7", signal: -23.2, lastDrop: "19/03 às 08:20", duration: "5 min" },
];

export const mockChartClients = [
  { month: "Abr", clients: 4120, meta: 4200 }, { month: "Mai", clients: 4210, meta: 4300 },
  { month: "Jun", clients: 4350, meta: 4400 }, { month: "Jul", clients: 4420, meta: 4500 },
  { month: "Ago", clients: 4510, meta: 4600 }, { month: "Set", clients: 4580, meta: 4700 },
  { month: "Out", clients: 4650, meta: 4800 }, { month: "Nov", clients: 4700, meta: 4850 },
  { month: "Dez", clients: 4750, meta: 4900 }, { month: "Jan", clients: 4790, meta: 4950 },
  { month: "Fev", clients: 4830, meta: 5000 }, { month: "Mar", clients: 4872, meta: 5050 },
];

export const mockChartRevenue = [
  { month: "Out", revenue: 215000, overdue: 18500 },
  { month: "Nov", revenue: 222000, overdue: 16800 },
  { month: "Dez", revenue: 228000, overdue: 21200 },
  { month: "Jan", revenue: 232000, overdue: 19400 },
  { month: "Fev", revenue: 238000, overdue: 17600 },
  { month: "Mar", revenue: 243600, overdue: 15800 },
];

export const mockCashflow = [
  { month: "Out", inflow: 215000, outflow: 145000 },
  { month: "Nov", inflow: 222000, outflow: 152000 },
  { month: "Dez", inflow: 228000, outflow: 168000 },
  { month: "Jan", inflow: 232000, outflow: 155000 },
  { month: "Fev", inflow: 238000, outflow: 149000 },
  { month: "Mar", inflow: 243600, outflow: 158000 },
];

export const mockPlanDistribution = [
  { name: "Básico 50", value: 842, color: "#60A5FA" },
  { name: "Padrão 100", value: 1856, color: "#2563EB" },
  { name: "Turbo 200", value: 1245, color: "#8B5CF6" },
  { name: "Ultra 300", value: 623, color: "#10B981" },
  { name: "Empresarial 500", value: 306, color: "#F59E0B" },
];

export const mockChurnActivations = [
  { month: "Out", activations: 180, cancellations: 92, netGrowth: 88 },
  { month: "Nov", activations: 210, cancellations: 78, netGrowth: 132 },
  { month: "Dez", activations: 165, cancellations: 105, netGrowth: 60 },
  { month: "Jan", activations: 195, cancellations: 85, netGrowth: 110 },
  { month: "Fev", activations: 220, cancellations: 72, netGrowth: 148 },
  { month: "Mar", activations: 240, cancellations: 68, netGrowth: 172 },
];

// Weekly heatmap data (7 days x 24 hours)
const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const mockHeatmapData: { day: string; hour: number; value: number }[] = [];
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

export const mockAutomations = [
  {
    id: "1", name: "Notificação de Queda", icon: "Wifi",
    description: "Dispara WhatsApp/SMS automático para clientes afetados quando uma OLT cai.",
    active: true, metric: "328 envios este mês", highlight: "Reduz tickets em até 60%",
  },
  {
    id: "2", name: "Cobrança Inteligente", icon: "CreditCard",
    description: "Escalonamento automático de lembretes antes e depois do vencimento via WhatsApp.",
    active: true, metric: "1.247 mensagens enviadas", highlight: "Reduz inadimplência em 40%",
  },
  {
    id: "3", name: "Reativação de Churn", icon: "UserPlus",
    description: "Contato automático com clientes que cancelaram, oferecendo condições especiais.",
    active: true, metric: "12 reativações este mês", highlight: "ROI de 340%",
  },
  {
    id: "4", name: "Boas-vindas", icon: "Heart",
    description: "Mensagem automática de boas-vindas + tutorial após ativação do serviço.",
    active: true, metric: "89 envios este mês", highlight: "95% de abertura",
  },
  {
    id: "5", name: "Pesquisa de Satisfação (NPS)", icon: "Star",
    description: "Envio periódico de pesquisa pós-atendimento para medir satisfação.",
    active: false, metric: "NPS atual: 72", highlight: "Identifica problemas cedo",
  },
  {
    id: "6", name: "Monitoramento de Velocidade", icon: "Gauge",
    description: "Testa velocidade dos clientes e alerta quando está muito abaixo do contratado.",
    active: true, metric: "47 alertas este mês", highlight: "Identifica problemas antes do cliente reclamar",
  },
];

export const mockUptimeData = [
  { hour: "00h", uptime: 99.8 }, { hour: "02h", uptime: 99.9 }, { hour: "04h", uptime: 100 },
  { hour: "06h", uptime: 99.7 }, { hour: "08h", uptime: 99.5 }, { hour: "10h", uptime: 98.2 },
  { hour: "12h", uptime: 99.1 }, { hour: "14h", uptime: 99.8 }, { hour: "16h", uptime: 99.9 },
  { hour: "18h", uptime: 99.6 }, { hour: "20h", uptime: 99.4 }, { hour: "22h", uptime: 99.8 },
];
