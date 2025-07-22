// src/api/types.ts

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 2f90ce0 (refactor to work with the new backend)
// --- Base and Utility Types ---
export enum RuleSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
  Unknown = 'unknown',
}

<<<<<<< HEAD
<<<<<<< HEAD
export interface TechniqueBase {
  id: string;
  name: string;
  reference: string; // Changed from url to match backend schema
  is_subtechnique: boolean;
}

export interface CveBase {
    cve_id: string;
    description: string;
}

// --- MITRE ATT&CK Data Structures ---
export interface MitreTechnique extends TechniqueBase {
  description?: string | null;
  platforms: string[];
  subtechniques: MitreTechnique[];
  is_deprecated?: boolean;
}

=======
// Corresponds to Pydantic TechniqueBase in app.py
=======
>>>>>>> 318d3ed (fixes for rule explorer)
export interface TechniqueBase {
  id: string;
  name: string;
  reference: string; // Changed from url to match backend schema
  is_subtechnique: boolean;
}

export interface CveBase {
    cve_id: string;
    description: string;
}

// --- MITRE ATT&CK Data Structures ---
export interface MitreTechnique extends TechniqueBase {
  description?: string | null;
  platforms: string[];
  subtechniques: MitreTechnique[];
  is_deprecated?: boolean;
}

<<<<<<< HEAD
// Corresponds to Pydantic TacticResponse in app.py
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
>>>>>>> 318d3ed (fixes for rule explorer)
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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export type MitreMatrixData = MitreTactic[];


<<<<<<< HEAD
<<<<<<< HEAD
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
  tags?: string[] | null;
}

// Represents the full details for a single rule, including the raw rule object.
export interface RuleDetail extends RuleSummary {
  author?: string | null;
  source_file_path?: string | null;
  raw_rule?: any | null;
  linked_techniques: TechniqueBase[];
  cves: CveBase[]; // Added CVEs array
}


export interface FetchRulesResponse {
  rules: RuleSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Techniques Coverage Data Structures ---
=======
// If /mitre/matrix returns List[MitreTactic], then:
=======
>>>>>>> 984e985 (backend rework for rule_platforms)
export type MitreMatrixData = MitreTactic[];
=======
export type MitreMatrixData = MitreTactic[]; // This represents the typical structure from /mitre/matrix
>>>>>>> bf06576 (refactoring attack matrix)
=======
export type MitreMatrixData = MitreTactic[];
>>>>>>> 4d01977 (improved issue creator)

// --- Rule Data Structures ---
=======
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

=======
>>>>>>> 37ba2d8 (Initial commit)
// Represents the base information for a rule, common across all sources.
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
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
}

// Represents the full details for a single rule, including the raw rule object.
export interface RuleDetail extends RuleSummary {
  author?: string | null;
  source_file_path?: string | null;
  raw_rule?: any | null;
  linked_techniques: TechniqueBase[];
  cves: CveBase[]; // Added CVEs array
}


