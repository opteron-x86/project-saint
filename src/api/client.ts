// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
<<<<<<< HEAD
<<<<<<< HEAD
import { CREATE_ISSUE } from './endpoints';
import { CreateIssuePayload, CreateIssueResponse } from './types';

// Base URL from the deployed API Gateway in CloudFormation
const API_URL = import.meta.env.VITE_API_TARGET || 'https://x2uroi2lm5.execute-api.us-gov-east-1.amazonaws.com/v2';
<<<<<<< HEAD
=======
=======
import { CREATE_ISSUE } from './endpoints';
import { CreateIssuePayload, CreateIssueResponse } from './types';
>>>>>>> 23a6656 (Feature/issue creator)

// Base URL from the deployed API Gateway in CloudFormation
const API_URL = '/api';
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 37ba2d8 (Initial commit)

// Define a generic error type
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

/**
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37ba2d8 (Initial commit)
 * Safe array helper - ensures we always get an array
 */
const ensureArray = <T>(value: T[] | null | undefined): T[] => {
  return Array.isArray(value) ? value : [];
};

/**
<<<<<<< HEAD
=======
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 37ba2d8 (Initial commit)
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
<<<<<<< HEAD
<<<<<<< HEAD
 * Transform API response to handle common response formats and ensure data integrity.
=======
 * Transform API response to handle common response formats
>>>>>>> a380730 (Initial deployment)
=======
 * Transform API response to handle common response formats and ensure data integrity.
>>>>>>> 37ba2d8 (Initial commit)
 */
const transformResponse = <T>(response: AxiosResponse): T => {
  const data = response.data;
  
<<<<<<< HEAD
<<<<<<< HEAD
  // If the API returns non-object data, return it as is.
  if (!data || typeof data !== 'object') {
    return data as T;
  }
  
  // For other specific response types that need cleaning (e.g., ensuring nested arrays)
  // we can add safe transformations here. For now, we pass the main object through.
  
  // Default: return the data object as received from the API.
=======
  // If the API returns 'items', 'total', etc. (standard pagination)
  if (data.items && Array.isArray(data.items)) {
    return {
      rules: data.items,
      total: data.total || data.items.length,
      page: data.page || 1,
      limit: data.limit || data.items.length,
      totalPages: data.totalPages || Math.ceil((data.total || data.items.length) / (data.limit || 10)),
    } as unknown as T;
=======
  // If the API returns non-object data, return it as is.
  if (!data || typeof data !== 'object') {
    return data as T;
>>>>>>> 37ba2d8 (Initial commit)
  }
  
  // For other specific response types that need cleaning (e.g., ensuring nested arrays)
  // we can add safe transformations here. For now, we pass the main object through.
  
<<<<<<< HEAD
  // Default - return raw data
>>>>>>> a380730 (Initial deployment)
=======
  // Default: return the data object as received from the API.
>>>>>>> 37ba2d8 (Initial commit)
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
    
    const response = await axios.get<T>(url, config);
<<<<<<< HEAD
<<<<<<< HEAD
    
=======
>>>>>>> a380730 (Initial deployment)
=======
    
>>>>>>> 37ba2d8 (Initial commit)
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
    const response = await axios.post<T>(url, data);
    return transformResponse<T>(response);
  } catch (error) {
    console.error(`API error on POST ${endpoint}:`, error);
    throw createApiError(error);
  }
}

<<<<<<< HEAD
<<<<<<< HEAD
// ... (apiPut, apiDelete, and other functions remain the same) ...

=======
>>>>>>> a380730 (Initial deployment)
=======
// ... (apiPut, apiDelete, and other functions remain the same) ...

>>>>>>> 37ba2d8 (Initial commit)
/**
 * Generic PUT request function with improved error handling and response transformation
 */
export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;
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
    const response = await axios.delete<T>(url);
    return transformResponse<T>(response);
  } catch (error) {
    console.error(`API error on DELETE ${endpoint}:`, error);
    throw createApiError(error);
  }
}

/**
 * Helper to prepare query parameters, handling arrays and objects properly
 */
const prepareQueryParams = (params: Record<string, any>): Record<string, string> => {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    if (Array.isArray(value)) {
<<<<<<< HEAD
<<<<<<< HEAD
      continue;
    } else if (typeof value === 'object') {
      result[key] = JSON.stringify(value);
    } else {
=======
      // For arrays, we keep the original key multiple times
      // This will result in ?key=value1&key=value2 format
      // (most APIs support this format for array parameters)
=======
>>>>>>> 37ba2d8 (Initial commit)
      continue;
    } else if (typeof value === 'object') {
      result[key] = JSON.stringify(value);
    } else {
<<<<<<< HEAD
      // For primitive values, just convert to string
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 37ba2d8 (Initial commit)
      result[key] = String(value);
    }
  }
  
  return result;
<<<<<<< HEAD
<<<<<<< HEAD
};

/**
 * Create an issue for a specific rule
 */
export const createIssue = async (ruleId: string, payload: CreateIssuePayload): Promise<CreateIssueResponse> => {
  const response = await apiPost<CreateIssueResponse>(CREATE_ISSUE(ruleId), payload);
  return response;
};

/**
 * Configure axios defaults
 */
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptors remain the same

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
=======
>>>>>>> a380730 (Initial deployment)
=======
};

/**
 * Create an issue for a specific rule
 */
export const createIssue = async (ruleId: string, payload: CreateIssuePayload): Promise<CreateIssueResponse> => {
  const response = await apiPost<CreateIssueResponse>(CREATE_ISSUE(ruleId), payload);
  return response;
<<<<<<< HEAD
>>>>>>> 23a6656 (Feature/issue creator)
=======
};

/**
 * Configure axios defaults
 */
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptors remain the same

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
>>>>>>> 37ba2d8 (Initial commit)
};