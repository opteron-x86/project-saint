// src/api/queries.ts

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { useQuery, UseQueryOptions, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';
=======
import { useQuery, UseQueryOptions, keepPreviousData } from '@tanstack/react-query';
>>>>>>> caba7c5 (code cleanup)
=======
import { useQuery, UseQueryOptions, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';
>>>>>>> 23a6656 (Feature/issue creator)
import {
  fetchRules,
  fetchRuleById,
  fetchRuleStats,
  fetchTechniqueCoverage,
  fetchFilterOptions,
<<<<<<< HEAD
} from './endpoints';
import {
  FetchRulesResponse,
  RuleDetail,
  FetchRuleStatsResponse,
  PaginationParams,
  RuleFilters,
  TechniquesCoverageResponse,
  FilterOptionsResponse,
  MitreMatrixData,
  CreateIssuePayload,
} from './types';
import { apiGet, createIssue } from './client';

// --- Query Keys ---
export const queryKeys = {
  rules: (filters?: RuleFilters, pagination?: PaginationParams) => [
    'rules',
    // Stringify the filters and pagination objects to ensure the key changes reliably
    // when their content changes.
    filters ? JSON.stringify(filters) : 'no_filters', // Use a placeholder if undefined
    pagination ? JSON.stringify(pagination) : 'no_pagination', // Use a placeholder
  ],
  ruleDetail: (id: string) => ['rule', id],
  ruleStats: (filters?: RuleFilters) => [
    'ruleStats',
    filters ? JSON.stringify(filters) : 'no_filters',
  ],
  techniquesCoverage: (
    platform?: string | null,
    rulePlatform?: string | null
  ) => [
    'techniquesCoverage',
    // For simple string/null parameters, direct inclusion is fine.
    // If these were objects, stringification would be recommended.
    platform ?? 'no_platform_filter',
    rulePlatform ?? 'no_rule_platform_filter',
  ],
  mitreMatrix: () => ['mitreMatrix'],
  filterOptions: () => ['filterOptions'],
};

// --- Query Hooks ---

export const useRulesQuery = (
  pagination: PaginationParams,
  filters?: RuleFilters,
  options?: UseQueryOptions<FetchRulesResponse, Error>
) => {
  return useQuery<FetchRulesResponse, Error>({
    queryKey: queryKeys.rules(filters, pagination),
    queryFn: async () => {
      // This console.log is crucial for debugging if queryFn is called
      console.log('useRulesQuery: Fetching rules with key parts - pagination:', JSON.stringify(pagination), 'filters:', JSON.stringify(filters));
      const result = await fetchRules(pagination, filters);
      return result;
    },
    retry: false,
    placeholderData: keepPreviousData, // Good for pagination UX
    ...options,
  });
};

export const useRuleQuery = (
  id: string | null,
  options?: UseQueryOptions<RuleDetail, Error>
) => {
  return useQuery<RuleDetail, Error>({
    queryKey: queryKeys.ruleDetail(id!),
    queryFn: () => fetchRuleById(id!),
    enabled: !!id,
=======
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { 
  fetchRules, 
  fetchRuleById, 
  fetchRuleStats, 
  fetchRulesByTechnique,
  fetchRulesByPlatform,
  fetchTechniqueCoverage
=======
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  fetchRules,
  fetchRuleById,
  fetchRuleStats,
  fetchTechniqueCoverage,
<<<<<<< HEAD
  fetchFilterOptions,   // New endpoint function
  // Consider adding fetchMitreMatrix if useMitreAttackData doesn't call apiGet directly
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
  fetchFilterOptions,
  // fetchMitreMatrix, // Assuming this might be added to endpoints.ts later
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
>>>>>>> ee348bb (stringified queries)
} from './endpoints';
import {
  FetchRulesResponse,
  RuleDetail,
  FetchRuleStatsResponse,
  PaginationParams,
  RuleFilters,
  TechniquesCoverageResponse,
  FilterOptionsResponse,
  MitreMatrixData,
  CreateIssuePayload,
} from './types';
import { apiGet, createIssue } from './client';

// --- Query Keys ---
export const queryKeys = {
  rules: (filters?: RuleFilters, pagination?: PaginationParams) => [
    'rules',
    // Stringify the filters and pagination objects to ensure the key changes reliably
    // when their content changes.
    filters ? JSON.stringify(filters) : 'no_filters', // Use a placeholder if undefined
    pagination ? JSON.stringify(pagination) : 'no_pagination', // Use a placeholder
  ],
  ruleDetail: (id: string) => ['rule', id],
  ruleStats: (filters?: RuleFilters) => [
    'ruleStats',
    filters ? JSON.stringify(filters) : 'no_filters',
  ],
  techniquesCoverage: (
    platform?: string | null,
    rulePlatform?: string | null
  ) => [
    'techniquesCoverage',
    // For simple string/null parameters, direct inclusion is fine.
    // If these were objects, stringification would be recommended.
    platform ?? 'no_platform_filter',
    rulePlatform ?? 'no_rule_platform_filter',
  ],
  mitreMatrix: () => ['mitreMatrix'],
  filterOptions: () => ['filterOptions'],
};

// --- Query Hooks ---

export const useRulesQuery = (
  pagination: PaginationParams,
  filters?: RuleFilters,
  options?: UseQueryOptions<FetchRulesResponse, Error>
) => {
  return useQuery<FetchRulesResponse, Error>({
    queryKey: queryKeys.rules(filters, pagination),
    queryFn: async () => {
      // This console.log is crucial for debugging if queryFn is called
      console.log('useRulesQuery: Fetching rules with key parts - pagination:', JSON.stringify(pagination), 'filters:', JSON.stringify(filters));
      const result = await fetchRules(pagination, filters);
      return result;
    },
    retry: false,
    placeholderData: keepPreviousData, // Good for pagination UX
    ...options,
  });
};

export const useRuleQuery = (
  id: string | null,
  options?: UseQueryOptions<RuleDetail, Error>
) => {
<<<<<<< HEAD
  return useQuery<FetchRulesResponse>({
    queryKey: [...queryKeys.rulesByTechnique(techniqueId), pagination],
    queryFn: () => fetchRulesByTechnique(techniqueId, pagination),
    enabled: !!techniqueId,
>>>>>>> a380730 (Initial deployment)
=======
  return useQuery<RuleDetail, Error>({
<<<<<<< HEAD
    queryKey: queryKeys.ruleDetail(id!), // Use non-null assertion if enabled is true
    queryFn: () => fetchRuleById(id!),    // Use non-null assertion
    enabled: !!id, // Only run query if ID is provided
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
    queryKey: queryKeys.ruleDetail(id!),
    queryFn: () => fetchRuleById(id!),
    enabled: !!id,
>>>>>>> 984e985 (backend rework for rule_platforms)
    ...options,
  });
};

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export const useRuleStatsQuery = (
  filters?: RuleFilters,
  options?: UseQueryOptions<FetchRuleStatsResponse, Error>
) => {
  return useQuery<FetchRuleStatsResponse, Error>({
    queryKey: queryKeys.ruleStats(filters),
    queryFn: () => {
      console.log('useRuleStatsQuery: Fetching stats with key part - filters:', JSON.stringify(filters));
      return fetchRuleStats(filters);
    },
=======
// Rules by Platform query hook
export const useRulesByPlatformQuery = (
  platform: string,
  pagination?: PaginationParams,
  options?: UseQueryOptions<FetchRulesResponse>
) => {
  return useQuery<FetchRulesResponse>({
    queryKey: [...queryKeys.rulesByPlatform(platform), pagination],
    queryFn: () => fetchRulesByPlatform(platform, pagination),
    enabled: !!platform,
>>>>>>> a380730 (Initial deployment)
=======
/**
 * Hook to fetch rule statistics.
 * Can accept filters to get stats for a specific subset of rules.
 */
=======
>>>>>>> ee348bb (stringified queries)
export const useRuleStatsQuery = (
  filters?: RuleFilters,
  options?: UseQueryOptions<FetchRuleStatsResponse, Error>
) => {
  return useQuery<FetchRuleStatsResponse, Error>({
    queryKey: queryKeys.ruleStats(filters),
<<<<<<< HEAD
    // fetchRuleStats uses buildQueryParams which now handles filters.rule_platform
    queryFn: () => fetchRuleStats(filters),
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
    queryFn: () => {
      console.log('useRuleStatsQuery: Fetching stats with key part - filters:', JSON.stringify(filters));
      return fetchRuleStats(filters);
    },
>>>>>>> ee348bb (stringified queries)
    ...options,
  });
};

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export const useTechniqueCoverageQuery = (
  platform?: string | null,
  rulePlatform?: string | null,
  options?: UseQueryOptions<TechniquesCoverageResponse, Error>
) => {
  return useQuery<TechniquesCoverageResponse, Error>({
    queryKey: queryKeys.techniquesCoverage(platform, rulePlatform),
    queryFn: () => fetchTechniqueCoverage(platform, rulePlatform),
    staleTime: 1000 * 60 * 60, 
<<<<<<< HEAD
=======
/**
 * Hook to fetch technique coverage data.
 * Can be filtered by ATT&CK technique platform and/or rule-specific platform.
 */
=======
>>>>>>> ee348bb (stringified queries)
export const useTechniqueCoverageQuery = (
  platform?: string | null,
  rulePlatform?: string | null,
  options?: UseQueryOptions<TechniquesCoverageResponse, Error>
) => {
  return useQuery<TechniquesCoverageResponse, Error>({
<<<<<<< HEAD
    queryKey: queryKeys.techniquesCoverage(platform),
    queryFn: () => fetchTechniqueCoverage(platform),
    staleTime: 60 * 60 * 1000, // 1 hour - coverage data might change infrequently
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
    queryKey: queryKeys.techniquesCoverage(platform, rulePlatform),
<<<<<<< HEAD
    queryFn: () => fetchTechniqueCoverage(platform, rulePlatform), // Pass both filters
    staleTime: 60 * 60 * 1000, // 1 hour
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
    queryFn: () => fetchTechniqueCoverage(platform, rulePlatform),
    staleTime: 60 * 60 * 1000,
>>>>>>> ee348bb (stringified queries)
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
    ...options,
  });
};

<<<<<<< HEAD
<<<<<<< HEAD
=======
/**
 * Hook to fetch MITRE ATT&CK matrix data.
 */
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
>>>>>>> ee348bb (stringified queries)
export const useMitreMatrixQuery = (
  options?: UseQueryOptions<MitreMatrixData, Error>
) => {
  return useQuery<MitreMatrixData, Error>({
    queryKey: queryKeys.mitreMatrix(),
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    queryFn: async () => await apiGet<MitreMatrixData>('/mitre/matrix'),
    staleTime: 1000 * 60 * 5, 
=======
    // Assuming fetchMitreMatrix is added to endpoints.ts or apiGet is used directly
    // For now, let's assume apiGet is used directly in useMitreAttackData.ts,
    // or we can add a fetchMitreMatrix function to endpoints.ts.
    // If useMitreAttackData.ts directly uses apiGet('/mitre/matrix'), this specific hook might be redundant
    // unless you want to centralize all TanStack Query hook definitions here.
    // Let's assume useMitreAttackData will use this:
    queryFn: async () => {
        // This assumes you might add a dedicated fetchMitreMatrix to endpoints.ts
        // that calls apiGet<MitreMatrixData>(ENDPOINTS.MITRE_MATRIX)
        // If not, useMitreAttackData would call apiGet directly.
        // For completeness, let's imagine fetchMitreMatrix exists:
        // return await fetchMitreMatrix();
        // For now, we'll leave this as a placeholder to be completed if needed,
        // or acknowledge useMitreAttackData handles its own direct apiGet.
        // Let's assume for now that `useMitreAttackData` calls `apiGet` directly for matrix.
        // If we want this hook to be the source:
        // 1. Add ENDPOINTS.MITRE_MATRIX = '/mitre/matrix' to endpoints.ts
        // 2. Add fetchMitreMatrix = () => apiGet<MitreMatrixData>(ENDPOINTS.MITRE_MATRIX) to endpoints.ts
        throw new Error("fetchMitreMatrix not implemented in endpoints.ts for this hook yet, or use apiGet directly in useMitreAttackData.");
    },
    staleTime: Infinity, // Matrix data changes very infrequently (e.g., new ATT&CK version)
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
    // Example using apiGet directly, or you can create fetchMitreMatrix in endpoints.ts
=======
>>>>>>> ee348bb (stringified queries)
    queryFn: async () => await apiGet<MitreMatrixData>('/mitre/matrix'),
<<<<<<< HEAD
    staleTime: Infinity,
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
    staleTime: 1000 * 60 * 5, 
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
    ...options,
  });
};

<<<<<<< HEAD
<<<<<<< HEAD
=======
/**
 * Hook to fetch available filter options for UI dropdowns.
 */
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
>>>>>>> ee348bb (stringified queries)
export const useFilterOptionsQuery = (
  options?: UseQueryOptions<FilterOptionsResponse, Error>
) => {
  return useQuery<FilterOptionsResponse, Error>({
    queryKey: queryKeys.filterOptions(),
    queryFn: fetchFilterOptions,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    staleTime: 24 * 60 * 60 * 1000,
=======
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - filter options change very infrequently
>>>>>>> 2f90ce0 (refactor to work with the new backend)
    ...options,
  });
};

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 23a6656 (Feature/issue creator)
export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, payload }: { ruleId: string; payload: CreateIssuePayload }) =>
      createIssue(ruleId, payload),
    onSuccess: (data, { ruleId }) => {
      // Invalidate queries that might be affected by the new issue
      // For example, you might want to refetch the rule details to show a link to the new issue
      queryClient.invalidateQueries({ queryKey: queryKeys.ruleDetail(ruleId) });
    },
  });
<<<<<<< HEAD
};
=======
// Technique Coverage query hook
export const useTechniqueCoverageQuery = (options?: UseQueryOptions<TechniqueCoverage>) => {
    return useQuery<TechniqueCoverage>({
      queryKey: queryKeys.techniquesCoverage,
      queryFn: fetchTechniqueCoverage,
      staleTime: 60 * 60 * 1000, // 1 hour - coverage data changes infrequently
      ...options,
    });
  };
>>>>>>> a380730 (Initial deployment)
=======
// The old useRulesByTechniqueQuery and useRulesByPlatformQuery are no longer needed
// as useRulesQuery with appropriate filters handles these cases.
// Example of how they would be replaced:
// To get rules by technique 'T1234':
// const { data } = useRulesQuery(pagination, { techniques: ['T1234'] });
// To get rules by platform 'Windows':
// const { data } = useRulesQuery(pagination, { platforms: ['Windows'] });
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
=======
    staleTime: 24 * 60 * 60 * 1000,
>>>>>>> ee348bb (stringified queries)
    ...options,
  });
};
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
};
>>>>>>> 23a6656 (Feature/issue creator)
