/**
 * CONTRACT AUTOMATION - Gestão de Contratos
 * 
 * Funcionalidades:
 * - Aviso de vencimento de contrato (30, 15, 7 dias)
 * - Renovação automática
 * - Notificações de fidelidade
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T12:00:00");
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!checkRateLimit("contract-automation", 10)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const result = {
    success: true,
    contracts_checked: 0,
    expiring_30_days: 0,
    expiring_15_days: 0,
    expiring_7_days: 0,
    notifications_sent: 0,
    errors: [] as string[],
    execution_time: "",
  };

  const startTime = Date.now();

  try {
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id, name")
      .limit(10);

    if (!organizations?.length) {
      result.errors.push("Nenhuma organização encontrada");
    } else {
      for (const org of organizations) {
        const orgId = org.id;
        const today = new Date();
        const in30Days = new Date(today);
        in30Days.setDate(in30Days.getDate() + 30);
        const in15Days = new Date(today);
        in15Days.setDate(in15Days.getDate() + 15);
        const in7Days = new Date(today);
        in7Days.setDate(in7Days.getDate() + 7);

        // Buscar contratos ativos com vencimento próximo
        const { data: contracts } = await supabase
          .from("contracts")
          .select(`
            id,
            customer_id,
            end_date,
            status,
            customers(name, email, whatsapp)
          `)
          .eq("organization_id", orgId)
          .eq("status", "active")
          .gte("end_date", today.toISOString().slice(0, 10));

        if (contracts?.length) {
          for (const contract of contracts) {
            result.contracts_checked++;
            const customer = contract.customers as any;
            if (!customer) continue;

            const daysUntil = getDaysUntil(contract.end_date);
            const todayStr = today.toISOString().slice(0, 10);

            // Verificar se já notificou hoje
            const { data: existing } = await supabase
              .from("notification_alerts")
              .select("id")
              .eq("reference_id", contract.id)
              .eq("reference_type", "contract_expiring")
              .gte("created_at", todayStr + "T00:00:00Z")
              .limit(1);

            if (existing?.length) continue;

            // Notificar conforme dias restantes
            if (daysUntil <= 7 && daysUntil > 0) {
              result.expiring_7_days++;
              
              await supabase.from("notification_alerts").insert({
                organization_id: orgId,
                type: "warning",
                title: "⚠️ Contrato vencendo em 7 dias!",
                description: `Contrato do cliente ${customer.name} vence em ${daysUntil} dias (${contract.end_date})`,
                channel: "in_app",
                reference_id: contract.id,
                reference_type: "contract_expiring",
              });
              result.notifications_sent++;

              if (customer.whatsapp) {
                await supabase.functions.invoke("whatsapp-api", {
                  body: {
                    action: "send_message",
                    params: {
                      phone: customer.whatsapp.replace(/\D/g, ""),
                      message: `Olá ${customer.name}! Seu contrato vence em ${daysUntil} dias. Entre em contato para renovar e manter seu serviço!`,
                    },
                  },
                });
              }

            } else if (daysUntil <= 15 && daysUntil > 7) {
              result.expiring_15_days++;

              await supabase.from("notification_alerts").insert({
                organization_id: orgId,
                type: "info",
                title: "📄 Contrato vencendo em 15 dias",
                description: `Contrato do cliente ${customer.name} vence em ${daysUntil} dias`,
                channel: "in_app",
                reference_id: contract.id,
                reference_type: "contract_expiring",
              });
              result.notifications_sent++;

            } else if (daysUntil <= 30 && daysUntil > 15) {
              result.expiring_30_days++;

              await supabase.from("notification_alerts").insert({
                organization_id: orgId,
                type: "info",
                title: "📅 Lembrete de renovação",
                description: `Contrato do cliente ${customer.name} vence em ${daysUntil} dias`,
                channel: "in_app",
                reference_id: contract.id,
                reference_type: "contract_expiring",
              });
              result.notifications_sent++;
            }

            // Contrato venceu
            if (daysUntil <= 0 && daysUntil >= -7) {
              // Suspender cliente se contrato venceu
              await supabase
                .from("customers")
                .update({ status: "suspended" })
                .eq("id", contract.customer_id);

              await supabase
                .from("contracts")
                .update({ status: "cancelled" })
                .eq("id", contract.id);

              await supabase.from("notification_alerts").insert({
                organization_id: orgId,
                type: "warning",
                title: "Contrato Vencido",
                description: `Contrato de ${customer.name} venceu e foi cancelado. Cliente suspenso.`,
                channel: "in_app",
                reference_id: contract.id,
                reference_type: "contract_expired",
              });
            }
          }
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
