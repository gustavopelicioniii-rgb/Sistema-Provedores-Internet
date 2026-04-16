import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Ticket {
  id: string;
  organization_id: string;
  customer_id?: string;
  subject: string;
  description?: string;
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category?: string;
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

export function useTickets(statusFilter?: string[]) {
  return useQuery({
    queryKey: ["tickets", statusFilter],
    queryFn: async (): Promise<Ticket[]> => {
      const organizationId = await getOrganizationId();
      
      if (!organizationId) {
        return [];
      }

      let query = supabase
        .from("tickets")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter.length > 0) {
        query = query.in("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching tickets:", error);
        return [];
      }
      
      return data as Ticket[] || [];
    },
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: async (): Promise<Ticket | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Ticket || null;
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<Ticket>) => {
      const organizationId = await getOrganizationId();
      
      if (!organizationId) {
        throw new Error("Organização não encontrada");
      }

      const { data, error } = await supabase
        .from("tickets")
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
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket criado");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Ticket> & { id: string }) => {
      const { data, error } = await supabase
        .from("tickets")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket atualizado");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tickets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket excluído");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}
