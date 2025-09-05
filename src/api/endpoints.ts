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
  AffectedRulesResponse,
  RuleDeprecationCheck,
  UpdateMappingsOptions,
  UpdateMappingsResponse,
  DeprecationStatistics,
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
  
  // Deprecation management endpoints
  DEPRECATED_STATISTICS: '/deprecated/statistics',
  DEPRECATED_AFFECTED_RULES: '/deprecated/affected-rules',
  DEPRECATED_CHECK_RULE: '/deprecated/check-rule',
  DEPRECATED_UPDATE_MAPPINGS: '/deprecated/update-mappings',

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
  
  // Pagination
  if (pagination) {
    params.offset = (pagination.page - 1) * pagination.limit;
    params.limit = pagination.limit;
    
    if (pagination.sortBy) {
      params.sort_by = pagination.sortBy;
    }
    if (pagination.sortDirection) {
      params.sort_dir = pagination.sortDirection;
    }
  }
  
  // Filters
  if (filters) {
    if (filters.query || filters.search) {
      params.query = filters.query || filters.search;
    }
    
    // Handle both rule_source and rule_sources for backward compatibility
    if (filters.rule_sources && filters.rule_sources.length > 0) {
      params.rule_sources = filters.rule_sources.join(',');
    } else if (filters.rule_source && filters.rule_source.length > 0) {
      params.rule_sources = filters.rule_source.join(',');
    }
    
    // Array filters - convert to comma-separated strings
    const arrayFilters = [
      'severity', 'platforms', 'techniques', 'tactics', 
      'tags', 'rule_platform', 'mitre_techniques', 'cve_ids',
      'siem_platforms', 'aors', 'data_sources', 'info_controls'
    ];
    
    arrayFilters.forEach(key => {
      const value = filters[key as keyof RuleFilters];
      if (Array.isArray(value) && value.length > 0) {
        params[key] = value.join(',');
      }
    });
    
    // Boolean filters - handle compatibility fields
    if (filters.has_mitre !== undefined) params.has_mitre = filters.has_mitre;
    if (filters.has_cves !== undefined) params.has_cves = filters.has_cves;
    if (filters.is_active !== undefined) params.is_active = filters.is_active;
    
    // Handle backward compatibility for has_mitre_mapping and has_cve_references
    if (filters.has_mitre_mapping !== undefined) params.has_mitre = filters.has_mitre_mapping;
    if (filters.has_cve_references !== undefined) params.has_cves = filters.has_cve_references;
    
    // Date range
    if (filters.dateRange) {
      if (filters.dateRange.start) params.start_date = filters.dateRange.start;
      if (filters.dateRange.end) params.end_date = filters.dateRange.end;
    }
    
    // Enrichment score filter
    if (filters.enrichment_score_min !== undefined) {
      params.enrichment_score_min = filters.enrichment_score_min;
    }
    
    // Validation status
    if (filters.validation_status && filters.validation_status.length > 0) {
      params.validation_status = filters.validation_status.join(',');
    }
  }
  
  return params;
};

/**
 * Transform raw API response to RuleDetail
 */
