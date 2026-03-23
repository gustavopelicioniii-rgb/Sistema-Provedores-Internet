import { useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageWrapper } from "@/components/shared/PageWrapper";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PlansTable } from "@/components/features/plans/PlansTable";
import { PlanKPIs } from "@/components/features/plans/PlanKPIs";
import { PlansComparison } from "@/components/features/plans/PlansComparison";
import { usePlans, usePlanKPIs, useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/usePlans";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Plus, LayoutList, LayoutGrid, Download, Upload, BarChart3, Search, RefreshCw
} from "lucide-react";
import { mockPlans } from "@/data/mockData";
import { useQueryClient } from "@tanstack/react-query";

export default function Plans() {
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [kpiPlanId, setKpiPlanId] = useState<string | null>(null);
  const [kpiDrawerOpen, setKpiDrawerOpen] = useState(false);

  const { isComparisonOpen, toggleComparison } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Use API data when authenticated, fallback to mock
  const { data: apiData, isLoading, isError } = usePlans({
    page: 1,
    limit: 50,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });

  const { data: kpis, isLoading: kpisLoading } = usePlanKPIs(kpiPlanId);
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  // Determine data source: API or mock
  const useMock = !isAuthenticated || isError;
  const plans = useMock
    ? mockPlans
        .filter(p => statusFilter === "all" || p.status === statusFilter)
        .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
        .map(p => ({ ...p, clients_count: p.clients, monthly_price: p.price }))
    : (apiData?.data || []);

  // Form state
  const [formData, setFormData] = useState({
    name: "", download_speed: "", upload_speed: "", monthly_price: "", description: "", sla_uptime: "99.5", status: "ativo",
  });

  const openCreateForm = () => {
    setEditingPlan(null);
    setFormData({ name: "", download_speed: "", upload_speed: "", monthly_price: "", description: "", sla_uptime: "99.5", status: "ativo" });
    setFormOpen(true);
  };

  const openEditForm = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      download_speed: String(plan.download_speed || plan.downloadSpeed),
      upload_speed: String(plan.upload_speed || plan.uploadSpeed),
      monthly_price: String(plan.monthly_price || plan.price),
      description: plan.description || "",
      sla_uptime: String(plan.sla_uptime || "99.5"),
      status: plan.status || "ativo",
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      name: formData.name,
      download_speed: parseInt(formData.download_speed),
      upload_speed: parseInt(formData.upload_speed),
      monthly_price: parseFloat(formData.monthly_price),
      description: formData.description,
      sla_uptime: parseFloat(formData.sla_uptime),
      status: formData.status,
    };

    if (editingPlan) {
      updatePlan.mutate({ id: editingPlan.id, data: payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      createPlan.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePlan.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  const openKPIDrawer = (planId: string) => {
    setKpiPlanId(planId);
    setKpiDrawerOpen(true);
  };

  return (
    <PageWrapper>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Planos e Servicos</h2>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plano..."
                className="pl-9 h-9 text-sm w-48"
                style={{ borderRadius: 10 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9 text-xs" style={{ borderRadius: 10 }}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <div className="glass-card flex overflow-hidden p-0.5" style={{ borderRadius: 10 }}>
              <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("table")} style={{ borderRadius: 8 }}>
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "cards" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("cards")} style={{ borderRadius: 8 }}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={toggleComparison} style={{ borderRadius: 10 }}>
              <BarChart3 className="h-4 w-4 mr-1.5" />Comparar
            </Button>
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['plans'] })} style={{ borderRadius: 10 }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={openCreateForm} style={{ borderRadius: 10 }}>
              <Plus className="h-4 w-4 mr-1.5" />Novo plano
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading && !useMock ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i}><div className="p-6 space-y-4 animate-pulse">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-8 w-24 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
              </div></GlassCard>
            ))}
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((p: any, i: number) => (
              <GlassCard key={p.id} hover className="stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    <span className="text-sm">{p.download_speed || p.downloadSpeed} Mbps</span>
                    <Upload className="h-4 w-4 text-muted-foreground ml-2" />
                    <span className="text-sm">{p.upload_speed || p.uploadSpeed} Mbps</span>
                  </div>
                  <div>
                    <span className="text-3xl font-bold">R$ {Number(p.monthly_price || p.price).toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                  <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <span className="text-xs text-muted-foreground">
                      {Number(p.clients_count || p.clients || 0).toLocaleString("pt-BR")} clientes
                    </span>
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => openKPIDrawer(p.id)} style={{ borderRadius: 8 }}>
                        <BarChart3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditForm(p)} style={{ borderRadius: 10 }}>Editar</Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard>
            <PlansTable
              plans={plans}
              onEdit={openEditForm}
              onDelete={(id) => setDeleteId(id)}
              onViewKPIs={openKPIDrawer}
              onViewClients={() => {}}
            />
          </GlassCard>
        )}

        {/* Plan Form Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="glass-card border-none">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Editar Plano" : "Novo Plano"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nome do plano</Label>
                <Input placeholder="Ex: Ultra 300" style={{ borderRadius: 10 }} value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Download (Mbps)</Label>
                  <Input type="number" placeholder="300" style={{ borderRadius: 10 }} value={formData.download_speed}
                    onChange={(e) => setFormData(f => ({ ...f, download_speed: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Upload (Mbps)</Label>
                  <Input type="number" placeholder="150" style={{ borderRadius: 10 }} value={formData.upload_speed}
                    onChange={(e) => setFormData(f => ({ ...f, upload_speed: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preco (R$)</Label>
                  <Input type="number" placeholder="199.90" step="0.01" style={{ borderRadius: 10 }} value={formData.monthly_price}
                    onChange={(e) => setFormData(f => ({ ...f, monthly_price: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>SLA Uptime (%)</Label>
                  <Input type="number" placeholder="99.5" step="0.1" style={{ borderRadius: 10 }} value={formData.sla_uptime}
                    onChange={(e) => setFormData(f => ({ ...f, sla_uptime: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descricao</Label>
                <Input placeholder="Descricao do plano" style={{ borderRadius: 10 }} value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(f => ({ ...f, status: v }))}>
                  <SelectTrigger style={{ borderRadius: 10 }}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="descontinuado">Descontinuado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" style={{ borderRadius: 10 }} onClick={handleSubmit}
                disabled={createPlan.isPending || updatePlan.isPending}>
                {createPlan.isPending || updatePlan.isPending ? "Salvando..." : editingPlan ? "Atualizar" : "Criar plano"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Excluir Plano"
          description="Tem certeza que deseja excluir este plano? Esta acao nao pode ser desfeita."
          onConfirm={handleDelete}
        />

        {/* KPI Drawer */}
        <Sheet open={kpiDrawerOpen} onOpenChange={setKpiDrawerOpen}>
          <SheetContent className="glass-card border-none w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>KPIs do Plano</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <PlanKPIs kpis={kpis || null} isLoading={kpisLoading} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Comparison Modal */}
        <PlansComparison open={isComparisonOpen} onOpenChange={toggleComparison} />
      </div>
    </PageWrapper>
  );
}
