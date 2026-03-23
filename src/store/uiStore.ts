import { create } from 'zustand';

interface UIState {
  // Plans
  selectedPlanId: string | null;
  isComparisonOpen: boolean;
  isPlanFormOpen: boolean;
  editingPlan: any | null;

  // Network
  selectedOLTId: string | null;
  selectedRegion: string | null;
  isOLTDetailOpen: boolean;

  // General
  dateRange: [string, string];
  sidebarCollapsed: boolean;

  // Actions
  setSelectedPlan: (id: string | null) => void;
  toggleComparison: () => void;
  setPlanFormOpen: (open: boolean) => void;
  setEditingPlan: (plan: any | null) => void;
  setSelectedOLT: (id: string | null) => void;
  setSelectedRegion: (region: string | null) => void;
  setOLTDetailOpen: (open: boolean) => void;
  setDateRange: (range: [string, string]) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Plans
  selectedPlanId: null,
  isComparisonOpen: false,
  isPlanFormOpen: false,
  editingPlan: null,

  // Network
  selectedOLTId: null,
  selectedRegion: null,
  isOLTDetailOpen: false,

  // General
  dateRange: [
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date().toISOString().split('T')[0],
  ],
  sidebarCollapsed: false,

  // Actions
  setSelectedPlan: (id) => set({ selectedPlanId: id }),
  toggleComparison: () => set((s) => ({ isComparisonOpen: !s.isComparisonOpen })),
  setPlanFormOpen: (open) => set({ isPlanFormOpen: open }),
  setEditingPlan: (plan) => set({ editingPlan: plan, isPlanFormOpen: !!plan }),
  setSelectedOLT: (id) => set({ selectedOLTId: id, isOLTDetailOpen: !!id }),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setOLTDetailOpen: (open) => set({ isOLTDetailOpen: open }),
  setDateRange: (range) => set({ dateRange: range }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
