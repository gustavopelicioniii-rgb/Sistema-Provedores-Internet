/**
 * SETUP TABLES - Creates missing tables
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const results: string[] = [];

  try {
    // Create automations table
    const { error: autoError } = await supabase.rpc("pg_execute", {
      sql: `
        CREATE TABLE IF NOT EXISTS automations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          trigger_type TEXT NOT NULL,
          trigger_config JSONB NOT NULL DEFAULT '{}',
          action_type TEXT NOT NULL,
          action_config JSONB NOT NULL DEFAULT '{}',
          enabled BOOLEAN NOT NULL DEFAULT true,
          webhook_url TEXT,
          webhook_secret TEXT,
          last_triggered_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_automations_org ON automations(organization_id);
        CREATE INDEX IF NOT EXISTS idx_automations_enabled ON automations(enabled);
      `
    });
    
    if (autoError) {
      results.push(`automations: ${autoError.message}`);
    } else {
      results.push("automations: created");
    }

    // Create automation_logs table
    const { error: logsError } = await supabase.rpc("pg_execute", {
      sql: `
        CREATE TABLE IF NOT EXISTS automation_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          status TEXT NOT NULL,
          trigger_payload JSONB,
          response_payload JSONB,
          error_message TEXT,
          executed_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_automation_logs_org ON automation_logs(organization_id);
        CREATE INDEX IF NOT EXISTS idx_automation_logs_executed ON automation_logs(executed_at DESC);
      `
    });
    
    if (logsError) {
      results.push(`automation_logs: ${logsError.message}`);
    } else {
      results.push("automation_logs: created");
    }

    // Create noc_alerts table
    const { error: alertsError } = await supabase.rpc("pg_execute", {
      sql: `
        CREATE TABLE IF NOT EXISTS noc_alerts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          severity TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          reference_id UUID,
          reference_type TEXT,
          channel TEXT NOT NULL DEFAULT 'in_app',
          acknowledged BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_noc_alerts_org ON noc_alerts(organization_id);
        CREATE INDEX IF NOT EXISTS idx_noc_alerts_created ON noc_alerts(created_at DESC);
      `
    });
    
    if (alertsError) {
      results.push(`noc_alerts: ${alertsError.message}`);
    } else {
      results.push("noc_alerts: created");
    }

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
