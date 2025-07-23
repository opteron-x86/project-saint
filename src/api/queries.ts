// src/api/queries.ts - Enhanced for Phase 2 with TypeScript fixes

import React from 'react';
import { useQuery, UseQueryOptions, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRules,
  fetchRuleById,
  fetchRuleStats,
  fetchRuleEnrichment,
  fetchTechniqueCoverage,
  fetchFilterOptions,
  fetchMitreMatrix,
  fetchMitreTechniques,
  fetchMitreTactics,
  fetchCveById,
  fetchCveStats,
  fetchDashboardData,
  fetchTrendAnalysis,
  performGlobalSearch,
  exportRules,
  fetchHealthStatus,
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
  DashboardResponse,
  TrendAnalysisResponse,
  GlobalSearchResponse,
  ExportRequest,
  ExportResponse,
  CveDetail,
  CveStatsResponse,
  CreateIssuePayload,
  MitreTechniquesResponse,
  MitreTacticsResponse,
  RuleEnrichmentResponse,
} from './types';
import { createIssue } from './client';

// --- Enhanced Query Keys ---
const queryKeys = {
  // Core rules queries
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
  ruleEnrichment: (filters?: RuleFilters) => [
    'ruleEnrichment',
    filters ? JSON.stringify(filters) : 'no_filters',
  ],
  
  // MITRE queries
  mitreMatrix: () => ['mitreMatrix'],
  mitreTechniques: (pagination?: PaginationParams, search?: string) => [
    'mitreTechniques',
    pagination ? JSON.stringify(pagination) : 'no_pagination',
    search || 'no_search',
  ],
  mitreTactics: () => ['mitreTactics'],
  techniquesCoverage: (
    platform?: string | null,
    rulePlatform?: string | null
  ) => [
    'techniquesCoverage',
    platform ?? 'no_platform_filter',
    rulePlatform ?? 'no_rule_platform_filter',
  ],
  
  // CVE queries
  cveDetail: (cveId: string) => ['cve', cveId],
  cveStats: () => ['cveStats'],
  
  // Filter queries
  filterOptions: () => ['filterOptions'],
  
  // Analytics queries
  dashboardData: (params?: { days_back?: number; source_ids?: number[]; severities?: string[] }) => [
    'dashboardData',
    params ? JSON.stringify(params) : 'no_params',
  ],
  trendAnalysis: (params?: { period?: string; days_back?: number }) => [
    'trendAnalysis', 
    params ? JSON.stringify(params) : 'no_params',
  ],
  
  // Search queries
  globalSearch: (query: string, params?: { limit?: number; types?: string[] }) => [
    'globalSearch',
    query,
    params ? JSON.stringify(params) : 'no_params',
  ],
  
  // Export queries
  exportRules: (request: ExportRequest) => [
    'exportRules',
    JSON.stringify(request),
  ],
  
  // Health check
  health: () => ['health'],
} as const;

// --- Core Rules Query Hooks ---

