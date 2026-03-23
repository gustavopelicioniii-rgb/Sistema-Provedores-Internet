import { useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageWrapper } from "@/components/shared/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/shared/KPICard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Plus, Search, Users, UserCheck, UserX, UserMinus, UserPlus,
  MessageSquare, PauseCircle, FileText, ArrowUpDown, Download,
  Send, MoreHorizontal, AlertTriangle
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockClients } from "@/data/mockData";

// Add risk scores to clients
const clientsWithRisk = mockClients.map((c) => ({
  ...c,
  riskScore: c.status === "cancelado" ? 92 : c.status === "suspenso" ? 78 : Math.floor(Math.random() * 45 + 10),
  ltv: `R$ ${(Math.random() * 5000 + 500).toFixed(0)}`,
  tenure: `${Math.floor(Math.random() * 24 + 1)} meses`,
}));

const stats = [
  { label: "Total", value: mockClients.length, icon: Users, filter: "all" },
  { label: "Ativos", value: mockClients.filter(c => c.status === "ativo").length, icon: UserCheck, filter: "ativo" },
  { label: "Suspensos", value: mockClients.filter(c => c.status === "suspenso").length, icon: UserMinus, filter: "suspenso" },
  { label: "Cancelados", value: mockClients.filter(c => c.status === "cancelado").length, icon: UserX, filter: "cancelado" },
  { label: "Novos (mês)", value: 42, icon: UserPlus, filter: "all" },
];

function getRiskBadge(score: number) {
  if (score >= 75) return { label: "Crítico", bg: "rgba(239,68,68,0.1)", color: "#DC2626" };
  if (score >= 50) return { label: "Alto", bg: "rgba(245,158,11,0.1)", color: "#D97706" };
  if (score >= 25) return { label: "Médio", bg: "rgba(59,130,246,0.1)", color: "#2563EB" };
  return { label: "Baixo", bg: "rgba(16,185,129,0.1)", color: "#059669" };
}

