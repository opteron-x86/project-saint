// src/api/endpoints.ts

import { apiGet, apiPost } from './client';
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
  DashboardStats,
  TrendData,
  ExportOptions,
  ExportResponse,
  GlobalSearchResponse,
  CveData,
  CveStats,
} from './types';

// Base endpoint paths - Updated with all new enhanced endpoints
const ENDPOINTS = {
  // Core rules endpoints
  RULES: '/rules',
  RULE_BY_ID: (id: string) => `/rules/${id}`,
  RULES_STATS: '/rules/stats',
  RULES_ENRICHMENT: '/rules/enrichment',
  RULES_EXPORT: '/rules/export',
  
  // MITRE ATT&CK endpoints
  MITRE_MATRIX: '/mitre/matrix',
  MITRE_COVERAGE: '/mitre/coverage',
  MITRE_TECHNIQUES: '/mitre/techniques',
  MITRE_TACTICS: '/mitre/tactics',
  
  // CVE endpoints
  CVES: '/cves',
  CVE_BY_ID: (id: string) => `/cves/${id}`,
  CVE_STATS: '/cves/stats',
  
  // Filter and search endpoints
  FILTERS_OPTIONS: '/filters/options',
  GLOBAL_SEARCH: '/search',
  
  // Analytics and dashboard endpoints
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_TRENDS: '/analytics/trends',
  
  // Legacy endpoints (keeping for compatibility)
  TECHNIQUES_COVERAGE: '/techniques/coverage',
  STATS: '/rules/stats',
};

/**
 * Convert filters and pagination to query parameters.
 * Fixed parameter mapping to match the enhanced backend API.
 */
