import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusType = "ativo" | "suspenso" | "cancelado" | "inativo" | "pago" | "pendente" | "atrasado" | "aberto" | "em andamento" | "resolvido" | "emitida" | "cancelada" | "online" | "offline" | "warning" | "baixa" | "média" | "alta" | "crítica";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  suspenso: { label: "Suspenso", className: "bg-warning/10 text-warning border-warning/20" },
  cancelado: { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/20" },
  inativo: { label: "Inativo", className: "bg-muted text-muted-foreground" },
  pago: { label: "Pago", className: "bg-success/10 text-success border-success/20" },
  pendente: { label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
  atrasado: { label: "Atrasado", className: "bg-destructive/10 text-destructive border-destructive/20" },
  aberto: { label: "Aberto", className: "bg-primary/10 text-primary border-primary/20" },
  "em andamento": { label: "Em andamento", className: "bg-warning/10 text-warning border-warning/20" },
  resolvido: { label: "Resolvido", className: "bg-success/10 text-success border-success/20" },
  emitida: { label: "Emitida", className: "bg-success/10 text-success border-success/20" },
  cancelada: { label: "Cancelada", className: "bg-destructive/10 text-destructive border-destructive/20" },
  online: { label: "Online", className: "bg-success/10 text-success border-success/20" },
  offline: { label: "Offline", className: "bg-destructive/10 text-destructive border-destructive/20" },
  warning: { label: "Alerta", className: "bg-warning/10 text-warning border-warning/20" },
  baixa: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  média: { label: "Média", className: "bg-warning/10 text-warning border-warning/20" },
  alta: { label: "Alta", className: "bg-destructive/10 text-destructive border-destructive/20" },
  crítica: { label: "Crítica", className: "bg-destructive text-destructive-foreground" },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status] || { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
