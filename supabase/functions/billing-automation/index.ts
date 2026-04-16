/**
 * BILLING AUTOMATION - Full Security Hardening
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================
// CORS - Allowed Origins
// ============================================
const ALLOWED_ORIGINS = [
  "https://vercel-deploy-inky-delta.vercel.app",
  "https://*.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowedOrigin = ALLOWED_ORIGINS.find(o => 
    o.includes("*") ? true : o === origin
  ) || ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

// ============================================
// RATE LIMITING - Persistent with Supabase
// ============================================
const rateLimits = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimitPersistent(
  supabase: ReturnType<typeof createClient>,
  key: string, 
  maxRequests: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  
  try {
    // Try to use persistent rate limit from database
    const { data, error } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("key", key)
      .single();
    
    if (error || !data) {
      // First request, create entry
      await supabase.from("rate_limits").insert({ key, requests: 1, window_start: new Date().toISOString() });
      return { allowed: true, remaining: maxRequests - 1 };
    }
    
    const windowStart = new Date(data.window_start).getTime();
    if (now - windowStart > windowMs) {
      // Window expired, reset
      await supabase.from("rate_limits").update({ requests: 1, window_start: new Date().toISOString() }).eq("key", key);
      return { allowed: true, remaining: maxRequests - 1 };
    }
    
    if (data.requests >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    await supabase.from("rate_limits").update({ requests: data.requests + 1 }).eq("key", key);
    return { allowed: true, remaining: maxRequests - data.requests - 1 };
  } catch {
    // Fallback to memory rate limit
    const entry = rateLimits.get(key);
    if (!entry || now > entry.resetAt) {
      rateLimits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1 };
    }
    entry.count++;
    return { allowed: entry.count <= maxRequests, remaining: maxRequests - entry.count };
  }
}

// ============================================
// INPUT SANITIZATION
// ============================================
function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, "") // Remove < and >
    .trim();
}

function sanitizeEmail(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
}

// ============================================
// SECURITY LOGGING
// ============================================
async function logSecurityEvent(
  supabase: ReturnType<typeof createClient>,
  event: {
    organization_id?: string;
    user_id?: string;
    action: string;
    ip_address?: string;
    user_agent?: string;
    success: boolean;
    details?: string;
  }
) {
  try {
    await supabase.from("security_logs").insert({
      ...event,
      ip_address: event.ip_address || "unknown",
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Failed to log security event:", e);
  }
}

// ============================================
// WEBHOOK SIGNATURE VALIDATION
// ============================================
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return false;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
  
  return signature === expectedSignature;
}

// ============================================
// JWT VERIFICATION
// ============================================
async function verifyAuth(
  supabase: ReturnType<typeof createClient>,
  req: Request
): Promise<{ valid: boolean; userId?: string; orgId?: string; error?: string }> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid authorization header" };
  }
  
  const token = authHeader.replace("Bearer ", "");
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return { valid: false, error: "Invalid token" };
    }
    
    // Get user's organization
    const { data: orgData } = await supabase
      .rpc("get_user_organization_id", { user_id: user.id });
    
    return { 
      valid: true, 
      userId: user.id, 
      orgId: orgData || undefined,
      error: undefined 
    };
  } catch (e) {
    return { valid: false, error: String(e) };
  }
}

// ============================================
// MAIN HANDLER
// ============================================
Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  // Rate limiting
  const { allowed, remaining } = await checkRateLimitPersistent(supabase, `billing:${clientIp}`, 60);
  if (!allowed) {
    await logSecurityEvent(supabase, {
      action: "billing_automation_rate_limited",
      ip_address: clientIp,
      user_agent: userAgent,
      success: false,
      details: "Rate limit exceeded"
    });
    
    return new Response(JSON.stringify({ 
      error: "Rate limit exceeded",
      retryAfter: 60 
    }), {
      status: 429,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Retry-After": "60",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  }

  // Verify authentication
  const auth = await verifyAuth(supabase, req);
  if (!auth.valid) {
    await logSecurityEvent(supabase, {
      action: "billing_automation_unauthorized",
      ip_address: clientIp,
      user_agent: userAgent,
      success: false,
      details: auth.error
    });
    
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = {
    success: false,
    invoices_generated: 0,
    notifications_sent: 0,
    customers_suspended: 0,
    customers_reactivated: 0,
    errors: [] as string[],
    execution_time: "",
  };

  const startTime = Date.now();

  try {
    // Get request body for webhook validation
    let body: Record<string, unknown> = {};
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch { /* empty body is OK */ }

    // Validate webhook signature if this is a webhook call
    const webhookSignature = req.headers.get("x-webhook-signature");
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    
    if (webhookSignature && webhookSecret) {
      const isValid = await verifyWebhookSignature(
        JSON.stringify(body), 
        webhookSignature, 
        webhookSecret
      );
      
      if (!isValid) {
        await logSecurityEvent(supabase, {
          user_id: auth.userId,
          organization_id: auth.orgId,
          action: "billing_automation_invalid_webhook_signature",
          ip_address: clientIp,
          user_agent: userAgent,
          success: false,
          details: "Invalid webhook signature"
        });
        
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Sanitize inputs
    const sanitizedOrgId = sanitizeInput(auth.orgId || "");
    
    if (!sanitizedOrgId) {
      result.errors.push("Nenhuma organização ativa encontrada");
    } else {
      // Get billing configuration
      const { data: config } = await supabase
        .from("billing_configurations")
        .select("*")
        .eq("organization_id", sanitizedOrgId)
        .eq("enabled", true)
        .single();

      // TODO: Implement full billing logic with config
      result.errors.push("Billing logic needs implementation with real tables");
    }

    result.success = result.errors.length === 0;

    await logSecurityEvent(supabase, {
      user_id: auth.userId,
      organization_id: auth.orgId,
      action: "billing_automation_executed",
      ip_address: clientIp,
      user_agent: userAgent,
      success: result.success,
      details: result.success ? "Success" : result.errors.join("; ")
    });

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
    
    await logSecurityEvent(supabase, {
      user_id: auth.userId,
      organization_id: auth.orgId,
      action: "billing_automation_error",
      ip_address: clientIp,
      user_agent: userAgent,
      success: false,
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }

  result.execution_time = `${Date.now() - startTime}ms`;

  return new Response(JSON.stringify(result, null, 2), {
    status: result.success ? 200 : 500,
    headers: { 
      ...corsHeaders, 
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
});
