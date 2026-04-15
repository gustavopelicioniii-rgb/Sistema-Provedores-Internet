/**
 * BILLING AUTOMATION - Sistema de Cobrança Automática
 * 
 * Executa todo o fluxo de cobrança automaticamente:
 * - Geração de faturas mensais
 * - Notificações de vencimento (7, 3, 1 dia antes)
 * - Suspensão de inadimplentes
 * - Reativação após pagamento
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================================
// TYPES
// ============================================================================

interface Customer {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  status: string;
}

interface Contract {
  id: string;
  customer_id: string;
  billing_day: number | null;
  plans: {
    name: string;
    price: number;
  } | null;
}

interface BillingResult {
  success: boolean;
  invoices_generated: number;
  notifications_sent: number;
  customers_suspended: number;
  customers_reactivated: number;
  errors: string[];
  execution_time: string;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 10): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }
  entry.count++;
  return entry.count <= maxRequests;
}

// ============================================================================
// HELPERS
// ============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR");
}

function getDaysDiff(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T12:00:00");
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================================================
// WHATSAPP NOTIFICATION
// ============================================================================

async function sendWhatsAppMessage(
  supabase: ReturnType<typeof createClient>,
  phone: string,
  message: string,
  organizationId: string
): Promise<boolean> {
  try {
    const cleanPhone = phone.replace(/\D/g, "");
    
    const { error } = await supabase.functions.invoke("whatsapp-api", {
      body: {
        action: "send_message",
        params: {
          phone: cleanPhone,
          message: message,
        },
      },
    });

    if (error) {
      console.error("WhatsApp error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("WhatsApp exception:", err);
    return false;
  }
}

// ============================================================================
// INVOICE GENERATION
// ============================================================================

async function generateInvoices(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<number> {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  // Próximo mês para vencimento
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  // Busca contratos ativos com planos
  const { data: contracts, error: contractsError } = await supabase
    .from("contracts")
    .select(`
      id,
      customer_id,
      billing_day,
      plans(name, price)
    `)
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (contractsError || !contracts?.length) {
    console.log("Nenhum contrato ativo encontrado");
    return 0;
  }

  // Busca faturas já geradas para o próximo mês
  const nextMonthStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
  const { data: existingInvoices } = await supabase
    .from("invoices")
    .select("contract_id")
    .eq("organization_id", organizationId)
    .like("due_date", `${nextMonthStr}%`);

  const existingContractIds = new Set(existingInvoices?.map(inv => inv.contract_id) || []);

  // Filtra contratos sem fatura no próximo mês
  const contractsWithoutInvoice = (contracts as unknown as Contract[])
    .filter(c => c.plans && !existingContractIds.has(c.id));

  let generated = 0;

  for (const contract of contractsWithoutInvoice) {
    const plan = contract.plans!;
    const amount = plan.price;
    const planName = plan.name;

    // Usa o billing_day do contrato ou dia 5 como padrão
    const billingDay = contract.billing_day || 5;
    const dueDate = new Date(nextYear, nextMonth - 1, billingDay);
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    // Busca nome do cliente
    const { data: customer } = await supabase
      .from("customers")
      .select("name")
      .eq("id", contract.customer_id)
      .single();

    const customerName = customer?.name || "Cliente";

    const { error: insertError } = await supabase.from("invoices").insert({
      organization_id: organizationId,
      contract_id: contract.id,
      customer_id: contract.customer_id,
      amount: amount,
      due_date: dueDateStr,
      status: "pending",
      description: `Mensalidade ${planName} - ${dueDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
    });

    if (!insertError) {
      generated++;

      // Notifica criação
      await supabase.from("notification_alerts").insert({
        organization_id: organizationId,
        type: "info",
        title: "Nova fatura gerada",
        description: `Fatura de ${formatCurrency(amount)} para ${customerName} - vencimento ${formatDate(dueDateStr)}`,
        channel: "in_app",
        reference_type: "invoice_generated",
      });
    }
  }

  return generated;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

async function sendDueDateNotifications(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
  notifyDays: number[]
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  let notificationsSent = 0;

  for (const days of notifyDays) {
    const notifyDate = new Date(today);
    notifyDate.setDate(notifyDate.getDate() + days);
    const notifyDateStr = notifyDate.toISOString().slice(0, 10);

    const { data: invoices, error } = await supabase
      .from("invoices")
      .select(`
        id,
        customer_id,
        amount,
        due_date,
        customers(name, whatsapp, email)
      `)
      .eq("organization_id", organizationId)
      .eq("status", "pending")
      .eq("due_date", notifyDateStr);

    if (error || !invoices?.length) continue;

    for (const invoice of invoices as any[]) {
      const customer = invoice.customers as Customer;
      if (!customer) continue;

      const isUrgent = days <= 1;
      const message = isUrgent
        ? `⚠️ URGENTE: Sua fatura de ${formatCurrency(invoice.amount)} vence ${days === 0 ? "HOJE" : "amanhã"}! Efetue o pagamento agora para não ser suspenso!`
        : `Olá ${customer.name}! Sua fatura de ${formatCurrency(invoice.amount)} vence em ${days} dia(s) (${formatDate(invoice.due_date)}). Pague em dia para evitar suspensão.`;

      // Verifica se já notificou hoje
      const { data: existing } = await supabase
        .from("notification_alerts")
        .select("id")
        .eq("reference_id", invoice.id)
        .eq("reference_type", "due_notification")
        .gte("created_at", todayStr + "T00:00:00Z")
        .limit(1);

      if (existing?.length) continue;

      // Notificação in-app
      await supabase.from("notification_alerts").insert({
        organization_id: organizationId,
        type: isUrgent ? "warning" : "info",
        title: isUrgent ? "⚠️ Vencimento Urgente!" : "📅 Lembrete de Vencimento",
        description: `Fatura de ${formatCurrency(invoice.amount)} para ${customer.name}`,
        channel: "in_app",
        reference_id: invoice.id,
        reference_type: "due_notification",
      });
      notificationsSent++;

      // WhatsApp
      if (customer.whatsapp) {
        const sent = await sendWhatsAppMessage(supabase, customer.whatsapp, message, organizationId);
        if (sent) notificationsSent++;
      }
    }
  }

  return notificationsSent;
}

// ============================================================================
// SUSPENSION
// ============================================================================

async function suspendOverdueCustomers(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
  suspendAfterDays: number
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const oldestAllowedDate = new Date(today);
  oldestAllowedDate.setDate(oldestAllowedDate.getDate() - suspendAfterDays);
  const oldestAllowedStr = oldestAllowedDate.toISOString().slice(0, 10);

  const { data: overdueInvoices, error } = await supabase
    .from("invoices")
    .select(`
      id,
      customer_id,
      amount,
      due_date,
      customers(id, name, status)
    `)
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .lte("due_date", oldestAllowedStr);

  if (error || !overdueInvoices?.length) return 0;

  let suspended = 0;

  for (const invoice of overdueInvoices as any[]) {
    const customer = invoice.customers as Customer;
    if (!customer || customer.status !== "active") continue;

    // Suspende cliente
    await supabase
      .from("customers")
      .update({ status: "suspended", updated_at: todayStr })
      .eq("id", customer.id);

    // Marca fatura como vencida
    await supabase
      .from("invoices")
      .update({ status: "overdue" })
      .eq("id", invoice.id);

    // Notifica
    await supabase.from("notification_alerts").insert({
      organization_id: organizationId,
      type: "warning",
      title: "Cliente Suspenso",
      description: `${customer.name} foi suspenso por inadimplência`,
      channel: "in_app",
      reference_id: invoice.id,
      reference_type: "customer_suspended",
    });

    // Dispara evento para MikroTik
    try {
      await supabase.functions.invoke("automation-event-dispatch", {
        body: {
          event: "customer.suspended",
          organization_id: organizationId,
          payload: {
            customer_id: customer.id,
            customer_name: customer.name,
            invoice_id: invoice.id,
          },
        },
      });
    } catch (e) {
      console.error("Error dispatching event:", e);
    }

    suspended++;
  }

  return suspended;
}

// ============================================================================
// REACTIVATION
// ============================================================================

async function reactivatePaidCustomers(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<number> {
  const { data: paidInvoices, error } = await supabase
    .from("invoices")
    .select(`
      id,
      customer_id,
      customers(id, name, status)
    `)
    .eq("organization_id", organizationId)
    .eq("status", "paid")
    .eq("customers.status", "suspended");

  if (error || !paidInvoices?.length) return 0;

  let reactivated = 0;

  for (const invoice of paidInvoices as any[]) {
    const customer = invoice.customers as Customer;
    if (!customer) continue;

    await supabase
      .from("customers")
      .update({ status: "active" })
      .eq("id", customer.id);

    await supabase.from("notification_alerts").insert({
      organization_id: organizationId,
      type: "success",
      title: "✅ Cliente Reativado",
      description: `${customer.name} foi reativado após pagamento`,
      channel: "in_app",
      reference_id: invoice.id,
      reference_type: "customer_reactivated",
    });

    try {
      await supabase.functions.invoke("automation-event-dispatch", {
        body: {
          event: "customer.reactivated",
          organization_id: organizationId,
          payload: {
            customer_id: customer.id,
            customer_name: customer.name,
            invoice_id: invoice.id,
          },
        },
      });
    } catch (e) {
      console.error("Error dispatching event:", e);
    }

    reactivated++;
  }

  return reactivated;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate limiting
  if (!checkRateLimit("billing-automation", 10)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Max 10 executions per minute." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const startTime = Date.now();
  const result: BillingResult = {
    success: true,
    invoices_generated: 0,
    notifications_sent: 0,
    customers_suspended: 0,
    customers_reactivated: 0,
    errors: [],
    execution_time: "",
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Busca organizações ativas
    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("status", "active");

    if (orgError || !organizations?.length) {
      result.errors.push("Nenhuma organização ativa encontrada");
    } else {
      for (const org of organizations) {
        console.log(`Processando organização: ${org.name} (${org.id})`);

        // 1. Gera faturas do próximo mês
        try {
          const generated = await generateInvoices(supabase, org.id);
          result.invoices_generated += generated;
        } catch (e) {
          result.errors.push(`Erro gerar faturas ${org.name}: ${e}`);
        }

        // 2. Envia notificações de vencimento (7, 3, 1 dia antes)
        try {
          const notified = await sendDueDateNotifications(supabase, org.id, [7, 3, 1]);
          result.notifications_sent += notified;
        } catch (e) {
          result.errors.push(`Erro notificações ${org.name}: ${e}`);
        }

        // 3. Suspende inadimplentes (7+ dias)
        try {
          const suspended = await suspendOverdueCustomers(supabase, org.id, 7);
          result.customers_suspended += suspended;
        } catch (e) {
          result.errors.push(`Erro suspensão ${org.name}: ${e}`);
        }

        // 4. Reativa clientes com pagamento confirmado
        try {
          const reactivated = await reactivatePaidCustomers(supabase, org.id);
          result.customers_reactivated += reactivated;
        } catch (e) {
          result.errors.push(`Erro reativação ${org.name}: ${e}`);
        }
      }
    }

    result.success = result.errors.length === 0;
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
  }

  result.execution_time = `${Date.now() - startTime}ms`;

  return new Response(JSON.stringify(result, null, 2), {
    status: result.success ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