const transformRuleResponse = (response: any): RuleDetail => {
  const linkedTechniqueIds = response.linked_technique_ids || 
    (response.mitre_techniques && Array.isArray(response.mitre_techniques) 
      ? (typeof response.mitre_techniques[0] === 'string' 
        ? response.mitre_techniques 
        : response.mitre_techniques.map((t: any) => t.technique_id || t))
      : []);
  
  return {
    // Base fields
    id: response.id,
    source_rule_id: response.rule_id || response.source_rule_id,
    title: response.title || response.name,
    description: response.description,
    platforms: response.platforms || [],
    rule_source: response.rule_source,
    severity: response.severity || 'unknown',
    status: response.status || (response.is_active ? 'active' : 'inactive'),
    created_date: response.created_date,
    modified_date: response.modified_date || response.updated_date,
    rule_platforms: response.rule_platforms || response.platforms || [],
    linked_technique_ids: linkedTechniqueIds,
    has_mitre_mapping: response.has_mitre_mapping ?? (response.has_mitre || linkedTechniqueIds.length > 0),
    has_cve_references: response.has_cve_references ?? (response.has_cves || (response.cve_references?.length > 0)),
    enrichment_score: response.enrichment_score,
    tags: response.tags || [],
    
    // Extended detail fields
    author: response.author,
    source_file_path: response.source_file_path,
    raw_rule: response.raw_rule,
    linked_techniques: response.linked_techniques || response.mitre_techniques || [],
    elastic_details: response.elastic_details,
    sentinel_details: response.sentinel_details,
    trinitycyber_details: response.trinitycyber_details,
    mitre_techniques: response.mitre_techniques,
    cve_references: response.cve_references,
    cves: response.cves || response.cve_references,
    related_rules: response.related_rules,
    rule_metadata: response.rule_metadata,
    rule_content: response.rule_content,
    is_active: response.is_active,
    
    // New metadata fields
    siem_platform: response.siem_platform,
    aor: response.aor,
    source_org: response.source_org,
    data_sources: response.data_sources,
    info_controls: response.info_controls,
    modified_by: response.modified_by,
    hunt_id: response.hunt_id,
    malware_family: response.malware_family,
    intrusion_set: response.intrusion_set,
    cwe_ids: response.cwe_ids,
    validation: response.validation
  };
};

// --- RULES ENDPOINTS ---

/**
 * Fetch rules with pagination and filters
 */
export const fetchRules = async (
  pagination?: PaginationParams,
  filters?: RuleFilters
): Promise<FetchRulesResponse> => {
  const params = buildQueryParams(pagination, filters);
  const response = await apiGet<any>(ENDPOINTS.RULES, params);
  
  // API returns 'rules' array, not 'items'
  const rulesArray = response.rules || [];
  
  // Rules already come properly formatted from backend, minimal transformation needed
  const transformedRules = rulesArray.map((rule: any) => ({
    ...rule,
    // Ensure consistent field names
    title: rule.title || rule.name,
    status: rule.status || (rule.is_active ? 'active' : 'inactive'),
  }));
  
  return {
    rules: transformedRules,
    items: transformedRules, // Alias for backward compatibility
    total: response.total || 0,
    offset: response.offset || 0,
    limit: response.limit || params.limit || 25,
    page: response.page || Math.ceil(response.offset / (response.limit || 25)) + 1,
    totalPages: response.totalPages || Math.ceil(response.total / (response.limit || 25)),
    facets: response.facets
  };
};

/**
 * Fetch rule by ID
 */
export const fetchRuleById = async (id: string): Promise<RuleDetail> => {
  const response = await apiGet<any>(ENDPOINTS.RULE_BY_ID(id));
  return transformRuleResponse(response);
};

/**
 * Fetch rule statistics
 */
export const fetchRuleStats = async (
  filters?: RuleFilters
): Promise<FetchRuleStatsResponse> => {
  const params = filters ? buildQueryParams(undefined, filters) : {};
  const response = await apiGet<any>(ENDPOINTS.RULES_STATS, params);
  
  return {
    total_rules: response.total_rules || 0,
    active_rules: response.active_rules || response.total_rules || 0,
    inactive_rules: response.inactive_rules || 0,
    active_filters: response.active_filters,
    stats: {
      by_severity: response.stats?.by_severity || {},
      by_platform: response.stats?.by_platform || response.stats?.by_rule_platform || {},
      by_rule_source: response.stats?.by_rule_source || {},
      by_rule_platform: response.stats?.by_rule_platform || {},
      by_mitre_coverage: response.stats?.by_mitre_coverage || {},
      by_cve_coverage: response.stats?.by_cve_coverage || {},
      by_enrichment_quality: response.stats?.by_enrichment_quality || {}
    },
    enrichment_stats: {
      rules_with_mitre: response.enrichment?.rules_with_mitre || response.enrichment?.mitre?.total_enriched || 0,
      rules_with_cves: response.enrichment?.rules_with_cves || response.enrichment?.cve?.total_enriched || 0,
      average_enrichment_score: response.enrichment?.average_enrichment_score || 0,
      total_mitre_techniques_covered: response.enrichment?.total_mitre_techniques_covered || 0,
      total_cves_referenced: response.enrichment?.total_cves_referenced || 0
    }
  };
};

