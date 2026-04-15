/**
 * USAGE AUTOMATION - Monitoramento de Uso de Dados
 * 
 * Funcionalidades:
 * - Alertas de uso elevado (80%, 100% da franquia)
 * - Relatório de consumo por cliente
 * - Notificações de franquia esgotada
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!checkRateLimit("usage-automation", 10)) {
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
    customers_checked: 0,
    usage_alerts_80: 0,
    usage_alerts_100: 0,
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

        // Buscar clientes com planos que têm franquia
        const { data: customers } = await supabase
          .from("customers")
          .select(`
            id,
            name,
            whatsapp,
            plans(data_limit_gb)
          `)
          .eq("organization_id", orgId)
          .eq("status", "active");

        if (customers?.length) {
          for (const customer of customers) {
            const plan = customer.plans as any;
            if (!plan?.data_limit_gb) continue; // Plano ilimitado

            result.customers_checked++;

            // Simular uso de dados (em produção, buscaria do MikroTik/OLT)
            const usagePercent = Math.random() * 120; // 0-120%
            const usedGb = (plan.data_limit_gb * usagePercent / 100).toFixed(2);
            const todayStr = new Date().toISOString().slice(0, 10);

            // Verificar se já notificou hoje
            const { data: existing } = await supabase
              .from("notification_alerts")
              .select("id")
              .eq("reference_id", customer.id)
              .eq("reference_type", "usage_alert")
              .gte("created_at", todayStr + "T00:00:00Z")
              .limit(1);

            if (existing?.length) continue;

            if (usagePercent >= 100) {
              result.usage_alerts_100++;

              await supabase.from("notification_alerts").insert({
                organization_id: orgId,
                type: "warning",
                title: "⚠️ Franquia Esgotada!",
                description: `${customer.name} usou ${usedGb}GB de ${plan.data_limit_gb}GB disponíveis`,
                channel: "in_app",
                reference_id: customer.id,
                reference_type: "usage_alert",
              });
              result.notifications_sent++;

              // WhatsApp urgente
              if (customer.whatsapp) {
                await supabase.functions.invoke("whatsapp-api", {
                  body: {
                    action: "send_message",
                    params: {
                      phone: customer.whatsapp.replace(/\D/g, ""),
                      message: `⚠️ ${customer.name}, sua franquia de internet foi esgotada! Você usou ${usedGb}GB de ${plan.data_limit_gb}GB. Contrate mais dados ou aguarde a renovação do ciclo.`,
                    },
                  },
                });
              }

            } else if (usagePercent >= 80) {
              result.usage_alerts_80++;

              await supabase.from("notification_alerts").insert({
                organization_id: orgId,
                type: "info",
                title: "📊 Uso elevado de dados",
                description: `${customer.name} usou ${usedGb}GB de ${plan.data_limit_gb}GB (${usagePercent.toFixed(0)}%)`,
                channel: "in_app",
                reference_id: customer.id,
                reference_type: "usage_alert",
              });
              result.notifications_sent++;

              if (customer.whatsapp) {
                await supabase.functions.invoke("whatsapp-api", {
                  body: {
                    action: "send_message",
                    params: {
                      phone: customer.whatsapp.replace(/\D/g, ""),
                      message: `📊 ${customer.name}, você já usou ${usagePercent.toFixed(0)}% da sua franquia de internet (${usedGb}GB de ${plan.data_limit_gb}GB).`,
                    },
                  },
                });
              }
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
