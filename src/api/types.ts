// src/api/types.ts - Enhanced for Phase 2 with TypeScript fixes

// --- Base and Utility Types ---
export enum RuleSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
  Unknown = 'unknown',
}

// --- Enhanced Base Types with Enrichment Support ---
export interface TechniqueBase {
  id: string;
  name: string;
  reference: string;
  is_subtechnique: boolean;
}

export interface CveBase {
  cve_id: string;
  description: string;
  cvss_score?: number | null;
  severity?: string | null;
  published_date?: string | null;
}

// --- Enhanced MITRE ATT&CK Data Structures ---
export interface MitreTechnique extends TechniqueBase {
  description?: string | null;
  platforms: string[];
  subtechniques: MitreTechnique[];
  is_deprecated?: boolean;
  rule_count?: number; // Added for coverage analysis
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
  rule_count?: number; // Added for coverage analysis
}

export type MitreMatrixData = MitreTactic[];

// --- Enhanced Rule Data Structures ---
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
  tags?: string[] | null;
  
  // Enhanced enrichment indicators
  mitre_technique_count?: number;
  cve_count?: number;
  enrichment_status?: 'full' | 'partial' | 'none';
}

export interface PerformanceMetrics {
  effectiveness_score?: number;
  false_positive_rate?: number;
  last_triggered?: string;
}

export interface ElasticDetails {
  query?: string;
  language?: string;
  risk_score?: number;
  version?: number;
  false_positives?: string[];
}

export interface SentinelDetails {
  query?: string;
  query_frequency?: string;
  query_period?: string;
  trigger_threshold?: number;
}

export interface TrinityCyberDetails {
  action?: string;
  checksum?: string;
  implementation?: Record<string, unknown>;
  references?: string[];
}

export interface RuleDetail extends RuleSummary {
  author?: string | null;
  source_file_path?: string | null;
  raw_rule?: Record<string, unknown> | null;
  
  // Enhanced relationship data
  linked_techniques: TechniqueBase[];
  cves: CveBase[];
  
  // Performance and analysis data
  performance_metrics?: PerformanceMetrics;
  
  // Source-specific details
  elastic_details?: ElasticDetails;
  sentinel_details?: SentinelDetails;
  trinity_cyber_details?: TrinityCyberDetails;
}

export interface FetchRulesResponse {
  rules: RuleSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Enhanced Filter Types ---
export interface RuleFilters {
  search?: string;
  severity?: string[];
  platforms?: string[];
  techniques?: string[];
  tactics?: string[];
  rule_source?: string[];
  tags?: string[];
  dateRange?: { start?: string; end?: string } | null;
  rule_platform?: string[];
  validation_status?: string[];
  
  // Enhanced filtering options
  mitre_techniques?: string[];
  cve_ids?: string[];
  enrichment_status?: ('full' | 'partial' | 'none')[];
  is_active?: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number; // Added for dynamic filter counts
}

export interface FilterOptionsResponse {
  platforms: FilterOption[];
  rule_sources: FilterOption[];
  severities: FilterOption[];
  tactics: FilterOption[];
  rule_platforms: FilterOption[];
  validation_statuses: FilterOption[];
  
  // Enhanced filter options
  mitre_techniques: FilterOption[];
  enrichment_statuses: FilterOption[];
}

// --- Pagination Parameters ---
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// --- Enhanced Statistics Types ---
export interface StatsCategorical {
  [key: string]: number;
}

export interface EnrichmentStats {
  mitre: {
    with_mappings: number;
    with_metadata: number;
    coverage_percentage: number;
  };
  cve: {
    with_mappings: number;
    with_metadata: number;
    coverage_percentage: number;
  };
}

export interface RuleStatsResponse {
  total: number;
  active: number;
  by_severity: StatsCategorical;
  by_source: StatsCategorical;
  by_platform: StatsCategorical;
  by_tactic: StatsCategorical;
  
  // Enhanced enrichment statistics
  enrichment: EnrichmentStats;
}

export interface FetchRuleStatsResponse extends RuleStatsResponse {
  // Adding any additional response-specific fields
}

// --- Coverage Analysis Types ---
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
  coverage_percentage?: number;
}

