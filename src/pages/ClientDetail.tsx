import { useParams, Link } from "react-router-dom";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageWrapper } from "@/components/shared/PageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Phone, Mail, MapPin, Edit, PauseCircle, FileText,
  Wifi, Clock, Activity, MessageSquare, CreditCard, RefreshCw,
  AlertTriangle, Star, TrendingUp, Brain, BarChart3
} from "lucide-react";
import { mockClients, mockInvoices, mockTickets } from "@/data/mockData";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

const paymentHistory = [
  { month: "Abr", value: 99.9 }, { month: "Mai", value: 99.9 }, { month: "Jun", value: 99.9 },
  { month: "Jul", value: 0 }, { month: "Ago", value: 99.9 }, { month: "Set", value: 99.9 },
  { month: "Out", value: 99.9 }, { month: "Nov", value: 99.9 }, { month: "Dez", value: 99.9 },
  { month: "Jan", value: 99.9 }, { month: "Fev", value: 99.9 }, { month: "Mar", value: 99.9 },
];

const consumptionData = [
  { day: "01", download: 12, upload: 3 }, { day: "05", download: 45, upload: 8 },
  { day: "10", download: 38, upload: 12 }, { day: "15", download: 56, upload: 15 },
  { day: "20", download: 42, upload: 10 }, { day: "25", download: 67, upload: 18 },
  { day: "30", download: 51, upload: 14 },
];

const timeline = [
  { date: "15/03/2026", event: "Pagamento confirmado — R$ 99,90", type: "payment" },
  { date: "10/03/2026", event: "Ticket #TK-1042 aberto: Lentidão na conexão", type: "ticket" },
  { date: "05/03/2026", event: "WhatsApp enviado: lembrete de vencimento", type: "communication" },
  { date: "01/03/2026", event: "Fatura INV-001 gerada — R$ 99,90", type: "invoice" },
  { date: "15/02/2026", event: "Pagamento confirmado — R$ 99,90", type: "payment" },
  { date: "01/02/2026", event: "NPS respondido — Nota 8", type: "nps" },
  { date: "01/01/2026", event: "Upgrade de plano: 50 Mega → 100 Mega", type: "plan" },
  { date: "20/12/2025", event: "Ticket #TK-980 resolvido: Troca de roteador", type: "ticket" },
  { date: "10/01/2024", event: "Ativação do serviço — Plano 50 Mega", type: "activation" },
];

const timelineColors: Record<string, string> = {
  payment: "#10B981", ticket: "#F59E0B", invoice: "#2563EB",
  plan: "#8B5CF6", activation: "#10B981", communication: "#6366F1", nps: "#EC4899",
};

const churnFactors = [
  { label: "Dias em atraso", value: "0 dias", score: 5, max: 100 },
  { label: "Tickets (últimos 90d)", value: "2 tickets", score: 25, max: 100 },
  { label: "Uso de banda", value: "72% do plano", score: 10, max: 100 },
  { label: "Tempo de contrato", value: "26 meses", score: 8, max: 100 },
  { label: "Recorrência de problemas", value: "Baixa", score: 12, max: 100 },
  { label: "Qualidade do sinal", value: "-22.4 dBm", score: 5, max: 100 },
];

