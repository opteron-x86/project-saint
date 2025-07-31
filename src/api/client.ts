// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CREATE_ISSUE } from './endpoints';
import { CreateIssuePayload, CreateIssueResponse, RuleSummary } from './types';

const API_URL = '/api';

// Define a generic error type
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

/**
 * Create an API error from an Axios error
 */
const createApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return {
      status: axiosError.response?.status || 500,
      message: axiosError.message,
      details: axiosError.response?.data,
    };
  }
  
  // For non-axios errors
  return {
    status: 500,
    message: error.message || 'Unknown error occurred',
    details: error,
  };
};

/**
 * Transform API rule item to frontend RuleSummary format
 */
const transformApiRuleToRuleSummary = (apiItem: any): RuleSummary => {
  return {
    id: String(apiItem.id), // Convert number to string for consistency
    source_rule_id: apiItem.rule_id || null,
    title: apiItem.name || '', // API uses 'name', frontend expects 'title'
    description: apiItem.description || null,
    platforms: apiItem.platforms || null,
    rule_source: apiItem.source?.name || apiItem.rule_type || '', // Use source name or fallback to rule_type
    severity: apiItem.severity || 'unknown',
    status: apiItem.is_active ? 'active' : 'inactive',
    created_date: apiItem.created_date || null,
    modified_date: apiItem.updated_date || null, // API uses 'updated_date'
    rule_platforms: apiItem.rule_platforms || null,
    linked_technique_ids: apiItem.linked_technique_ids || null,
    // New enrichment fields
    has_mitre_mapping: (apiItem.extracted_mitre_count || 0) > 0,
    has_cve_references: (apiItem.extracted_cve_count || 0) > 0,
    enrichment_score: calculateEnrichmentScore(apiItem),
    tags: apiItem.tags || null,
  };
};

/**
 * Calculate enrichment score based on available data
 */
const calculateEnrichmentScore = (apiItem: any): number => {
  let score = 0;
  const maxScore = 100;
  
  // Base score for having basic information
  if (apiItem.description) score += 20;
  if (apiItem.severity && apiItem.severity !== 'unknown') score += 15;
  if (apiItem.platforms && apiItem.platforms.length > 0) score += 15;
  
  // Bonus for enrichment
  if ((apiItem.extracted_mitre_count || 0) > 0) score += 25;
  if ((apiItem.extracted_cve_count || 0) > 0) score += 15;
  if (apiItem.tags && apiItem.tags.length > 0) score += 10;
  
  return Math.min(score, maxScore);
};

/**
 * Transform API response to handle common response formats
 */
const transformResponse = <T>(response: AxiosResponse): T => {
  const data = response.data;
  
  // Handle rules list response (paginated)
  if (data.items && Array.isArray(data.items)) {
    // Transform each rule item to match frontend expectations
    const transformedRules = data.items.map(transformApiRuleToRuleSummary);
    
    return {
      rules: transformedRules,
      total: data.total || data.items.length,
      page: data.page || Math.floor((data.offset || 0) / (data.limit || 25)) + 1,
      limit: data.limit || data.items.length,
      totalPages: data.totalPages || Math.ceil((data.total || data.items.length) / (data.limit || 25)),
      // Include facets if present
      facets: data.facets || undefined,
    } as unknown as T;
  }
  
  // Handle single rule response
  if (data.item) {
    // If it's a single rule, transform it
    if (data.item.id && data.item.name) {
      return transformApiRuleToRuleSummary(data.item) as unknown as T;
    }
    return data.item as T;
  }
  
  // Handle direct rule object (when API returns rule directly)
  if (data.id && data.name && !data.items) {
    return transformApiRuleToRuleSummary(data) as unknown as T;
  }
  
  // Default - return raw data for other endpoints
  return data as T;
};

/**
 * Generic GET request function with improved error handling and response transformation
 */
export async function apiGet<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;
    
    const config: AxiosRequestConfig = {
      params: params ? prepareQueryParams(params) : undefined,
    };
    
    console.log(`Making GET request to: ${url}`, config.params);
    
    const response = await axios.get<T>(url, config);
    return transformResponse<T>(response);
  } catch (error) {
    console.error(`API error on GET ${endpoint}:`, error);
    throw createApiError(error);
  }
}

/**
 * Generic POST request function with improved error handling and response transformation
 */
export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;
    
    console.log(`Making POST request to: ${url}`, data);
    
    const response = await axios.post<T>(url, data);
    return transformResponse<T>(response);
  } catch (error) {
    console.error(`API error on POST ${endpoint}:`, error);
    throw createApiError(error);
  }
}

/**
 * Generic PUT request function with improved error handling and response transformation
 */
export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;
    
    console.log(`Making PUT request to: ${url}`, data);
    
    const response = await axios.put<T>(url, data);
    return transformResponse<T>(response);
  } catch (error) {
    console.error(`API error on PUT ${endpoint}:`, error);
    throw createApiError(error);
  }
}

/**
 * Generic DELETE request function with improved error handling
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;
    
    console.log(`Making DELETE request to: ${url}`);
    
    const response = await axios.delete<T>(url);
    return transformResponse<T>(response);
  } catch (error) {
    console.error(`API error on DELETE ${endpoint}:`, error);
    throw createApiError(error);
  }
}

/**
 * Helper to prepare query parameters, handling arrays and objects properly
 * Fixed to properly handle array parameters for filters
 */
const prepareQueryParams = (params: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    if (Array.isArray(value)) {
      // For arrays, keep them as arrays - axios will handle the URL encoding properly
      // This will result in ?key=value1&key=value2 format
      if (value.length > 0) {
        result[key] = value;
      }
    } else if (typeof value === 'object') {
      // For objects, stringify them
      result[key] = JSON.stringify(value);
    } else {
      // For primitive values, just convert to string
      result[key] = String(value);
    }
  }
  
  return result;
};

/**
 * Create issue function for rule feedback
 */
export const createIssue = async (ruleId: string, payload: CreateIssuePayload): Promise<CreateIssueResponse> => {
  const response = await apiPost<CreateIssueResponse>(CREATE_ISSUE(ruleId), payload);
  return response;
};

/**
 * Enhanced error handling with retry logic for specific error types
 */
export const createApiClient = () => {
  const client = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for logging and debugging
  client.interceptors.request.use(
    (config) => {
      console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for consistent error handling
  client.interceptors.response.use(
    (response) => {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
      return response;
    },
    (error) => {
      const method = error.config?.method?.toUpperCase() || 'REQUEST';
      const url = error.config?.url || 'unknown';
      const status = error.response?.status || 'no response';
      
      console.error(`❌ ${method} ${url} - ${status}`, {
        message: error.message,
        data: error.response?.data,
      });
      
      return Promise.reject(createApiError(error));
    }
  );

  return client;
};

// Export the configured client
export const apiClient = createApiClient();