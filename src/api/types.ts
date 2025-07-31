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

// --- MITRE ATT&CK Data Structures ---
export interface MitreTechnique extends TechniqueBase {
  description?: string | null;
  platforms: string[];
  subtechniques: MitreTechnique[];
  is_deprecated?: boolean;
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
}

export type MitreMatrixData = MitreTactic[];


// --- Source-Specific Rule Detail Types ---
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
}

export interface TrinityCyberDetails {
  action?: string | null;
  checksum?: string | null;
  human_hash?: string | null;
  implementation?: any | null;
  information_controls?: any | null;
  references?: string[] | null;
  cve?: string[] | null;
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
}


export interface FetchRulesResponse {
  rules: RuleSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Techniques Coverage Data Structures ---
export interface TechniqueRuleInfo {
  id: string;
  title: string;
  severity: string;
  platforms: string[];
}

export interface TechniqueCoverageDetail {
  technique_id: string;
  name: string;
  count: number;
  rules: TechniqueRuleInfo[];
}

export interface TechniquesCoverageResponse {
  total_techniques: number;
  techniques: TechniqueCoverageDetail[];
  platform_filter_applied?: string | null;
  rule_platform_filter_applied?: string | null;
}

// --- Rule Statistics Data Structures ---
export interface StatsCategorical {
  by_severity: Record<string, number>;
  by_platform: Record<string, number>;
  by_rule_source: Record<string, number>;
  by_rule_platform: Record<string, number>;
}

export interface RuleStatsResponse {
  total_rules: number;
  active_filters?: Record<string, any> | null;
  stats: StatsCategorical;
}

export interface FetchRuleStatsResponse extends RuleStatsResponse {}

// --- Filter Options Data Structures ---
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOptionsResponse {
  platforms: FilterOption[];
  rule_sources: FilterOption[];
  severities: FilterOption[];
  tactics: FilterOption[];
  rule_platforms: FilterOption[];
  validation_statuses: FilterOption[];
}

// --- Filter Types for UI and API Requests ---
export interface RuleFilters {
  search?: string;
  severity?: string[];
  platforms?: string[];
  techniques?: string[];
  tactics?: string[];
  rule_source?: string[];
  tags?: string[];
  dateRange?: { start?: string; end?: string; } | null;
  rule_platform?: string[];
  validation_status?: string[];
}

// --- Pagination Parameters ---
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Represents the valid string literals for issue types
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
}
