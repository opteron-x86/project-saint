// src/api/types.ts - Updated type definitions

// --- Base and Utility Types ---
export enum RuleSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
  Unknown = 'unknown',
}

export interface TechniqueBase {
  id: string;
  name: string;
  url?: string | null;
  is_subtechnique: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  include_facets?: boolean;
}

// --- MITRE ATT&CK Data Structures ---
export interface MitreTechnique {
  id: string;
  technique_id?: string;
  name: string;
  description?: string | null;
  url?: string | null;
  is_subtechnique: boolean;
  is_deprecated?: boolean;
  deprecated_date?: string | null;
  superseded_by?: string | null;
  deprecation_reason?: string | null;
  revoked?: boolean;
  version?: string | null;
  stix_id?: string | null;
  platforms?: string[];
  data_sources?: string[];
  subtechniques?: MitreTechnique[];
  rule_count?: number;
  coverage_percentage?: number;
  parent_technique_id?: string | null;
  tactics?: string[];
  confidence?: number;
}

export interface MitreTactic {
  id: string;
  tactic_id?: string;
  stix_id?: string | null;
  name: string;
  shortname?: string | null;
  description?: string | null;
  url?: string | null;
  matrix_order?: number | null;
  techniques: MitreTechnique[];
  rule_count?: number;
}

export type MitreMatrixData = MitreTactic[];

// --- CVE Data Structures ---
export interface CveData {
  id: string;
  cve_id: string;
  description?: string | null;
  severity?: string | null;
  cvss_score?: number | null;
  cvss_v3_score?: number | null;
  published_date?: string | null;
  modified_date?: string | null;
  references?: string[] | null;
  rule_count?: number;
}


export interface CveStats {
  total_cves: number;
  rules_with_cves: number;
  coverage_percentage: number;
  severity_distribution: Record<string, number>;
  recent_cves: CveData[];
}

// --- Rule Types ---
export interface RuleSummary {
  id: string;
  source_rule_id?: string | null;
  title: string;
  description?: string | null;
  platforms?: string[] | null;
  rule_source: string;
  severity: string;
  status?: string | null;
  created_date?: string | null;
  modified_date?: string | null;
  rule_platforms?: string[] | null;
  linked_technique_ids?: string[] | null;
  has_mitre_mapping?: boolean;
  has_cve_references?: boolean;
  has_deprecated_techniques?: boolean;
  enrichment_score?: number | null;
  tags?: string[] | null;
}

export interface RuleDetail extends RuleSummary {
  author?: string | null;
  source_file_path?: string | null;
  raw_rule?: any | null;
  linked_techniques?: TechniqueBase[];
  mitre_techniques?: MitreTechnique[] | null;
  cve_references?: CveData[] | null;
  cves?: CveData[] | null;
  related_rules?: RuleSummary[] | null;
  rule_metadata?: Record<string, unknown> | null;
  deprecated_technique_warnings?: DeprecatedTechniqueWarning[];
  rule_content?: string | null;
  rule_type?: string | null;
  language?: string | null;
  index?: string[] | null;
  query?: string | null;
  is_active?: boolean;
  siem_platform?: string | null;
  aor?: string | null;
  source_org?: string | null;
  data_sources?: string[] | null;
  info_controls?: string | null;
  modified_by?: string | null;
  hunt_id?: string | null;
  malware_family?: string | null;
  intrusion_set?: string | null;
  cwe_ids?: string[] | null;
  validation?: {
    testable_via?: string | null;
    asv_action_id?: string | null;
    validated?: boolean;
    last_tested?: string | null;
  } | null;
  [key: string]: any;
}

export interface DeprecatedTechniqueWarning {
  technique_id: string;
  technique_name: string;
  deprecated_date?: string | null;
  superseded_by?: string | null;
  deprecation_reason?: string | null;
  is_revoked: boolean;
  recommendation: string;
}


export interface DeprecationStatistics {
  total_techniques: number;
  deprecated_techniques: number;
  revoked_techniques: number;
  total_deprecated_or_revoked: number;
  techniques_with_replacements: number;
  rules_affected: number;
  percentage_deprecated: number;
  percentage_revoked: number;
}

export interface AffectedRule {
  rule_id: string;
  source_rule_id: string;
  rule_name: string;
  rule_source: string;
  deprecated_techniques: {
    technique_id: string;
    technique_name: string;
    is_deprecated: boolean;
    is_revoked: boolean;
    superseded_by?: string | null;
    mapping_confidence?: number;
  }[];
}

export interface AffectedRulesResponse {
  total_affected_rules: number;
  rules: AffectedRule[];
}

export interface RuleDeprecationCheck {
  rule_id: string;
  has_deprecated_techniques: boolean;
  deprecated_count: number;
  warnings: DeprecatedTechniqueWarning[];
}

export interface UpdateMappingsOptions {
  auto_update?: boolean;
  dry_run?: boolean;
  rule_ids?: string[];
}

export interface UpdateMappingsResponse {
  updates_made: number;
  recommendations_generated: number;
  updates?: {
    rule_id: string;
    old_technique: string;
    new_technique?: string;
    action?: string;
  }[];
  recommendations?: {
    rule_id: string;
    current_technique: string;
    recommended_technique: string;
    reason: string;
  }[];
}

// --- Filter Options ---
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  source_type?: string;
  rule_count?: number;
  children?: FilterOption[];
}

