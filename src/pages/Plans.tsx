import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, LayoutList, LayoutGrid, Download, Upload } from "lucide-react";
import { mockPlans } from "@/data/mockData";

export default function Plans() {
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Planos e Serviços</h2>
          <div className="flex gap-2">
            <div className="glass-card flex overflow-hidden p-0.5" style={{ borderRadius: 10 }}>
              <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("table")} style={{ borderRadius: 8 }}>
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "cards" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("cards")} style={{ borderRadius: 8 }}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button style={{ borderRadius: 10 }}><Plus className="h-4 w-4 mr-2" />Novo plano</Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-none">
                <DialogHeader><DialogTitle>Novo Plano</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2"><Label>Nome do plano</Label><Input placeholder="Ex: Ultra 300" style={{ borderRadius: 10 }} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Download (Mbps)</Label><Input type="number" placeholder="300" style={{ borderRadius: 10 }} /></div>
                    <div className="space-y-2"><Label>Upload (Mbps)</Label><Input type="number" placeholder="150" style={{ borderRadius: 10 }} /></div>
                  </div>
                  <div className="space-y-2"><Label>Preço (R$)</Label><Input type="number" placeholder="199.90" style={{ borderRadius: 10 }} /></div>
                  <div className="space-y-2"><Label>Descrição</Label><Input placeholder="Descrição do plano" style={{ borderRadius: 10 }} /></div>
                  <Button className="w-full" style={{ borderRadius: 10 }}>Criar plano</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPlans.map((p, i) => (
              <GlassCard key={p.id} hover className="stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    <span className="text-sm">{p.downloadSpeed} Mbps</span>
                    <Upload className="h-4 w-4 text-muted-foreground ml-2" />
                    <span className="text-sm">{p.uploadSpeed} Mbps</span>
                  </div>
                  <div>
                    <span className="text-3xl font-bold">R$ {p.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                  <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <span className="text-xs text-muted-foreground">{p.clients.toLocaleString("pt-BR")} clientes</span>
                    <Button variant="outline" size="sm" style={{ borderRadius: 10 }}>Editar</Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-none">
                    <TableHead className="glass-table-header">Nome</TableHead>
                    <TableHead className="glass-table-header">Download</TableHead>
                    <TableHead className="glass-table-header">Upload</TableHead>
                    <TableHead className="glass-table-header">Preço</TableHead>
                    <TableHead className="glass-table-header">Clientes</TableHead>
                    <TableHead className="glass-table-header">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPlans.map((p) => (
                    <TableRow key={p.id} className="glass-table-row border-none">
                      <TableCell className="font-medium text-sm">{p.name}</TableCell>
                      <TableCell className="text-sm">{p.downloadSpeed} Mbps</TableCell>
                      <TableCell className="text-sm">{p.uploadSpeed} Mbps</TableCell>
                      <TableCell className="text-sm">R$ {p.price.toFixed(2)}</TableCell>
                      <TableCell className="text-sm">{p.clients.toLocaleString("pt-BR")}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GlassCard>
        )}
      </div>
    </PageWrapper>
  );
}
