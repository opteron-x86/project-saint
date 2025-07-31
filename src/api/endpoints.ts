// src/api/endpoints.ts

import { apiGet } from './client';
import {
  RuleSummary,
  RuleDetail,
  FetchRulesResponse,
  PaginationParams,
  RuleFilters,
  TechniquesCoverageResponse,
  FetchRuleStatsResponse,
  FilterOptionsResponse,
} from './types';

// Base endpoint paths
const ENDPOINTS = {
  RULES: '/rules',
  RULE_BY_ID: (id: string) => `/rules/${id}`,
  TECHNIQUES_COVERAGE: '/techniques/coverage',
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
    
    if (pagination.sortBy) params.append('sort_by', pagination.sortBy);
    if (pagination.sortDirection) params.append('sort_dir', pagination.sortDirection);
  }

  if (filters) {
    if (filters.search) params.append('search', filters.search);
    
    filters.severity?.forEach(value => params.append('severity', value));

    // --- FIX APPLIED HERE ---
    // Changed the parameter name from 'platform' to 'platforms' to match the backend API.
    filters.platforms?.forEach(value => params.append('platforms', value));

    filters.rule_platform?.forEach(value => params.append('rule_platform', value));

    filters.rule_source?.forEach(value => params.append('rule_source', value));

    filters.tactics?.forEach(value => params.append('tactic', value));

    filters.tags?.forEach(value => params.append('tag', value));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Fetch rules with pagination and filtering
 */
export const fetchRules = async (
  pagination: PaginationParams,
  filters?: RuleFilters
): Promise<FetchRulesResponse> => {
  try {
    const queryString = buildQueryParams(pagination, filters);
    const url = `${ENDPOINTS.RULES}${queryString}`;
    
    const response = await apiGet<{
      rules: RuleSummary[];
      total: number;
      limit: number;
      offset: number;
    }>(url);
    
    return {
      rules: response.rules,
      total: response.total,
      limit: response.limit,
      page: response.offset / response.limit + 1,
      totalPages: Math.ceil(response.total / response.limit),
    };
  } catch (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }
};

/**
 * Fetch a rule by ID
 */
export const fetchRuleById = async (id: string): Promise<RuleDetail> => {
  try {
    return await apiGet<RuleDetail>(ENDPOINTS.RULE_BY_ID(id));
  } catch (error) {
    console.error(`Error fetching rule with ID ${id}:`, error);
    throw error;
  }
};

/**
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
    
    console.log('Fetching technique coverage with URL:', url);
    return await apiGet<TechniquesCoverageResponse>(url);
  } catch (error) {
    console.error('Error fetching technique coverage:', error);
    throw error;
  }
};

/**
 * Fetch rule statistics
 */
export const fetchRuleStats = async (filters?: RuleFilters): Promise<FetchRuleStatsResponse> => {
  try {
    const queryString = buildQueryParams(undefined, filters);
    const url = `${ENDPOINTS.STATS}${queryString}`;
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


export const CREATE_ISSUE = (ruleId: string): string => `/rules/${ruleId}/issues`;
