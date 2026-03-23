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
import { MoreHorizontal, Pencil, Trash2, Users, BarChart3, ArrowUpDown } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  download_speed: number;
  upload_speed: number;
  monthly_price: number;
  clients_count: number;
  status: string;
  description?: string;
}

interface PlansTableProps {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
  onViewKPIs: (id: string) => void;
  onViewClients: (id: string) => void;
}

export function PlansTable({
  plans,
  onEdit,
  onDelete,
  onViewKPIs,
  onViewClients,
}: PlansTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-none">
            <TableHead className="glass-table-header">
              <div className="flex items-center gap-1 cursor-pointer">
                Nome <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="glass-table-header">Download</TableHead>
            <TableHead className="glass-table-header">Upload</TableHead>
            <TableHead className="glass-table-header">
              <div className="flex items-center gap-1 cursor-pointer">
                Preco <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="glass-table-header">
              <div className="flex items-center gap-1 cursor-pointer">
                Clientes <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="glass-table-header">Status</TableHead>
            <TableHead className="glass-table-header text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id} className="glass-table-row border-none">
              <TableCell className="font-medium text-sm">{plan.name}</TableCell>
              <TableCell className="text-sm">{plan.download_speed} Mbps</TableCell>
              <TableCell className="text-sm">{plan.upload_speed} Mbps</TableCell>
              <TableCell className="text-sm font-medium">
                R$ {Number(plan.monthly_price).toFixed(2)}
              </TableCell>
              <TableCell className="text-sm">
                {Number(plan.clients_count || 0).toLocaleString('pt-BR')}
              </TableCell>
              <TableCell>
                <StatusBadge status={plan.status} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(plan)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewKPIs(plan.id)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver KPIs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewClients(plan.id)}>
                      <Users className="h-4 w-4 mr-2" />
                      Ver Clientes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(plan.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {plans.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhum plano encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
