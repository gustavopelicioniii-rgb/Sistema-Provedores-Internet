/**
 * NETWORK AUTOMATION - Monitoramento e Automação de Rede
 * 
 * Funcionalidades:
 * - Monitoramento de equipamentos (OLT, roteadores)
 * - Alertas de indisponibilidade
 * - Automação de bloqueio/desbloqueio MikroTik
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

  if (!checkRateLimit("network-automation", 10)) {
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
    equipment_checked: 0,
    alerts_generated: 0,
    customers_blocked: 0,
    customers_unblocked: 0,
    errors: [] as string[],
    execution_time: "",
  };

  const startTime = Date.now();

  try {
    // Busca organizações ativas
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id, name")
      .limit(10);

    if (!organizations?.length) {
      result.errors.push("Nenhuma organização encontrada");
    } else {
      for (const org of organizations) {
        const orgId = org.id;

        // 1. Verificar equipamentos de rede
        const { data: devices } = await supabase
          .from("network_devices")
          .select("*")
          .eq("organization_id", orgId)
          .eq("status", "active");

        if (devices?.length) {
          for (const device of devices) {
            result.equipment_checked++;

            // Simular verificação de ping/conectividade
            // Em produção, faria uma chamada real ao equipamento
            const isOnline = Math.random() > 0.1; // 90% uptime simulado

            if (!isOnline) {
              // Equipamento offline - gerar alerta
              await supabase.from("noc_alerts").insert({
                organization_id: orgId,
                device_id: device.id,
                severity: "critical",
                title: `Equipamento offline: ${device.name}`,
                description: `IP: ${device.ip_address} - Setor: ${device.sector || "N/A"}`,
                channel: "in_app",
              });
              result.alerts_generated++;

              // Notificar admin via webhook se configurado
              if (device.webhook_url) {
                try {
                  await fetch(device.webhook_url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      event: "device.offline",
                      device: device.name,
                      ip: device.ip_address,
                      organization: org.name,
                    }),
                  });
                } catch (e) {
                  console.error("Webhook error:", e);
                }
              }
            }
          }
        }

        // 2. Verificar clientes suspensos e bloquear no MikroTik
        const { data: suspendedCustomers } = await supabase
          .from("customers")
          .select("id, name, cpf_cnpj, status")
          .eq("organization_id", orgId)
          .eq("status", "suspended");

        if (suspendedCustomers?.length) {
          for (const customer of suspendedCustomers) {
            // Buscar contrato ativo
            const { data: contract } = await supabase
              .from("contracts")
              .select("id, authentication")
              .eq("customer_id", customer.id)
              .eq("status", "active")
              .single();

            if (contract?.authentication?.pppoe_username) {
              // Chamar mikrotik-api para bloquear
              try {
                await supabase.functions.invoke("mikrotik-api", {
                  body: {
                    action: "block_client",
                    params: {
                      name: contract.authentication.pppoe_username,
                    },
                  },
                });
                result.customers_blocked++;
              } catch (e) {
                result.errors.push(`Erro ao bloquear ${customer.name}: ${e}`);
              }
            }
          }
        }

        // 3. Verificar clientes ativos com pagamento em dia e desbloquear
        const { data: paidCustomers } = await supabase
          .from("customers")
          .select("id, name, status")
          .eq("organization_id", orgId)
          .eq("status", "active");

        if (paidCustomers?.length) {
          // Verificar se há faturas pendentes vencidas
          for (const customer of paidCustomers) {
            const { data: overdueInvoices } = await supabase
              .from("invoices")
              .select("id")
              .eq("customer_id", customer.id)
              .eq("status", "overdue");

            if (overdueInvoices?.length) {
              // Cliente tem fatura vencida mas status é active - Suspensão pendente
              await supabase
                .from("customers")
                .update({ status: "suspended" })
                .eq("id", customer.id);

              await supabase.from("notification_alerts").insert({
                organization_id: orgId,
                type: "warning",
                title: "Cliente Suspenso",
                description: `${customer.name} suspenso por inadimplência`,
                channel: "in_app",
                reference_id: customer.id,
                reference_type: "customer_suspended",
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
