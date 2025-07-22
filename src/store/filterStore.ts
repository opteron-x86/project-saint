// src/store/filterStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
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
<<<<<<< HEAD
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
  setValidationStatus: (statuses: string[]) => void;

  clearFilters: () => void;
  fetchAllFilterOptions: () => Promise<void>;
=======
import { RuleFilters, RuleSeverity } from '@/api/types';
=======
import { RuleFilters, FilterOption, FilterOptionsResponse } from '@/api/types'; // Ensure FilterOption is imported
import { fetchFilterOptions } from '@/api/endpoints'; // To fetch the options
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
import { RuleFilters, FilterOption, FilterOptionsResponse } from '@/api/types'; // RuleFilters now includes rule_platform
=======
import { RuleFilters, FilterOption, FilterOptionsResponse } from '@/api/types';
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
import { fetchFilterOptions } from '@/api/endpoints';
>>>>>>> 984e985 (backend rework for rule_platforms)

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
=======
>>>>>>> 37ba2d8 (Initial commit)
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
  setValidationStatus: (statuses: string[]) => void;

  clearFilters: () => void;
<<<<<<< HEAD
<<<<<<< HEAD
  
  // Options actions
  setAvailablePlatforms: (platforms: string[]) => void;
  setAvailableTactics: (tactics: Array<{ id: string; name: string }>) => void;
  setAvailableTechniques: (techniques: Array<{ id: string; name: string }>) => void;
  setAvailableRuleSources: (sources: string[]) => void;
  setAvailableTags: (tags: string[]) => void;
>>>>>>> a380730 (Initial deployment)
=======

  // Action to fetch and set all filter options
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
  fetchAllFilterOptions: () => Promise<void>;
>>>>>>> 2f90ce0 (refactor to work with the new backend)
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  dateRange: null,
  rule_platform: [],
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
=======
  dateRange: undefined,
=======
  dateRange: null, // Initialize as null
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
  dateRange: null,
<<<<<<< HEAD
  rule_platform: [], // ADDED: For rule-specific platforms
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
  rule_platform: [],
  // --- FIX APPLIED HERE ---
  validation_status: [],
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      name: 'saint-ex-filters', // Name for localStorage
      // Only persist the filters, not the available options
>>>>>>> a380730 (Initial deployment)
=======
      name: 'saint-ex-filters-v2', // Changed name slightly to avoid potential conflict with old structure if any
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
      name: 'saint-ex-filters-v3', // Increment version for storage if structure changed significantly
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
      name: 'saint-ex-filters-v4', // Increment version for new filter state
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
// Selector for just the filters
export const useFilters = () => useFilterStore((state) => state.filters);
>>>>>>> a380730 (Initial deployment)
=======
// Selectors (optional, but can be useful)
export const useCurrentFilters = () => useFilterStore((state) => state.filters);
export const usePlatformOptions = () => useFilterStore((state) => state.platformOptions);
// Add other option selectors as needed
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
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
>>>>>>> 984e985 (backend rework for rule_platforms)

export default useFilterStore;