export default function Clients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = clientsWithRisk.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.document.includes(search) || c.phone.includes(search);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchPlan = planFilter === "all" || c.plan === planFilter;
    const matchCity = cityFilter === "all" || c.city === cityFilter;
    const matchRisk = riskFilter === "all" ||
      (riskFilter === "critico" && c.riskScore >= 75) ||
      (riskFilter === "alto" && c.riskScore >= 50 && c.riskScore < 75) ||
      (riskFilter === "medio" && c.riskScore >= 25 && c.riskScore < 50) ||
      (riskFilter === "baixo" && c.riskScore < 25);
    return matchSearch && matchStatus && matchPlan && matchCity && matchRisk;
  });

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(c => c.id));
  };

  const toggleOne = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const cities = [...new Set(mockClients.map(c => c.city))];
  const plans = [...new Set(mockClients.map(c => c.plan))];

  return (
    <PageWrapper>
      <div className="space-y-4">
        {/* Page Header */}
        <PageHeader title="Clientes" subtitle="Gerencie seus clientes e acompanhe o status de cada um" />

        {/* KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stats.map((s) => (
            <button key={s.label} onClick={() => setStatusFilter(s.filter)} className="text-left">
              <KPICard
                title={s.label}
                value={s.value}
                icon={s.icon}
                iconColor={statusFilter === s.filter ? "#2563EB" : "#6B7280"}
                iconBg={statusFilter === s.filter ? "rgba(37,99,235,0.1)" : "rgba(107,127,128,0.1)"}
                className={`cursor-pointer transition-all ${statusFilter === s.filter ? "ring-2 ring-primary" : ""}`}
              />
            </button>
          ))}
        </div>

        {/* Search + Filters + Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Nome, CPF/CNPJ, telefone..." className="pl-9 h-9 text-sm" style={{ borderRadius: 10 }} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} style={{ borderRadius: 10 }}>
                Filtros {showFilters ? "▲" : "▼"}
              </Button>
            </div>
            <div className="flex gap-2">
              {selected.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" style={{ borderRadius: 10 }}>
                      Ações em massa ({selected.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem><MessageSquare className="h-4 w-4 mr-2" />Enviar WhatsApp</DropdownMenuItem>
                    <DropdownMenuItem><PauseCircle className="h-4 w-4 mr-2" />Suspender/Reativar</DropdownMenuItem>
                    <DropdownMenuItem><FileText className="h-4 w-4 mr-2" />Gerar faturas</DropdownMenuItem>
                    <DropdownMenuItem><ArrowUpDown className="h-4 w-4 mr-2" />Mover de plano</DropdownMenuItem>
                    <DropdownMenuItem><Send className="h-4 w-4 mr-2" />Disparar campanha</DropdownMenuItem>
                    <DropdownMenuItem><Download className="h-4 w-4 mr-2" />Exportar lista</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" style={{ borderRadius: 10 }}><Plus className="h-4 w-4 mr-1.5" />Novo cliente</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg glass-card border-none">
                  <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className="text-xs">Nome completo</Label><Input placeholder="Nome" style={{ borderRadius: 10 }} className="h-9" /></div>
                      <div className="space-y-1.5"><Label className="text-xs">CPF/CNPJ</Label><Input placeholder="000.000.000-00" style={{ borderRadius: 10 }} className="h-9" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input type="email" placeholder="email@exemplo.com" style={{ borderRadius: 10 }} className="h-9" /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Telefone</Label><Input placeholder="(11) 99999-9999" style={{ borderRadius: 10 }} className="h-9" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className="text-xs">Endereço</Label><Input placeholder="Rua, número - Bairro" style={{ borderRadius: 10 }} className="h-9" /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Cidade</Label><Input placeholder="São Paulo" style={{ borderRadius: 10 }} className="h-9" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5"><Label className="text-xs">Plano</Label>
                        <Select><SelectTrigger style={{ borderRadius: 10 }} className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {plans.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5"><Label className="text-xs">Forma de pagamento</Label>
                        <Select><SelectTrigger style={{ borderRadius: 10 }} className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="boleto">Boleto</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="cartao">Cartão</SelectItem>
                            <SelectItem value="debito">Débito automático</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5"><Label className="text-xs">Dia de vencimento</Label>
                        <Select><SelectTrigger style={{ borderRadius: 10 }} className="h-9"><SelectValue placeholder="Dia" /></SelectTrigger>
                          <SelectContent>
                            {[5,10,15,20,25].map(d => <SelectItem key={d} value={String(d)}>Dia {d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className="text-xs">Data de instalação</Label><Input type="date" style={{ borderRadius: 10 }} className="h-9" /></div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <Checkbox />
                          Agendar instalação
                        </label>
                      </div>
                    </div>
                    <Button className="w-full" style={{ borderRadius: 10 }}>Cadastrar cliente</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <GlassCard>
              <div className="p-3 flex flex-wrap gap-3">
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-36 h-8 text-xs" style={{ borderRadius: 8 }}><SelectValue placeholder="Plano" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os planos</SelectItem>
                    {plans.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-36 h-8 text-xs" style={{ borderRadius: 8 }}><SelectValue placeholder="Cidade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-36 h-8 text-xs" style={{ borderRadius: 8 }}><SelectValue placeholder="Risco" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os riscos</SelectItem>
                    <SelectItem value="critico">Crítico (75+)</SelectItem>
                    <SelectItem value="alto">Alto (50-74)</SelectItem>
                    <SelectItem value="medio">Médio (25-49)</SelectItem>
                    <SelectItem value="baixo">Baixo (0-24)</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => { setPlanFilter("all"); setCityFilter("all"); setRiskFilter("all"); setStatusFilter("all"); }}>
                  Limpar filtros
                </Button>
              </div>
            </GlassCard>
          )}
        </div>

        <GlassCard>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead className="glass-table-header w-8">
                    <Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead className="glass-table-header">Nome</TableHead>
                  <TableHead className="glass-table-header">CPF/CNPJ</TableHead>
                  <TableHead className="glass-table-header">Plano</TableHead>
                  <TableHead className="glass-table-header">Status</TableHead>
                  <TableHead className="glass-table-header">Risco</TableHead>
                  <TableHead className="glass-table-header">Cidade</TableHead>
                  <TableHead className="glass-table-header">Último Pgto</TableHead>
                  <TableHead className="glass-table-header">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const risk = getRiskBadge(c.riskScore);
                  return (
                    <TableRow key={c.id} className="glass-table-row border-none">
                      <TableCell><Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggleOne(c.id)} /></TableCell>
                      <TableCell>
                        <Link to={`/clients/${c.id}`} className="font-medium text-primary hover:underline text-sm">{c.name}</Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{c.document}</TableCell>
                      <TableCell className="text-xs">{c.plan}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: risk.bg, color: risk.color }}>
                          {risk.label} ({c.riskScore})
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{c.city}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{c.lastPayment}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>💰 Cobrar</DropdownMenuItem>
                            <DropdownMenuItem>🎫 Abrir ticket</DropdownMenuItem>
                            <DropdownMenuItem>📝 Alterar plano</DropdownMenuItem>
                            <DropdownMenuItem>📄 Gerar 2ª via</DropdownMenuItem>
                            <DropdownMenuItem>⏸️ Suspender</DropdownMenuItem>
                            <DropdownMenuItem>💬 Enviar mensagem</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}
