import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Bot, Sparkles, MessageSquare, TrendingUp, Users, Clock, ThumbsUp,
  Brain, AlertTriangle, ArrowUpRight, ArrowRight, Send, Settings2,
  Shield, DollarSign, Phone, Mail, Zap, ChevronRight, Eye, UserCheck,
  BarChart3, Target, Lightbulb, FileText, Search
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from "recharts";

// === MOCK DATA ===

const aiKpis = [
  { label: "Resolvidos pela IA hoje", value: "67", icon: Bot, change: "+23%", positive: true, bg: "rgba(139,92,246,0.1)", iconColor: "#8B5CF6" },
  { label: "Taxa resolução sem humano", value: "74%", icon: Target, change: "+5pp", positive: true, bg: "rgba(16,185,129,0.1)", iconColor: "#10B981" },
  { label: "Tempo médio IA", value: "1m 42s", icon: Clock, change: "-18%", positive: true, bg: "rgba(59,130,246,0.1)", iconColor: "#2563EB" },
  { label: "Tempo médio humano", value: "23m 15s", icon: Users, change: "-2%", positive: true, bg: "rgba(245,158,11,0.1)", iconColor: "#F59E0B" },
  { label: "NPS conversas IA", value: "82", icon: ThumbsUp, change: "+3pts", positive: true, bg: "rgba(16,185,129,0.1)", iconColor: "#059669" },
  { label: "Economia mensal estimada", value: "R$ 18.400", icon: DollarSign, change: "+12%", positive: true, bg: "rgba(59,130,246,0.1)", iconColor: "#2563EB" },
];

const mockConversations = [
  { id: "CV-301", client: "Carlos Alberto Silva", channel: "WhatsApp", status: "ia_resolvido" as const, subject: "Segunda via de boleto", startedAt: "14:32", duration: "2m", messages: 4, satisfaction: 5 },
  { id: "CV-302", client: "Maria Fernanda Oliveira", channel: "WhatsApp", status: "ia_ativo" as const, subject: "Lentidão na conexão", startedAt: "14:28", duration: "6m", messages: 8, satisfaction: null },
  { id: "CV-303", client: "Tech Solutions LTDA", channel: "Chat", status: "humano" as const, subject: "Configuração de IP fixo", startedAt: "14:15", duration: "18m", messages: 12, satisfaction: null },
  { id: "CV-304", client: "Restaurante Sabor & Cia", channel: "WhatsApp", status: "ia_resolvido" as const, subject: "Alteração de vencimento", startedAt: "13:55", duration: "1m", messages: 3, satisfaction: 4 },
  { id: "CV-305", client: "Ana Paula Santos", channel: "WhatsApp", status: "ia_ativo" as const, subject: "Reativação do serviço", startedAt: "13:48", duration: "4m", messages: 6, satisfaction: null },
  { id: "CV-306", client: "Roberto Almeida", channel: "Chat", status: "ia_resolvido" as const, subject: "Teste de velocidade", startedAt: "13:30", duration: "3m", messages: 5, satisfaction: 5 },
  { id: "CV-307", client: "João Pedro Costa", channel: "WhatsApp", status: "humano" as const, subject: "Reclamação de cobrança indevida", startedAt: "13:12", duration: "25m", messages: 15, satisfaction: null },
  { id: "CV-308", client: "Clínica Bem Estar", channel: "WhatsApp", status: "ia_resolvido" as const, subject: "Upgrade de plano", startedAt: "12:45", duration: "4m", messages: 6, satisfaction: 4 },
];

const mockChurnRisk = [
  { client: "Ana Paula Santos", plan: "50 Mega", score: 87, factors: ["42 dias em atraso", "3 tickets no mês", "Sinal degradado"], action: "Oferta de retenção" },
  { client: "Luciana Martins", plan: "50 Mega", score: 79, factors: ["65 dias em atraso", "Suspensa", "Baixo consumo"], action: "Renegociação" },
  { client: "Fernanda Lima", plan: "100 Mega", score: 72, factors: ["Cancelou", "4 tickets antes", "NPS 2"], action: "Campanha reativação" },
  { client: "Roberto Almeida", plan: "300 Mega", score: 58, factors: ["Sem conexão recente", "2 tickets", "Sinal -27dBm"], action: "Diagnóstico técnico" },
  { client: "João Pedro Costa", plan: "100 Mega", score: 45, factors: ["Ticket aberto", "Reclamação cobrança"], action: "Priorizar atendimento" },
];

