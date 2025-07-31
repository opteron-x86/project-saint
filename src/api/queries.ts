// src/api/queries.ts

import { useQuery, UseQueryOptions, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRules,
  fetchRuleById,
  fetchRuleStats,
  fetchTechniqueCoverage,
  fetchFilterOptions,
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
    ...options,
  });
};

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
    ...options,
  });
};

export const useTechniqueCoverageQuery = (
  platform?: string | null,
  rulePlatform?: string | null,
  options?: UseQueryOptions<TechniquesCoverageResponse, Error>
) => {
  return useQuery<TechniquesCoverageResponse, Error>({
    queryKey: queryKeys.techniquesCoverage(platform, rulePlatform),
    queryFn: () => fetchTechniqueCoverage(platform, rulePlatform),
    staleTime: 1000 * 60 * 60, 
    ...options,
  });
};

export const useMitreMatrixQuery = (
  options?: UseQueryOptions<MitreMatrixData, Error>
) => {
  return useQuery<MitreMatrixData, Error>({
    queryKey: queryKeys.mitreMatrix(),
    queryFn: async () => await apiGet<MitreMatrixData>('/mitre/matrix'),
    staleTime: 1000 * 60 * 5, 
    ...options,
  });
};

export const useFilterOptionsQuery = (
  options?: UseQueryOptions<FilterOptionsResponse, Error>
) => {
  return useQuery<FilterOptionsResponse, Error>({
    queryKey: queryKeys.filterOptions(),
    queryFn: fetchFilterOptions,
    staleTime: 24 * 60 * 60 * 1000,
    ...options,
  });
};

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
};