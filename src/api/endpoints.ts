// src/api/endpoints.ts

import { apiGet } from './client';
import {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  RuleSummary,
  RuleDetail,
  FetchRulesResponse,
  PaginationParams,
  RuleFilters,
<<<<<<< HEAD
  TechniquesCoverageResponse,
  FetchRuleStatsResponse,
  FilterOptionsResponse,
} from './types';

// Base endpoint paths
const ENDPOINTS = {
  RULES: '/rules',
  RULE_BY_ID: (id: string) => `/rules/${id}`,
  TECHNIQUES_COVERAGE: '/mitre/coverage',
  STATS: '/rules/stats',
  FILTERS_OPTIONS: '/filters/options',
  MITRE_MATRIX: '/mitre/matrix',
};

/**
 * Convert filters and pagination to query parameters.
 * Ensures all filter parameters are correctly included.
 */
const buildQueryParams = (
    pagination?: PaginationParams,
    filters?: RuleFilters,
): string => {
  const params = new URLSearchParams();

  if (pagination) {
    params.append('offset', ((pagination.page - 1) * pagination.limit).toString());
    params.append('limit', pagination.limit.toString());
    
    if (pagination.sortBy) {
      params.append('sort_by', pagination.sortBy);
    }
    if (pagination.sortDirection) {
      params.append('sort_dir', pagination.sortDirection);
    }
  }

  if (filters) {
    if (filters.search) {
      params.append('query', filters.search);
    }
    filters.severity?.forEach(value => params.append('severities', value));
    filters.rule_source?.forEach(value => params.append('source_ids', value));
    filters.tags?.forEach(value => params.append('tags', value));
    filters.platforms?.forEach(value => params.append('platforms', value));
    filters.rule_platform?.forEach(value => params.append('rule_platforms', value));
    filters.tactics?.forEach(value => params.append('tactics', value));
  }

=======
  Rule,
=======
  RuleSummary,         // Updated: Using RuleSummary for lists
  RuleDetail,          // Updated: Using RuleDetail for single rule
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
  RuleSummary,
  RuleDetail,
>>>>>>> 984e985 (backend rework for rule_platforms)
  FetchRulesResponse,
  PaginationParams,
  RuleFilters, // This type now includes rule_platform?: string[]
=======
>>>>>>> 23a6656 (Feature/issue creator)
  TechniquesCoverageResponse,
  FetchRuleStatsResponse,
  FilterOptionsResponse,
} from './types';

// Base endpoint paths
const ENDPOINTS = {
  RULES: '/rules',
  RULE_BY_ID: (id: string) => `/rules/${id}`,
  TECHNIQUES_COVERAGE: '/mitre/coverage',
  STATS: '/rules/stats',
  FILTERS_OPTIONS: '/filters/options',
  MITRE_MATRIX: '/mitre/matrix',
};

/**
 * Convert filters and pagination to query parameters.
 * Ensures all filter parameters are correctly included.
 */