export const useRulesQuery = (
  pagination: PaginationParams,
  filters?: RuleFilters,
  options?: UseQueryOptions<FetchRulesResponse, Error>
) => {
  return useQuery<FetchRulesResponse, Error>({
    queryKey: queryKeys.rules(filters, pagination),
    queryFn: async () => {
      console.log('useRulesQuery: Fetching rules with pagination:', JSON.stringify(pagination), 'filters:', JSON.stringify(filters));
      return await fetchRules(pagination, filters);
    },
    retry: 1,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
    staleTime: 1000 * 60 * 5, // 5 minutes
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
      console.log('useRuleStatsQuery: Fetching stats with filters:', JSON.stringify(filters));
      return fetchRuleStats(filters);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useRuleEnrichmentQuery = (
  filters?: RuleFilters,
  options?: UseQueryOptions<RuleEnrichmentResponse, Error>
) => {
  return useQuery<RuleEnrichmentResponse, Error>({
    queryKey: queryKeys.ruleEnrichment(filters),
    queryFn: () => fetchRuleEnrichment(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

// --- MITRE ATT&CK Query Hooks ---

export const useMitreMatrixQuery = (
  options?: UseQueryOptions<MitreMatrixData, Error>
) => {
  return useQuery<MitreMatrixData, Error>({
    queryKey: queryKeys.mitreMatrix(),
    queryFn: () => fetchMitreMatrix(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - matrix data changes rarely
    ...options,
  });
};

export const useMitreTechniquesQuery = (
  pagination?: PaginationParams,
  search?: string,
  options?: UseQueryOptions<MitreTechniquesResponse, Error>
) => {
  return useQuery<MitreTechniquesResponse, Error>({
    queryKey: queryKeys.mitreTechniques(pagination, search),
    queryFn: () => fetchMitreTechniques(pagination, search),
    enabled: !!pagination || !!search,
    staleTime: 1000 * 60 * 30, // 30 minutes
    placeholderData: keepPreviousData,
    ...options,
  });
};

export const useMitreTacticsQuery = (
  options?: UseQueryOptions<MitreTacticsResponse, Error>
) => {
  return useQuery<MitreTacticsResponse, Error>({
    queryKey: queryKeys.mitreTactics(),
    queryFn: () => fetchMitreTactics(),
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
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
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

// --- CVE Query Hooks ---

export const useCveQuery = (
  cveId: string | null,
  options?: UseQueryOptions<CveDetail, Error>
) => {
  return useQuery<CveDetail, Error>({
    queryKey: queryKeys.cveDetail(cveId!),
    queryFn: () => fetchCveById(cveId!),
    enabled: !!cveId,
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options,
  });
};

export const useCveStatsQuery = (
  options?: UseQueryOptions<CveStatsResponse, Error>
) => {
  return useQuery<CveStatsResponse, Error>({
    queryKey: queryKeys.cveStats(),
    queryFn: () => fetchCveStats(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
};

// --- Filter Options Query Hook ---

export const useFilterOptionsQuery = (
  options?: UseQueryOptions<FilterOptionsResponse, Error>
) => {
  return useQuery<FilterOptionsResponse, Error>({
    queryKey: queryKeys.filterOptions(),
    queryFn: fetchFilterOptions,
    staleTime: 1000 * 60 * 60 * 4, // 4 hours
    ...options,
  });
};

// --- Analytics Query Hooks (NEW for Phase 2) ---

export const useDashboardDataQuery = (
  params?: { days_back?: number; source_ids?: number[]; severities?: string[] },
  options?: UseQueryOptions<DashboardResponse, Error>
) => {
  return useQuery<DashboardResponse, Error>({
    queryKey: queryKeys.dashboardData(params),
    queryFn: () => fetchDashboardData(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Auto-refresh every 10 minutes
    ...options,
  });
};

export const useTrendAnalysisQuery = (
  params?: { period?: string; days_back?: number },
  options?: UseQueryOptions<TrendAnalysisResponse, Error>
) => {
  return useQuery<TrendAnalysisResponse, Error>({
    queryKey: queryKeys.trendAnalysis(params),
    queryFn: () => fetchTrendAnalysis(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

// --- Global Search Query Hook (NEW for Phase 2) ---

export const useGlobalSearchQuery = (
  query: string,
  params?: { limit?: number; types?: ('rule' | 'cve' | 'mitre_technique')[] },
  options?: UseQueryOptions<GlobalSearchResponse, Error>
) => {
  return useQuery<GlobalSearchResponse, Error>({
    queryKey: queryKeys.globalSearch(query, params),
    queryFn: () => performGlobalSearch(query, params),
    enabled: !!query && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// --- Export Query Hook (NEW for Phase 2) ---

export const useExportRulesQuery = (
  request: ExportRequest,
  enabled: boolean = false,
  options?: UseQueryOptions<ExportResponse, Error>
) => {
  return useQuery<ExportResponse, Error>({
    queryKey: queryKeys.exportRules(request),
    queryFn: () => exportRules(request),
    enabled: enabled,
    staleTime: 0, // Don't cache export requests
    ...options,
  });
};

// --- Health Check Query Hook ---

export const useHealthQuery = (
  options?: UseQueryOptions<{ status: string; version?: string }, Error>
) => {
  return useQuery<{ status: string; version?: string }, Error>({
    queryKey: queryKeys.health(),
    queryFn: () => fetchHealthStatus(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Check health every 5 minutes
    retry: 3,
    ...options,
  });
};

// --- Mutation Hooks ---

export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ruleId, payload }: { ruleId: string; payload: CreateIssuePayload }) =>
      createIssue(ruleId, payload),
    onSuccess: (data, { ruleId }) => {
      // Invalidate rule details to potentially show new issue link
      queryClient.invalidateQueries({ queryKey: queryKeys.ruleDetail(ruleId) });
      
      // Optionally invalidate dashboard data if it shows recent activity
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardData() });
    },
    onError: (error) => {
      console.error('Failed to create issue:', error);
    },
  });
};

export const useExportRulesMutation = () => {
  return useMutation({
    mutationFn: (request: ExportRequest) => exportRules(request),
    onError: (error) => {
      console.error('Failed to export rules:', error);
    },
  });
};

// --- Utility Hooks for Common Patterns ---

/**
 * Hook that combines rules query with stats for overview components
 */
export const useRulesOverviewQuery = (
  pagination: PaginationParams,
  filters?: RuleFilters
) => {
  const rulesQuery = useRulesQuery(pagination, filters);
  const statsQuery = useRuleStatsQuery(filters);
  
  return {
    rules: rulesQuery.data,
    stats: statsQuery.data,
    isLoading: rulesQuery.isLoading || statsQuery.isLoading,
    isError: rulesQuery.isError || statsQuery.isError,
    error: rulesQuery.error || statsQuery.error,
  };
};

/**
 * Hook that prefetches next page for better UX
 */
export const useRulesWithPrefetch = (
  pagination: PaginationParams,
  filters?: RuleFilters
) => {
  const queryClient = useQueryClient();
  const query = useRulesQuery(pagination, filters);
  
  // Prefetch next page if we're not on the last page
  const totalPages = query.data?.totalPages || 0;
  const currentPage = pagination.page;
  
  React.useEffect(() => {
    if (currentPage < totalPages) {
      const nextPagination = { ...pagination, page: currentPage + 1 };
      queryClient.prefetchQuery({
        queryKey: queryKeys.rules(filters, nextPagination),
        queryFn: () => fetchRules(nextPagination, filters),
        staleTime: 1000 * 60 * 2,
      });
    }
  }, [currentPage, totalPages, pagination, filters, queryClient]);
  
  return query;
};

/**
 * Hook for dashboard page that fetches all necessary data
 */
export const useDashboardQueries = (params?: {
  days_back?: number;
  source_ids?: number[];
  severities?: string[];
}) => {
  const dashboardQuery = useDashboardDataQuery(params);
  const trendQuery = useTrendAnalysisQuery({ 
    period: 'daily', 
    days_back: params?.days_back || 30 
  });
  const statsQuery = useRuleStatsQuery();
  const cveStatsQuery = useCveStatsQuery();
  
  return {
    dashboard: dashboardQuery.data,
    trends: trendQuery.data,
    ruleStats: statsQuery.data,
    cveStats: cveStatsQuery.data,
    isLoading: dashboardQuery.isLoading || trendQuery.isLoading || statsQuery.isLoading || cveStatsQuery.isLoading,
    isError: dashboardQuery.isError || trendQuery.isError || statsQuery.isError || cveStatsQuery.isError,
    error: dashboardQuery.error || trendQuery.error || statsQuery.error || cveStatsQuery.error,
    refetch: () => {
      dashboardQuery.refetch();
      trendQuery.refetch();
      statsQuery.refetch();
      cveStatsQuery.refetch();
    },
  };
};

// --- Legacy Support (Deprecated but maintained for backward compatibility) ---

/**
 * @deprecated Use useRulesQuery with techniques filter instead
 */
export const useRulesByTechniqueQuery = (
  techniqueId: string,
  pagination: PaginationParams,
  options?: UseQueryOptions<FetchRulesResponse, Error>
) => {
  console.warn('useRulesByTechniqueQuery is deprecated. Use useRulesQuery with techniques filter.');
  const filters: RuleFilters = { techniques: [techniqueId] };
  return useRulesQuery(pagination, filters, options);
};

/**
 * @deprecated Use useRulesQuery with platforms filter instead
 */
export const useRulesByPlatformQuery = (
  platform: string,
  pagination: PaginationParams,
  options?: UseQueryOptions<FetchRulesResponse, Error>
) => {
  console.warn('useRulesByPlatformQuery is deprecated. Use useRulesQuery with platforms filter.');
  const filters: RuleFilters = { platforms: [platform] };
  return useRulesQuery(pagination, filters, options);
};

// Export query keys for external use
export { queryKeys };