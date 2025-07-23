// src/api/endpoints.ts - Enhanced for Phase 2 with TypeScript fixes

import { apiGet } from './client';
import {
  RuleSummary,
  RuleDetail,
  FetchRulesResponse,
  PaginationParams,
  RuleFilters,
  TechniquesCoverageResponse,
  FetchRuleStatsResponse,
  FilterOptionsResponse,
  MitreMatrixData,
  DashboardResponse,
  TrendAnalysisResponse,
  GlobalSearchResponse,
  ExportRequest,
  ExportResponse,
  CveDetail,
  CveStatsResponse,
  RuleEnrichmentResponse,
  MitreTechniquesResponse,
  MitreTacticsResponse,
} from './types';

// --- Enhanced Endpoint Configuration ---
const ENDPOINTS = {
  // Core endpoints
  HEALTH: '/health',
  API_DOCS: '/api/docs',
  
  // Rules endpoints
  RULES: '/rules',
  RULE_BY_ID: (id: string) => `/rules/${id}`,
  RULES_STATS: '/rules/stats',
  RULES_ENRICHMENT: '/rules/enrichment',
  RULES_EXPORT: '/rules/export',
  RULE_ISSUES: (id: string) => `/rules/${id}/issues`,
  
  // MITRE endpoints
  MITRE_MATRIX: '/mitre/matrix',
  MITRE_COVERAGE: '/mitre/coverage',
  MITRE_TECHNIQUES: '/mitre/techniques',
  MITRE_TACTICS: '/mitre/tactics',
  
  // CVE endpoints
  CVES: '/cves',
  CVE_BY_ID: (id: string) => `/cves/${id}`,
  CVE_STATS: '/cves/stats',
  
  // Filter endpoints
  FILTERS_OPTIONS: '/filters/options',
  
  // Analytics endpoints
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_TRENDS: '/analytics/trends',
  
  // Search endpoints
  GLOBAL_SEARCH: '/search',
} as const;

/**
 * Enhanced query parameter building with better array handling
 */
