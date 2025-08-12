// src/api/queries.ts

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseQueryOptions, 
  UseMutationOptions,
  keepPreviousData 
} from '@tanstack/react-query';

import {
  // Core endpoints
  fetchRules,
  fetchRuleById,
  fetchRuleStats,
  fetchRuleEnrichmentStats,
  exportRules,
  
  // MITRE endpoints
  fetchMitreMatrix,
  fetchTechniqueCoverage,
  fetchMitreTechniques,
  
  // CVE endpoints
  fetchCves,
  fetchCveById,
  fetchCveStats,
  
  // Filter and search endpoints
  fetchFilterOptions,
  globalSearch,
  
  // Analytics endpoints
  fetchDashboardData,
  fetchTrendData,
  
  // Issue creation
  createIssue,
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
  MitreTechnique,
  DashboardStats,
  TrendData,
  ExportOptions,
  ExportResponse,
  GlobalSearchResponse,
  CveData,
  CveStats,
  CreateIssuePayload,
  CreateIssueResponse,
} from './types';

// Define proper error type
interface QueryError extends Error {
  status?: number;
}

// --- QUERY KEYS ---
export const queryKeys = {
  // Rules
  rules: (filters?: RuleFilters, pagination?: PaginationParams) => [
    'rules',
    filters ? JSON.stringify(filters) : 'no_filters',
    pagination ? JSON.stringify(pagination) : 'no_pagination',
  ],
  ruleDetail: (id: string) => ['rule', id],
  ruleStats: (filters?: RuleFilters) => [
    'ruleStats',
    filters ? JSON.stringify(filters) : 'no_filters',
  ],
  ruleEnrichmentStats: () => ['ruleEnrichmentStats'],
  
  // MITRE ATT&CK
  mitreMatrix: () => ['mitreMatrix'],
  techniquesCoverage: (platform?: string | null, rulePlatform?: string | null) => [
    'techniquesCoverage',
    platform ?? 'no_platform_filter',
    rulePlatform ?? 'no_rule_platform_filter',
  ],
  mitreTechniques: (pagination?: PaginationParams, search?: string) => [
    'mitreTechniques',
    pagination ? JSON.stringify(pagination) : 'no_pagination',
    search ?? 'no_search',
  ],
  
  // CVEs
  cves: (pagination: PaginationParams, filters?: any) => [
    'cves',
    JSON.stringify(pagination),
    filters ? JSON.stringify(filters) : 'no_filters',
  ],
  cveDetail: (id: string) => ['cve', id],
  cveStats: () => ['cveStats'],
  
  // Filters and search
  filterOptions: () => ['filterOptions'],
  globalSearch: (query: string, pagination?: PaginationParams, types?: string[]) => [
    'globalSearch',
    query,
    pagination ? JSON.stringify(pagination) : 'no_pagination',
    types ? JSON.stringify(types) : 'no_types',
  ],
  
  // Analytics
  dashboardData: () => ['dashboardData'],
  trendData: (period?: string, startDate?: string, endDate?: string) => [
    'trendData',
    period ?? 'no_period',
    startDate ?? 'no_start_date',
    endDate ?? 'no_end_date',
  ],
};

// --- CORE RULES QUERY HOOKS ---

