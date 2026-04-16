import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Lead {
  id: string;
  organization_id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  notes?: string;
  created_at: string;
  updated_at: string;
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

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async (): Promise<Lead[]> => {
      const organizationId = await getOrganizationId();
      
      if (!organizationId) {
        return [];
      }

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching leads:", error);
        return [];
      }
      
      return data as Lead[] || [];
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: async (): Promise<Lead | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Lead || null;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<Lead>) => {
      const organizationId = await getOrganizationId();
      
      if (!organizationId) {
        throw new Error("Organização não encontrada");
      }

      const { data, error } = await supabase
        .from("leads")
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
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead criado");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead atualizado");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead excluído");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}