export interface FetchRulesResponse {
  rules: RuleSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Techniques Coverage Data Structures ---
<<<<<<< HEAD
// Corresponds to Pydantic TechniqueRuleInfo in app.py
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
>>>>>>> 318d3ed (fixes for rule explorer)
export interface TechniqueRuleInfo {
  id: string;
  title: string;
  severity: string;
  platforms: string[];
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
// Corresponds to Pydantic TechniqueCoverageDetail in app.py
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
>>>>>>> 318d3ed (fixes for rule explorer)
export interface TechniqueCoverageDetail {
  technique_id: string;
  name: string;
  count: number;
  rules: TechniqueRuleInfo[];
}

<<<<<<< HEAD
<<<<<<< HEAD
export interface TechniquesCoverageResponse {
  total_techniques: number;
  techniques: TechniqueCoverageDetail[];
  platform_filter_applied?: string | null;
  rule_platform_filter_applied?: string | null;
}

// --- Rule Statistics Data Structures ---
=======
// Corresponds to Pydantic TechniquesCoverageResponse in app.py
=======
>>>>>>> 318d3ed (fixes for rule explorer)
export interface TechniquesCoverageResponse {
  total_techniques: number;
  techniques: TechniqueCoverageDetail[];
  platform_filter_applied?: string | null;
  rule_platform_filter_applied?: string | null;
}

// --- Rule Statistics Data Structures ---
<<<<<<< HEAD
// Corresponds to Pydantic StatsCategorical in app.py
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
>>>>>>> 318d3ed (fixes for rule explorer)
export interface StatsCategorical {
  by_severity: Record<string, number>;
  by_platform: Record<string, number>;
  by_rule_source: Record<string, number>;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  by_rule_platform: Record<string, number>;
=======
  by_rule_platform: Record<string, number>; // Rule-specific platforms
>>>>>>> bf06576 (refactoring attack matrix)
=======
  by_rule_platform: Record<string, number>;
>>>>>>> 4d01977 (improved issue creator)
}

=======
=======
  by_rule_platform: Record<string, number>; // ADDED: Stats by rule-specific platform
>>>>>>> 984e985 (backend rework for rule_platforms)
}

// Corresponds to Pydantic RuleStatsResponse in app.py
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
  by_rule_platform: Record<string, number>;
}

>>>>>>> 318d3ed (fixes for rule explorer)
export interface RuleStatsResponse {
  total_rules: number;
  active_filters?: Record<string, any> | null;
  stats: StatsCategorical;
}
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 23a6656 (Feature/issue creator)

export interface FetchRuleStatsResponse extends RuleStatsResponse {}

// --- Filter Options Data Structures ---
=======
// Match the backend response structure for /rules/stats
=======
>>>>>>> 984e985 (backend rework for rule_platforms)
export interface FetchRuleStatsResponse extends RuleStatsResponse {}

// --- Filter Options Data Structures ---
<<<<<<< HEAD
// Corresponds to Pydantic FilterOption in app.py
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
>>>>>>> 318d3ed (fixes for rule explorer)
export interface FilterOption {
  value: string;
  label: string;
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
// Corresponds to Pydantic FilterOptionsResponse in app.py
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
>>>>>>> 318d3ed (fixes for rule explorer)
export interface FilterOptionsResponse {
  platforms: FilterOption[];
  rule_sources: FilterOption[];
  severities: FilterOption[];
  tactics: FilterOption[];
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  rule_platforms: FilterOption[];
  validation_statuses: FilterOption[];
<<<<<<< HEAD
=======
  rule_platforms: FilterOption[];
>>>>>>> 4d01977 (improved issue creator)
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
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
<<<<<<< HEAD
=======
=======
  rule_platforms: FilterOption[]; // ADDED: Options for rule-specific platforms
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
  rule_platforms: FilterOption[];
>>>>>>> 318d3ed (fixes for rule explorer)
=======
  rule_platforms: FilterOption[]; // Rule-specific platforms
>>>>>>> bf06576 (refactoring attack matrix)
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
<<<<<<< HEAD
  dateRange?: {
    start?: string;
    end?: string;
  } | null;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
  rule_platform?: string[]; // ADDED: For filtering by rule-specific platform
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
  rule_platform?: string[];
>>>>>>> 318d3ed (fixes for rule explorer)
=======
  rule_platform?: string[]; // For filtering by rule-specific platform
>>>>>>> bf06576 (refactoring attack matrix)
=======
  dateRange?: { start?: string; end?: string; } | null;
  rule_platform?: string[];
>>>>>>> 7449a80 (api updates for filtering)
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
}

// --- Pagination Parameters ---
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
<<<<<<< HEAD
<<<<<<< HEAD
}
<<<<<<< HEAD

<<<<<<< HEAD
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
=======
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
<<<<<<< HEAD
  description: string; 
  submittedBy: string; 
