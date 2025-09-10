// src/api/queries.ts

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseQueryOptions, 
  UseMutationOptions,
  keepPreviousData,
  UseQueryResult
} from '@tanstack/react-query';
import { apiGet } from './client';

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
  
  // Deprecation management endpoints
  fetchDeprecationStats,
  fetchRulesWithDeprecatedTechniques,
  checkRuleDeprecation,
  updateDeprecatedMappings,

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
  DeprecationStatistics,
  AffectedRulesResponse,
  RuleDeprecationCheck,
  UpdateMappingsOptions,
  UpdateMappingsResponse,
  DeprecatedTechniqueWarning,
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

  // Deprecation management
  deprecationStats: () => ['deprecation', 'stats'] as const,
  deprecatedRules: () => ['deprecated', 'rules'] as const,
  ruleDeprecationCheck: (ruleId: string) => ['rule', ruleId, 'deprecation'] as const,

  // CVEs
  cves: (pagination: PaginationParams, filters?: { severities?: string[]; with_rules_only?: boolean; query?: string }) => [
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
  options?: UseQueryOptions<Record<string, unknown>, Error>
) => {
  return useQuery<Record<string, unknown>, Error>({
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
    queryFn: () => fetchMitreMatrix(), // Wrap in arrow function
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
  pagination?: PaginationParams,
  search?: string,
  options?: UseQueryOptions<{ techniques: MitreTechnique[]; total: number }, Error>
) => {
  return useQuery<{ techniques: MitreTechnique[]; total: number }, Error>({
    queryKey: queryKeys.mitreTechniques(pagination, search),
    queryFn: () => fetchMitreTechniques(pagination, search),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};


// --- DEPRECATION QUERY HOOKS ---

/**
 * Hook for deprecation statistics
 */
export const useDeprecationStatsQuery = (
  options?: UseQueryOptions<DeprecationStatistics, Error>
) => {
  return useQuery<DeprecationStatistics, Error>({
    queryKey: queryKeys.deprecationStats(),
    queryFn: fetchDeprecationStats,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...options,
  });
};

/**
 * Hook for fetching rules with deprecated techniques
 */
export const useRulesWithDeprecatedQuery = (
  options?: UseQueryOptions<AffectedRulesResponse, Error>
) => {
  return useQuery<AffectedRulesResponse, Error>({
    queryKey: queryKeys.deprecatedRules(),
    queryFn: fetchRulesWithDeprecatedTechniques,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    ...options,
  });
};

/**
 * Hook for checking specific rule deprecation status
 * Integrates with existing rule detail data
 */
export const useRuleDeprecationCheck = (
  ruleId: string | null,
  options?: UseQueryOptions<RuleDeprecationCheck, Error>
) => {
  return useQuery<RuleDeprecationCheck, Error>({
    queryKey: queryKeys.ruleDeprecationCheck(ruleId!),
    queryFn: () => checkRuleDeprecation(ruleId!),
    enabled: !!ruleId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    ...options,
  });
};

// Hook for fetching system-wide deprecation statistics
export const useDeprecationStats = (
  options?: UseQueryOptions<DeprecationStatistics, Error>
) => {
  return useQuery<DeprecationStatistics, Error>({
    queryKey: queryKeys.deprecationStats(),
    queryFn: fetchDeprecationStats,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    ...options,
  });
};

/**
 * Mutation hook for updating deprecated mappings
 */
export const useUpdateDeprecatedMappings = (
  options?: UseMutationOptions<UpdateMappingsResponse, Error, UpdateMappingsOptions>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateMappingsResponse, Error, UpdateMappingsOptions>({
    mutationFn: updateDeprecatedMappings,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries after successful update
      queryClient.invalidateQueries({
        queryKey: queryKeys.deprecationStats(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.deprecatedRules(),
      });
      
      // Invalidate specific rule queries if rule IDs were provided
      if (variables.rule_ids?.length) {
        variables.rule_ids.forEach(ruleId => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.ruleDetail(ruleId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.ruleDeprecationCheck(ruleId),
          });
        });
      }
      
      // Invalidate all rules queries to reflect updates
      queryClient.invalidateQueries({
        queryKey: ['rules'],
      });
    },
    ...options,
  });
};

// --- HELPER HOOKS ---

/**
 * Combined hook for rule detail with deprecation check
 * Fetches both rule details and deprecation status in parallel
 */
export const useRuleWithDeprecationCheck = (
  ruleId: string | null,
  options?: {
    ruleOptions?: UseQueryOptions<RuleDetail, Error>;
    deprecationOptions?: UseQueryOptions<RuleDeprecationCheck, Error>;
  }
) => {
  const ruleQuery = useRuleQuery(ruleId, options?.ruleOptions);
  const deprecationQuery = useRuleDeprecationCheck(ruleId, options?.deprecationOptions);
  
  return {
    rule: ruleQuery.data,
    deprecation: deprecationQuery.data,
    isLoading: ruleQuery.isLoading || deprecationQuery.isLoading,
    isError: ruleQuery.isError || deprecationQuery.isError,
    error: ruleQuery.error || deprecationQuery.error,
  };
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

// Dashboard data types
export interface DashboardOverview {
  total_rules: number;
  active_rules: number;
  inactive_rules: number;
  mitre_coverage: {
    rules_with_mitre: number;
    techniques_covered: number;
    total_techniques: number;
    coverage_percentage: number;
  };
  cve_coverage: {
    rules_with_cves: number;
    coverage_percentage: number;
  };
}

export interface DashboardCharts {
  severity_distribution: Array<{ name: string; value: number }>;
  rules_by_source: Array<{ name: string; value: number }>;
  mitre_tactic_coverage: Array<{ tactic: string; rules: number }>;
}

export interface DashboardRecentActivity {
  recent_rules: Array<{
    rule_id: string;
    name: string;
    severity: string;
    created_date: string;
  }>;
  recent_updates: Array<{
    rule_id: string;
    name: string;
    severity: string;
    updated_date: string;
  }>;
}

export interface DashboardAlert {
  type: 'info' | 'warning' | 'error';
  message: string;
  count?: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  charts: DashboardCharts;
  recent_activity: DashboardRecentActivity;
  alerts: DashboardAlert[];
  metadata: {
    generated_at: string;
    filters_applied: Record<string, any>;
  };
}

export interface DashboardFilters {
  days_back?: number;
  source_ids?: number[];
  severities?: string[];
}

// Dashboard data query hook
export const useDashboardQuery = (
  filters?: DashboardFilters
): UseQueryResult<DashboardData, Error> => {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard', filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters?.days_back) params.days_back = filters.days_back;
      if (filters?.source_ids) params.source_ids = filters.source_ids;
      if (filters?.severities) params.severities = filters.severities;
      
      return apiGet<DashboardData>('/analytics/dashboard', params);
    },
    staleTime: 60000,
    refetchInterval: 300000,
  });
};