const buildQueryParams = (
  pagination?: PaginationParams,
  filters?: RuleFilters,
): string => {
  const params = new URLSearchParams();

  // Pagination parameters
  if (pagination) {
    params.append('offset', ((pagination.page - 1) * pagination.limit).toString());
    params.append('limit', pagination.limit.toString());
    
    if (pagination.sortBy) params.append('sort_by', pagination.sortBy);
    if (pagination.sortDirection) params.append('sort_dir', pagination.sortDirection);
    if (pagination.include_facets) params.append('include_facets', 'true');
  }

  // Filter parameters - Fixed to match backend API expectations
  if (filters) {
    // Text search parameters
    if (filters.search) params.append('search', filters.search);
    if (filters.query) params.append('query', filters.query);
    
    // Multi-value filters - using correct parameter names
    filters.severity?.forEach(value => params.append('severities', value));
    filters.platforms?.forEach(value => params.append('platforms', value));
    filters.rule_platform?.forEach(value => params.append('rule_platforms', value));
    filters.rule_source?.forEach(value => params.append('rule_sources', value));
    filters.tactics?.forEach(value => params.append('tactics', value));
    filters.tags?.forEach(value => params.append('tags', value));
    
    // New enhanced filters
    filters.mitre_techniques?.forEach(value => params.append('mitre_techniques', value));
    filters.cve_ids?.forEach(value => params.append('cve_ids', value));
    filters.validation_status?.forEach(value => params.append('validation_statuses', value));
    
    // Boolean filters
    if (filters.has_mitre_mapping !== undefined) {
      params.append('has_mitre_mapping', filters.has_mitre_mapping.toString());
    }
    if (filters.has_cve_references !== undefined) {
      params.append('has_cve_references', filters.has_cve_references.toString());
    }
    if (filters.is_active !== undefined) {
      params.append('is_active', filters.is_active.toString());
    }
    
    // Range filters
    if (filters.enrichment_score_min !== undefined) {
      params.append('enrichment_score_min', filters.enrichment_score_min.toString());
    }
    
    // Date filters
    if (filters.created_after) params.append('created_after', filters.created_after);
    if (filters.modified_after) params.append('modified_after', filters.modified_after);
    
    // Date range filter
    if (filters.dateRange) {
      if (filters.dateRange.start) params.append('date_start', filters.dateRange.start);
      if (filters.dateRange.end) params.append('date_end', filters.dateRange.end);
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// --- CORE RULES ENDPOINTS ---

/**
 * Fetch rules with pagination and filtering - Enhanced with new API capabilities
 */
export const fetchRules = async (
  pagination: PaginationParams,
  filters?: RuleFilters
): Promise<FetchRulesResponse> => {
  try {
    const queryString = buildQueryParams(pagination, filters);
    const url = `${ENDPOINTS.RULES}${queryString}`;
    
    console.log('fetchRules: Making request to:', url);
    
    const response = await apiGet<FetchRulesResponse>(url);
    
    console.log('fetchRules: Response received:', {
      rulesCount: response.rules?.length || 0,
      total: response.total,
      page: response.page,
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }
};

/**
 * Fetch a rule by ID - Enhanced with enrichment data
 */
export const fetchRuleById = async (id: string): Promise<RuleDetail> => {
  try {
    console.log('fetchRuleById: Fetching rule:', id);
    const response = await apiGet<RuleDetail>(ENDPOINTS.RULE_BY_ID(id));
    console.log('fetchRuleById: Rule fetched successfully');
    return response;
  } catch (error) {
    console.error(`Error fetching rule with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch rule statistics - Enhanced with enrichment statistics
 */
export const fetchRuleStats = async (filters?: RuleFilters): Promise<FetchRuleStatsResponse> => {
  try {
    const queryString = buildQueryParams(undefined, filters);
    const url = `${ENDPOINTS.RULES_STATS}${queryString}`;
    
    console.log('fetchRuleStats: Making request to:', url);
    const response = await apiGet<FetchRuleStatsResponse>(url);
    console.log('fetchRuleStats: Stats fetched successfully');
    return response;
  } catch (error) {
    console.error('Error fetching rule statistics:', error);
    throw error;
  }
};

/**
 * Fetch rule enrichment statistics - NEW ENDPOINT
 */
export const fetchRuleEnrichmentStats = async (filters?: RuleFilters): Promise<any> => {
  try {
    const queryString = buildQueryParams(undefined, filters);
    const url = `${ENDPOINTS.RULES_ENRICHMENT}${queryString}`;
    
    console.log('fetchRuleEnrichmentStats: Making request to:', url);
    return await apiGet<any>(url);
  } catch (error) {
    console.error('Error fetching rule enrichment statistics:', error);
    throw error;
  }
};

/**
 * Export rules data - NEW ENDPOINT
 */
export const exportRules = async (options: ExportOptions): Promise<ExportResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('format', options.format);
    
    if (options.include_enrichment_data) params.append('include_enrichment_data', 'true');
    if (options.include_rule_content) params.append('include_rule_content', 'true');
    
    // Add filters if provided
    if (options.filters) {
      const filterParams = buildQueryParams(undefined, options.filters);
      if (filterParams) {
        // Remove the leading '?' and append to existing params
        params.append('filters', filterParams.substring(1));
      }
    }
    
    const url = `${ENDPOINTS.RULES_EXPORT}?${params.toString()}`;
    console.log('exportRules: Making request to:', url);
    
    return await apiGet<ExportResponse>(url);
  } catch (error) {
    console.error('Error exporting rules:', error);
    throw error;
  }
};

// --- MITRE ATT&CK ENDPOINTS ---

/**
 * Fetch MITRE ATT&CK matrix - Enhanced with rule mappings
 */
export const fetchMitreMatrix = async (): Promise<MitreMatrixData> => {
  try {
    console.log('fetchMitreMatrix: Making request');
    const response = await apiGet<MitreMatrixData>(ENDPOINTS.MITRE_MATRIX);
    console.log('fetchMitreMatrix: Matrix fetched successfully');
    return response;
  } catch (error) {
    console.error('Error fetching MITRE matrix:', error);
    throw error;
  }
};

/**
 * Fetch technique coverage statistics - Enhanced version
 */
export const fetchTechniqueCoverage = async (
  platform?: string | null,
  rulePlatform?: string | null
): Promise<TechniquesCoverageResponse> => {
  try {
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    if (rulePlatform) params.append('rule_platform', rulePlatform);
    
    const url = `${ENDPOINTS.MITRE_COVERAGE}${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('fetchTechniqueCoverage: Making request to:', url);
    
    const response = await apiGet<TechniquesCoverageResponse>(url);
    console.log('fetchTechniqueCoverage: Coverage fetched successfully');
    return response;
  } catch (error) {
    console.error('Error fetching technique coverage:', error);
    throw error;
  }
};

/**
 * Fetch MITRE techniques list - NEW ENDPOINT
 */
export const fetchMitreTechniques = async (
  pagination?: PaginationParams,
  search?: string
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (pagination) {
      params.append('offset', ((pagination.page - 1) * pagination.limit).toString());
      params.append('limit', pagination.limit.toString());
    }
    
    const url = `${ENDPOINTS.MITRE_TECHNIQUES}${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('fetchMitreTechniques: Making request to:', url);
    
    return await apiGet<any>(url);
  } catch (error) {
    console.error('Error fetching MITRE techniques:', error);
    throw error;
  }
};

/**
 * Fetch MITRE tactics list - NEW ENDPOINT
 */
export const fetchMitreTactics = async (): Promise<any> => {
  try {
    console.log('fetchMitreTactics: Making request');
    return await apiGet<any>(ENDPOINTS.MITRE_TACTICS);
  } catch (error) {
    console.error('Error fetching MITRE tactics:', error);
    throw error;
  }
};

// --- CVE ENDPOINTS ---

/**
 * Search CVEs - NEW ENDPOINT
 */
export const fetchCves = async (
  pagination: PaginationParams,
  search?: string,
  severity?: string[]
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('offset', ((pagination.page - 1) * pagination.limit).toString());
    params.append('limit', pagination.limit.toString());
    
    if (search) params.append('search', search);
    severity?.forEach(s => params.append('severity', s));
    
    const url = `${ENDPOINTS.CVES}?${params.toString()}`;
    console.log('fetchCves: Making request to:', url);
    
    return await apiGet<any>(url);
  } catch (error) {
    console.error('Error fetching CVEs:', error);
    throw error;
  }
};

/**
 * Fetch CVE by ID - NEW ENDPOINT
 */
export const fetchCveById = async (id: string): Promise<CveData> => {
  try {
    console.log('fetchCveById: Fetching CVE:', id);
    return await apiGet<CveData>(ENDPOINTS.CVE_BY_ID(id));
  } catch (error) {
    console.error(`Error fetching CVE with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch CVE statistics - NEW ENDPOINT
 */
export const fetchCveStats = async (): Promise<CveStats> => {
  try {
    console.log('fetchCveStats: Making request');
    return await apiGet<CveStats>(ENDPOINTS.CVE_STATS);
  } catch (error) {
    console.error('Error fetching CVE statistics:', error);
    throw error;
  }
};

// --- FILTER AND SEARCH ENDPOINTS ---

/**
 * Fetch available filter options - Enhanced with counts
 */
export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  try {
    console.log('fetchFilterOptions: Making request');
    const response = await apiGet<FilterOptionsResponse>(ENDPOINTS.FILTERS_OPTIONS);
    console.log('fetchFilterOptions: Options fetched successfully');
    return response;
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};

/**
 * Global search across all entities - NEW ENDPOINT
 */
export const globalSearch = async (
  query: string,
  pagination?: PaginationParams,
  types?: string[]
): Promise<GlobalSearchResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('query', query);
    
    if (pagination) {
      params.append('offset', ((pagination.page - 1) * pagination.limit).toString());
      params.append('limit', pagination.limit.toString());
    }
    
    types?.forEach(type => params.append('types', type));
    
    const url = `${ENDPOINTS.GLOBAL_SEARCH}?${params.toString()}`;
    console.log('globalSearch: Making request to:', url);
    
    return await apiGet<GlobalSearchResponse>(url);
  } catch (error) {
    console.error('Error performing global search:', error);
    throw error;
  }
};

// --- ANALYTICS AND DASHBOARD ENDPOINTS ---

/**
 * Fetch dashboard data - NEW ENDPOINT
 */
export const fetchDashboardData = async (): Promise<DashboardStats> => {
  try {
    console.log('fetchDashboardData: Making request');
    const response = await apiGet<DashboardStats>(ENDPOINTS.ANALYTICS_DASHBOARD);
    console.log('fetchDashboardData: Dashboard data fetched successfully');
    return response;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Fetch trend analysis data - NEW ENDPOINT
 */
export const fetchTrendData = async (
  period?: string,
  startDate?: string,
  endDate?: string
): Promise<TrendData> => {
  try {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `${ENDPOINTS.ANALYTICS_TRENDS}${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('fetchTrendData: Making request to:', url);
    
    return await apiGet<TrendData>(url);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    throw error;
  }
};

// --- LEGACY COMPATIBILITY ---

/**
 * Legacy technique coverage endpoint - keeping for compatibility
 * @deprecated Use fetchTechniqueCoverage instead
 */
export const fetchTechniqueCoverageLegacy = async (
  platform?: string | null,
  rulePlatform?: string | null
): Promise<TechniquesCoverageResponse> => {
  console.warn('fetchTechniqueCoverageLegacy is deprecated, use fetchTechniqueCoverage instead');
  return fetchTechniqueCoverage(platform, rulePlatform);
};

// --- UTILITY FUNCTIONS ---

/**
 * Build download URL for exports
 */
export const buildDownloadUrl = (path: string): string => {
  return path.startsWith('http') ? path : `${API_URL}${path}`;
};

/**
 * Create issue endpoint function (keeping existing functionality)
 */
export const CREATE_ISSUE = (ruleId: string): string => `/rules/${ruleId}/issues`;

/**
 * Create issue function - re-export from client for compatibility
 */
export { createIssue } from './client';