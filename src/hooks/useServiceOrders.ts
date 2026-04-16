import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ServiceOrderRecord {
  id: string;
  organization_id: string;
  customer_id: string;
  technician_id?: string;
  title: string;
  description?: string;
  type: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "completed" | "cancelled";
  scheduled_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

async function getOrganizationId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();
    
    if (error || !data?.organization_id) return null;
    return data.organization_id;
  } catch {
    return null;
  }
}

export function useServiceOrders() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["service-orders"],
    queryFn: async (): Promise<ServiceOrderRecord[]> => {
      const organizationId = await getOrganizationId();
      
      if (!organizationId) {
        console.warn("No organization found for service orders");
        return [];
      }

      const { data, error } = await supabase
        .from("service_orders")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching service orders:", error);
        throw error;
      }
      
      return data as ServiceOrderRecord[] || [];
    },
  });
}

export function useServiceOrder(id: string) {
  return useQuery({
    queryKey: ["service-order", id],
    queryFn: async (): Promise<ServiceOrderRecord | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("service_orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as ServiceOrderRecord || null;
    },
    enabled: !!id,
  });
}

export function useCreateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<ServiceOrderRecord>) => {
      const organizationId = await getOrganizationId();
      
      if (!organizationId) {
        throw new Error("Organização não encontrada");
      }

      const { data, error } = await supabase
        .from("service_orders")
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
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
      toast.success("Ordem de serviço criada");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<ServiceOrderRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from("service_orders")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
      toast.success("Ordem atualizada");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
      toast.success("Ordem excluída");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}
