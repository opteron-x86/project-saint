// src/api/endpoints.ts
// Simplified version that works with the fixed backend API

import { apiGet, apiPost } from './client';
import {
  RuleDetail,
  FetchRulesResponse,
  PaginationParams,
  RuleFilters,
  TechniquesCoverageResponse,
  FetchRuleStatsResponse,
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

// Base endpoint paths
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
};

/**
 * Build query parameters for Lambda API
 */
const buildQueryParams = (
  pagination?: PaginationParams,
  filters?: RuleFilters
): Record<string, any> => {
  const params: Record<string, any> = {};
  
  // Pagination - Lambda uses offset/limit
  if (pagination) {
    params.offset = (pagination.page - 1) * pagination.limit;
    params.limit = pagination.limit;
  }
  
  // Filters - Lambda expects comma-separated strings for arrays
  if (filters) {
    if (filters.query || filters.search) {
      params.query = filters.query || filters.search;
    }
    
    // Array filters - convert to comma-separated strings
    const arrayFilters = [
      'severity', 'platforms', 'techniques', 'tactics', 
      'rule_source', 'tags', 'rule_platform', 'validation_status',
      'mitre_techniques', 'cve_ids'
    ];
    
    arrayFilters.forEach(key => {
      const value = filters[key as keyof RuleFilters];
      if (Array.isArray(value) && value.length > 0) {
        params[key] = value.join(',');
      }
    });
    
    // Boolean filters
    if (filters.has_mitre !== undefined) params.has_mitre = filters.has_mitre;
    if (filters.has_cves !== undefined) params.has_cves = filters.has_cves;
    if (filters.is_active !== undefined) params.is_active = filters.is_active;
    
    // Date range
    if (filters.dateRange) {
      if (filters.dateRange.start) params.start_date = filters.dateRange.start;
      if (filters.dateRange.end) params.end_date = filters.dateRange.end;
    }
  }
  
  return params;
};

// --- RULES ENDPOINTS ---

/**
 * Fetch rules with pagination and filters
 * No transformation needed - backend now returns correct field names
 */
export const fetchRules = async (
  pagination?: PaginationParams,
  filters?: RuleFilters
): Promise<FetchRulesResponse> => {
  const params = buildQueryParams(pagination, filters);
  const response = await apiGet<FetchRulesResponse>(ENDPOINTS.RULES, params);
  
  // Backend now returns the correct structure
  // No transformation needed
  return response;
};

/**
 * Fetch rule by ID
 * Direct pass-through as backend returns correct format
 */
export const fetchRuleById = async (id: string): Promise<RuleDetail> => {
  return await apiGet<RuleDetail>(ENDPOINTS.RULE_BY_ID(id));
};

/**
 * Fetch rule statistics
 */
export const fetchRuleStats = async (
  filters?: RuleFilters
): Promise<FetchRuleStatsResponse> => {
  const params = buildQueryParams(undefined, filters);
  return await apiGet<FetchRuleStatsResponse>(ENDPOINTS.RULES_STATS, params);
};

/**
 * Fetch rule enrichment statistics
 */
export const fetchRuleEnrichmentStats = async (): Promise<any> => {
  return await apiGet<any>(ENDPOINTS.RULES_ENRICHMENT);
};

/**
 * Export rules in various formats
 */
export const exportRules = async (
  options: ExportOptions
): Promise<ExportResponse> => {
  const params = {
    format: options.format,
    include_enrichments: options.include_enrichments,
    include_raw_content: options.include_raw_content,
    ...buildQueryParams(undefined, options.filters)
  };
  return await apiGet<ExportResponse>(ENDPOINTS.RULES_EXPORT, params);
};

// --- MITRE ENDPOINTS ---

/**
 * Fetch MITRE ATT&CK matrix
 * Minimal transformation for consistency
 */
export const fetchMitreMatrix = async (): Promise<MitreMatrixData> => {
  const response = await apiGet<any>(ENDPOINTS.MITRE_MATRIX);
  
  // API returns data wrapped in 'matrix' field
  const matrixData = response.matrix || response;
  
  // Ensure consistent ID field naming
  return matrixData.map((tactic: any) => ({
    ...tactic,
    id: tactic.tactic_id || tactic.id,
    techniques: (tactic.techniques || []).map((technique: any) => ({
      ...technique,
      id: technique.technique_id || technique.id,
      subtechniques: (technique.subtechniques || []).map((subtech: any) => ({
        ...subtech,
        id: subtech.technique_id || subtech.id,
      }))
    }))
  }));
};

/**
 * Fetch technique coverage analysis
 */
