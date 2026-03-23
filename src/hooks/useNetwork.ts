import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

export function useOLTs(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['olts', params],
    queryFn: async () => {
      const res = await apiClient.getOLTs(params);
      return res;
    },
  });
}

export function useOLT(id: string | null) {
  return useQuery({
    queryKey: ['olt', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.getOLT(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useOLTHealth(id: string | null) {
  return useQuery({
    queryKey: ['olt-health', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.getOLTHealth(id);
      return res.data;
    },
    enabled: !!id,
    refetchInterval: 30000, // Refresh every 30s
  });
}

export function useOLTClients(id: string | null) {
  return useQuery({
    queryKey: ['olt-clients', id],
    queryFn: async () => {
      if (!id) return [];
      const res = await apiClient.getOLTClients(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useOLTIncidents(id: string | null) {
  return useQuery({
    queryKey: ['olt-incidents', id],
    queryFn: async () => {
      if (!id) return [];
      const res = await apiClient.getOLTIncidents(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useNetworkIncidents(params?: { page?: number; limit?: number; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['network-incidents', params],
    queryFn: async () => {
      const res = await apiClient.getNetworkIncidents(params);
      return res;
    },
  });
}

export function useSignalQuality() {
  return useQuery({
    queryKey: ['signal-quality'],
    queryFn: async () => {
      const res = await apiClient.getSignalQualityByOLT();
      return res.data;
    },
    refetchInterval: 60000,
  });
}

export function useClientsAtRisk(threshold?: number) {
  return useQuery({
    queryKey: ['clients-at-risk', threshold],
    queryFn: async () => {
      const res = await apiClient.getClientsAtRisk(threshold);
      return res.data;
    },
  });
}

export function useNetworkHeatmap() {
  return useQuery({
    queryKey: ['network-heatmap'],
    queryFn: async () => {
      const res = await apiClient.getNetworkHeatmap();
      return res.data;
    },
  });
}

export function useCreateOLT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createOLT(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olts'] });
      toast({ title: 'OLT cadastrada' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao cadastrar OLT', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['olts'] });
      toast({ title: 'Incidente registrado' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao registrar incidente', description: error.message, variant: 'destructive' });
    },
  });
}
