import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

export function usePlans(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['plans', params],
    queryFn: async () => {
      const res = await apiClient.getPlans(params);
      return res;
    },
  });
}

export function usePlan(id: string | null) {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.getPlan(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function usePlanKPIs(id: string | null) {
  return useQuery({
    queryKey: ['plan-kpis', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.getPlanKPIs(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function usePlanMigrationHistory(id: string | null) {
  return useQuery({
    queryKey: ['plan-migrations', id],
    queryFn: async () => {
      if (!id) return [];
      const res = await apiClient.getPlanMigrationHistory(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function usePlansComparison() {
  return useQuery({
    queryKey: ['plans-comparison'],
    queryFn: async () => {
      const res = await apiClient.getPlansComparison();
      return res.data;
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({ title: 'Plano criado com sucesso' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar plano', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({ title: 'Plano atualizado' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar plano', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({ title: 'Plano excluído' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao excluir plano', description: error.message, variant: 'destructive' });
    },
  });
}
