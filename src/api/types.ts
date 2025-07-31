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

// --- Enhanced MITRE ATT&CK Data Structures ---
export interface MitreTechnique extends TechniqueBase {
  description?: string | null;
  platforms: string[];
  subtechniques: MitreTechnique[];
  is_deprecated?: boolean;
  stix_id?: string | null;
  rule_count?: number; // New: number of rules covering this technique
  coverage_percentage?: number; // New: coverage percentage
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
  rule_count?: number; // New: total rules for this tactic
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
  rule_count?: number; // New: number of rules referencing this CVE
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
  // New: extracted enrichments
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
  // New: extracted enrichments
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
  // New: extracted enrichments
  extracted_mitre?: string[] | null;
  extracted_cves?: string[] | null;
}

// Represents the base information for a rule, common across all sources.
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
  // New: enriched data indicators
  has_mitre_mapping?: boolean;
  has_cve_references?: boolean;
  enrichment_score?: number; // 0-100 indicating how well enriched the rule is
  tags?: string[] | null; // Searchable tags from processors
}

// Represents the full details for a single rule, including nested source-specific data.
export interface RuleDetail extends RuleSummary {
  author?: string | null;
  source_file_path?: string | null;
  raw_rule?: any | null;
  linked_techniques: TechniqueBase[];
  elastic_details?: ElasticDetails | null;
  sentinel_details?: SentinelDetails | null;
  trinitycyber_details?: TrinityCyberDetails | null;
  // New: enriched relationship data
  mitre_techniques?: MitreTechnique[] | null; // Full technique objects with metadata
  cve_references?: CveData[] | null; // Full CVE objects with details
  related_rules?: RuleSummary[] | null; // Rules with similar techniques/CVEs
}

export interface FetchRulesResponse {
  rules: RuleSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  // New: aggregation data
  facets?: {
    severity: Record<string, number>;
    platforms: Record<string, number>;
    rule_sources: Record<string, number>;
    has_mitre: Record<string, number>;
    has_cves: Record<string, number>;
  };
}

// --- Enhanced Techniques Coverage Data Structures ---
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
  // New: enhanced coverage data
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
  // New: coverage analytics
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

// --- Enhanced Rule Statistics Data Structures ---
export interface StatsCategorical {
  by_severity: Record<string, number>;
  by_platform: Record<string, number>;
  by_rule_source: Record<string, number>;
  by_rule_platform: Record<string, number>;
  // New: enrichment statistics
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
  // New: enrichment statistics
  enrichment_stats: {
    rules_with_mitre: number;
    rules_with_cves: number;
    average_enrichment_score: number;
    total_mitre_techniques_covered: number;
    total_cves_referenced: number;
  };
}

export interface FetchRuleStatsResponse extends RuleStatsResponse {}

// --- Enhanced Filter Options Data Structures ---
export interface FilterOption {
  value: string;
  label: string;
  count?: number; // New: count of items for this filter
  description?: string; // New: optional description
}

export interface FilterOptionsResponse {
  platforms: FilterOption[];
  rule_sources: FilterOption[];
  severities: FilterOption[];
  tactics: FilterOption[];
  rule_platforms: FilterOption[];
  validation_statuses: FilterOption[];
  // New: enrichment-based filters
  mitre_techniques: FilterOption[];
  cve_severities: FilterOption[];
  enrichment_levels: FilterOption[];
}

// --- Enhanced Filter Types for UI and API Requests ---
export interface RuleFilters {
  search?: string;
  query?: string; // New: dedicated full-text search
  severity?: string[];
  platforms?: string[];
  techniques?: string[];
  tactics?: string[];
  rule_source?: string[];
  tags?: string[];
  dateRange?: { start?: string; end?: string; } | null;
  rule_platform?: string[];
  validation_status?: string[];
  // New: enhanced filtering options
  mitre_techniques?: string[]; // Filter by specific MITRE techniques
  cve_ids?: string[]; // Filter by specific CVE IDs
  has_mitre_mapping?: boolean; // Filter rules with/without MITRE mappings
  has_cve_references?: boolean; // Filter rules with/without CVE references
  enrichment_score_min?: number; // Minimum enrichment score (0-100)
  is_active?: boolean; // Filter active/inactive rules
  created_after?: string; // Filter by creation date
  modified_after?: string; // Filter by modification date
}

// --- Pagination Parameters ---
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // New: enhanced sorting options
  include_facets?: boolean; // Include aggregation data in response
}

// --- Analytics and Dashboard Data Structures ---
export interface DashboardStats {
  overview: {
    total_rules: number;
    active_rules: number;
    mitre_coverage: {
      techniques_covered: number;
      coverage_percentage: number;
    };
    cve_coverage: {
      rules_with_cves: number;
      coverage_percentage: number;
    };
  };
  charts: {
    severity_distribution: { name: string; value: number; color?: string }[];
    rules_by_source: { name: string; value: number; color?: string }[];
    mitre_tactic_coverage: { tactic: string; covered: number; total: number }[];
    enrichment_quality: { level: string; count: number }[];
  };
  alerts: {
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    action_url?: string;
  }[];
  recent_activity: {
    type: 'rule_created' | 'rule_updated' | 'enrichment_improved';
    title: string;
    description: string;
    timestamp: string;
    rule_id?: string;
  }[];
}

export interface TrendData {
  time_series: {
    date: string;
    rules_created: number;
    rules_updated: number;
    enrichment_improvements: number;
  }[];
  period_comparison: {
    current_period: {
      rules_created: number;
      rules_updated: number;
      coverage_improvement: number;
    };
    previous_period: {
      rules_created: number;
      rules_updated: number;
      coverage_improvement: number;
    };
    percentage_change: {
      rules_created: number;
      rules_updated: number;
      coverage_improvement: number;
    };
  };
}

// --- Export Data Structures ---
export interface ExportOptions {
  format: 'json' | 'csv' | 'excel';
  include_enrichment_data?: boolean;
  include_rule_content?: boolean;
  filters?: RuleFilters;
}

export interface ExportResponse {
  download_url: string;
  expires_at: string;
  file_size_bytes: number;
  record_count: number;
}

// --- Global Search Data Structures ---
export interface GlobalSearchResult {
  type: 'rule' | 'technique' | 'cve';
  id: string;
  title: string;
  description?: string;
  score: number; // Search relevance score
  highlight?: string; // Highlighted matching text
  metadata?: Record<string, any>;
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[];
  total: number;
  query: string;
  took_ms: number;
  facets: {
    by_type: Record<string, number>;
    by_source: Record<string, number>;
  };
}

// --- Issue Creation (existing, keeping for compatibility) ---
export type IssueType =
  | 'False Positive'
  | 'Tuning Suggestion'
  | 'General Query'
  | 'Performance Issue'
  | 'Missing Detection'
  | 'Bug Report';

export interface CreateIssuePayload {
  title: string;
  issueType: IssueType;
  eventSource: string;
  eventTimestamp: string;
  description: string;
  submittedBy: string;
}

export interface CreateIssueResponse {
  message: string;
  issue_url: string;
  rule_id: string;
}