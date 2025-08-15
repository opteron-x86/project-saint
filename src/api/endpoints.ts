// src/api/endpoints.ts

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

export const fetchRules = async (
  pagination?: PaginationParams,
  filters?: RuleFilters
): Promise<FetchRulesResponse> => {
  const params = buildQueryParams(pagination, filters);
  const response = await apiGet<any>(ENDPOINTS.RULES, params);
  
  // Transform each rule item
  const transformedRules = (response.items || []).map((item: any) => ({
    id: String(item.id),
    source_rule_id: item.rule_id || null,
    title: item.name || '',  // Map 'name' to 'title'
    description: item.description || null,
    platforms: item.platforms || null,
    rule_source: item.source?.name || item.rule_type || '',
    severity: item.severity || 'unknown',
    status: item.is_active ? 'active' : 'inactive',
    created_date: item.created_date || null,
    modified_date: item.updated_date || item.modified_date || null,
    rule_platforms: item.rule_platforms || null,
    linked_technique_ids: item.linked_technique_ids || null,
    has_mitre_mapping: item.extracted_mitre_count > 0,
    has_cve_references: item.extracted_cve_count > 0,
    enrichment_score: item.enrichment_score,
    tags: item.tags || null
  }));
  
  return {
    rules: transformedRules,
    items: transformedRules,
    total: response.total || 0,
    offset: response.offset || 0,
    limit: response.limit || pagination?.limit || 100,
    page: pagination?.page || 1,
    totalPages: Math.ceil((response.total || 0) / (pagination?.limit || 100)),
    facets: response.facets
  };
};

export const fetchRuleById = async (id: string): Promise<RuleDetail> => {
  return await apiGet<RuleDetail>(ENDPOINTS.RULE_BY_ID(id));
};

export const fetchRuleStats = async (filters?: RuleFilters): Promise<FetchRuleStatsResponse> => {
  const params = buildQueryParams(undefined, filters);
  return await apiGet<FetchRuleStatsResponse>(ENDPOINTS.RULES_STATS, params);
};

export const fetchRuleEnrichmentStats = async (): Promise<any> => {
  return await apiGet<any>(ENDPOINTS.RULES_ENRICHMENT);
};

export const exportRules = async (options: ExportOptions): Promise<ExportResponse> => {
  const params = {
    format: options.format,
    include_enrichments: options.include_enrichments,
    include_raw_content: options.include_raw_content,
    ...buildQueryParams(undefined, options.filters)
  };
  return await apiGet<ExportResponse>(ENDPOINTS.RULES_EXPORT, params);
};

// --- MITRE ENDPOINTS ---

export const fetchMitreMatrix = async (): Promise<MitreMatrixData> => {
  const response = await apiGet<any>(ENDPOINTS.MITRE_MATRIX);
  
  // API returns data wrapped in 'matrix' field
  const matrixData = response.matrix || response;
  
  // Transform the API response to match frontend expectations
  return matrixData.map((tactic: any) => ({
    // Core tactic fields
    id: tactic.tactic_id || tactic.id, // Use tactic_id as the primary ID for consistency
    stix_id: tactic.stix_id || null,
    name: tactic.name || '',
    shortname: tactic.shortname || null,
    description: tactic.description || null,
    url: tactic.url || null,
    matrix_order: tactic.matrix_order || null,
    rule_count: tactic.rule_count || 0,
    
    // Transform techniques array
    techniques: (tactic.techniques || []).map((technique: any) => ({
      // Use technique_id as the primary identifier
      id: technique.technique_id || technique.id,
      name: technique.name || '',
      url: technique.url || null,
      description: technique.description || null,
      is_subtechnique: technique.is_subtechnique || false,
      is_deprecated: technique.is_deprecated || false,
      stix_id: technique.stix_id || null,
      platforms: technique.platforms || [],
      rule_count: technique.rule_count || 0,
      coverage_percentage: technique.coverage_percentage || 0,
      
      // Transform subtechniques
      subtechniques: (technique.subtechniques || []).map((subtech: any) => ({
        id: subtech.technique_id || subtech.id,
        name: subtech.name || '',
        url: subtech.url || null,
        description: subtech.description || null,
        is_subtechnique: true,
        is_deprecated: subtech.is_deprecated || false,
        stix_id: subtech.stix_id || null,
        platforms: subtech.platforms || [],
        rule_count: subtech.rule_count || 0,
        coverage_percentage: subtech.coverage_percentage || 0,
        subtechniques: [] // Subtechniques don't have their own subtechniques
      }))
    }))
  }));
};

