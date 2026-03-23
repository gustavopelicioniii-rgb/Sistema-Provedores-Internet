export type InvoiceStatus = "pago" | "pendente" | "atrasado" | "cancelado";

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  daysOverdue?: number;
}

export interface InvoicePayment {
  invoiceId: string;
  amount: number;
  method: "pix" | "boleto" | "cartao" | "transferencia";
  paidAt: string;
  reference?: string;
}
