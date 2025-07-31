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
  fetchMitreTactics,
  
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

// Define proper error type instead of any
interface QueryError extends Error {
  status?: number;
}

// Define proper types for enrichment stats response
interface EnrichmentStatsResponse {
  total_rules: number;
  rules_with_mitre: number;
  rules_with_cves: number;
  average_enrichment_score: number;
  total_mitre_techniques_covered: number;
  total_cves_referenced: number;
}

// --- ENHANCED QUERY KEYS ---
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
  ruleEnrichmentStats: (filters?: RuleFilters) => [
    'ruleEnrichmentStats',
    filters ? JSON.stringify(filters) : 'no_filters',
  ],
  
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
  mitreTactics: () => ['mitreTactics'],
  
  // CVEs
  cves: (pagination: PaginationParams, search?: string, severity?: string[]) => [
    'cves',
    JSON.stringify(pagination),
    search ?? 'no_search',
    severity ? JSON.stringify(severity) : 'no_severity_filter',
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
  
  // Export
  exportRules: (options: ExportOptions) => [
    'exportRules',
    JSON.stringify(options),
  ],
};

// --- CORE RULES QUERY HOOKS ---

/**
 * Enhanced rules query with better error handling and debugging
 */
export const useRulesQuery = (
  pagination: PaginationParams,
  filters?: RuleFilters,
  options?: UseQueryOptions<FetchRulesResponse, Error>
) => {
  return useQuery<FetchRulesResponse, Error>({
    queryKey: queryKeys.rules(filters, pagination),
    queryFn: async () => {
      console.log('useRulesQuery: Executing query with:', {
        pagination: JSON.stringify(pagination),
        filters: JSON.stringify(filters),
      });
      
      const result = await fetchRules(pagination, filters);
      
      console.log('useRulesQuery: Query completed:', {
        rulesCount: result.rules?.length || 0,
        total: result.total,
        page: result.page,
        hasFilters: !!filters,
      });
      
      return result;
    },
    retry: (failureCount, error: QueryError) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    placeholderData: keepPreviousData, // Smooth pagination UX
    staleTime: 5 * 60 * 1000, // 5 minutes - rules don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    ...options,
  });
};

/**
 * Single rule query with enhanced error handling
 */