export const fetchTechniqueCoverage = async (
  platform?: string | null,
  rulePlatform?: string | null,
  includeSubtechniques?: boolean
): Promise<TechniquesCoverageResponse> => {
  const params: Record<string, any> = {};
  
  if (platform) params.platform = platform;
  if (rulePlatform) params.rule_platform = rulePlatform;
  if (includeSubtechniques !== undefined) {
    params.include_subtechniques = includeSubtechniques;
  }
  
  return await apiGet<TechniquesCoverageResponse>(ENDPOINTS.MITRE_COVERAGE, params);
};

/**
 * Fetch paginated MITRE techniques
 */
export const fetchMitreTechniques = async (
  pagination?: PaginationParams,
  search?: string
): Promise<{ techniques: MitreTechnique[]; total: number }> => {
  const params: Record<string, any> = {};
  
  if (pagination) {
    params.offset = (pagination.page - 1) * pagination.limit;
    params.limit = pagination.limit;
  }
  
  if (search) {
    params.search = search;
  }
  
  const response = await apiGet<any>(ENDPOINTS.MITRE_TECHNIQUES, params);
  
  // Ensure consistent technique ID field
  const techniques = (response.techniques || response.items || []).map((tech: any) => ({
    ...tech,
    id: tech.technique_id || tech.id,
    subtechniques: (tech.subtechniques || []).map((subtech: any) => ({
      ...subtech,
      id: subtech.technique_id || subtech.id,
    }))
  }));
  
  return {
    techniques,
    total: response.total || techniques.length
  };
};

// --- CVE ENDPOINTS ---

/**
 * Fetch CVEs with pagination and filters
 */
export const fetchCves = async (
  pagination?: PaginationParams,
  filters?: { severities?: string[]; with_rules_only?: boolean; query?: string }
): Promise<{ items: CveData[]; total: number }> => {
  const params: Record<string, any> = {};
  
  if (pagination) {
    params.offset = (pagination.page - 1) * pagination.limit;
    params.limit = pagination.limit;
  }
  
  if (filters) {
    if (filters.severities?.length) params.severities = filters.severities.join(',');
    if (filters.with_rules_only !== undefined) params.with_rules_only = filters.with_rules_only;
    if (filters.query) params.query = filters.query;
  }
  
  return await apiGet<{ items: CveData[]; total: number }>(ENDPOINTS.CVES, params);
};

/**
 * Fetch CVE by ID
 */
export const fetchCveById = async (id: string): Promise<CveData> => {
  return await apiGet<CveData>(ENDPOINTS.CVE_BY_ID(id));
};

/**
 * Fetch CVE statistics
 */
export const fetchCveStats = async (): Promise<CveStats> => {
  return await apiGet<CveStats>(ENDPOINTS.CVE_STATS);
};

// --- FILTER OPTIONS ---

/**
 * Fetch available filter options
 */
export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  return await apiGet<FilterOptionsResponse>(ENDPOINTS.FILTERS_OPTIONS);
};

// --- GLOBAL SEARCH ---

/**
 * Perform global search across all entities
 */
export const globalSearch = async (
  query: string,
  pagination?: PaginationParams,
  types?: string[]
): Promise<GlobalSearchResponse> => {
  const params: Record<string, any> = { query };
  
  if (pagination) {
    params.offset = (pagination.page - 1) * pagination.limit;
    params.limit = pagination.limit;
  }
  
  if (types?.length) {
    params.types = types.join(',');
  }
  
  return await apiGet<GlobalSearchResponse>(ENDPOINTS.GLOBAL_SEARCH, params);
};

// --- ANALYTICS ENDPOINTS ---

/**
 * Fetch dashboard analytics data
 */
export const fetchDashboardData = async (): Promise<DashboardStats> => {
  return await apiGet<DashboardStats>(ENDPOINTS.ANALYTICS_DASHBOARD);
};

/**
 * Fetch trend data for analytics
 */
export const fetchTrendData = async (
  period?: string,
  startDate?: string,
  endDate?: string
): Promise<TrendData[]> => {
  const params: Record<string, any> = {};
  
  if (period) params.period = period;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await apiGet<{ trends: TrendData[] }>(ENDPOINTS.ANALYTICS_TRENDS, params);
  return response.trends || [];
};

// --- ISSUE CREATION ---

/**
 * Create an issue for a rule
 */
export const createIssue = async (
  payload: CreateIssuePayload
): Promise<CreateIssueResponse> => {
  const endpoint = `/rules/${payload.rule_id}/issues`;
  const data = {
    title: payload.title,
    description: payload.description,
    issueType: payload.issue_type,
    priority: payload.priority,
    affected_platforms: payload.affected_platforms,
    suggested_fix: payload.suggested_fix,
    contact_email: payload.contact_email
  };
  
  return await apiPost<CreateIssueResponse>(endpoint, data);
};