export const useTrendAnalysisQuery = (
  days_back: number = 30
): UseQueryResult<TrendData, Error> => {
  return useQuery<TrendData, Error>({
    queryKey: ['trends', days_back],
    queryFn: async () => {
      return apiGet<TrendData>('/analytics/trends', { days_back });
    },
    staleTime: 300000,
  });
};

// Trend analysis query hook
export interface TrendData {
  period_days: number;
  daily_stats: Array<{
    date: string;
    rules_created: number;
    rules_updated: number;
    total_activity: number;
  }>;
  summary: {
    total_created: number;
    total_updated: number;
    most_active_day: string | null;
  };
}


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

// FIX 1: Changed TrendData to TrendData[] to match the return type of fetchTrendData
export const useTrendDataQuery = (
  period?: string,
  startDate?: string,
  endDate?: string,
  options?: UseQueryOptions<TrendData[], Error>
) => {
  return useQuery<TrendData[], Error>({
    queryKey: queryKeys.trendData(period, startDate, endDate),
    queryFn: () => fetchTrendData(period, startDate, endDate),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// --- MUTATION HOOKS ---

// FIX 2: Updated to match the createIssue function signature that only takes payload
export const useCreateIssueMutation = (
  options?: UseMutationOptions<CreateIssueResponse, Error, CreateIssuePayload>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateIssueResponse, Error, CreateIssuePayload>({
    mutationFn: (payload) => createIssue(payload),
    onSuccess: (data, variables) => {
      // Invalidate the rule detail query for the affected rule
      if (variables.rule_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.ruleDetail(variables.rule_id),
        });
      }
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