const buildQueryParams = (
  pagination?: PaginationParams,
  filters?: RuleFilters,
  additionalParams?: Record<string, string | number | boolean | string[] | number[]>
): string => {
  const params = new URLSearchParams();

  // Add pagination parameters
  if (pagination) {
    params.append('offset', ((pagination.page - 1) * pagination.limit).toString());
    params.append('limit', pagination.limit.toString());
    
    if (pagination.sortBy) {
      params.append('sort_by', pagination.sortBy);
    }
    if (pagination.sortDirection) {
      params.append('sort_dir', pagination.sortDirection);
    }
  }

  // Add filter parameters
  if (filters) {
    // Text search
    if (filters.search?.trim()) {
      params.append('query', filters.search.trim());
    }
    
    // Array filters - append each value separately for better backend compatibility
    filters.severity?.forEach(value => params.append('severities', value));
    filters.rule_source?.forEach(value => params.append('source_ids', value));
    filters.tags?.forEach(value => params.append('tags', value));
    filters.platforms?.forEach(value => params.append('platforms', value));
    filters.rule_platform?.forEach(value => params.append('rule_platforms', value));
    filters.tactics?.forEach(value => params.append('tactics', value));
    filters.techniques?.forEach(value => params.append('techniques', value));
    filters.mitre_techniques?.forEach(value => params.append('mitre_techniques', value));
    filters.cve_ids?.forEach(value => params.append('cve_ids', value));
    filters.validation_status?.forEach(value => params.append('validation_statuses', value));
    filters.enrichment_status?.forEach(value => params.append('enrichment_status', value));
    
    // Boolean filters
    if (filters.is_active !== undefined) {
      params.append('is_active', filters.is_active.toString());
    }
    
    // Date range filters
    if (filters.dateRange?.start) {
      params.append('start_date', filters.dateRange.start);
    }
    if (filters.dateRange?.end) {
      params.append('end_date', filters.dateRange.end);
    }
  }
  
  // Add any additional parameters
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// --- Core Rule Operations ---

/**
 * Fetch rules with enhanced filtering and pagination
 */
export const fetchRules = async (
  pagination: PaginationParams,
  filters?: RuleFilters
): Promise<FetchRulesResponse> => {
  try {
    const queryString = buildQueryParams(pagination, filters);
    const url = `${ENDPOINTS.RULES}${queryString}`;
    
    console.log('Fetching rules with URL:', url);
    
    const response = await apiGet<{
      items: RuleSummary[];
      total: number;
      limit: number;
      offset: number;
    }>(url);
    
    return {
      rules: response.items,
      total: response.total,
      limit: response.limit,
      page: Math.floor(response.offset / response.limit) + 1,
      totalPages: Math.ceil(response.total / response.limit),
    };
  } catch (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }
};

/**
 * Fetch a single rule by ID with full details
 */
export const fetchRuleById = async (id: string): Promise<RuleDetail> => {
  try {
    return await apiGet<RuleDetail>(ENDPOINTS.RULE_BY_ID(id));
  } catch (error) {
    console.error(`Error fetching rule with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch rule statistics with optional filtering
 */
export const fetchRuleStats = async (filters?: RuleFilters): Promise<FetchRuleStatsResponse> => {
  try {
    const queryString = buildQueryParams(undefined, filters);
    const url = `${ENDPOINTS.RULES_STATS}${queryString}`;
    
    console.log('Fetching rule stats from URL:', url);
    return await apiGet<FetchRuleStatsResponse>(url);
  } catch (error) {
    console.error('Error fetching rule statistics:', error);
    throw error;
  }
};

/**
 * Fetch rule enrichment statistics
 */
export const fetchRuleEnrichment = async (filters?: RuleFilters): Promise<RuleEnrichmentResponse> => {
  try {
    const queryString = buildQueryParams(undefined, filters);
    const url = `${ENDPOINTS.RULES_ENRICHMENT}${queryString}`;
    
    return await apiGet<RuleEnrichmentResponse>(url);
  } catch (error) {
    console.error('Error fetching rule enrichment statistics:', error);
    throw error;
  }
};

/**
 * Export rules in specified format
 */
export const exportRules = async (request: ExportRequest): Promise<ExportResponse> => {
  try {
    const params: Record<string, string | number | boolean | string[]> = {
      format: request.format,
      ...request.filters,
    };
    
    if (request.fields?.length) {
      params.fields = request.fields;
    }
    
    const queryString = buildQueryParams(undefined, undefined, params);
    const url = `${ENDPOINTS.RULES_EXPORT}${queryString}`;
    
    return await apiGet<ExportResponse>(url);
  } catch (error) {
    console.error('Error exporting rules:', error);
    throw error;
  }
};

// --- MITRE ATT&CK Operations ---

/**
 * Fetch MITRE ATT&CK matrix data
 */
export const fetchMitreMatrix = async (): Promise<MitreMatrixData> => {
  try {
    return await apiGet<MitreMatrixData>(ENDPOINTS.MITRE_MATRIX);
  } catch (error) {
    console.error('Error fetching MITRE matrix:', error);
    throw error;
  }
};

/**
 * Fetch technique coverage analysis
 */
export const fetchTechniqueCoverage = async (
  platform?: string | null,
  rulePlatform?: string | null
): Promise<TechniquesCoverageResponse> => {
  try {
    const params: Record<string, string> = {};
    if (platform) params.platform = platform;
    if (rulePlatform) params.rule_platform = rulePlatform;
    
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const url = `${ENDPOINTS.MITRE_COVERAGE}${queryString}`;
    
    console.log('Fetching technique coverage with URL:', url);
    return await apiGet<TechniquesCoverageResponse>(url);
  } catch (error) {
    console.error('Error fetching technique coverage:', error);
    throw error;
  }
};

/**
 * Fetch MITRE techniques with pagination
 */
export const fetchMitreTechniques = async (
  pagination?: PaginationParams,
  search?: string
): Promise<MitreTechniquesResponse> => {
  try {
    const params: Record<string, string | number> = {};
    
    if (pagination) {
      params.offset = (pagination.page - 1) * pagination.limit;
      params.limit = pagination.limit;
    }
    
    if (search?.trim()) {
      params.search = search.trim();
    }
    
    const queryString = buildQueryParams(undefined, undefined, params);
    const url = `${ENDPOINTS.MITRE_TECHNIQUES}${queryString}`;
    
    return await apiGet<MitreTechniquesResponse>(url);
  } catch (error) {
    console.error('Error fetching MITRE techniques:', error);
    throw error;
  }
};

/**
 * Fetch MITRE tactics
 */
export const fetchMitreTactics = async (): Promise<MitreTacticsResponse> => {
  try {
    return await apiGet<MitreTacticsResponse>(ENDPOINTS.MITRE_TACTICS);
  } catch (error) {
    console.error('Error fetching MITRE tactics:', error);
    throw error;
  }
};

// --- CVE Operations ---

/**
 * Fetch CVE details by ID
 */
export const fetchCveById = async (cveId: string): Promise<CveDetail> => {
  try {
    return await apiGet<CveDetail>(ENDPOINTS.CVE_BY_ID(cveId));
  } catch (error) {
    console.error(`Error fetching CVE ${cveId}:`, error);
    throw error;
  }
};

/**
 * Fetch CVE statistics
 */
export const fetchCveStats = async (): Promise<CveStatsResponse> => {
  try {
    return await apiGet<CveStatsResponse>(ENDPOINTS.CVE_STATS);
  } catch (error) {
    console.error('Error fetching CVE statistics:', error);
    throw error;
  }
};

// --- Filter Operations ---

/**
 * Fetch available filter options with counts
 */
export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  try {
    return await apiGet<FilterOptionsResponse>(ENDPOINTS.FILTERS_OPTIONS);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};

// --- Analytics Operations ---

/**
 * Fetch dashboard analytics data
 */
export const fetchDashboardData = async (params?: {
  days_back?: number;
  source_ids?: number[];
  severities?: string[];
}): Promise<DashboardResponse> => {
  try {
    const queryString = buildQueryParams(undefined, undefined, params);
    const url = `${ENDPOINTS.ANALYTICS_DASHBOARD}${queryString}`;
    
    return await apiGet<DashboardResponse>(url);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Fetch trend analysis data
 */
export const fetchTrendAnalysis = async (params?: {
  period?: string;
  days_back?: number;
}): Promise<TrendAnalysisResponse> => {
  try {
    const queryString = buildQueryParams(undefined, undefined, params);
    const url = `${ENDPOINTS.ANALYTICS_TRENDS}${queryString}`;
    
    return await apiGet<TrendAnalysisResponse>(url);
  } catch (error) {
    console.error('Error fetching trend analysis:', error);
    throw error;
  }
};

// --- Search Operations ---

/**
 * Perform global search across all entities
 */
export const performGlobalSearch = async (query: string, params?: {
  limit?: number;
  types?: ('rule' | 'cve' | 'mitre_technique')[];
}): Promise<GlobalSearchResponse> => {
  try {
    const searchParams = { query, ...params };
    const queryString = buildQueryParams(undefined, undefined, searchParams);
    const url = `${ENDPOINTS.GLOBAL_SEARCH}${queryString}`;
    
    return await apiGet<GlobalSearchResponse>(url);
  } catch (error) {
    console.error('Error performing global search:', error);
    throw error;
  }
};

// --- Health Check ---

/**
 * API health check
 */
export const fetchHealthStatus = async (): Promise<{ status: string; version?: string }> => {
  try {
    return await apiGet<{ status: string; version?: string }>(ENDPOINTS.HEALTH);
  } catch (error) {
    console.error('Error fetching health status:', error);
    throw error;
  }
};

// --- Legacy Support Functions ---
// These maintain compatibility while components are migrated

/**
 * @deprecated Use fetchRules with technique filter instead
 */
export const fetchRulesByTechnique = async (
  techniqueId: string,
  pagination?: PaginationParams
): Promise<FetchRulesResponse> => {
  console.warn('fetchRulesByTechnique is deprecated. Use fetchRules with techniques filter.');
  const filters: RuleFilters = { techniques: [techniqueId] };
  return fetchRules(pagination || { page: 1, limit: 25 }, filters);
};

/**
 * @deprecated Use fetchRules with platform filter instead
 */
export const fetchRulesByPlatform = async (
  platform: string,
  pagination?: PaginationParams
): Promise<FetchRulesResponse> => {
  console.warn('fetchRulesByPlatform is deprecated. Use fetchRules with platforms filter.');
  const filters: RuleFilters = { platforms: [platform] };
  return fetchRules(pagination || { page: 1, limit: 25 }, filters);
};

// Export endpoint paths for direct use if needed
export { ENDPOINTS };