import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

export function useClients(params?: {
  page?: number; limit?: number; status?: string; city?: string; search?: string; plan_id?: string;
}) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: async () => {
      const res = await apiClient.getClients(params);
      return res;
    },
  });
}

export function useClient(id: string | null) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.getClient(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useClientHistory(id: string | null) {
  return useQuery({
    queryKey: ['client-history', id],
    queryFn: async () => {
      if (!id) return [];
      const res = await apiClient.getClientHistory(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Cliente cadastrado com sucesso' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao cadastrar cliente', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Cliente atualizado' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar cliente', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCalculateChurnScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.calculateChurnScore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Score de churn calculado' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao calcular churn score', description: error.message, variant: 'destructive' });
    },
  });
}
