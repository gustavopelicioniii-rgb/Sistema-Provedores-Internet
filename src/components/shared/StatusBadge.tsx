import { Badge } from "@/components/ui/badge";

type StatusVariant = "client" | "invoice" | "ticket" | "network" | "plan" | "automation";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const STATUS_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  // Green (Success)
  ativo: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  pago: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  online: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  resolvido: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  emitida: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },

  // Yellow (Warning)
  pendente: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  em_andamento: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  aguardando: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  alerta: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  media: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },

  // Red (Error/Warning)
  atrasado: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  suspenso: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  offline: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  alta: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  critica: { bg: "bg-red-900 dark:bg-red-800", text: "text-red-100 dark:text-red-200", border: "border-red-700 dark:border-red-600" },

  // Gray (Disabled/Cancelled)
  cancelado: { bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-600 dark:text-slate-400", border: "border-slate-300 dark:border-slate-700" },
  inativo: { bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-600 dark:text-slate-400", border: "border-slate-300 dark:border-slate-700" },
  cancelada: { bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-600 dark:text-slate-400", border: "border-slate-300 dark:border-slate-700" },
};

export function StatusBadge({
  status,
  variant,
  className = "",
}: StatusBadgeProps) {
  const statusKey = status.toLowerCase();
  const colorConfig = STATUS_COLOR_MAP[statusKey] || STATUS_COLOR_MAP["pendente"];

  const displayLabel = status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const isCritical = statusKey === "critica";

  return (
    <Badge
      className={`${colorConfig.bg} ${colorConfig.text} border ${colorConfig.border} cursor-default font-medium transition-all hover:shadow-md ${
        isCritical ? "text-sm font-bold" : ""
      } ${className}`}
      variant="outline"
    >
      {displayLabel}
    </Badge>
  );
}
