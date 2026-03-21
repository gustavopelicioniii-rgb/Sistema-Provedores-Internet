import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Network, Zap, FileText } from "lucide-react";

const reports = [
  { title: "Financeiro Mensal", description: "Resumo completo de receitas, despesas e inadimplência do mês", icon: DollarSign },
  { title: "Crescimento de Base", description: "Análise de novos clientes, cancelamentos e crescimento líquido", icon: TrendingUp },
  { title: "Análise de Churn", description: "Motivos de cancelamento, taxa de churn e tendências", icon: TrendingDown },
  { title: "Performance de Rede", description: "Uptime, quedas, tempo médio de recuperação e qualidade de sinal", icon: Network },
  { title: "Automações (ROI)", description: "Retorno sobre investimento das automações ativas, tickets evitados", icon: Zap },
  { title: "Relatório Fiscal", description: "Notas fiscais emitidas, impostos e obrigações do período", icon: FileText },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Relatórios</h2>
          <p className="text-sm text-muted-foreground">Gere relatórios detalhados sobre seu provedor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <report.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
              </div>
              <Button variant="outline" className="w-full">Gerar Relatório</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
