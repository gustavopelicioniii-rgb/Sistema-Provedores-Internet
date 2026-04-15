/**
 * MASTER AUTOMATION - Orquestrador de Todas as Automações
 * 
 * Executa todas as automações em sequência:
 * 1. Billing Automation - Cobranças
 * 2. Network Automation - Rede e equipamentos
 * 3. Contract Automation - Contratos
 * 4. Usage Automation - Uso de dados
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomationResult {
  name: string;
  success: boolean;
  duration: string;
  result?: unknown;
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const startTime = Date.now();
  const results: AutomationResult[] = [];

  try {
    // 1. Billing Automation
    try {
      const billingStart = Date.now();
      const billingRes = await fetch(`${supabaseUrl}/functions/v1/billing-automation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: "{}",
      });
      const billingData = await billingRes.json();
      results.push({
        name: "billing-automation",
        success: billingRes.ok,
        duration: `${Date.now() - billingStart}ms`,
        result: billingData,
      });
    } catch (e) {
      results.push({
        name: "billing-automation",
        success: false,
        duration: "0ms",
        error: String(e),
      });
    }

    // 2. Network Automation
    try {
      const networkStart = Date.now();
      const networkRes = await fetch(`${supabaseUrl}/functions/v1/network-automation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: "{}",
      });
      const networkData = await networkRes.json();
      results.push({
        name: "network-automation",
        success: networkRes.ok,
        duration: `${Date.now() - networkStart}ms`,
        result: networkData,
      });
    } catch (e) {
      results.push({
        name: "network-automation",
        success: false,
        duration: "0ms",
        error: String(e),
      });
    }

    // 3. Contract Automation
    try {
      const contractStart = Date.now();
      const contractRes = await fetch(`${supabaseUrl}/functions/v1/contract-automation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: "{}",
      });
      const contractData = await contractRes.json();
      results.push({
        name: "contract-automation",
        success: contractRes.ok,
        duration: `${Date.now() - contractStart}ms`,
        result: contractData,
      });
    } catch (e) {
      results.push({
        name: "contract-automation",
        success: false,
        duration: "0ms",
        error: String(e),
      });
    }

    // 4. Usage Automation
    try {
      const usageStart = Date.now();
      const usageRes = await fetch(`${supabaseUrl}/functions/v1/usage-automation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: "{}",
      });
      const usageData = await usageRes.json();
      results.push({
        name: "usage-automation",
        success: usageRes.ok,
        duration: `${Date.now() - usageStart}ms`,
        result: usageData,
      });
    } catch (e) {
      results.push({
        name: "usage-automation",
        success: false,
        duration: "0ms",
        error: String(e),
      });
    }

  } catch (error) {
    console.error("Master automation error:", error);
  }

  const totalDuration = `${Date.now() - startTime}ms`;
  const successCount = results.filter(r => r.success).length;

  return new Response(JSON.stringify({
    success: successCount === results.length,
    total_duration: totalDuration,
    automations_run: results.length,
    successful: successCount,
    failed: results.length - successCount,
    results,
  }, null, 2), {
    status: successCount > 0 ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
