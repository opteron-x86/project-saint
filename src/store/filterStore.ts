// src/store/filterStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RuleFilters, FilterOption, FilterOptionsResponse } from '@/api/types';
import { fetchFilterOptions } from '@/api/endpoints';

// Define the filter store state interface
interface FilterState {
  filters: RuleFilters;

  // Store the fetched filter options
  platformOptions: FilterOption[];
  tacticOptions: FilterOption[];
  ruleSourceOptions: FilterOption[];
  severityOptions: FilterOption[];
  rulePlatformOptions: FilterOption[];
  // --- FIX APPLIED HERE ---
  validationStatusOptions: FilterOption[];

  // Loading/error state for fetching options
  isLoadingOptions: boolean;
  optionsError: Error | null;

  // Filter actions
  setSearchTerm: (search: string | undefined) => void;
  setSeverities: (severities: string[]) => void;
  setPlatforms: (platforms: string[]) => void;
  setTactics: (tactics: string[]) => void;
  setRuleSources: (sources: string[]) => void;
  setRulePlatforms: (platforms: string[]) => void;
  // --- FIX APPLIED HERE ---
  setValidationStatus: (statuses: string[]) => void;

  clearFilters: () => void;
  fetchAllFilterOptions: () => Promise<void>;
}

// Initial filter state
const initialFilters: RuleFilters = {
  search: undefined,
  severity: [],
  platforms: [],
  techniques: [],
  tactics: [],
  rule_source: [],
  tags: [],
  dateRange: null,
  rule_platform: [],
  // --- FIX APPLIED HERE ---
  validation_status: [],
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      filters: { ...initialFilters },

      platformOptions: [],
      tacticOptions: [],
      ruleSourceOptions: [],
      severityOptions: [],
      rulePlatformOptions: [],
      validationStatusOptions: [], // Initialize new options state

      isLoadingOptions: false,
      optionsError: null,

      setSearchTerm: (search) => set((state) => ({ filters: { ...state.filters, search } })),
      setSeverities: (severity) => set((state) => ({ filters: { ...state.filters, severity } })),
      setPlatforms: (platforms) => set((state) => ({ filters: { ...state.filters, platforms } })),
      setTactics: (tactics) => set((state) => ({ filters: { ...state.filters, tactics } })),
      setRuleSources: (rule_source) => set((state) => ({ filters: { ...state.filters, rule_source } })),
      setRulePlatforms: (rule_platform) => set((state) => ({ filters: { ...state.filters, rule_platform } })),
      setValidationStatus: (validation_status) => set((state) => ({ filters: { ...state.filters, validation_status } })),
      
      clearFilters: () => set({ filters: { ...initialFilters } }),

      fetchAllFilterOptions: async () => {
        if (get().isLoadingOptions) return;
        set({ isLoadingOptions: true, optionsError: null });
        try {
          const response: FilterOptionsResponse = await fetchFilterOptions();
          set({
            platformOptions: response.platforms || [],
            tacticOptions: response.tactics || [],
            ruleSourceOptions: response.rule_sources || [],
            severityOptions: response.severities || [],
            rulePlatformOptions: response.rule_platforms || [],
            validationStatusOptions: response.validation_statuses || [], // Store validation status options
            isLoadingOptions: false,
          });
        } catch (error) {
          console.error("Failed to fetch filter options:", error);
          set({ optionsError: error as Error, isLoadingOptions: false });
        }
      },
    }),
    {
      name: 'saint-ex-filters-v4', // Increment version for new filter state
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);

// Selectors
export const useCurrentFilters = () => useFilterStore((state) => state.filters);
export const usePlatformOptions = () => useFilterStore((state) => state.platformOptions);
export const useRulePlatformOptions = () => useFilterStore((state) => state.rulePlatformOptions);
export const useTacticOptions = () => useFilterStore((state) => state.tacticOptions);
export const useRuleSourceOptions = () => useFilterStore((state) => state.ruleSourceOptions);
export const useSeverityOptions = () => useFilterStore((state) => state.severityOptions);
export const useValidationStatusOptions = () => useFilterStore((state) => state.validationStatusOptions);
export const useIsLoadingOptions = () => useFilterStore((state) => state.isLoadingOptions);
export const useOptionsError = () => useFilterStore((state) => state.optionsError);

export default useFilterStore;