const mockAIRecommendations = [
  { type: "retention", icon: Shield, title: "Retenção urgente", description: "3 clientes premium com score de churn > 70. Recomendação: oferta de desconto de 20% por 3 meses.", priority: "alta" as const, impact: "R$ 8.970/mês em MRR protegido" },
  { type: "campaign", icon: Zap, title: "Campanha de upgrade", description: "47 clientes no plano 50 Mega com consumo acima de 80% há 3 meses. Oportunidade de migração para 100 Mega.", priority: "média" as const, impact: "R$ 1.880/mês potencial" },
  { type: "billing", icon: DollarSign, title: "Cobrança inteligente", description: "12 faturas vencidas há 5+ dias sem cobrança automatizada. Ativar régua D+5 via WhatsApp.", priority: "alta" as const, impact: "R$ 2.340 em recuperação" },
  { type: "network", icon: AlertTriangle, title: "Prevenção de falha", description: "OLT MA5608T com sinal médio degradando 0.3dBm/semana. 64 clientes podem ser afetados.", priority: "crítica" as const, impact: "Prevenir ~18 tickets" },
  { type: "satisfaction", icon: ThumbsUp, title: "Melhoria de NPS", description: "Clientes do plano Ultra 300 com NPS médio 62. Investigar: 78% das reclamações são sobre Wi-Fi.", priority: "média" as const, impact: "Aumento de 8pts no NPS" },
];

const mockFAQs = [
  { id: 1, question: "Como solicitar segunda via de boleto?", category: "Financeiro", uses: 342, resolved: "94%" },
  { id: 2, question: "Minha internet está lenta, o que fazer?", category: "Técnico", uses: 287, resolved: "78%" },
  { id: 3, question: "Como alterar meu plano?", category: "Comercial", uses: 198, resolved: "91%" },
  { id: 4, question: "Qual o prazo para instalação?", category: "Instalação", uses: 156, resolved: "96%" },
  { id: 5, question: "Como cancelar meu contrato?", category: "Retenção", uses: 134, resolved: "67%" },
  { id: 6, question: "Meu serviço foi suspenso, como reativar?", category: "Financeiro", uses: 123, resolved: "88%" },
  { id: 7, question: "Como configurar o roteador Wi-Fi?", category: "Técnico", uses: 112, resolved: "82%" },
  { id: 8, question: "Vocês oferecem IP fixo?", category: "Comercial", uses: 89, resolved: "95%" },
];

