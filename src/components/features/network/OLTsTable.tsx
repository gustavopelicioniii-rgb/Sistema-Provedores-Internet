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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Activity, Users, AlertTriangle, Pencil } from 'lucide-react';

interface OLT {
  id: string;
  name: string;
  model?: string;
  ip_address: string;
  port?: string;
  status: string;
  uptime_seconds?: number;
  clients_connected?: number;
  active_incidents?: number;
  signal_quality?: number;
}

interface OLTsTableProps {
  olts: OLT[];
  onViewHealth: (id: string) => void;
  onViewClients: (id: string) => void;
  onViewIncidents: (id: string) => void;
  onEdit: (olt: OLT) => void;
}

export function OLTsTable({
  olts,
  onViewHealth,
  onViewClients,
  onViewIncidents,
  onEdit,
}: OLTsTableProps) {
  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0d 0h';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-none">
            <TableHead className="glass-table-header">Nome</TableHead>
            <TableHead className="glass-table-header">Modelo</TableHead>
            <TableHead className="glass-table-header">IP</TableHead>
            <TableHead className="glass-table-header">Status</TableHead>
            <TableHead className="glass-table-header">Clientes</TableHead>
            <TableHead className="glass-table-header">Sinal</TableHead>
            <TableHead className="glass-table-header">Uptime</TableHead>
            <TableHead className="glass-table-header">Incidentes</TableHead>
            <TableHead className="glass-table-header text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {olts.map((olt) => (
            <TableRow key={olt.id} className="glass-table-row border-none">
              <TableCell className="font-medium text-sm">{olt.name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{olt.model || '-'}</TableCell>
              <TableCell className="font-mono text-xs">{olt.ip_address}</TableCell>
              <TableCell>
                <StatusBadge status={olt.status} />
              </TableCell>
              <TableCell className="text-sm">{olt.clients_connected || 0}</TableCell>
              <TableCell className="text-sm">
                <span
                  className={`font-medium ${
                    (olt.signal_quality || 0) >= 90
                      ? 'text-success'
                      : (olt.signal_quality || 0) >= 70
                        ? 'text-amber-500'
                        : 'text-destructive'
                  }`}
                >
                  {olt.signal_quality || 0}%
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatUptime(olt.uptime_seconds)}
              </TableCell>
              <TableCell>
                {(olt.active_incidents || 0) > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-destructive/10 text-destructive">
                    {olt.active_incidents} ativo(s)
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Nenhum</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewHealth(olt.id)}>
                      <Activity className="h-4 w-4 mr-2" />
                      Ver Health
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewClients(olt.id)}>
                      <Users className="h-4 w-4 mr-2" />
                      Ver Clientes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewIncidents(olt.id)}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Ver Incidentes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(olt)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {olts.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                Nenhuma OLT encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