export const fetchTechniqueCoverage = async (
  platform?: string | null,
  rulePlatform?: string | null
): Promise<TechniquesCoverageResponse> => {
  const params: Record<string, any> = {};
  if (platform) params.platform = platform;
  if (rulePlatform) params.rule_platform = rulePlatform;
  
  const response = await apiGet<any>(ENDPOINTS.MITRE_COVERAGE, params);
  
  // Transform coverage response to ensure technique_id matches the ID format used in matrix
  return {
    total_techniques: response.total_techniques || 0,
    covered_techniques: response.covered_techniques || 0,
    coverage_percentage: response.coverage_percentage || 0,
    platform_filter_applied: response.platform_filter_applied || null,
    rule_platform_filter_applied: response.rule_platform_filter_applied || null,
    coverage_gaps: response.coverage_gaps || [],
    
    // Ensure technique_id in coverage matches the ID format from matrix
    techniques: (response.techniques || []).map((tech: any) => ({
      technique_id: tech.technique_id || tech.id, // This should match the 'id' field in MitreTechnique
      name: tech.name || '',
      count: tech.count || 0,
      rules: (tech.rules || []).map((rule: any) => ({
        id: String(rule.id),
        title: rule.title || rule.name || '',
        severity: rule.severity || 'unknown',
        platforms: rule.platforms || [],
        rule_source: rule.rule_source || '',
        enrichment_score: rule.enrichment_score || 0
      })),
      coverage_quality: tech.coverage_quality || 'poor',
      platforms_covered: tech.platforms_covered || [],
      rule_sources_covering: tech.rule_sources_covering || [],
      last_updated: tech.last_updated || null
    }))
  };
};

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
  
  // Transform techniques to match frontend expectations
  const techniques = (response.techniques || response.items || []).map((tech: any) => ({
    id: tech.technique_id || tech.id,
    name: tech.name || '',
    url: tech.url || null,
    description: tech.description || null,
    is_subtechnique: tech.is_subtechnique || false,
    is_deprecated: tech.is_deprecated || false,
    stix_id: tech.stix_id || null,
    platforms: tech.platforms || [],
    rule_count: tech.rule_count || 0,
    coverage_percentage: tech.coverage_percentage || 0,
    subtechniques: (tech.subtechniques || []).map((subtech: any) => ({
      id: subtech.technique_id || subtech.id,
      name: subtech.name || '',
      url: subtech.url || null,
      description: subtech.description || null,
      is_subtechnique: true,
      is_deprecated: subtech.is_deprecated || false,
      stix_id: subtech.stix_id || null,
      platforms: subtech.platforms || [],
      rule_count: subtech.rule_count || 0,
      coverage_percentage: subtech.coverage_percentage || 0,
      subtechniques: []
    }))
  }));
  
  return {
    techniques,
    total: response.total || techniques.length
  };
};

// --- CVE ENDPOINTS ---

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

export const fetchCveById = async (id: string): Promise<CveData> => {
  return await apiGet<CveData>(ENDPOINTS.CVE_BY_ID(id));
};

export const fetchCveStats = async (): Promise<CveStats> => {
  return await apiGet<CveStats>(ENDPOINTS.CVE_STATS);
};

// --- FILTER OPTIONS ---

export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  return await apiGet<FilterOptionsResponse>(ENDPOINTS.FILTERS_OPTIONS);
};

// --- GLOBAL SEARCH ---

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
  
  if (types?.length) params.types = types.join(',');
  
  return await apiGet<GlobalSearchResponse>(ENDPOINTS.GLOBAL_SEARCH, params);
};

// --- ANALYTICS AND DASHBOARD ---

export const fetchDashboardData = async (): Promise<DashboardStats> => {
  return await apiGet<DashboardStats>(ENDPOINTS.ANALYTICS_DASHBOARD);
};

export const fetchTrendData = async (
  period?: string,
  startDate?: string,
  endDate?: string
): Promise<TrendData> => {
  const params: Record<string, any> = {};
  if (period) params.period = period;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  return await apiGet<TrendData>(ENDPOINTS.ANALYTICS_TRENDS, params);
};

// --- ISSUE CREATION ---

export const createIssue = async (
  ruleId: string,
  payload: CreateIssuePayload
): Promise<CreateIssueResponse> => {
  return await apiPost<CreateIssueResponse>(`/rules/${ruleId}/issues`, payload);
};