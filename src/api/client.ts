// src/api/client.ts - Enhanced for Phase 2 with TypeScript fixes
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, CreateIssuePayload, CreateIssueResponse } from './types';

// Enhanced API URL configuration with development proxy support
const getApiUrl = () => {
  // Use proxy in development to avoid CORS issues
  if (import.meta.env.DEV) {
    return '/api'; // This will be proxied by Vite to your API Gateway
  }
  
  // Use direct URL in production
  return import.meta.env.VITE_API_TARGET || 
         import.meta.env.VITE_API_URL || 
         'https://x2uroi2lm5.execute-api.us-gov-east-1.amazonaws.com/v3';
};

const API_URL = getApiUrl();

console.log('API Client initialized with URL:', API_URL);

/**
 * Enhanced error handling with detailed error information
 */
const createApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const response = axiosError.response;
    
    // Safely handle response data
    const responseData = response?.data as Record<string, unknown> | undefined;
    
    return {
      status: response?.status || 500,
      message: (responseData?.message as string) || axiosError.message || 'Network error occurred',
      details: responseData?.details || responseData,
      timestamp: new Date().toISOString(),
      request_id: response?.headers?.['x-request-id'] as string | undefined,
    };
  }
  
  // For non-axios errors
  const errorObj = error as Error;
  return {
    status: 500,
    message: errorObj.message || 'Unknown error occurred',
    details: errorObj,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Enhanced response transformation with better data handling
 */
const transformResponse = <T>(response: AxiosResponse): T => {
  const data = response.data;
  
  // Handle non-object responses
  if (!data || typeof data !== 'object') {
    return data as T;
  }
  
  // Handle enhanced API responses with metadata
  if ('data' in data && data.data !== undefined) {
    // New API format: { data: T, metadata: {...} }
    return data as T;
  }
  
  // Handle legacy pagination format transformation
  if ('items' in data && Array.isArray(data.items)) {
    return {
      rules: data.items,
      total: (data as Record<string, unknown>).total || data.items.length,
      page: (data as Record<string, unknown>).page || Math.floor(((data as Record<string, unknown>).offset as number || 0) / ((data as Record<string, unknown>).limit as number || 25)) + 1,
      limit: (data as Record<string, unknown>).limit || data.items.length,
      totalPages: (data as Record<string, unknown>).totalPages || Math.ceil(((data as Record<string, unknown>).total as number || data.items.length) / ((data as Record<string, unknown>).limit as number || 25)),
    } as unknown as T;
  }
  
  // Return data as-is for other formats
  return data as T;
};

/**
 * Enhanced query parameter preparation with array support
 */
const prepareQueryParams = (params: Record<string, unknown>): Record<string, string> => {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    if (Array.isArray(value)) {
      // Handle arrays by joining with comma for single parameter
      if (value.length > 0) {
        result[key] = value.join(',');
      }
    } else if (typeof value === 'object') {
      // Stringify objects
      result[key] = JSON.stringify(value);
    } else {
      // Convert primitives to string
      result[key] = String(value);
    }
  }
  
  return result;
};

/**
 * Enhanced GET request with improved error handling and logging
 */
export async function apiGet<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;
    
    const config: AxiosRequestConfig = {
      params: params ? prepareQueryParams(params) : undefined,
      timeout: 30000, // 30 second timeout
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };
    
    // Enhanced development logging
    if (import.meta.env.DEV) {
      console.log(`🚀 API GET: ${url}`, {
        params: config.params,
        fullUrl: `${url}${config.params ? '?' + new URLSearchParams(config.params as Record<string, string>).toString() : ''}`
      });
    }
    
    const response = await axios.get<T>(url, config);
    
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API GET Success: ${url}`, response.status);
    }
    
    return transformResponse<T>(response);
  } catch (error) {
    console.error(`❌ API GET Error: ${endpoint}`, error);
    throw createApiError(error);
  }
}

/**
 * Enhanced POST request with improved error handling
 */
export async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;
    
    const config: AxiosRequestConfig = {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };
    
    if (import.meta.env.DEV) {
      console.log(`🚀 API POST: ${url}`, data ? 'with payload' : 'no payload');
    }
    
    const response = await axios.post<T>(url, data, config);
    
    if (import.meta.env.DEV) {
      console.log(`✅ API POST Success: ${url}`, response.status);
    }
    
    return transformResponse<T>(response);
  } catch (error) {
    console.error(`❌ API POST Error: ${endpoint}`, error);
    throw createApiError(error);
  }
}

/**
 * Enhanced PUT request
 */
export async function apiPut<T>(endpoint: string, data?: unknown): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;
    
    const config: AxiosRequestConfig = {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };
    
    if (import.meta.env.DEV) {
      console.log(`🚀 API PUT: ${url}`);
    }
    
    const response = await axios.put<T>(url, data, config);
    
    if (import.meta.env.DEV) {
      console.log(`✅ API PUT Success: ${url}`, response.status);
    }
    
    return transformResponse<T>(response);
  } catch (error) {
    console.error(`❌ API PUT Error: ${endpoint}`, error);
    throw createApiError(error);
  }
}

/**
 * Enhanced DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;
    
    const config: AxiosRequestConfig = {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    };
    
    if (import.meta.env.DEV) {
      console.log(`🚀 API DELETE: ${url}`);
    }
    
    const response = await axios.delete<T>(url, config);
    
    if (import.meta.env.DEV) {
      console.log(`✅ API DELETE Success: ${url}`, response.status);
    }
    
    return transformResponse<T>(response);
  } catch (error) {
    console.error(`❌ API DELETE Error: ${endpoint}`, error);
    throw createApiError(error);
  }
}

/**
 * Create an issue for a specific rule
 */
export const createIssue = async (ruleId: string, payload: CreateIssuePayload): Promise<CreateIssueResponse> => {
  const endpoint = `/rules/${ruleId}/issues`;
  return await apiPost<CreateIssueResponse>(endpoint, payload);
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<{ status: string; version?: string }> => {
  return await apiGet<{ status: string; version?: string }>('/health');
};

/**
 * Configure axios defaults and interceptors
 */
axios.defaults.timeout = 30000;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor for logging and auth
axios.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    // config.headers.Authorization = `Bearer ${token}`;
    
    // Add request ID for tracing
    config.headers['X-Request-ID'] = `saint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Development logging
    if (import.meta.env.DEV) {
      console.log('📤 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axios.interceptors.response.use(
  (response) => {
    // Development logging
    if (import.meta.env.DEV) {
      console.log('📥 Response:', {
        status: response.status,
        url: response.config?.url,
        headers: response.headers
      });
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (import.meta.env.DEV) {
      console.error('📥 Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      });
    }
    
    // Global error handling
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized access detected');
      // Could dispatch auth logout action here
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error detected:', error.response.status);
    } else if (!error.response) {
      // Handle network errors
      console.error('Network error detected');
    }
    
    return Promise.reject(error);
  }
);

// Export API client object
export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  healthCheck,
  createIssue,
};

// Export API URL for use in other parts of the application
export { API_URL };