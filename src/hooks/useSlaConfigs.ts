import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SlaConfig {
  id: string;
  organization_id: string;
  name: string;
  response_time_minutes: number;
  resolution_time_hours: number;
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
}

async function getOrganizationId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();
    
    return data?.organization_id || null;
  } catch {
    return null;
  }
}

export function useSlaConfigs() {
  return useQuery({
    queryKey: ["sla-configs"],
    queryFn: async (): Promise<SlaConfig[]> => {
      const organizationId = await getOrganizationId();
      
      if (!organizationId) {
        return [];
      }

      const { data, error } = await supabase
        .from("sla_configs")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching SLA configs:", error);
        return [];
      }
      
      return data as SlaConfig[] || [];
    },
  });
}

export function useCreateSlaConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<SlaConfig>) => {
      const organizationId = await getOrganizationId();
      
      if (!organizationId) {
        throw new Error("Organização não encontrada");
      }

      const { data, error } = await supabase
        .from("sla_configs")
        .insert({
          ...values,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-configs"] });
      toast.success("Configuração SLA criada");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateSlaConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<SlaConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from("sla_configs")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-configs"] });
      toast.success("Configuração SLA atualizada");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteSlaConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sla_configs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-configs"] });
      toast.success("Configuração SLA excluída");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}