export interface FilterOptionsResponse {
  rule_sources: FilterOption[];
  siem_platforms?: FilterOption[];
  rule_types: FilterOption[];
  severities: FilterOption[];
  tactics: FilterOption[];
  platforms: FilterOption[];
  rule_platforms: FilterOption[];
  areas_of_responsibility?: FilterOption[];
  data_sources?: FilterOption[];
  info_controls?: FilterOption[];
  popular_tags?: FilterOption[];
  // Additional filter options
  mitre_techniques?: FilterOption[];
  cve_severities?: FilterOption[];
  enrichment_levels?: FilterOption[];
}

// --- Rule Filters with all fields ---
export interface RuleFilters {
  search?: string;
  query?: string;
  severity?: string[];
  platforms?: string[];
  techniques?: string[];
  tactics?: string[];
  rule_source?: string[];
  rule_sources?: string[];
  tags?: string[];
  dateRange?: { start?: string; end?: string; } | null;
  rule_platform?: string[];
  mitre_techniques?: string[];
  cve_ids?: string[];
  has_mitre?: boolean;
  has_cves?: boolean;
  is_active?: boolean;
  siem_platforms?: string[];
  aors?: string[];
  data_sources?: string[];
  info_controls?: string[];
  // Additional filter fields for compatibility
  has_mitre_mapping?: boolean;
  has_cve_references?: boolean;
  enrichment_score_min?: number;
  validation_status?: string[];
}

// --- API Response Types ---
export interface FetchRulesResponse {
  rules: RuleSummary[];
  items?: RuleSummary[];
  total: number;
  offset: number;
  limit: number;
  page?: number;
  totalPages?: number;
  facets?: {
    severity: Record<string, number>;
    platforms: Record<string, number>;
    rule_sources: Record<string, number>;
    has_mitre: Record<string, number>;
    has_cves: Record<string, number>;
  };
}

// --- Export Options ---
export interface ExportOptions {
  format: 'json' | 'csv' | 'yaml';
  include_enrichments?: boolean;
  include_raw_content?: boolean;
  filters?: RuleFilters;
}

export interface ExportResponse {
  file_url?: string;
  download_url?: string;
  content?: string;
  filename: string;
  format: string;
  rules_count: number;
  created_at: string;
}

// --- Techniques Coverage ---
export interface TechniqueRuleInfo {
  id: string;
  title: string;
  severity: string;
  platforms: string[];
  rule_source?: string;
  enrichment_score?: number;
  tags?: string[];
  created_date?: string | null;
  modified_date?: string | null;
}

export interface TechniqueCoverageDetail {
  technique_id: string;
  name: string;
  count: number;
  rules: TechniqueRuleInfo[];
  coverage_quality?: 'excellent' | 'good' | 'fair' | 'poor';
  platforms_covered?: string[];
  rule_sources_covering?: string[];
  last_updated?: string | null;
}

export interface TechniquesCoverageResponse {
  total_techniques: number;
  covered_techniques: number;
  coverage_percentage: number;
  techniques: TechniqueCoverageDetail[];
  platform_filter_applied?: string | null;
  rule_platform_filter_applied?: string | null;
  coverage_gaps?: string[];
  metadata?: {
    last_updated?: string;
    data_source?: string;
  };
}

// --- Rule Statistics ---
export interface RuleStatsResponse {
  total_rules: number;
  active_rules: number;
  inactive_rules: number;
  active_filters?: Record<string, any> | null;
  stats: {
    by_severity: Record<string, number>;
    by_platform: Record<string, number>;
    by_rule_source: Record<string, number>;
    by_rule_platform: Record<string, number>;
    by_mitre_coverage: Record<string, number>;
    by_cve_coverage: Record<string, number>;
    by_enrichment_quality: Record<string, number>;
  };
  enrichment_stats: {
    rules_with_mitre: number;
    rules_with_cves: number;
    average_enrichment_score: number;
    total_mitre_techniques_covered: number;
    total_cves_referenced: number;
  };
}

export interface FetchRuleStatsResponse extends RuleStatsResponse {}

// --- Global Search ---
export interface GlobalSearchResult {
  type: 'rule' | 'technique' | 'cve' | 'tactic';
  id: string;
  title: string;
  description?: string;
  relevance_score: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[];
  total: number;
  query: string;
  types_searched: string[];
  facets?: {
    by_type: Record<string, number>;
  };
}

// --- Analytics and Dashboard ---
export interface DashboardStats {
  total_rules: number;
  active_rules: number;
  coverage_percentage: number;
  recent_activity: {
    new_rules_24h: number;
    updated_rules_24h: number;
    new_techniques_covered_7d: number;
  };
  top_sources: Array<{ name: string; count: number }>;
  severity_distribution: Record<string, number>;
  platform_distribution: Record<string, number>;
  enrichment_summary: {
    rules_with_mitre: number;
    rules_with_cves: number;
    average_enrichment_score: number;
  };
}

export interface TrendData {
  date: string;
  rules_count: number;
  techniques_covered: number;
  coverage_percentage: number;
  new_rules?: number;
  updated_rules?: number;
}

// --- Issue Creation ---
export type IssueType = 'False Positive' | 'Tuning Suggestion' | 'Performance Issue' | 
                        'Missing Detection' | 'Bug Report' | 'General Query';

export interface CreateIssuePayload {
  rule_id: string;
  issue_type: IssueType;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  affected_platforms?: string[];
  suggested_fix?: string;
  contact_email?: string;
}

export interface CreateIssueResponse {
  issue_id?: string;
  issue_url?: string;
  status?: 'created' | 'pending' | 'failed';
  message?: string;
  tracking_url?: string;
  rule_id?: string;
}

// --- Enhanced Error Types ---
export interface ApiError extends Error {
  status?: number;
  details?: any;
  code?: string;
}