const resolutionByHour = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}h`,
  ia: Math.round(h >= 8 && h <= 22 ? 5 + Math.random() * 12 : 1 + Math.random() * 3),
  humano: Math.round(h >= 8 && h <= 18 ? 2 + Math.random() * 6 : Math.random() * 1),
}));

const resolutionByCategory = [
  { name: "Financeiro", value: 38, color: "#2563EB" },
  { name: "Técnico", value: 28, color: "#8B5CF6" },
  { name: "Comercial", value: 18, color: "#10B981" },
  { name: "Instalação", value: 10, color: "#F59E0B" },
  { name: "Outros", value: 6, color: "#94A3B8" },
];

const weeklyPerformance = [
  { day: "Seg", resolved: 58, escalated: 12 },
  { day: "Ter", resolved: 65, escalated: 9 },
  { day: "Qua", resolved: 72, escalated: 8 },
  { day: "Qui", resolved: 61, escalated: 14 },
  { day: "Sex", resolved: 69, escalated: 11 },
  { day: "Sáb", resolved: 34, escalated: 5 },
  { day: "Dom", resolved: 22, escalated: 3 },
];

// === COMPONENTS ===

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-tooltip">
      <p className="text-xs font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

function getConversationStatusBadge(status: string) {
  switch (status) {
    case "ia_resolvido": return <Badge className="text-[10px]" style={{ background: '#ECFDF5', color: '#059669', borderRadius: 9999, border: 'none' }}>✨ IA resolveu</Badge>;
    case "ia_ativo": return <Badge className="text-[10px]" style={{ background: '#EFF6FF', color: '#2563EB', borderRadius: 9999, border: 'none' }}>🤖 IA atendendo</Badge>;
    case "humano": return <Badge className="text-[10px]" style={{ background: '#FEF3C7', color: '#D97706', borderRadius: 9999, border: 'none' }}>👤 Com humano</Badge>;
    default: return null;
  }
}

function getScoreColor(score: number) {
  if (score >= 70) return "#DC2626";
  if (score >= 50) return "#F59E0B";
  return "#10B981";
}

// === MAIN COMPONENT ===

export default function AIAttendance() {
  const [activeTab, setActiveTab] = useState("painel");
  const [conversationFilter, setConversationFilter] = useState("all");

  const filteredConversations = mockConversations.filter(c =>
    conversationFilter === "all" || c.status === conversationFilter
  );

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
              <Sparkles style={{ width: 22, height: 22, color: '#8B5CF6' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">IA & Atendimento</h2>
              <p className="text-xs text-muted-foreground">Inteligência artificial aplicada ao atendimento e operações</p>
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" style={{ borderRadius: 10 }}>
                <Settings2 className="h-4 w-4 mr-2" /> Configurar assistente
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-card border-none w-[420px] sm:w-[500px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" /> Configuração do Assistente IA
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label>Nome do assistente</Label>
                  <Input defaultValue="NetBot" style={{ borderRadius: 10 }} />
                </div>
                <div className="space-y-2">
                  <Label>Tom de voz</Label>
                  <Select defaultValue="professional">
                    <SelectTrigger style={{ borderRadius: 10 }}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Profissional e amigável</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual e descontraído</SelectItem>
                      <SelectItem value="technical">Técnico e direto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Instruções gerais</Label>
                  <Textarea
                    defaultValue="Você é o assistente virtual do provedor NetAdmin. Sempre cumprimente o cliente pelo nome, seja empático e resolva problemas de forma objetiva. Para questões financeiras, ofereça segunda via automaticamente. Para problemas técnicos, faça diagnóstico antes de escalonar."
                    rows={5}
                    style={{ borderRadius: 10 }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Política de escalonamento</Label>
                  <Textarea
                    defaultValue="Escalonar para humano quando: cliente irritado (3+ mensagens negativas), problema técnico complexo, solicitação de cancelamento, reclamação sobre cobrança indevida, tempo de conversa > 10 minutos sem resolução."
                    rows={4}
                    style={{ borderRadius: 10 }}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Capacidades</Label>
                  {[
                    { label: "Emitir segunda via de boleto", checked: true },
                    { label: "Alterar data de vencimento", checked: true },
                    { label: "Informar status da fatura", checked: true },
                    { label: "Fazer diagnóstico de conexão", checked: true },
                    { label: "Alterar plano do cliente", checked: false },
                    { label: "Suspender/reativar serviço", checked: false },
                    { label: "Agendar visita técnica", checked: true },
                    { label: "Aplicar desconto de retenção", checked: false },
                  ].map(cap => (
                    <div key={cap.label} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.02)' }}>
                      <span className="text-sm">{cap.label}</span>
                      <Switch defaultChecked={cap.checked} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Label>Horário de atendimento IA</Label>
                  <Badge style={{ background: '#ECFDF5', color: '#059669', borderRadius: 9999, border: 'none' }}>24/7</Badge>
                </div>
                <Button className="w-full" style={{ borderRadius: 10 }}>Salvar configurações</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {aiKpis.map((kpi, i) => (
            <GlassCard key={kpi.label} hover className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-muted-foreground leading-tight">{kpi.label}</span>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: kpi.bg }}>
                    <kpi.icon style={{ width: 16, height: 16, color: kpi.iconColor }} />
                  </div>
                </div>
                <p className="text-xl font-bold">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="h-2.5 w-2.5 text-success" />
                  <span className="text-success">{kpi.change}</span>
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass-card border-none p-1" style={{ borderRadius: 12 }}>
            <TabsTrigger value="painel" className="text-xs gap-1.5" style={{ borderRadius: 8 }}>
              <BarChart3 className="h-3.5 w-3.5" /> Painel
            </TabsTrigger>
            <TabsTrigger value="conversas" className="text-xs gap-1.5" style={{ borderRadius: 8 }}>
              <MessageSquare className="h-3.5 w-3.5" /> Conversas
            </TabsTrigger>
            <TabsTrigger value="antecipacao" className="text-xs gap-1.5" style={{ borderRadius: 8 }}>
              <Brain className="h-3.5 w-3.5" /> Antecipação
            </TabsTrigger>
            <TabsTrigger value="recomendacoes" className="text-xs gap-1.5" style={{ borderRadius: 8 }}>
              <Lightbulb className="h-3.5 w-3.5" /> Recomendações IA
            </TabsTrigger>
            <TabsTrigger value="base" className="text-xs gap-1.5" style={{ borderRadius: 8 }}>
              <FileText className="h-3.5 w-3.5" /> Base de Conhecimento
            </TabsTrigger>
          </TabsList>

          {/* ======= PAINEL TAB ======= */}
          <TabsContent value="painel">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Resoluções por hora */}
              <GlassCard hover>
                <div className="p-5">
                  <h3 className="text-base font-semibold">Resoluções por hora</h3>
                  <p className="text-xs text-muted-foreground mb-3">IA vs Atendentes humanos (hoje)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={resolutionByHour}>
                      <defs>
                        <linearGradient id="iaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<GlassTooltip />} />
                      <Area type="monotone" dataKey="ia" stroke="#8B5CF6" strokeWidth={2} fill="url(#iaGrad)" name="IA" />
                      <Area type="monotone" dataKey="humano" stroke="#F59E0B" strokeWidth={2} fill="url(#humGrad)" name="Humano" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Resoluções por categoria */}
              <GlassCard hover>
                <div className="p-5">
                  <h3 className="text-base font-semibold">Resoluções por categoria</h3>
                  <p className="text-xs text-muted-foreground mb-3">Distribuição dos atendimentos da IA</p>
                  <div className="flex items-center gap-6">
                    <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={resolutionByCategory} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                            {resolutionByCategory.map(e => <Cell key={e.name} fill={e.color} />)}
                          </Pie>
                          <Tooltip content={<GlassTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold">100%</span>
                        <span className="text-[10px] text-muted-foreground">total</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {resolutionByCategory.map(cat => (
                        <div key={cat.name} className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                          <span className="text-xs flex-1">{cat.name}</span>
                          <span className="text-xs font-medium">{cat.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Performance semanal */}
              <GlassCard hover className="lg:col-span-2">
                <div className="p-5">
                  <h3 className="text-base font-semibold">Performance semanal</h3>
                  <p className="text-xs text-muted-foreground mb-3">Conversas resolvidas vs escalonadas para humano</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<GlassTooltip />} />
                      <Bar dataKey="resolved" fill="#8B5CF6" radius={[4,4,0,0]} name="Resolvidas IA" />
                      <Bar dataKey="escalated" fill="#F59E0B" radius={[4,4,0,0]} name="Escalonadas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* Economy summary */}
            <GlassCard hover className="mt-6">
              <div className="p-5">
                <h3 className="text-base font-semibold mb-4">💰 Quanto a IA economizou este mês</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Atendimentos resolvidos", value: "1.847", sub: "sem intervenção humana" },
                    { label: "Tickets evitados", value: "623", sub: "por automação + IA" },
                    { label: "Horas de atendente salvas", value: "312h", sub: "~2 atendentes full-time" },
                    { label: "Economia total", value: "R$ 18.400", sub: "considerando custo médio de atendimento" },
                  ].map(item => (
                    <div key={item.label} className="p-4 rounded-xl text-center" style={{ background: 'rgba(139,92,246,0.04)' }}>
                      <p className="text-2xl font-bold text-primary">{item.value}</p>
                      <p className="text-xs font-medium mt-1">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* ======= CONVERSAS TAB ======= */}
          <TabsContent value="conversas">
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar conversa..." className="pl-9" style={{ borderRadius: 10 }} />
                </div>
                <Select value={conversationFilter} onValueChange={setConversationFilter}>
                  <SelectTrigger className="w-44" style={{ borderRadius: 10 }}><SelectValue placeholder="Filtrar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="ia_ativo">IA atendendo</SelectItem>
                    <SelectItem value="ia_resolvido">IA resolveu</SelectItem>
                    <SelectItem value="humano">Com humano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <GlassCard>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-none">
                        <TableHead className="glass-table-header">ID</TableHead>
                        <TableHead className="glass-table-header">Cliente</TableHead>
                        <TableHead className="glass-table-header">Canal</TableHead>
                        <TableHead className="glass-table-header">Assunto</TableHead>
                        <TableHead className="glass-table-header">Status</TableHead>
                        <TableHead className="glass-table-header">Início</TableHead>
                        <TableHead className="glass-table-header">Duração</TableHead>
                        <TableHead className="glass-table-header">Msgs</TableHead>
                        <TableHead className="glass-table-header">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConversations.map(c => (
                        <TableRow key={c.id} className="glass-table-row border-none">
                          <TableCell className="font-mono text-xs">{c.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-[9px] font-bold text-primary">{c.client.split(" ").map(w => w[0]).slice(0,2).join("")}</span>
                              </div>
                              <span className="text-sm font-medium">{c.client}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]" style={{ borderRadius: 9999 }}>
                              {c.channel === "WhatsApp" ? <Phone className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
                              {c.channel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{c.subject}</TableCell>
                          <TableCell>{getConversationStatusBadge(c.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{c.startedAt}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{c.duration}</TableCell>
                          <TableCell className="text-xs">{c.messages}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver conversa">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              {c.status === "ia_ativo" && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Assumir atendimento">
                                  <UserCheck className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </GlassCard>

              {/* Live conversation preview */}
              <GlassCard>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                      <h3 className="text-base font-semibold">Conversa ao vivo — Maria Fernanda Oliveira</h3>
                    </div>
                    <Button size="sm" variant="outline" style={{ borderRadius: 10 }}>
                      <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Assumir
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {[
                      { from: "client", text: "Oi, minha internet tá muito lenta hoje", time: "14:28" },
                      { from: "ai", text: "Olá, Maria! Sou o NetBot, assistente virtual do seu provedor. Vou verificar sua conexão agora mesmo. Um momento, por favor. 🔍", time: "14:28" },
                      { from: "ai", text: "Identifiquei que sua ONU está com sinal de -25.3 dBm, que está dentro do normal. Porém, notei que há um evento de manutenção programada na sua região que pode causar lentidão temporária. A previsão de normalização é até 16h.", time: "14:29" },
                      { from: "client", text: "Ah entendi, mas tô trabalhando em home office e preciso da internet agora", time: "14:30" },
                      { from: "ai", text: "Entendo perfeitamente, Maria! Para o seu caso, posso fazer um reset remoto da sua ONU para tentar otimizar a conexão. Isso leva cerca de 2 minutos. Deseja que eu faça isso agora?", time: "14:30" },
                      { from: "client", text: "Sim, pode fazer", time: "14:31" },
                      { from: "ai", text: "Perfeito! Iniciando o reset remoto agora. Sua internet vai desconectar por aproximadamente 2 minutos e voltará automaticamente. Aguarde... ⏳", time: "14:31" },
                      { from: "ai", text: "✅ Reset concluído com sucesso! Sua ONU reconectou com sinal de -24.8 dBm. Pode verificar se melhorou?", time: "14:34" },
                    ].map((msg, i) => (
                      <div key={i} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                          msg.from === "client"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "rounded-bl-md"
                        }`} style={msg.from !== "client" ? { background: 'rgba(139,92,246,0.08)' } : {}}>
                          <p>{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${msg.from === "client" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          {/* ======= ANTECIPAÇÃO TAB ======= */}
          <TabsContent value="antecipacao">
            <div className="space-y-6 mt-4">
              <GlassCard>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold">Clientes em risco de churn</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Previsão de cancelamento nas próximas 2 semanas baseada em IA</p>
                  <div className="space-y-3">
                    {mockChurnRisk.map((client) => (
                      <div key={client.client} className="flex items-center gap-4 p-4 rounded-xl glass-table-row" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
                        <div className="flex-shrink-0">
                          <div className="relative h-12 w-12">
                            <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
                              <circle
                                cx="18" cy="18" r="15" fill="none"
                                stroke={getScoreColor(client.score)}
                                strokeWidth="3"
                                strokeDasharray={`${(client.score / 100) * 94.2} 94.2`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: getScoreColor(client.score) }}>
                              {client.score}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{client.client}</span>
                            <Badge variant="outline" className="text-[10px]" style={{ borderRadius: 9999 }}>{client.plan}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {client.factors.map(f => (
                              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge style={{ background: '#FEF3C7', color: '#D97706', borderRadius: 9999, border: 'none' }} className="text-[10px]">
                            {client.action}
                          </Badge>
                          <Button size="sm" variant="outline" style={{ borderRadius: 8 }}>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* Insights de antecipação */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Clientes sem consumo", value: "23", desc: "Sem tráfego significativo nos últimos 7 dias. Possível desconexão ou mudança de provedor.", icon: AlertTriangle, color: "#DC2626", bg: "rgba(239,68,68,0.08)" },
                  { title: "Degradação de sinal", value: "15", desc: "Clientes com piora progressiva de sinal na última semana. Manutenção preventiva recomendada.", icon: TrendingUp, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
                  { title: "Tickets recorrentes", value: "8", desc: "Clientes com 3+ tickets no mesmo tema nos últimos 30 dias. Resolução definitiva necessária.", icon: MessageSquare, color: "#8B5CF6", bg: "rgba(139,92,246,0.08)" },
                ].map(item => (
                  <GlassCard key={item.title} hover>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                          <item.icon style={{ width: 16, height: 16, color: item.color }} />
                        </div>
                        <span className="text-2xl font-bold">{item.value}</span>
                      </div>
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                      <Button variant="ghost" size="sm" className="text-xs mt-3 p-0 h-auto text-primary">
                        Ver lista completa <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ======= RECOMENDAÇÕES IA TAB ======= */}
          <TabsContent value="recomendacoes">
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                <h3 className="text-base font-semibold">Recomendações da IA</h3>
                <Badge style={{ background: '#EFF6FF', color: '#2563EB', borderRadius: 9999, border: 'none' }} className="text-[10px]">
                  {mockAIRecommendations.length} ações sugeridas
                </Badge>
              </div>

              {mockAIRecommendations.map((rec, i) => (
                <GlassCard key={i} hover>
                  <div className="p-5 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                      background: rec.priority === "crítica" ? "rgba(239,68,68,0.1)" : rec.priority === "alta" ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)"
                    }}>
                      <rec.icon style={{ width: 20, height: 20, color: rec.priority === "crítica" ? "#DC2626" : rec.priority === "alta" ? "#F59E0B" : "#2563EB" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold">{rec.title}</h4>
                        <StatusBadge status={rec.priority} />
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs font-medium flex items-center gap-1" style={{ color: '#059669' }}>
                          <TrendingUp className="h-3 w-3" /> {rec.impact}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" style={{ borderRadius: 8 }}>Ignorar</Button>
                      <Button size="sm" style={{ borderRadius: 8 }}>Executar</Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </TabsContent>

          {/* ======= BASE DE CONHECIMENTO TAB ======= */}
          <TabsContent value="base">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Base de Conhecimento</h3>
                  <p className="text-xs text-muted-foreground">FAQs e respostas usadas pelo assistente IA</p>
                </div>
                <Button style={{ borderRadius: 10 }}>
                  <FileText className="h-4 w-4 mr-2" /> Novo artigo
                </Button>
              </div>

              <GlassCard>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-none">
                        <TableHead className="glass-table-header">#</TableHead>
                        <TableHead className="glass-table-header">Pergunta</TableHead>
                        <TableHead className="glass-table-header">Categoria</TableHead>
                        <TableHead className="glass-table-header">Usos</TableHead>
                        <TableHead className="glass-table-header">Taxa resolução</TableHead>
                        <TableHead className="glass-table-header">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockFAQs.map(faq => (
                        <TableRow key={faq.id} className="glass-table-row border-none">
                          <TableCell className="text-xs text-muted-foreground">{faq.id}</TableCell>
                          <TableCell className="text-sm font-medium">{faq.question}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]" style={{ borderRadius: 9999 }}>{faq.category}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{faq.uses}</TableCell>
                          <TableCell>
                            <span className="text-sm font-medium" style={{ color: parseInt(faq.resolved) >= 90 ? '#059669' : parseInt(faq.resolved) >= 75 ? '#D97706' : '#DC2626' }}>
                              {faq.resolved}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-xs">Editar</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