/**
 * Export rules
 */
export const exportRules = async (options: ExportOptions): Promise<ExportResponse> => {
  const payload = {
    format: options.format,
    include_enrichments: options.include_enrichments ?? true,
    include_raw_content: options.include_raw_content ?? false,
    filters: options.filters,
  };
  
  const response = await apiPost<any>('/rules/export', payload);
  
  // Ensure the response matches ExportResponse interface
  return {
    file_url: response.file_url,
    download_url: response.download_url,
    content: response.content,
    filename: response.filename || `rules_export.${options.format}`,
    format: response.format || options.format,
    rules_count: response.rules_count || 0,
    created_at: response.created_at || new Date().toISOString(),
  };
};

// --- MITRE ATT&CK ENDPOINTS ---

/**
 * Fetch MITRE matrix data
 */
export const fetchMitreMatrix = async (platforms?: string[]): Promise<MitreMatrixData> => {
  const params = platforms?.length ? { platforms: platforms.join(',') } : {};
  const response = await apiGet<any>('/mitre/matrix', params);

  return response.matrix || response;
};

/**
 * Fetch MITRE coverage data
 */
export const fetchMitreCoverage = async (
  platforms?: string[],
  includeDetails = false
): Promise<TechniquesCoverageResponse> => {
  const params: Record<string, any> = { include_details: includeDetails };
  if (platforms?.length) {
    params.platforms = platforms.join(',');
  }
  
  const response = await apiGet<any>(ENDPOINTS.MITRE_COVERAGE, params);
  
  return {
    total_techniques: response.total_techniques || 0,
    covered_techniques: response.covered_techniques || 0,
    coverage_percentage: response.coverage_percentage || 0,
    techniques: response.techniques || [],
    platform_filter_applied: response.platform_filter_applied,
    rule_platform_filter_applied: response.rule_platform_filter_applied,
    coverage_gaps: response.coverage_gaps,
    metadata: response.metadata
  };
};

/**
 * Fetch MITRE techniques
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
  
  const response = await apiGet<any>('/mitre/techniques', params);
  
  return {
    techniques: response.techniques || [],
    total: response.total || 0
  };
};

// --- CVE ENDPOINTS ---

/**
 * Fetch CVEs with pagination
 */
export const fetchCves = async (
  pagination: PaginationParams = { page: 1, limit: 25 },
  filters?: { severities?: string[]; with_rules_only?: boolean; query?: string }
): Promise<{ items: CveData[]; total: number }> => {
  const params: Record<string, any> = {
    offset: (pagination.page - 1) * pagination.limit,
    limit: pagination.limit,
  };
  
  if (filters?.severities?.length) {
    params.severities = filters.severities.join(',');
  }
  
  if (filters?.with_rules_only) {
    params.with_rules_only = 'true';
  }
  
  if (filters?.query) {
    params.query = filters.query;
  }
  
  const response = await apiGet<any>(ENDPOINTS.CVES, params);
  
  return {
    items: response.items || response.cves || [],
    total: response.total || 0,
  };
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

// --- FILTER AND SEARCH ENDPOINTS ---

/**
 * Fetch filter options
 */
export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  const response = await apiGet<any>('/filters/options');
  
  // Ensure all expected fields are present
  return {
    rule_sources: response.rule_sources || [],
    siem_platforms: response.siem_platforms || [],
    rule_types: response.rule_types || [],
    severities: response.severities || [],
    tactics: response.tactics || [],
    platforms: response.platforms || [],
    rule_platforms: response.rule_platforms || [],
    areas_of_responsibility: response.areas_of_responsibility || [],
    data_sources: response.data_sources || [],
    info_controls: response.info_controls || [],
    popular_tags: response.popular_tags || [],
    mitre_techniques: response.mitre_techniques || [],
    cve_severities: response.cve_severities || [],
    enrichment_levels: response.enrichment_levels || []
  };
};

