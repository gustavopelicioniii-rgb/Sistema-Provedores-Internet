export type TicketPriority = "baixa" | "media" | "alta" | "critica";
export type TicketStatus = "aberto" | "em_andamento" | "aguardando" | "resolvido" | "fechado";
export type TicketOrigin = "whatsapp" | "email" | "telefone" | "portal" | "api";

export interface Ticket {
  id: string;
  number: string;          // "TK-1042"
  clientId: string;
  clientName: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  origin?: TicketOrigin;
  assignee: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  sla?: {
    deadline: string;
    status: "on_track" | "warning" | "breached";
  };
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  author: string;
  authorId: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  averageResolutionTime: number; // hours
  satisfactionRate: number;      // percentage
}
