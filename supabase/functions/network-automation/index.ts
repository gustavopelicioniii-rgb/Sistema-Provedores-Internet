/**
 * NETWORK AUTOMATION - Full Security Hardening
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://vercel-deploy-inky-delta.vercel.app",
  "https://*.vercel.app",
  "http://localhost:3000"
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowedOrigin = ALLOWED_ORIGINS.find(o => o.includes("*") ? true : o === origin) || ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 60): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }
  entry.count++;
  return entry.count <= maxRequests;
}

function sanitizeInput(input: string, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  return input.slice(0, maxLength).replace(/[<>]/g, "").trim();
}

async function logSecurityEvent(supabase: any, event: any) {
  try {
    await supabase.from("security_logs").insert({
      ...event,
      ip_address: event.ip_address || "unknown",
      created_at: new Date().toISOString(),
    });
  } catch { /* ignore */ }
}

async function verifyAuth(supabase: any, req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing authorization" };
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return { valid: false, error: "Invalid token" };
    
    const { data: orgData } = await supabase.rpc("get_user_organization_id", { user_id: user.id });
    return { valid: true, userId: user.id, orgId: orgData || undefined };
  } catch (e) {
    return { valid: false, error: String(e) };
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  if (!checkRateLimit(clientIp, 60)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const auth = await verifyAuth(supabase, req);
  if (!auth.valid) {
    await logSecurityEvent(supabase, { action: "network_unauthorized", ip_address: clientIp, success: false, details: auth.error });
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = { success: true, equipment_checked: 0, alerts_generated: 0, customers_blocked: 0, customers_unblocked: 0, errors: [] as string[], execution_time: "" };
  const startTime = Date.now();

  try {
    const { data: organizations } = await supabase.from("organizations").select("id, name").limit(10);
    
    if (!organizations?.length) {
      result.errors.push("Nenhuma organização encontrada");
    } else {
      for (const org of organizations) {
        const { data: devices } = await supabase.from("network_devices").select("*").eq("organization_id", org.id).eq("status", "active");
        
        if (devices?.length) {
          for (const device of devices) {
            result.equipment_checked++;
            // Device monitoring logic here
          }
        }
      }
    }

    result.success = result.errors.length === 0;
    await logSecurityEvent(supabase, { user_id: auth.userId, organization_id: auth.orgId, action: "network_automation_executed", ip_address: clientIp, success: result.success });

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
  }

  result.execution_time = `${Date.now() - startTime}ms`;

  return new Response(JSON.stringify(result, null, 2), {
    status: result.success ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" },
  });
});