function GaugeChart({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference * 0.75;
  const color = score >= 75 ? "#DC2626" : score >= 50 ? "#F59E0B" : score >= 25 ? "#2563EB" : "#10B981";
  return (
    <svg width={120} height={80} viewBox="0 0 120 80">
      <path d="M 15 75 A 45 45 0 0 1 105 75" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" strokeLinecap="round" />
      <path d="M 15 75 A 45 45 0 0 1 105 75" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${circumference * 0.75}`} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x="60" y="60" textAnchor="middle" fontSize="22" fontWeight="bold" fill={color}>{score}</text>
      <text x="60" y="75" textAnchor="middle" fontSize="9" fill="#94A3B8">de 100</text>
    </svg>
  );
}

export default function ClientDetail() {
  const { id } = useParams();
  const client = mockClients.find((c) => c.id === id) || mockClients[0];
  const clientInvoices = mockInvoices.filter((i) => i.client === client.name);
  const clientTickets = mockTickets.filter((t) => t.client === client.name);
  const churnScore = client.status === "cancelado" ? 92 : client.status === "suspenso" ? 78 : 28;

  return (
    <PageWrapper>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild style={{ borderRadius: 10 }}>
              <Link to="/clients"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{client.name}</h2>
                <StatusBadge status={client.status} />
                {churnScore >= 50 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#DC2626" }}>
                    ⚠ Risco {churnScore}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{client.document} • {client.plan} • {client.city}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-xs" style={{ borderRadius: 8 }}><CreditCard className="h-3 w-3 mr-1" />Cobrar</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" style={{ borderRadius: 8 }}><MessageSquare className="h-3 w-3 mr-1" />Mensagem</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" style={{ borderRadius: 8 }}><Edit className="h-3 w-3 mr-1" />Editar</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" style={{ borderRadius: 8 }}><PauseCircle className="h-3 w-3 mr-1" />Suspender</Button>
            <Button size="sm" className="h-7 text-xs" style={{ borderRadius: 8 }}><FileText className="h-3 w-3 mr-1" />Gerar fatura</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { label: "Plano", value: client.plan, icon: Wifi },
            { label: "Status Conexão", value: "Online", icon: Activity, color: "#10B981" },
            { label: "Sinal", value: "-22.4 dBm", icon: BarChart3 },
            { label: "LTV Estimado", value: "R$ 2.850", icon: TrendingUp },
            { label: "Tempo de casa", value: "26 meses", icon: Clock },
            { label: "Score IA", value: String(churnScore), icon: Brain, color: churnScore >= 50 ? "#DC2626" : "#10B981" },
          ].map((item) => (
            <GlassCard key={item.label} hover>
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                </div>
                <p className="text-sm font-bold" style={item.color ? { color: item.color } : {}}>{item.value}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <Tabs defaultValue="resumo">
          <TabsList className="glass-card p-1 flex-wrap h-auto">
            <TabsTrigger value="resumo" className="text-xs">Resumo</TabsTrigger>
            <TabsTrigger value="dados" className="text-xs">Dados</TabsTrigger>
            <TabsTrigger value="financeiro" className="text-xs">Financeiro</TabsTrigger>
            <TabsTrigger value="conexao" className="text-xs">Conexão</TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs">Tickets</TabsTrigger>
            <TabsTrigger value="consumo" className="text-xs">Consumo</TabsTrigger>
            <TabsTrigger value="score" className="text-xs">Score IA</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs">Histórico</TabsTrigger>
          </TabsList>

          {/* RESUMO */}
          <TabsContent value="resumo" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-semibold mb-3">Informações Rápidas</h3>
                  <div className="space-y-2">
                    {[
                      { icon: Phone, text: client.phone },
                      { icon: Mail, text: client.email },
                      { icon: MapPin, text: client.address },
                      { icon: Clock, text: `Instalação: ${client.installDate}` },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm p-2 rounded-lg hover:bg-accent/40">
                        <item.icon className="h-3.5 w-3.5 text-muted-foreground" />{item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-semibold mb-3">Pagamentos (12 meses)</h3>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={paymentHistory}>
                      <defs><linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
                      <XAxis dataKey="month" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis hide /><Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#10B981" fill="url(#payGrad)" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          {/* DADOS */}
          <TabsContent value="dados" className="mt-4">
            <GlassCard>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Informações Pessoais</h3>
                  {[
                    { icon: Phone, text: client.phone },
                    { icon: Mail, text: client.email },
                    { icon: MapPin, text: client.address },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm p-2 rounded-lg hover:bg-accent/40">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />{item.text}
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Detalhes do Serviço</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Plano", value: client.plan },
                      { label: "Cidade", value: client.city },
                      { label: "Instalação", value: client.installDate },
                      { label: "Último pgto", value: client.lastPayment },
                    ].map((item) => (
                      <div key={item.label} className="p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-xs font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* FINANCEIRO */}
          <TabsContent value="financeiro" className="mt-4 space-y-4">
            <GlassCard>
              <div className="p-5">
                <h3 className="text-sm font-semibold mb-3">Faturas</h3>
                {clientInvoices.length > 0 ? (
                  <div className="space-y-1.5">
                    {clientInvoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg glass-table-row">
                        <div><p className="text-xs font-medium">{inv.id}</p><p className="text-[10px] text-muted-foreground">Vencimento: {inv.dueDate}</p></div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">R$ {inv.amount.toFixed(2)}</span>
                          <StatusBadge status={inv.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-muted-foreground">Nenhuma fatura encontrada</p>}
              </div>
            </GlassCard>
          </TabsContent>

          {/* CONEXÃO */}
          <TabsContent value="conexao" className="mt-4">
            <GlassCard>
              <div className="p-5">
                <h3 className="text-sm font-semibold mb-3">Dados de Conexão</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Plano", value: client.plan, icon: Wifi },
                    { label: "Status", value: "Online", icon: Activity, color: "#10B981" },
                    { label: "Sinal (dBm)", value: "-22.4", icon: BarChart3 },
                    { label: "Uptime", value: "15d 8h", icon: Clock },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.02)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <item.icon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{item.label}</span>
                      </div>
                      <p className="text-base font-semibold" style={item.color ? { color: item.color } : {}}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* TICKETS */}
          <TabsContent value="tickets" className="mt-4">
            <GlassCard>
              <div className="p-5">
                <h3 className="text-sm font-semibold mb-3">Tickets</h3>
                {clientTickets.length > 0 ? (
                  <div className="space-y-1.5">
                    {clientTickets.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg glass-table-row">
                        <div>
                          <p className="text-xs font-medium">{t.subject}</p>
                          <p className="text-[10px] text-muted-foreground">{t.id} • {t.timeAgo}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={t.priority} />
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-muted-foreground">Nenhum ticket encontrado</p>}
              </div>
            </GlassCard>
          </TabsContent>

          {/* CONSUMO */}
          <TabsContent value="consumo" className="mt-4">
            <GlassCard>
              <div className="p-5">
                <h3 className="text-sm font-semibold mb-1">Consumo de Banda (últimos 30 dias)</h3>
                <p className="text-[10px] text-muted-foreground mb-3">Download e upload em GB</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={consumptionData}>
                    <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="download" fill="#2563EB" radius={[3,3,0,0]} name="Download (GB)" />
                    <Bar dataKey="upload" fill="#8B5CF6" fillOpacity={0.7} radius={[3,3,0,0]} name="Upload (GB)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </TabsContent>

          {/* SCORE IA */}
          <TabsContent value="score" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-semibold mb-4">Score de Churn</h3>
                  <div className="flex flex-col items-center">
                    <GaugeChart score={churnScore} />
                    <p className="text-xs text-muted-foreground mt-2">
                      {churnScore < 25 ? "Risco baixo — cliente engajado" :
                       churnScore < 50 ? "Risco médio — monitorar" :
                       churnScore < 75 ? "Risco alto — ação recomendada" :
                       "Risco crítico — ação urgente"}
                    </p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-semibold mb-3">Fatores de Risco</h3>
                  <div className="space-y-2.5">
                    {churnFactors.map((f) => (
                      <div key={f.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs">{f.label}</span>
                          <span className="text-xs text-muted-foreground">{f.value}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${f.score}%`,
                            background: f.score >= 50 ? "#EF4444" : f.score >= 25 ? "#F59E0B" : "#10B981"
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          {/* HISTÓRICO */}
          <TabsContent value="historico" className="mt-4">
            <GlassCard>
              <div className="p-5">
                <h3 className="text-sm font-semibold mb-4">Histórico Completo</h3>
                <div className="relative pl-5">
                  <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-border" />
                  {timeline.map((item, i) => (
                    <div key={i} className="relative pb-4 last:pb-0">
                      <div className="absolute -left-3.5 top-1 h-2.5 w-2.5 rounded-full border-2 border-background" style={{ background: timelineColors[item.type] }} />
                      <p className="text-xs font-medium">{item.event}</p>
                      <p className="text-[10px] text-muted-foreground">{item.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
