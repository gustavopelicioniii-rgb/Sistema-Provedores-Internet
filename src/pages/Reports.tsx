import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Network, Zap, FileText, Download, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const reports = [
  { title: "Financeiro Mensal", description: "Resumo completo de receitas, despesas e inadimplência do mês", icon: DollarSign },
  { title: "Crescimento de Base", description: "Análise de novos clientes, cancelamentos e crescimento líquido", icon: TrendingUp },
  { title: "Análise de Churn", description: "Motivos de cancelamento, taxa de churn e tendências", icon: TrendingDown },
  { title: "Performance de Rede", description: "Uptime, quedas, tempo médio de recuperação e qualidade de sinal", icon: Network },
  { title: "Automações (ROI)", description: "Retorno sobre investimento das automações ativas, tickets evitados", icon: Zap },
  { title: "Relatório Fiscal", description: "Notas fiscais emitidas, impostos e obrigações do período", icon: FileText },
];

const mockReportData = [
  { month: "Out", value: 215 }, { month: "Nov", value: 222 }, { month: "Dez", value: 228 },
  { month: "Jan", value: 232 }, { month: "Fev", value: 238 }, { month: "Mar", value: 244 },
];

const periods = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "month", label: "Este mês" },
  { value: "lastmonth", label: "Último mês" },
  { value: "3m", label: "Últimos 3 meses" },
  { value: "custom", label: "Personalizado" },
];

export default function Reports() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);

  const handleGenerate = (title: string) => {
    setGenerating(title);
    setTimeout(() => {
      setGenerating(null);
      setGenerated((prev) => [...prev, title]);
    }, 1200);
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Relatórios</h2>
            <p className="text-xs text-muted-foreground">Gere relatórios detalhados sobre seu provedor</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="month">
              <SelectTrigger className="w-44" style={{ borderRadius: 10 }}><SelectValue /></SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, i) => (
            <GlassCard key={report.title} hover className="stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="p-6 space-y-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <report.icon style={{ width: 20, height: 20, color: '#2563EB' }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold">{report.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                </div>

                {generating === report.title ? (
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-4 w-full" />
                    <div className="skeleton-shimmer h-4 w-3/4" />
                    <div className="skeleton-shimmer h-24 w-full" />
                  </div>
                ) : generated.includes(report.title) ? (
                  <div className="space-y-3">
                    <ResponsiveContainer width="100%" height={80}>
                      <AreaChart data={mockReportData}>
                        <defs>
                          <linearGradient id={`rgrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#2563EB" fill={`url(#rgrad-${i})`} strokeWidth={2} />
                        <XAxis dataKey="month" fontSize={9} tickLine={false} axisLine={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs" style={{ borderRadius: 10 }}>
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs" style={{ borderRadius: 10 }}
                        onClick={() => handleGenerate(report.title)}>
                        Atualizar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" style={{ borderRadius: 10 }}
                    onClick={() => handleGenerate(report.title)}>
                    Gerar Relatório
                  </Button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