export interface CoverageSummary {
  techniques_covered: number;
  coverage_percentage: number;
  gaps_identified: number;
}

export interface TechniquesCoverageResponse {
  total_techniques: number;
  techniques: TechniqueCoverageDetail[];
  platform_filter_applied?: string | null;
  rule_platform_filter_applied?: string | null;
  
  // Enhanced coverage metrics
  coverage_summary: CoverageSummary;
}

// --- Dashboard and Analytics Types ---
export interface DashboardOverview {
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
  recent_activity: {
    rules_added_this_week: number;
    rules_updated_this_week: number;
  };
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TacticsChartDataPoint {
  tactic: string;
  coverage: number;
  total: number;
}

export interface TrendDataPoint {
  date: string;
  count: number;
  type: string;
}

export interface ChartData {
  severity_distribution: ChartDataPoint[];
  rules_by_source: ChartDataPoint[];
  mitre_tactic_coverage: TacticsChartDataPoint[];
  trend_data: TrendDataPoint[];
}

export interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  created_date: string;
  action_url?: string;
}

export interface DashboardMetadata {
  last_updated: string;
  data_freshness: number; // minutes
}

export interface DashboardResponse {
  overview: DashboardOverview;
  charts: ChartData;
  alerts: DashboardAlert[];
  metadata: DashboardMetadata;
}

// --- Trend Analysis Types ---
export interface TrendDataPointDetailed {
  date: string;
  rules_created: number;
  rules_updated: number;
  techniques_covered: number;
  cves_added: number;
}

export interface TrendInsights {
  growth_rate: number;
  coverage_trend: 'improving' | 'stable' | 'declining';
  key_metrics: Record<string, number>;
}

export interface TrendAnalysisResponse {
  period: string;
  data_points: TrendDataPointDetailed[];
  insights: TrendInsights;
}

// --- Global Search Types ---
export interface GlobalSearchResult {
  id: string;
  type: 'rule' | 'cve' | 'mitre_technique';
  title: string;
  description: string;
  relevance_score: number;
  metadata?: Record<string, unknown>;
}

export interface GlobalSearchResults {
  rules: GlobalSearchResult[];
  cves: GlobalSearchResult[];
  mitre_techniques: GlobalSearchResult[];
}

export interface GlobalSearchResponse {
  query: string;
  total_results: number;
  results: GlobalSearchResults;
  execution_time_ms: number;
}

// --- Export Types ---
export interface ExportRequest {
  format: 'json' | 'csv';
  filters?: RuleFilters;
  fields?: string[];
}

export interface ExportResponse {
  export_id: string;
  download_url: string;
  expires_at: string;
  record_count: number;
  file_size_bytes?: number;
}

// --- Issue Management Types ---
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
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

export interface CreateIssueResponse {
  message: string;
  issue_url: string;
  issue_id: string;
  rule_id: string;
}

// --- CVE Types ---
export interface CveDetail extends CveBase {
  vector?: string;
  impact_score?: number;
  exploitability_score?: number;
  references?: string[];
  affected_rules: RuleSummary[];
}

export interface CveStatsResponse {
  total_cves: number;
  by_severity: StatsCategorical;
  by_year: StatsCategorical;
  coverage_by_rules: number;
  high_risk_unmapped: number;
}

// --- Enhanced Error Types ---
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
  timestamp?: string;
  request_id?: string;
}

// --- API Response Wrapper ---
export interface ApiResponseMetadata {
  execution_time_ms?: number;
  cache_hit?: boolean;
  version?: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  metadata?: ApiResponseMetadata;
}

// --- New Response Types for Enhanced Endpoints ---
export interface RuleEnrichmentResponse {
  total_rules: number;
  enrichment_stats: EnrichmentStats;
  by_source: StatsCategorical;
}

export interface MitreTechniquesResponse {
  techniques: MitreTechnique[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MitreTacticsResponse {
  tactics: MitreTactic[];
  total: number;
}

// --- Health Check Types ---
export interface HealthResponse {
  status: string;
  version?: string;
  timestamp?: string;
  dependencies?: Record<string, string>;
}