const buildQueryParams = (
    pagination?: PaginationParams,
    filters?: RuleFilters,
): string => {
  const params = new URLSearchParams();

  if (pagination) {
    params.append('offset', ((pagination.page - 1) * pagination.limit).toString());
    params.append('limit', pagination.limit.toString());
    
    if (pagination.sortBy) {
      params.append('sort_by', pagination.sortBy);
    }
    if (pagination.sortDirection) {
      params.append('sort_dir', pagination.sortDirection);
    }
  }

  if (filters) {
    if (filters.search) {
      params.append('query', filters.search);
    }
    filters.severity?.forEach(value => params.append('severities', value));
    filters.rule_source?.forEach(value => params.append('source_ids', value));
    filters.tags?.forEach(value => params.append('tags', value));
    filters.platforms?.forEach(value => params.append('platforms', value));
    filters.rule_platform?.forEach(value => params.append('rule_platforms', value));
    filters.tactics?.forEach(value => params.append('tactics', value));
  }

<<<<<<< HEAD
  if (platform) {
    // Assuming your backend expects a query param like 'platform' or 'platforms'
    params.append('platform', platform);
  }
  
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 946a95a (Fixed endpoints)
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Fetch rules with pagination and filtering
 */
export const fetchRules = async (
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  pagination: PaginationParams,
=======
  pagination?: PaginationParams,
>>>>>>> a380730 (Initial deployment)
=======
  pagination: PaginationParams, // Made pagination required as backend needs offset/limit
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
  pagination: PaginationParams,
>>>>>>> 984e985 (backend rework for rule_platforms)
  filters?: RuleFilters
): Promise<FetchRulesResponse> => {
  try {
    const queryString = buildQueryParams(pagination, filters);
    const url = `${ENDPOINTS.RULES}${queryString}`;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    
<<<<<<< HEAD
    const response = await apiGet<{
      items: RuleSummary[];
      total: number;
      limit: number;
      offset: number;
    }>(url);
    
    return {
      rules: response.items,
      total: response.total,
      limit: response.limit,
      page: (response.offset / response.limit) + 1,
      totalPages: Math.ceil(response.total / response.limit),
=======
=======

>>>>>>> 946a95a (Fixed endpoints)
=======
>>>>>>> 2f90ce0 (refactor to work with the new backend)
    console.log('Fetching rules with URL:', url);

=======
    
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
    const response = await apiGet<{
      items: RuleSummary[];
      total: number;
      limit: number;
      offset: number;
    }>(url);
    
    return {
<<<<<<< HEAD
<<<<<<< HEAD
      rules: [],
      total: 0,
      page: pagination?.page || 1,
      limit: pagination?.limit || 25,
      totalPages: 0,
>>>>>>> a380730 (Initial deployment)
=======
      rules: response.rules,
=======
      rules: response.items,
>>>>>>> 37ba2d8 (Initial commit)
      total: response.total,
      limit: response.limit,
      page: (response.offset / response.limit) + 1,
      totalPages: Math.ceil(response.total / response.limit),
>>>>>>> 2f90ce0 (refactor to work with the new backend)
    };
  } catch (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }
};

/**
 * Fetch a rule by ID
 */
<<<<<<< HEAD
<<<<<<< HEAD
export const fetchRuleById = async (id: string): Promise<RuleDetail> => {
  try {
    return await apiGet<RuleDetail>(ENDPOINTS.RULE_BY_ID(id));
=======
export const fetchRuleById = async (id: string): Promise<Rule> => {
  try {
    return await apiGet<Rule>(ENDPOINTS.RULE_BY_ID(id));
>>>>>>> a380730 (Initial deployment)
=======
export const fetchRuleById = async (id: string): Promise<RuleDetail> => {
  try {
    return await apiGet<RuleDetail>(ENDPOINTS.RULE_BY_ID(id));
>>>>>>> 2f90ce0 (refactor to work with the new backend)
  } catch (error) {
    console.error(`Error fetching rule with ID ${id}:`, error);
    throw error;
  }
};

/**
<<<<<<< HEAD
<<<<<<< HEAD
 * Fetch technique coverage statistics
 */
export const fetchTechniqueCoverage = async (
  platform?: string | null,
  rulePlatform?: string | null
): Promise<TechniquesCoverageResponse> => {
  try {
    const params = new URLSearchParams();
    if (platform) {
      params.append('platform', platform);
    }
    if (rulePlatform) {
      params.append('rule_platform', rulePlatform);
    }
    const queryString = params.toString();
    const url = `${ENDPOINTS.TECHNIQUES_COVERAGE}${queryString ? `?${queryString}` : ''}`;
    
<<<<<<< HEAD
    return await apiGet<TechniquesCoverageResponse>(url);
=======
 * Fetch rules by technique ID
 * This now calls the main /rules endpoint with a technique_id filter
 */
export const fetchRulesByTechnique = async (
  techniqueId: string,
  pagination?: PaginationParams
): Promise<FetchRulesResponse> => {
  try {
    // Pass the techniqueId as part of the filters
    const filters: RuleFilters = { techniques: [techniqueId] };
    const queryString = buildQueryParams(pagination, filters);
    const url = `${ENDPOINTS.RULES}${queryString}`;

    console.log('Fetching rules by technique with URL:', url);
    const response = await apiGet<any>(url); // Adjust 'any' as needed

    // Assuming the response structure is similar to the main fetchRules
    if (response.rules && Array.isArray(response.rules) && typeof response.total === 'number') {
        return {
          rules: response.rules,
          total: response.total,
          page: response.offset / response.limit + 1,
          limit: response.limit,
          totalPages: Math.ceil(response.total / response.limit),
        };
      }

    console.error('Unexpected API response format for fetchRulesByTechnique:', response);
    return { rules: [], total: 0, page: 1, limit: 25, totalPages: 0 };

  } catch (error) {
    console.error(`Error fetching rules for technique ${techniqueId}:`, error);
    throw error;
  }
};

/**
 * Fetch rules by platform
 * This now calls the main /rules endpoint with a platform filter
 */
export const fetchRulesByPlatform = async (
  platform: string,
  pagination?: PaginationParams
): Promise<FetchRulesResponse> => {
  try {
    // Pass the platform as part of the filters
    const filters: RuleFilters = { platforms: [platform] };
    const queryString = buildQueryParams(pagination, filters);
    const url = `${ENDPOINTS.RULES}${queryString}`;

    console.log('Fetching rules by platform with URL:', url);
    const response = await apiGet<any>(url); // Adjust 'any' as needed

    if (response.rules && Array.isArray(response.rules) && typeof response.total === 'number') {
        return {
          rules: response.rules,
          total: response.total,
          page: response.offset / response.limit + 1,
          limit: response.limit,
          totalPages: Math.ceil(response.total / response.limit),
        };
      }

    console.error('Unexpected API response format for fetchRulesByPlatform:', response);
    return { rules: [], total: 0, page: 1, limit: 25, totalPages: 0 };

  } catch (error) {
    console.error(`Error fetching rules for platform ${platform}:`, error);
    throw error;
  }
};

/**
=======
>>>>>>> 2f90ce0 (refactor to work with the new backend)
 * Fetch technique coverage statistics
 */
export const fetchTechniqueCoverage = async (
  platform?: string | null,
  rulePlatform?: string | null
): Promise<TechniquesCoverageResponse> => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
    return await apiGet<TechniqueCoverage>(ENDPOINTS.TECHNIQUES_COVERAGE);
>>>>>>> a380730 (Initial deployment)
=======
    let url = ENDPOINTS.TECHNIQUES_COVERAGE;
=======
    const params = new URLSearchParams();
>>>>>>> 984e985 (backend rework for rule_platforms)
    if (platform) {
      params.append('platform', platform);
    }
    if (rulePlatform) {
      params.append('rule_platform', rulePlatform);
    }
    const queryString = params.toString();
    const url = `${ENDPOINTS.TECHNIQUES_COVERAGE}${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching technique coverage with URL:', url);
=======
>>>>>>> 37ba2d8 (Initial commit)
    return await apiGet<TechniquesCoverageResponse>(url);
>>>>>>> 2f90ce0 (refactor to work with the new backend)
  } catch (error) {
    console.error('Error fetching technique coverage:', error);
    throw error;
  }
};

/**
 * Fetch rule statistics
 */
<<<<<<< HEAD
<<<<<<< HEAD
export const fetchRuleStats = async (filters?: RuleFilters): Promise<FetchRuleStatsResponse> => {
  try {
    const queryString = buildQueryParams(undefined, filters);
    const url = `${ENDPOINTS.STATS}${queryString}`;
<<<<<<< HEAD
<<<<<<< HEAD
    return await apiGet<FetchRuleStatsResponse>(url);
  } catch (error) {
    console.error('Error fetching rule statistics:', error);
    throw error;
  }
};

/**
 * Fetch available filter options
 */
export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  try {
    return await apiGet<FilterOptionsResponse>(ENDPOINTS.FILTERS_OPTIONS);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};

<<<<<<< HEAD
export const CREATE_ISSUE = (ruleId: string): string => `/rules/${ruleId}/issues`;
=======
export const fetchRuleStats = async (filters?: RuleFilters) => {
=======
export const fetchRuleStats = async (filters?: RuleFilters): Promise<FetchRuleStatsResponse> => {
>>>>>>> 946a95a (Fixed endpoints)
  try {
    const queryString = buildQueryParams(undefined, filters);
    // Assuming your backend might have a /rules/stats endpoint, or adjust as needed
    const url = `${ENDPOINTS.RULES}/stats${queryString}`;

=======
>>>>>>> 2f90ce0 (refactor to work with the new backend)
    console.log('Fetching rule stats from URL:', url);
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
    return await apiGet<FetchRuleStatsResponse>(url);
  } catch (error) {
    console.error('Error fetching rule statistics:', error);
    throw error;
  }
};
<<<<<<< HEAD
>>>>>>> a380730 (Initial deployment)
=======

/**
 * Fetch available filter options
 */
export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  try {
    return await apiGet<FilterOptionsResponse>(ENDPOINTS.FILTERS_OPTIONS);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};

<<<<<<< HEAD
<<<<<<< HEAD
// fetchRulesByTechnique and fetchRulesByPlatform are now covered by fetchRules
// by passing the appropriate filter in RuleFilters.
// Example usage from queries.ts would change:
// useRulesByTechniqueQuery(techniqueId, pagination) would call:
//   fetchRules(pagination, { techniques: [techniqueId] })

<<<<<<< HEAD
// Similarly for platforms.
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
// Example for fetching Mitre Matrix data if you centralize all fetches here
// import { MitreMatrixData } from './types'; // Ensure type is imported
// export const fetchMitreMatrix = async (): Promise<MitreMatrixData> => {
//   try {
//     return await apiGet<MitreMatrixData>(ENDPOINTS.MITRE_MATRIX);
//   } catch (error) {
//     console.error('Error fetching MITRE Matrix data:', error);
//     throw error;
//   }
// };
>>>>>>> 984e985 (backend rework for rule_platforms)
=======

export const CREATE_ISSUE = (ruleId: string): string => `/rules/${ruleId}/issues`;
>>>>>>> 23a6656 (Feature/issue creator)
=======
export const CREATE_ISSUE = (ruleId: string): string => `/rules/${ruleId}/issues`;
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
=======
export const CREATE_ISSUE = (ruleId: string): string => `/rules/${ruleId}/issues`;
>>>>>>> 37ba2d8 (Initial commit)
