import { useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageWrapper } from "@/components/shared/PageWrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Plus, Search, LayoutList, Kanban, Clock, CheckCircle, AlertCircle, Timer } from "lucide-react";
import { mockTickets } from "@/data/mockData";

const ticketKpis = [
  { label: "Total abertos", value: mockTickets.filter(t => t.status === "aberto").length.toString(), icon: AlertCircle, bg: "rgba(59,130,246,0.1)", color: "#2563EB" },
  { label: "Tempo médio resolução", value: "4h 32min", icon: Timer, bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
  { label: "SLA cumprido", value: "94%", icon: CheckCircle, bg: "rgba(16,185,129,0.1)", color: "#10B981" },
  { label: "Tickets hoje", value: "8", icon: Clock, bg: "rgba(139,92,246,0.1)", color: "#8B5CF6" },
];

const priorityBarColor: Record<string, string> = {
  crítica: "#DC2626",
  alta: "#EF4444",
  média: "#F59E0B",
  baixa: "#94A3B8",
};

export default function Tickets() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockTickets.filter((t) => {
    const matchSearch = t.client.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const kanbanColumns = [
    { key: "aberto", label: "Aberto" },
    { key: "em andamento", label: "Em Andamento" },
    { key: "aguardando cliente", label: "Aguardando Cliente" },
    { key: "resolvido", label: "Resolvido" },
  ];

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Mini KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ticketKpis.map((kpi, i) => (
            <GlassCard key={kpi.label} hover className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <kpi.icon style={{ width: 18, height: 18, color: kpi.color }} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar tickets..." className="pl-9" style={{ borderRadius: 10 }} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" style={{ borderRadius: 10 }}><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="em andamento">Em andamento</SelectItem>
                <SelectItem value="aguardando cliente">Aguardando</SelectItem>
                <SelectItem value="resolvido">Resolvido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="glass-card flex overflow-hidden p-0.5" style={{ borderRadius: 10 }}>
              <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")} style={{ borderRadius: 8 }}>
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button variant={view === "kanban" ? "secondary" : "ghost"} size="sm" onClick={() => setView("kanban")} style={{ borderRadius: 8 }}>
                <Kanban className="h-4 w-4" />
              </Button>
            </div>
            <Button style={{ borderRadius: 10 }}><Plus className="h-4 w-4 mr-2" />Novo ticket</Button>
          </div>
        </div>

        {view === "list" ? (
          <GlassCard>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-none">
                    <TableHead className="glass-table-header">Nº</TableHead>
                    <TableHead className="glass-table-header">Cliente</TableHead>
                    <TableHead className="glass-table-header">Assunto</TableHead>
                    <TableHead className="glass-table-header">Prioridade</TableHead>
                    <TableHead className="glass-table-header">Status</TableHead>
                    <TableHead className="glass-table-header">Responsável</TableHead>
                    <TableHead className="glass-table-header">Tempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id} className="glass-table-row border-none">
                      <TableCell className="font-medium text-sm">{t.id}</TableCell>
                      <TableCell className="text-sm">{t.client}</TableCell>
                      <TableCell className="text-sm">{t.subject}</TableCell>
                      <TableCell><StatusBadge status={t.priority} /></TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{t.assignee}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{t.timeAgo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
            {kanbanColumns.map((col) => {
              const colTickets = filtered.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="space-y-3 min-w-[250px]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{col.label}</h3>
                    <span className="text-xs text-muted-foreground glass-card px-2 py-0.5" style={{ borderRadius: 9999 }}>
                      {colTickets.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {colTickets.map((t) => (
                      <GlassCard key={t.id} hover className="cursor-grab active:cursor-grabbing overflow-hidden">
                        <div className="h-1" style={{ background: priorityBarColor[t.priority] || "#94A3B8" }} />
                        <div className="p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-muted-foreground">{t.id}</span>
                            <StatusBadge status={t.priority} />
                          </div>
                          <p className="text-sm font-medium">{t.subject}</p>
                          <p className="text-xs text-muted-foreground">{t.client}</p>
                          <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-primary">
                                {t.assignee.split(" ").map(w => w[0]).slice(0, 2).join("")}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{t.timeAgo}</span>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
