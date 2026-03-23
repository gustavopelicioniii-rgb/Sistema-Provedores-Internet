import { GlassCard } from '@/components/shared/GlassCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AlertTriangle, Ticket, Bell } from 'lucide-react';

interface AtRiskClient {
  id: string;
  name: string;
  phone?: string;
  status: string;
  churn_score: number;
  signal_rx: number;
  signal_tx?: number;
  serial_number?: string;
  olt_name?: string;
  plan_name?: string;
}

interface AtRiskClientsProps {
  clients: AtRiskClient[];
  isLoading: boolean;
  onCreateTicket?: (clientId: string) => void;
  onNotifyClient?: (clientId: string) => void;
}

export function AtRiskClients({
  clients,
  isLoading,
  onCreateTicket,
  onNotifyClient,
}: AtRiskClientsProps) {
  if (isLoading) {
    return (
      <GlassCard>
        <div className="p-4">
          <div className="h-4 w-40 bg-muted rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted/30 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-semibold">Clientes em Risco de Sinal</h3>
          {clients.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-destructive/10 text-destructive">
              {clients.length} cliente(s)
            </span>
          )}
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-xs">Nenhum cliente com sinal critico no momento</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-none">
                <TableHead className="glass-table-header">Cliente</TableHead>
                <TableHead className="glass-table-header">OLT</TableHead>
                <TableHead className="glass-table-header">Plano</TableHead>
                <TableHead className="glass-table-header">Sinal (dBm)</TableHead>
                <TableHead className="glass-table-header">Status</TableHead>
                <TableHead className="glass-table-header">Churn</TableHead>
                <TableHead className="glass-table-header text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="glass-table-row border-none">
                  <TableCell className="text-sm font-medium">{client.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {client.olt_name || '-'}
                  </TableCell>
                  <TableCell className="text-xs">{client.plan_name || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`text-sm font-medium ${
                        client.signal_rx < -27 ? 'text-destructive' : 'text-amber-500'
                      }`}
                    >
                      {Number(client.signal_rx).toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={client.status} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        client.churn_score >= 75
                          ? 'bg-destructive/10 text-destructive'
                          : client.churn_score >= 50
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {client.churn_score}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px]"
                        onClick={() => onCreateTicket?.(client.id)}
                      >
                        <Ticket className="h-3 w-3 mr-1" />
                        Ticket
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px]"
                        onClick={() => onNotifyClient?.(client.id)}
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        Notificar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </GlassCard>
  );
}
