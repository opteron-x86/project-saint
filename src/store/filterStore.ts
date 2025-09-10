// src/store/filterStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RuleFilters, FilterOption, FilterOptionsResponse } from '@/api/types';
import { fetchFilterOptions } from '@/api/endpoints';

interface FilterState {
  filters: RuleFilters & {
    deprecation_status?: 'all' | 'has_deprecated' | 'no_deprecated';
  };

  // Store the fetched filter options
  platformOptions: FilterOption[];
  tacticOptions: FilterOption[];
  ruleSourceOptions: FilterOption[];
  severityOptions: FilterOption[];
  rulePlatformOptions: FilterOption[];

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
  setMitreTechniques: (techniques: string[]) => void;
  setTags: (tags: string[]) => void;
  setDeprecationStatus: (status: 'all' | 'has_deprecated' | 'no_deprecated' | undefined) => void;

  clearFilters: () => void;
  fetchAllFilterOptions: () => Promise<void>;
}

// Initial filter state
const initialFilters: RuleFilters & { deprecation_status?: 'all' | 'has_deprecated' | 'no_deprecated' } = {
  search: undefined,
  severity: [],
  platforms: [],
  techniques: [],
  tactics: [],
  rule_source: [],
  tags: [],
  dateRange: null,
  rule_platform: [],
  mitre_techniques: [],
  deprecation_status: undefined,
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

      isLoadingOptions: false,
      optionsError: null,

      setSearchTerm: (search) => 
        set((state) => ({ filters: { ...state.filters, search } })),
      
      setSeverities: (severity) => 
        set((state) => ({ filters: { ...state.filters, severity } })),
      
      setPlatforms: (platforms) => 
        set((state) => ({ filters: { ...state.filters, platforms } })),
      
      setTactics: (tactics) => 
        set((state) => ({ filters: { ...state.filters, tactics } })),
      
      setRuleSources: (rule_source) => 
        set((state) => ({ filters: { ...state.filters, rule_source } })),
      
      setRulePlatforms: (rule_platform) => 
        set((state) => ({ filters: { ...state.filters, rule_platform } })),
      
      setMitreTechniques: (mitre_techniques) => 
        set((state) => ({ filters: { ...state.filters, mitre_techniques } })),
      
      setTags: (tags) => 
        set((state) => ({ filters: { ...state.filters, tags } })),
      
      setDeprecationStatus: (deprecation_status) =>
        set((state) => ({ filters: { ...state.filters, deprecation_status } })),
      
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
            isLoadingOptions: false,
          });
        } catch (error) {
          console.error("Failed to fetch filter options:", error);
          set({ optionsError: error as Error, isLoadingOptions: false });
        }
      },
    }),
    {
      name: 'saint-ex-filters-v6', // Increment version for deprecation filter
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
export const useIsLoadingOptions = () => useFilterStore((state) => state.isLoadingOptions);
export const useOptionsError = () => useFilterStore((state) => state.optionsError);
export const useDeprecationStatus = () => useFilterStore((state) => state.filters.deprecation_status);

// Computed selectors
export const useActiveFilterCount = () => useFilterStore((state) => {
  const filters = state.filters;
  let count = 0;
  
  if (filters.search) count++;
  if (filters.severity?.length) count += filters.severity.length;
  if (filters.platforms?.length) count += filters.platforms.length;
  if (filters.rule_platform?.length) count += filters.rule_platform.length;
  if (filters.rule_source?.length) count += filters.rule_source.length;
  if (filters.tactics?.length) count += filters.tactics.length;
  if (filters.mitre_techniques?.length) count += filters.mitre_techniques.length;
  if (filters.tags?.length) count += filters.tags.length;
  if (filters.deprecation_status && filters.deprecation_status !== 'all') count++;
  
  return count;
});

export const useHasActiveFilters = () => useFilterStore((state) => {
  const filters = state.filters;
  
  return !!(
    filters.search ||
    filters.severity?.length ||
    filters.platforms?.length ||
    filters.rule_platform?.length ||
    filters.rule_source?.length ||
    filters.tactics?.length ||
    filters.mitre_techniques?.length ||
    filters.tags?.length ||
    (filters.deprecation_status && filters.deprecation_status !== 'all')
  );
});

export default useFilterStore;