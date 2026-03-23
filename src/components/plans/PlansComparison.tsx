import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { usePlansComparison } from "@/hooks/usePlans";

interface PlansComparisonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlansComparison({ open, onOpenChange }: PlansComparisonProps) {
  const { data: plans, isLoading } = usePlansComparison();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-none max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Comparativo de Planos</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead className="glass-table-header">Caracteristica</TableHead>
                  {(plans || []).map((p: any) => (
                    <TableHead key={p.id} className="glass-table-header text-center">
                      {p.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="glass-table-row border-none">
                  <TableCell className="font-medium text-sm">Download</TableCell>
                  {(plans || []).map((p: any) => (
                    <TableCell key={p.id} className="text-center text-sm">{p.download_speed} Mbps</TableCell>
                  ))}
                </TableRow>
                <TableRow className="glass-table-row border-none">
                  <TableCell className="font-medium text-sm">Upload</TableCell>
                  {(plans || []).map((p: any) => (
                    <TableCell key={p.id} className="text-center text-sm">{p.upload_speed} Mbps</TableCell>
                  ))}
                </TableRow>
                <TableRow className="glass-table-row border-none">
                  <TableCell className="font-medium text-sm">Preco Mensal</TableCell>
                  {(plans || []).map((p: any) => (
                    <TableCell key={p.id} className="text-center text-sm font-bold">
                      R$ {Number(p.monthly_price).toFixed(2)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="glass-table-row border-none">
                  <TableCell className="font-medium text-sm">SLA Uptime</TableCell>
                  {(plans || []).map((p: any) => (
                    <TableCell key={p.id} className="text-center text-sm">{p.sla_uptime || 99.5}%</TableCell>
                  ))}
                </TableRow>
                <TableRow className="glass-table-row border-none">
                  <TableCell className="font-medium text-sm">Clientes Ativos</TableCell>
                  {(plans || []).map((p: any) => (
                    <TableCell key={p.id} className="text-center text-sm font-medium">
                      {Number(p.clients_count).toLocaleString("pt-BR")}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="glass-table-row border-none">
                  <TableCell className="font-medium text-sm">Churn Score Medio</TableCell>
                  {(plans || []).map((p: any) => (
                    <TableCell key={p.id} className="text-center text-sm">
                      {Number(p.avg_churn_score).toFixed(0)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="glass-table-row border-none">
                  <TableCell className="font-medium text-sm">Status</TableCell>
                  {(plans || []).map((p: any) => (
                    <TableCell key={p.id} className="text-center">
                      <StatusBadge status={p.status} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
