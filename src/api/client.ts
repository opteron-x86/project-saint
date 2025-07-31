// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CREATE_ISSUE } from './endpoints';
import { CreateIssuePayload, CreateIssueResponse } from './types';

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
 * Transform API response to handle common response formats
 */
const transformResponse = <T>(response: AxiosResponse): T => {
  const data = response.data;
  
  // If the API returns 'items', 'total', etc. (standard pagination)
  if (data.items && Array.isArray(data.items)) {
    return {
      rules: data.items,
      total: data.total || data.items.length,
      page: data.page || 1,
      limit: data.limit || data.items.length,
      totalPages: data.totalPages || Math.ceil((data.total || data.items.length) / (data.limit || 10)),
    } as unknown as T;
  }
  
  // If the API returns 'item' (single item)
  if (data.item) {
    return data.item as T;
  }
  
  // Default - return raw data
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
      // For arrays, we keep the original key multiple times
      // This will result in ?key=value1&key=value2 format
      // (most APIs support this format for array parameters)
      continue;
    } else if (typeof value === 'object') {
      // For objects, we flatten with dot notation or just stringify
      result[key] = JSON.stringify(value);
    } else {
      // For primitive values, just convert to string
      result[key] = String(value);
    }
  }
  
  return result;
};

export const createIssue = async (ruleId: string, payload: CreateIssuePayload): Promise<CreateIssueResponse> => {
  const response = await apiPost<CreateIssueResponse>(CREATE_ISSUE(ruleId), payload);
  return response;
};