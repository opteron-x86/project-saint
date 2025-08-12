// src/api/types.ts

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

// FIX 1: Extended PaginationParams with sorting fields
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  include_facets?: boolean;
}

// --- Enhanced MITRE ATT&CK Data Structures ---
export interface MitreTechnique extends TechniqueBase {
  description?: string | null;
  platforms: string[];
  subtechniques: MitreTechnique[];
  is_deprecated?: boolean;
  stix_id?: string | null;
  rule_count?: number;
  coverage_percentage?: number;
}

export interface MitreTactic {
  id: string;
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

// --- Enhanced CVE Data Structures ---
export interface CveData {
  id: string;
  cve_id: string;
  description?: string | null;
  severity?: string | null;
  cvss_score?: number | null;
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

// --- Enhanced Source-Specific Rule Detail Types ---
export interface ElasticDetails {
  query: string;
  language?: string | null;
  severity?: string | null;
  version?: string | null;
  license?: string | null;
  tags?: string[] | null;
  false_positives?: string[] | null;
  interval?: string | null;
  risk_score?: number | null;
  extracted_mitre?: string[] | null;
  extracted_cves?: string[] | null;
}

export interface SentinelDetails {
  query: string;
  severity?: string | null;
  query_frequency?: string | null;
  query_period?: string | null;
  trigger_operator?: string | null;
  trigger_threshold?: number | null;
  suppression_duration?: string | null;
  suppression_enabled?: boolean | null;
  tactics?: string[] | null;
  entity_mappings?: any | null;
  event_grouping_settings?: any | null;
  extracted_mitre?: string[] | null;
  extracted_cves?: string[] | null;
}

export interface TrinityCyberDetails {
  action?: string | null;
  checksum?: string | null;
  human_hash?: string | null;
  implementation?: any | null;
  information_controls?: any | null;
  references?: string[] | null;
  cve?: string[] | null;
  extracted_mitre?: string[] | null;
  extracted_cves?: string[] | null;
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
  enrichment_score?: number;
  tags?: string[] | null;
}

// FIX 2: Extended RuleDetail with additional properties and index signature
export interface RuleDetail extends RuleSummary {
  author?: string | null;
  source_file_path?: string | null;
  raw_rule?: any | null;
  linked_techniques: TechniqueBase[];
  elastic_details?: ElasticDetails | null;
  sentinel_details?: SentinelDetails | null;
  trinitycyber_details?: TrinityCyberDetails | null;
  mitre_techniques?: MitreTechnique[] | null;
  cve_references?: CveData[] | null;
  cves?: CveData[] | null; // Added for compatibility
  related_rules?: RuleSummary[] | null;
  rule_metadata?: Record<string, unknown> | null;
  rule_content?: string | null;
  is_active?: boolean;
  validation_status?: string;
  [key: string]: any; // Index signature for type casting
}

// --- API Response Types (Matching Lambda format) ---
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

// --- Techniques Coverage ---
export interface TechniqueRuleInfo {
  id: string;
  title: string;
  severity: string;
  platforms: string[];
  rule_source?: string;
  enrichment_score?: number;
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
  coverage_gaps?: {
    technique_id: string;
    name: string;
    priority: 'high' | 'medium' | 'low';
    platforms: string[];
  }[];
  trending?: {
    improving: TechniqueCoverageDetail[];
    declining: TechniqueCoverageDetail[];
  };
}

// --- Rule Statistics ---
export interface StatsCategorical {
  by_severity: Record<string, number>;
  by_platform: Record<string, number>;
  by_rule_source: Record<string, number>;
  by_rule_platform: Record<string, number>;
  by_mitre_coverage: Record<string, number>;
  by_cve_coverage: Record<string, number>;
  by_enrichment_quality: Record<string, number>;
}

export interface RuleStatsResponse {
  total_rules: number;
  active_rules: number;
  inactive_rules: number;
  active_filters?: Record<string, any> | null;
  stats: StatsCategorical;
  enrichment_stats: {
    rules_with_mitre: number;
    rules_with_cves: number;
    average_enrichment_score: number;
    total_mitre_techniques_covered: number;
    total_cves_referenced: number;
  };
}

export interface FetchRuleStatsResponse extends RuleStatsResponse {}

// --- Filter Options ---
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  description?: string;
}

export interface FilterOptionsResponse {
  platforms: FilterOption[];
  rule_sources: FilterOption[];
  severities: FilterOption[];
  tactics: FilterOption[];
  rule_platforms: FilterOption[];
  validation_statuses: FilterOption[];
  mitre_techniques: FilterOption[];
  cve_severities: FilterOption[];
  enrichment_levels: FilterOption[];
}

// FIX 3: Extended RuleFilters with enrichment fields
export interface RuleFilters {
  search?: string;
  query?: string;
  severity?: string[];
  platforms?: string[];
  techniques?: string[];
  tactics?: string[];
  rule_source?: string[];
  tags?: string[];
  dateRange?: { start?: string; end?: string; } | null;
  rule_platform?: string[];
  validation_status?: string[];
  mitre_techniques?: string[];
  cve_ids?: string[];
  has_mitre?: boolean;
  has_cves?: boolean;
  is_active?: boolean;
  // Added enrichment filter fields
  has_mitre_mapping?: boolean;
  has_cve_references?: boolean;
  enrichment_score_min?: number;
}

// --- Export Options ---
// FIX 4: Corrected ExportOptions interface
export interface ExportOptions {
  format: 'json' | 'csv' | 'yaml';
  include_enrichments?: boolean; // Changed from include_enrichment_data
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
  issue_id: string;
  status: 'created' | 'pending' | 'failed';
  message?: string;
  tracking_url?: string;
}

// --- Enhanced Error Types ---
export interface ApiError extends Error {
  status?: number;
  details?: any;
  code?: string;
}