export const STATUS_COLORS = {
  ativo: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  pago: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  online: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  resolvido: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  emitida: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },

  pendente: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  em_andamento: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  aguardando: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  alerta: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  media: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },

  atrasado: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  suspenso: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  offline: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  alta: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  critica: { bg: "bg-red-900 dark:bg-red-800", text: "text-red-100 dark:text-red-200", border: "border-red-700 dark:border-red-600" },

  cancelado: { bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-600 dark:text-slate-400", border: "border-slate-300 dark:border-slate-700" },
  inativo: { bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-600 dark:text-slate-400", border: "border-slate-300 dark:border-slate-700" },
  cancelada: { bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-600 dark:text-slate-400", border: "border-slate-300 dark:border-slate-700" },
  baixa: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
} as const;

export type StatusKey = keyof typeof STATUS_COLORS;

export const GLASS_STYLES = {
  card: "bg-white/65 dark:bg-slate-900/65 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.04)]",
  hover: "hover:bg-card/80 hover:border-border/80 hover:shadow-md transition-all",
  tableHeader: "bg-slate-50/50 dark:bg-slate-800/50",
  tableRow: "border-b border-border/50 hover:bg-muted/50 transition-colors",
} as const;

export const CHART_COLORS = {
  primary: "#2563EB",
  secondary: "#8B5CF6",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#06B6D4",
} as const;

export const COLOR_MAP = {
  success: "#10B981",
  danger: "#DC2626",
  warning: "#D97706",
  amber: "#F59E0B",
  blue: "#2563EB",
  purple: "#8B5CF6",
  slate: "#6B7280",
} as const;