// --- DEPRECATION MANAGEMENT ENDPOINTS ---

/**
 * Get system-wide deprecation statistics
 */
export const fetchDeprecationStats = async (): Promise<DeprecationStatistics> => {
  const response = await apiGet<any>(ENDPOINTS.DEPRECATED_STATISTICS);
  
  return {
    total_techniques: response.total_techniques || 0,
    deprecated_techniques: response.deprecated_techniques || 0,
    revoked_techniques: response.revoked_techniques || 0,
    total_deprecated_or_revoked: response.total_deprecated_or_revoked || 0,
    techniques_with_replacements: response.techniques_with_replacements || 0,
    rules_affected: response.rules_affected || 0,
    percentage_deprecated: response.percentage_deprecated || 0,
    percentage_revoked: response.percentage_revoked || 0,
  };
};

/**
 * Get all rules with deprecated technique mappings
 */
export const fetchRulesWithDeprecatedTechniques = async (): Promise<AffectedRulesResponse> => {
  const response = await apiGet<any>(ENDPOINTS.DEPRECATED_AFFECTED_RULES);
  
  return {
    total_affected_rules: response.total_affected_rules || 0,
    rules: response.rules || [],
  };
};

/**
 * Check specific rule for deprecated technique mappings
 */
export const checkRuleDeprecation = async (ruleId: string): Promise<RuleDeprecationCheck> => {
  const params = { rule_id: ruleId };
  const response = await apiGet<any>(ENDPOINTS.DEPRECATED_CHECK_RULE, params);
  
  return {
    rule_id: response.rule_id,
    has_deprecated_techniques: response.has_deprecated_techniques || false,
    deprecated_count: response.deprecated_count || 0,
    warnings: response.warnings || [],
  };
};

/**
 * Update or generate recommendations for deprecated technique mappings
 */
export const updateDeprecatedMappings = async (
  options: UpdateMappingsOptions
): Promise<UpdateMappingsResponse> => {
  const payload = {
    auto_update: options.auto_update || false,
    dry_run: options.dry_run || true,
    rule_ids: options.rule_ids,
  };
  
  const response = await apiPost<any>(ENDPOINTS.DEPRECATED_UPDATE_MAPPINGS, payload);
  
  return {
    updates_made: response.updates_made || 0,
    recommendations_generated: response.recommendations_generated || 0,
    updates: response.updates || [],
    recommendations: response.recommendations || [],
  };
};

/**
 * Global search across entities
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
 * Fetch MITRE technique coverage data
 * Alias for fetchMitreCoverage for backward compatibility
 */
export const fetchTechniqueCoverage = async (
  platform?: string | null,
  rulePlatform?: string | null
): Promise<TechniquesCoverageResponse> => {
  const params: Record<string, any> = {};
  if (platform) params.platform = platform;
  if (rulePlatform) params.rule_platform = rulePlatform;
  
  const response = await apiGet<any>('/mitre/coverage', params);
  
  return {
    total_techniques: response.total_techniques || 0,
    covered_techniques: response.covered_techniques || 0,
    coverage_percentage: response.coverage_percentage || 0,
    techniques: response.techniques || [],
    platform_filter_applied: response.platform_filter_applied,
    rule_platform_filter_applied: response.rule_platform_filter_applied,
    coverage_gaps: response.coverage_gaps,
    metadata: response.metadata
  };
};
/**
 * Fetch rule enrichment statistics
 */
export const fetchRuleEnrichmentStats = async (): Promise<{
  total_rules: number;
  rules_with_mitre: number;
  rules_with_cves: number;
  average_enrichment_score: number;
}> => {
  const response = await apiGet<any>(ENDPOINTS.RULES_ENRICHMENT || '/rules/enrichment');
  return {
    total_rules: response.total_rules || 0,
    rules_with_mitre: response.rules_with_mitre || 0,
    rules_with_cves: response.rules_with_cves || 0,
    average_enrichment_score: response.average_enrichment_score || 0
  };
};

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