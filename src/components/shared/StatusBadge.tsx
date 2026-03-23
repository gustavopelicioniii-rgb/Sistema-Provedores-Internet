import { cn } from "@/lib/utils";

type StatusType = "ativo" | "suspenso" | "cancelado" | "inativo" | "pago" | "pendente" | "atrasado" | "aberto" | "em andamento" | "aguardando cliente" | "resolvido" | "emitida" | "cancelada" | "online" | "offline" | "warning" | "baixa" | "média" | "alta" | "crítica";

const statusConfig: Record<string, { label: string; bg: string; text: string; bold?: boolean }> = {
  ativo:     { label: "Ativo",     bg: "#ECFDF5", text: "#059669" },
  pago:      { label: "Pago",      bg: "#ECFDF5", text: "#059669" },
  online:    { label: "Online",    bg: "#ECFDF5", text: "#059669" },
  emitida:   { label: "Emitida",   bg: "#ECFDF5", text: "#059669" },
  resolvido: { label: "Resolvido", bg: "#ECFDF5", text: "#059669" },

  pendente:        { label: "Pendente",        bg: "#FEF3C7", text: "#D97706" },
  "em andamento":  { label: "Em andamento",    bg: "#FEF3C7", text: "#D97706" },
  "aguardando cliente": { label: "Aguardando", bg: "#FEF3C7", text: "#D97706" },
  warning:         { label: "Alerta",          bg: "#FEF3C7", text: "#D97706" },
  suspenso:        { label: "Suspenso",        bg: "#FEE2E2", text: "#DC2626" },
  média:           { label: "Média",           bg: "#FEF3C7", text: "#D97706" },

  atrasado:  { label: "Atrasado", bg: "#FEE2E2", text: "#DC2626" },
  offline:   { label: "Offline",  bg: "#FEE2E2", text: "#DC2626" },
  alta:      { label: "Alta",     bg: "#FEE2E2", text: "#DC2626" },
  aberto:    { label: "Aberto",   bg: "#DBEAFE", text: "#2563EB" },

  cancelado: { label: "Cancelado", bg: "#F1F5F9", text: "#64748B" },
  cancelada: { label: "Cancelada", bg: "#F1F5F9", text: "#64748B" },
  inativo:   { label: "Inativo",   bg: "#F1F5F9", text: "#64748B" },
  baixa:     { label: "Baixa",     bg: "#F1F5F9", text: "#64748B" },

  crítica:   { label: "Crítica", bg: "#DC2626", text: "#FFFFFF", bold: true },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, bg: "#F1F5F9", text: "#64748B" };
  return (
    <span
      className={cn("inline-flex items-center px-2.5 py-0.5 text-xs font-medium", config.bold && "font-bold")}
      style={{
        background: config.bg,
        color: config.text,
        borderRadius: 9999,
      }}
    >
      {config.label}
    </span>
  );
}
