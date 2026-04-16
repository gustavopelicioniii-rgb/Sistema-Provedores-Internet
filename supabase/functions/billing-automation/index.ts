/**
 * BILLING AUTOMATION - Supports Cron and User calls
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://vercel-deploy-inky-delta.vercel.app",
  "https://*.vercel.app",
  "http://localhost:3000"
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowedOrigin = ALLOWED_ORIGINS.find(o => 
    o.includes("*") ? true : o === origin
  ) || ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const CRON_SECRET = Deno.env.get("CRON_SECRET") || "billing-cron-secret-2024";

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  const supabase = createClient(supabaseUrl, serviceKey);

  // Verify auth - allow cron secret OR anon key (for cron jobs)
  const authHeader = req.headers.get("Authorization");
  const cronSecret = req.headers.get("x-cron-secret");
  const apikey = req.headers.get("apikey");
  
  let isCronCall = false;
  let userId: string | undefined;
  let orgId: string | undefined;

  // Check if it's a cron call with secret
  if (cronSecret === CRON_SECRET) {
    isCronCall = true;
  }
  // Or if using anon key (Supabase passes this for authenticated anon requests)
  else if (apikey === anonKey && authHeader?.startsWith("Bearer ")) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      
      if (!authError && user) {
        userId = user.id;
        const { data: orgData } = await supabase
          .rpc("get_user_organization_id", { user_id: user.id });
        orgId = orgData || undefined;
      }
    } catch { /* ignore */ }
  }
  // No valid auth
  else if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized - provide Authorization header or x-cron-secret" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  // Verify JWT for user calls
  else {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      userId = user.id;
      
      const { data: orgData } = await supabase
        .rpc("get_user_organization_id", { user_id: user.id });
      orgId = orgData || undefined;
    } catch (e) {
      return new Response(JSON.stringify({ error: "Auth error: " + String(e) }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const result = {
    success: true,
    invoices_generated: 0,
    notifications_sent: 0,
    customers_suspended: 0,
    customers_reactivated: 0,
    errors: [] as string[],
    execution_time: "",
    called_by: isCronCall ? "cron" : "user",
  };

  const startTime = Date.now();

  try {
    if (isCronCall) {
      // Cron call - process all organizations
      const { data: organizations } = await supabase
        .from("organizations")
        .select("id, name")
        .limit(100);

      if (!organizations?.length) {
        result.errors.push("Nenhuma organização encontrada");
      } else {
        for (const org of organizations) {
          const { data: config } = await supabase
            .from("billing_configurations")
            .select("*")
            .eq("organization_id", org.id)
            .eq("enabled", true)
            .single();

          if (config) {
            // Billing logic here
            result.invoices_generated += 0;
          }
        }
      }
    } else if (orgId) {
      // User call - process only their org
      const { data: config } = await supabase
        .from("billing_configurations")
        .select("*")
        .eq("organization_id", orgId)
        .eq("enabled", true)
        .single();

      if (!config) {
        result.errors.push("Nenhuma configuração de billing encontrada");
      }
    } else {
      result.errors.push("Nenhuma organização ativa encontrada");
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