export const useRuleQuery = (
  id: string | null,
  options?: UseQueryOptions<RuleDetail, Error>
) => {
  return useQuery<RuleDetail, Error>({
    queryKey: queryKeys.ruleDetail(id!),
    queryFn: async () => {
      if (!id) {
        throw new Error('Rule ID is required');
      }
      
      console.log('useRuleQuery: Starting fetch for rule:', {
        id,
        timestamp: new Date().toISOString()
      });
      
      const result = await fetchRuleById(id);
      
      console.log('useRuleQuery: Successfully fetched rule:', {
        id: result.id,
        source_rule_id: result.source_rule_id, // Fixed: use correct property name
        title: result.title // Fixed: use correct property name
      });
      
      return result;
    },
    enabled: !!id,
    retry: (failureCount, error: QueryError) => {
      console.log('useRuleQuery: Retry attempt:', {
        failureCount,
        errorStatus: error?.status,
        shouldRetry: error?.status !== 404 && failureCount < 2
      });
      
      // Don't retry on 404 errors (rule not found)
      if (error?.status === 404) {
        return false;
      }
      // Don't retry on other 4xx errors (client errors)
      if (error?.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Enhanced rule statistics query
 */
export const useRuleStatsQuery = (
  filters?: RuleFilters,
  options?: UseQueryOptions<FetchRuleStatsResponse, Error>
) => {
  return useQuery<FetchRuleStatsResponse, Error>({
    queryKey: queryKeys.ruleStats(filters),
    queryFn: async () => {
      console.log('useRuleStatsQuery: Fetching stats with filters:', JSON.stringify(filters));
      const result = await fetchRuleStats(filters);
      console.log('useRuleStatsQuery: Stats fetched successfully');
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - stats can change more frequently
    ...options,
  });
};

/**
 * Rule enrichment statistics query with proper typing
 */
export const useRuleEnrichmentStatsQuery = (
  filters?: RuleFilters,
  options?: UseQueryOptions<EnrichmentStatsResponse, Error>
) => {
  return useQuery<EnrichmentStatsResponse, Error>({
    queryKey: queryKeys.ruleEnrichmentStats(filters),
    queryFn: async () => {
      console.log('useRuleEnrichmentStatsQuery: Fetching enrichment stats');
      return await fetchRuleEnrichmentStats(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// --- MITRE ATT&CK QUERY HOOKS ---

/**
 * Enhanced MITRE matrix query
 */
export const useMitreMatrixQuery = (
  options?: UseQueryOptions<MitreMatrixData, Error>
) => {
  return useQuery<MitreMatrixData, Error>({
    queryKey: queryKeys.mitreMatrix(),
    queryFn: async () => {
      console.log('useMitreMatrixQuery: Fetching MITRE matrix');
      const result = await fetchMitreMatrix();
      console.log('useMitreMatrixQuery: Matrix fetched successfully');
      return result;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - MITRE data is relatively stable
    ...options,
  });
};

/**
 * Enhanced techniques coverage query
 */
export const useTechniqueCoverageQuery = (
  platform?: string | null,
  rulePlatform?: string | null,
  options?: UseQueryOptions<TechniquesCoverageResponse, Error>
) => {
  return useQuery<TechniquesCoverageResponse, Error>({
    queryKey: queryKeys.techniquesCoverage(platform, rulePlatform),
    queryFn: async () => {
      console.log('useTechniqueCoverageQuery: Fetching coverage data');
      const result = await fetchTechniqueCoverage(platform, rulePlatform);
      console.log('useTechniqueCoverageQuery: Coverage data fetched successfully');
      return result;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * MITRE techniques query with pagination
 */
export const useMitreTechniquesQuery = (
  pagination: PaginationParams,
  search?: string,
  options?: UseQueryOptions<{ techniques: MitreTechnique[]; total: number }, Error>
) => {
  return useQuery<{ techniques: MitreTechnique[]; total: number }, Error>({
    queryKey: queryKeys.mitreTechniques(pagination, search),
    queryFn: () => fetchMitreTechniques(pagination, search),
    placeholderData: keepPreviousData,
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

/**
 * MITRE tactics query
 */
export const useMitreTacticsQuery = (
  options?: UseQueryOptions<MitreMatrixData, Error>
) => {
  return useQuery<MitreMatrixData, Error>({
    queryKey: queryKeys.mitreTactics(),
    queryFn: fetchMitreTactics,
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

// --- CVE QUERY HOOKS ---

/**
 * CVEs query with pagination and filtering
 */
export const useCvesQuery = (
  pagination: PaginationParams,
  search?: string,
  severity?: string[],
  options?: UseQueryOptions<{ cves: CveData[]; total: number }, Error>
) => {
  return useQuery<{ cves: CveData[]; total: number }, Error>({
    queryKey: queryKeys.cves(pagination, search, severity),
    queryFn: () => fetchCves(pagination, search, severity),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Single CVE query
 */
export const useCveQuery = (
  id: string,
  options?: UseQueryOptions<CveData, Error>
) => {
  return useQuery<CveData, Error>({
    queryKey: queryKeys.cveDetail(id),
    queryFn: () => fetchCveById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes - CVE data doesn't change frequently
    ...options,
  });
};

/**
 * CVE statistics query
 */
export const useCveStatsQuery = (
  options?: UseQueryOptions<CveStats, Error>
) => {
  return useQuery<CveStats, Error>({
    queryKey: queryKeys.cveStats(),
    queryFn: fetchCveStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// --- FILTER AND SEARCH QUERY HOOKS ---

/**
 * Filter options query
 */
export const useFilterOptionsQuery = (
  options?: UseQueryOptions<FilterOptionsResponse, Error>
) => {
  return useQuery<FilterOptionsResponse, Error>({
    queryKey: queryKeys.filterOptions(),
    queryFn: fetchFilterOptions,
    staleTime: 30 * 60 * 1000, // 30 minutes - filter options are relatively stable
    ...options,
  });
};

/**
 * Global search query
 */
export const useGlobalSearchQuery = (
  query: string,
  pagination?: PaginationParams,
  types?: string[],
  options?: UseQueryOptions<GlobalSearchResponse, Error>
) => {
  return useQuery<GlobalSearchResponse, Error>({
    queryKey: queryKeys.globalSearch(query, pagination, types),
    queryFn: () => globalSearch(query, pagination, types),
    enabled: query.length >= 2, // Only search with 2+ characters
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000, // 2 minutes - search results can change
    ...options,
  });
};

// --- ANALYTICS QUERY HOOKS ---

/**
 * Dashboard data query
 */
export const useDashboardDataQuery = (
  options?: UseQueryOptions<DashboardStats, Error>
) => {
  return useQuery<DashboardStats, Error>({
    queryKey: queryKeys.dashboardData(),
    queryFn: async () => {
      console.log('useDashboardDataQuery: Fetching dashboard data');
      const result = await fetchDashboardData();
      console.log('useDashboardDataQuery: Dashboard data fetched successfully');
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data should be relatively fresh
    ...options,
  });
};

/**
 * Trend data query
 */
export const useTrendDataQuery = (
  period?: string,
  startDate?: string,
  endDate?: string,
  options?: UseQueryOptions<TrendData, Error>
) => {
  return useQuery<TrendData, Error>({
    queryKey: queryKeys.trendData(period, startDate, endDate),
    queryFn: () => fetchTrendData(period, startDate, endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// --- MUTATION HOOKS ---

/**
 * Enhanced create issue mutation
 */
export const useCreateIssueMutation = (
  options?: UseMutationOptions<CreateIssueResponse, Error, { ruleId: string; payload: CreateIssuePayload }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateIssueResponse, Error, { ruleId: string; payload: CreateIssuePayload }>({
    mutationFn: async ({ ruleId, payload }) => {
      console.log('useCreateIssueMutation: Creating issue for rule:', ruleId);
      const result = await createIssue(ruleId, payload);
      console.log('useCreateIssueMutation: Issue created successfully');
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate rule detail query to refresh the rule data
      queryClient.invalidateQueries({
        queryKey: queryKeys.ruleDetail(variables.ruleId),
      });
      
      console.log('Issue created successfully:', data.issue_url);
    },
    onError: (error) => {
      console.error('Failed to create issue:', error);
    },
    ...options,
  });
};

/**
 * Legacy alias for backward compatibility
 */
export const useCreateIssue = useCreateIssueMutation;

/**
 * Export rules mutation
 */
export const useExportRulesMutation = (
  options?: UseMutationOptions<ExportResponse, Error, ExportOptions>
) => {
  return useMutation<ExportResponse, Error, ExportOptions>({
    mutationFn: async (exportOptions) => {
      console.log('useExportRulesMutation: Exporting rules with options:', exportOptions);
      const result = await exportRules(exportOptions);
      console.log('useExportRulesMutation: Export initiated successfully');
      return result;
    },
    onError: (error) => {
      console.error('Failed to export rules:', error);
    },
    ...options,
  });
};

// --- UTILITY HOOKS ---

/**
 * Hook to refresh all related queries when data changes
 */
export const useRefreshQueries = () => {
  const queryClient = useQueryClient();
  
  const refreshRulesData = () => {
    queryClient.invalidateQueries({ queryKey: ['rules'] });
    queryClient.invalidateQueries({ queryKey: ['ruleStats'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    queryClient.invalidateQueries({ queryKey: ['techniquesCoverage'] });
  };
  
  const refreshMitreData = () => {
    queryClient.invalidateQueries({ queryKey: ['mitreMatrix'] });
    queryClient.invalidateQueries({ queryKey: ['mitreTechniques'] });
    queryClient.invalidateQueries({ queryKey: ['mitreTactics'] });
    queryClient.invalidateQueries({ queryKey: ['techniquesCoverage'] });
  };
  
  const refreshAllData = () => {
    queryClient.invalidateQueries();
  };
  
  return {
    refreshRulesData,
    refreshMitreData,
    refreshAllData,
  };
};

/**
 * Hook for prefetching related data
 */
export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();
  
  const prefetchRuleDetail = (ruleId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.ruleDetail(ruleId),
      queryFn: () => fetchRuleById(ruleId),
      staleTime: 10 * 60 * 1000,
    });
  };
  
  const prefetchFilterOptions = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.filterOptions(),
      queryFn: fetchFilterOptions,
      staleTime: 15 * 60 * 1000,
    });
  };
  
  return {
    prefetchRuleDetail,
    prefetchFilterOptions,
  };
};

// --- CUSTOM HOOKS FOR COMPLEX SCENARIOS ---

/**
 * Combined hook for dashboard page data
 */
export const useDashboardQueries = () => {
  const dashboardData = useDashboardDataQuery();
  const ruleStats = useRuleStatsQuery();
  const techniquesCoverage = useTechniqueCoverageQuery();
  const cveStats = useCveStatsQuery();
  
  return {
    dashboardData,
    ruleStats,
    techniquesCoverage,
    cveStats,
    isLoading: dashboardData.isLoading || ruleStats.isLoading || techniquesCoverage.isLoading || cveStats.isLoading,
    isError: dashboardData.isError || ruleStats.isError || techniquesCoverage.isError || cveStats.isError,
    error: dashboardData.error || ruleStats.error || techniquesCoverage.error || cveStats.error,
  };
};

/**
 * Combined hook for rules explorer page
 */
export const useRulesExplorerQueries = (
  pagination: PaginationParams,
  filters?: RuleFilters
) => {
  const rules = useRulesQuery(pagination, filters);
  const ruleStats = useRuleStatsQuery(filters);
  const filterOptions = useFilterOptionsQuery();
  
  return {
    rules,
    ruleStats,
    filterOptions,
    isLoading: rules.isLoading || ruleStats.isLoading || filterOptions.isLoading,
    isError: rules.isError || ruleStats.isError || filterOptions.isError,
    error: rules.error || ruleStats.error || filterOptions.error,
  };
};