export const useRulesQuery = (
  pagination: PaginationParams,
  filters?: RuleFilters,
  options?: UseQueryOptions<FetchRulesResponse, Error>
) => {
  return useQuery<FetchRulesResponse, Error>({
    queryKey: queryKeys.rules(filters, pagination),
    queryFn: () => fetchRules(pagination, filters),
    retry: (failureCount, error: QueryError) => {
      if (error?.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    retry: (failureCount, error: QueryError) => {
      if (error?.status === 404) return false;
      if (error?.status && error.status >= 400 && error.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useRuleStatsQuery = (
  filters?: RuleFilters,
  options?: UseQueryOptions<FetchRuleStatsResponse, Error>
) => {
  return useQuery<FetchRuleStatsResponse, Error>({
    queryKey: queryKeys.ruleStats(filters),
    queryFn: () => fetchRuleStats(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useRuleEnrichmentStatsQuery = (
  options?: UseQueryOptions<any, Error>
) => {
  return useQuery<any, Error>({
    queryKey: queryKeys.ruleEnrichmentStats(),
    queryFn: fetchRuleEnrichmentStats,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// --- MITRE ATT&CK QUERY HOOKS ---

export const useMitreMatrixQuery = (
  options?: UseQueryOptions<MitreMatrixData, Error>
) => {
  return useQuery<MitreMatrixData, Error>({
    queryKey: queryKeys.mitreMatrix(),
    queryFn: fetchMitreMatrix,
    staleTime: 15 * 60 * 1000,
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
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useMitreTechniquesQuery = (
  pagination: PaginationParams,
  search?: string,
  options?: UseQueryOptions<{ items: MitreTechnique[]; total: number }, Error>
) => {
  return useQuery<{ items: MitreTechnique[]; total: number }, Error>({
    queryKey: queryKeys.mitreTechniques(pagination, search),
    queryFn: () => fetchMitreTechniques(pagination, search),
    placeholderData: keepPreviousData,
    staleTime: 15 * 60 * 1000,
    ...options,
  });
};

// --- CVE QUERY HOOKS ---

export const useCvesQuery = (
  pagination: PaginationParams,
  filters?: { severities?: string[]; with_rules_only?: boolean; query?: string },
  options?: UseQueryOptions<{ items: CveData[]; total: number }, Error>
) => {
  return useQuery<{ items: CveData[]; total: number }, Error>({
    queryKey: queryKeys.cves(pagination, filters),
    queryFn: () => fetchCves(pagination, filters),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useCveQuery = (
  id: string,
  options?: UseQueryOptions<CveData, Error>
) => {
  return useQuery<CveData, Error>({
    queryKey: queryKeys.cveDetail(id),
    queryFn: () => fetchCveById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
    ...options,
  });
};

export const useCveStatsQuery = (
  options?: UseQueryOptions<CveStats, Error>
) => {
  return useQuery<CveStats, Error>({
    queryKey: queryKeys.cveStats(),
    queryFn: fetchCveStats,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// --- FILTER AND SEARCH QUERY HOOKS ---

export const useFilterOptionsQuery = (
  options?: UseQueryOptions<FilterOptionsResponse, Error>
) => {
  return useQuery<FilterOptionsResponse, Error>({
    queryKey: queryKeys.filterOptions(),
    queryFn: fetchFilterOptions,
    staleTime: 30 * 60 * 1000,
    ...options,
  });
};

export const useGlobalSearchQuery = (
  query: string,
  pagination?: PaginationParams,
  types?: string[],
  options?: UseQueryOptions<GlobalSearchResponse, Error>
) => {
  return useQuery<GlobalSearchResponse, Error>({
    queryKey: queryKeys.globalSearch(query, pagination, types),
    queryFn: () => globalSearch(query, pagination, types),
    enabled: query.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// --- ANALYTICS QUERY HOOKS ---

export const useDashboardDataQuery = (
  options?: UseQueryOptions<DashboardStats, Error>
) => {
  return useQuery<DashboardStats, Error>({
    queryKey: queryKeys.dashboardData(),
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useTrendDataQuery = (
  period?: string,
  startDate?: string,
  endDate?: string,
  options?: UseQueryOptions<TrendData, Error>
) => {
  return useQuery<TrendData, Error>({
    queryKey: queryKeys.trendData(period, startDate, endDate),
    queryFn: () => fetchTrendData(period, startDate, endDate),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// --- MUTATION HOOKS ---

export const useCreateIssueMutation = (
  options?: UseMutationOptions<CreateIssueResponse, Error, { ruleId: string; payload: CreateIssuePayload }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateIssueResponse, Error, { ruleId: string; payload: CreateIssuePayload }>({
    mutationFn: ({ ruleId, payload }) => createIssue(ruleId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ruleDetail(variables.ruleId),
      });
    },
    ...options,
  });
};

// Legacy alias
export const useCreateIssue = useCreateIssueMutation;

export const useExportRulesMutation = (
  options?: UseMutationOptions<ExportResponse, Error, ExportOptions>
) => {
  return useMutation<ExportResponse, Error, ExportOptions>({
    mutationFn: exportRules,
    ...options,
  });
};

// --- UTILITY HOOKS ---

export const useRefreshQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    refreshRulesData: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['ruleStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      queryClient.invalidateQueries({ queryKey: ['techniquesCoverage'] });
    },
    refreshMitreData: () => {
      queryClient.invalidateQueries({ queryKey: ['mitreMatrix'] });
      queryClient.invalidateQueries({ queryKey: ['mitreTechniques'] });
      queryClient.invalidateQueries({ queryKey: ['techniquesCoverage'] });
    },
    refreshAllData: () => queryClient.invalidateQueries(),
  };
};

export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchRuleDetail: (ruleId: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.ruleDetail(ruleId),
        queryFn: () => fetchRuleById(ruleId),
        staleTime: 10 * 60 * 1000,
      });
    },
    prefetchFilterOptions: () => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.filterOptions(),
        queryFn: fetchFilterOptions,
        staleTime: 15 * 60 * 1000,
      });
    },
  };
};