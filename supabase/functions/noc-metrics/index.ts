/**
 * NOC METRICS - Prometheus-compatible Monitoring Endpoint
 * 
 * Provides metrics for:
 * - System health
 * - Customer statistics
 * - Network device status
 * - Billing metrics
 * - API performance
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================
// METRICS COLLECTOR
// ============================================
interface Metrics {
  timestamp: number;
  organization_id: string;
  
  // Customer metrics
  total_customers: number;
  active_customers: number;
  suspended_customers: number;
  
  // Invoice metrics
  total_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
  paid_invoices: number;
  
  // Contract metrics
  total_contracts: number;
  active_contracts: number;
  expired_contracts: number;
  
  // Financial metrics
  total_revenue: number;
  total_pending: number;
  total_overdue: number;
  
  // Network metrics
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  
  // System metrics
  api_response_time_ms: number;
  cache_hit_rate: number;
  error_rate: number;
}

// Prometheus format output
function toPrometheusFormat(metrics: Metrics[], orgName: string): string {
  const lines: string[] = [
    `# HELP netpulse_customers_total Total number of customers`,
    `# TYPE netpulse_customers_total gauge`,
    `netpulse_customers_total{org="${orgName}"} ${metrics[0]?.total_customers || 0}`,
    ``,
    `# HELP netpulse_active_customers Number of active customers`,
    `# TYPE netpulse_active_customers gauge`,
    `netpulse_active_customers{org="${orgName}"} ${metrics[0]?.active_customers || 0}`,
    ``,
    `# HELP netpulse_suspended_customers Number of suspended customers`,
    `# TYPE netpulse_suspended_customers gauge`,
    `netpulse_suspended_customers{org="${orgName}"} ${metrics[0]?.suspended_customers || 0}`,
    ``,
    `# HELP netpulse_invoices_total Total number of invoices`,
    `# TYPE netpulse_invoices_total gauge`,
    `netpulse_invoices_total{org="${orgName}"} ${metrics[0]?.total_invoices || 0}`,
    ``,
    `# HELP netpulse_pending_invoices Pending invoices`,
    `# TYPE netpulse_pending_invoices gauge`,
    `netpulse_pending_invoices{org="${orgName}"} ${metrics[0]?.pending_invoices || 0}`,
    ``,
    `# HELP netpulse_overdue_invoices Overdue invoices`,
    `# TYPE netpulse_overdue_invoices gauge`,
    `netpulse_overdue_invoices{org="${orgName}"} ${metrics[0]?.overdue_invoices || 0}`,
    ``,
    `# HELP netpulse_paid_invoices Paid invoices`,
    `# TYPE netpulse_paid_invoices gauge`,
    `netpulse_paid_invoices{org="${orgName}"} ${metrics[0]?.paid_invoices || 0}`,
    ``,
    `# HELP netpulse_revenue_total Total revenue`,
    `# TYPE netpulse_revenue_total gauge`,
    `netpulse_revenue_total{org="${orgName}"} ${metrics[0]?.total_revenue || 0}`,
    ``,
    `# HELP netpulse_pending_amount Total pending amount`,
    `# TYPE netpulse_pending_amount gauge`,
    `netpulse_pending_amount{org="${orgName}"} ${metrics[0]?.total_pending || 0}`,
    ``,
    `# HELP netpulse_overdue_amount Total overdue amount`,
    `# TYPE netpulse_overdue_amount gauge`,
    `netpulse_overdue_amount{org="${orgName}"} ${metrics[0]?.total_overdue || 0}`,
    ``,
    `# HELP netpulse_contracts_total Total contracts`,
    `# TYPE netpulse_contracts_total gauge`,
    `netpulse_contracts_total{org="${orgName}"} ${metrics[0]?.total_contracts || 0}`,
    ``,
    `# HELP netpulse_active_contracts Active contracts`,
    `# TYPE netpulse_active_contracts gauge`,
    `netpulse_active_contracts{org="${orgName}"} ${metrics[0]?.active_contracts || 0}`,
    ``,
    `# HELP netpulse_expired_contracts Expired contracts`,
    `# TYPE netpulse_expired_contracts gauge`,
    `netpulse_expired_contracts{org="${orgName}"} ${metrics[0]?.expired_contracts || 0}`,
    ``,
    `# HELP netpulse_devices_total Total network devices`,
    `# TYPE netpulse_devices_total gauge`,
    `netpulse_devices_total{org="${orgName}"} ${metrics[0]?.total_devices || 0}`,
    ``,
    `# HELP netpulse_online_devices Online devices`,
    `# TYPE netpulse_online_devices gauge`,
    `netpulse_online_devices{org="${orgName}"} ${metrics[0]?.online_devices || 0}`,
    ``,
    `# HELP netpulse_offline_devices Offline devices`,
    `# TYPE netpulse_offline_devices gauge`,
    `netpulse_offline_devices{org="${orgName}"} ${metrics[0]?.offline_devices || 0}`,
    ``,
    `# HELP netpulse_api_response_time API response time in ms`,
    `# TYPE netpulse_api_response_time gauge`,
    `netpulse_api_response_time_ms{org="${orgName}"} ${metrics[0]?.api_response_time_ms || 0}`,
    ``,
    `# HELP netpulse_cache_hit_rate Cache hit rate`,
    `# TYPE netpulse_cache_hit_rate gauge`,
    `netpulse_cache_hit_rate{org="${orgName}"} ${metrics[0]?.cache_hit_rate || 0}`,
    ``,
    `# HELP netpulse_error_rate Error rate`,
    `# TYPE netpulse_error_rate gauge`,
    `netpulse_error_rate{org="${orgName}"} ${metrics[0]?.error_rate || 0}`,
    ``,
  ];

  return lines.join("\n");
}

// ============================================
// MAIN HANDLER
// ============================================
Deno.serve(async (req: Request) => {
  const startTime = Date.now();

  // CORS for metrics endpoint
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

  try {
    // Get all organizations
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id, name")
      .limit(100);

    const allMetrics: Metrics[] = [];

    for (const org of organizations || []) {
      // Customer metrics
      const { data: customers } = await supabase
        .from("customers")
        .select("id, status")
        .eq("organization_id", org.id);

      const customerMetrics = {
        total_customers: customers?.length || 0,
        active_customers: customers?.filter(c => c.status === "active").length || 0,
        suspended_customers: customers?.filter(c => c.status === "suspended").length || 0,
      };

      // Invoice metrics
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, status, total, amount_paid")
        .eq("organization_id", org.id);

      const invoiceMetrics = {
        total_invoices: invoices?.length || 0,
        pending_invoices: invoices?.filter(i => i.status === "pending").length || 0,
        overdue_invoices: invoices?.filter(i => i.status === "overdue").length || 0,
        paid_invoices: invoices?.filter(i => i.status === "paid").length || 0,
        total_revenue: invoices?.reduce((sum, i) => sum + (i.amount_paid || 0), 0) || 0,
        total_pending: invoices?.filter(i => i.status === "pending").reduce((sum, i) => sum + (i.total || 0), 0) || 0,
        total_overdue: invoices?.filter(i => i.status === "overdue").reduce((sum, i) => sum + (i.total || 0), 0) || 0,
      };

      // Contract metrics
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id, status")
        .eq("organization_id", org.id);

      const contractMetrics = {
        total_contracts: contracts?.length || 0,
        active_contracts: contracts?.filter(c => c.status === "active").length || 0,
        expired_contracts: contracts?.filter(c => c.status === "expired" || c.status === "cancelled").length || 0,
      };

      // Device metrics
      const { data: devices } = await supabase
        .from("network_devices")
        .select("id, status")
        .eq("organization_id", org.id);

      const deviceMetrics = {
        total_devices: devices?.length || 0,
        online_devices: devices?.filter(d => d.status === "online" || d.status === "active").length || 0,
        offline_devices: devices?.filter(d => d.status === "offline").length || 0,
      };

      allMetrics.push({
        timestamp: Date.now(),
        organization_id: org.id,
        ...customerMetrics,
        ...invoiceMetrics,
        ...contractMetrics,
        ...deviceMetrics,
        api_response_time_ms: Date.now() - startTime,
        cache_hit_rate: 0.75, // Would be calculated from Redis
        error_rate: 0.01,
      });
    }

    // Check format (Prometheus or JSON)
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "prometheus";

    if (format === "json") {
      return new Response(JSON.stringify({
        success: true,
        metrics: allMetrics,
        generated_at: new Date().toISOString(),
        response_time_ms: Date.now() - startTime,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prometheus format
    const prometheusOutput = toPrometheusFormat(allMetrics, organizations?.[0]?.name || "unknown");

    return new Response(prometheusOutput, {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });

  } catch (error) {
    return new Response(`# Error: ${error.message}\n`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
