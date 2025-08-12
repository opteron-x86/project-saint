// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Environment-based API URL configuration
const getApiUrl = (): string => {
  // For local development, use proxy or local endpoint
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || '/api';
  }
  
  // For production, use the API Gateway URL
  return import.meta.env.VITE_API_GATEWAY_URL || 'https://x2uroi2lm5.execute-api.us-gov-east-1.amazonaws.com/v3';
};

export const API_URL = getApiUrl();

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 60000; // 60 seconds for large data requests
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for auth token if needed
axios.interceptors.request.use(
  (config) => {
    // Add auth token from Cognito if available
    const token = sessionStorage.getItem('id_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const message = (error.response?.data as any)?.error || error.message;
    
    // Handle specific error cases
    if (status === 401) {
      // Token expired or invalid - redirect to login
      console.error('Authentication error - redirecting to login');
      // Clear stored tokens
      sessionStorage.removeItem('id_token');
      sessionStorage.removeItem('access_token');
      // Trigger re-authentication
      window.location.href = '/';
    } else if (status === 403) {
      console.error('Authorization error - insufficient permissions');
    } else if (status === 429) {
      console.error('Rate limit exceeded - please try again later');
    } else if (status && status >= 500) {
      console.error('Server error - please try again later');
    }
    
    return Promise.reject({
      status: status || 500,
      message,
      details: error.response?.data
    });
  }
);

// Define a generic error type
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

/**
 * Prepare query parameters for API requests
 * Handles arrays, nulls, and undefined values properly
 */
const prepareQueryParams = (params: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    
    if (value === null || value === undefined || value === '') {
      return; // Skip null/undefined/empty values
    }
    
    if (Array.isArray(value)) {
      if (value.length > 0) {
        // Lambda API expects comma-separated values for arrays
        cleaned[key] = value.join(',');
      }
    } else if (typeof value === 'boolean') {
      cleaned[key] = value.toString();
    } else {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
};

/**
 * Transform API response to handle Lambda function response format
 */
const transformResponse = <T>(response: AxiosResponse): T => {
  // Lambda returns data in body if it's a proxy integration
  if (response.data && typeof response.data === 'object') {
    // If response has a body property, it's likely a Lambda proxy response
    if ('body' in response.data && typeof response.data.body === 'string') {
      try {
        return JSON.parse(response.data.body);
      } catch {
        return response.data.body as T;
      }
    }
  }
  return response.data;
};

/**
 * Generic GET request with Lambda API compatibility
 */
export async function apiGet<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    const config: AxiosRequestConfig = {
      params: params ? prepareQueryParams(params) : undefined,
    };
    
    const response = await axios.get<T>(url, config);
    return transformResponse<T>(response);
  } catch (error: any) {
    console.error(`[API Error] GET ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Generic POST request with Lambda API compatibility
 */
export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    const response = await axios.post<T>(url, data);
    return transformResponse<T>(response);
  } catch (error: any) {
    console.error(`[API Error] POST ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Generic PUT request with Lambda API compatibility
 */
export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    const response = await axios.put<T>(url, data);
    return transformResponse<T>(response);
  } catch (error: any) {
    console.error(`[API Error] PUT ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Generic DELETE request with Lambda API compatibility
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    const response = await axios.delete<T>(url);
    return transformResponse<T>(response);
  } catch (error: any) {
    console.error(`[API Error] DELETE ${endpoint}:`, error);
    throw error;
  }
}