>>>>>>> 23a6656 (Feature/issue creator)
=======
  description: string;
  submittedBy: string;
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
}

export interface CreateIssueResponse {
  message: string;
  issue_url: string;
<<<<<<< HEAD
<<<<<<< HEAD
}
=======
// API response types
export interface ApiResponse<T> {
    items?: T[];
    total?: number;
    status?: string;
    message?: string;
  }
  
  // Rule types
  export interface Rule {
    id: string;
    title: string;
    description: string;
    rule_source: string;
    query: string;
    query_language: string;
    severity: RuleSeverity;
    author: string;
    created_date: string;
    modified_date: string;
    tactics: string[];
    techniques: string[];
    subtechniques: string[];
    platforms: string[];
    categories: string[];
    references: string[];
    tags: string[];
    source_file: string;
    
    // Additional fields specific to Elastic rules
    type?: string;
    enabled?: boolean;
    interval?: string;
    risk_score?: number;
    version?: number;
    revision?: number;
    license?: string;
    note?: string;
    rule_id?: string;
    indices?: string[];
    max_signals?: number;
    from_time?: string;
    to_time?: string;
    false_positives?: string[];
    validated?: boolean;
  }
  
  // MITRE ATT&CK types
  export interface MitreMatrix {
=======
// --- Old types (review and remove if no longer accurate/used) ---
// The existing MitreMatrix, MitreTactic (with nested MitreTechnique), MitreTechnique (with subtechniques),
// MitreSubtechnique, TimelineDataPoint, RuleStats (old version), CoverageHeatmapData, HeatmapGroup, HeatmapCell
// should be reviewed. Many of these are now covered by the more specific types above,
// or the data they represent will come from the new endpoints with new structures.
// For example, the new MitreTactic and MitreTechnique align with what /mitre/matrix returns.
// The old RuleStats is replaced by RuleStatsResponse.

/*
  Review and remove or update these based on current component needs and new API structures:

  export interface MitreMatrix { // This seems too generic now. Use MitreMatrixData = MitreTactic[]
>>>>>>> 2f90ce0 (refactor to work with the new backend)
    id: string;
    name: string;
    tactics: MitreTactic[]; // This MitreTactic is the old one
  }

  // Old MitreTactic, MitreTechnique, MitreSubtechnique are superseded by the new ones above
  // that align with the /mitre/matrix endpoint's response structure.

  export interface TimelineDataPoint { // If still used, ensure data source is updated
    date: string;
    count: number;
  }

  // Old RuleStats - replaced by RuleStatsResponse
  export interface RuleStats {
    totalRules: number;
    bySeverity: Record<RuleSeverity, number>;
    byPlatform: Record<string, number>;
    byRuleSource: Record<string, number>;
    coverageByTactic: Record<string, number>;
    coverageByTechnique: Record<string, number>;
  }

  // TechniqueCoverage was previously defined, now we have TechniquesCoverageResponse
  export interface TechniqueCoverage { // Old - likely superseded
    techniques: Record<string, {
      count: number;
      rules: Rule[]; // Old Rule type
    }>;
    tactics: Record<string, {
      count: number;
      techniques: string[];
    }>;
  }

  // Heatmap types - if the heatmap components use these, they will need to be
  // populated from the new TechniquesCoverageResponse data.
  export interface HeatmapCell {
    id: string;
    name: string;
    count: number;
    percentage?: number;
  }

  export interface HeatmapGroup {
    id: string;
    name: string;
    cells: HeatmapCell[];
  }

  export interface CoverageHeatmapData {
    groups: HeatmapGroup[];
    totalTechniques: number;
    coveredTechniques: number;
    coveragePercentage: number;
  }
<<<<<<< HEAD
>>>>>>> a380730 (Initial deployment)
=======
*/
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
}
>>>>>>> bf06576 (refactoring attack matrix)
=======
}
>>>>>>> 23a6656 (Feature/issue creator)
=======
}
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
