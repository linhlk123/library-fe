import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';
import { useAuthStore } from '../stores';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://library-crbe.onrender.com';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenStore: {
  token: string | null;
  setToken: (token: string | null) => void;
} = {
  token: null,
  setToken: () => {},
};

export const setTokenStore = (store: typeof tokenStore) => {
  tokenStore = store;
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// let isRefreshing = false;
// let failedQueue: Array<{
//   resolve: (token: string) => void;
//   reject: (error: unknown) => void;
// }> = [];

// const processQueue = (error: unknown, token: string | null = null) => {
//   failedQueue.forEach((promise) => {
//     if (error) promise.reject(error);
//     else if (token) promise.resolve(token);
//   });
//   failedQueue = [];
// };

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  return [
    '/api/v1/auth/token',
    '/api/v1/auth/refresh',
    '/api/v1/auth/introspect',
    '/api/v1/auth/logout',
  ].some((path) => url.includes(path));
};

apiClient.interceptors.response.use(
  (response) => {
    // Extract code, message, result from ApiResponse wrapper
    const data = response.data;
    
    // If response has code field (standardized ApiResponse format)
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code !== 1000) {
        // Non-success response → throw error with backend message
        const error = new Error(data.message || 'API error');
        Object.assign(error, { code: data.code, originalResponse: response });
        return Promise.reject(error);
      }
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu 401 → clear token, về login, KHÔNG refresh
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint(originalRequest?.url)
    ) {
      tokenStore.setToken(null);
      // window.location.href = '/';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

//     if (
//       error.response?.status === 401 &&
//       !originalRequest?._retry &&
//       !isAuthEndpoint(originalRequest?.url)
//     ) {
//       if (isRefreshing) {
//         return new Promise<string>((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return apiClient(originalRequest);
//           });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const response = await axios.post<ApiResponse<AuthTokenResponse>>(
//           `${API_BASE_URL}/api/v1/auth/refresh`,
//           { token: tokenStore.token }
//         );

//         const newToken = response.data.result.token;
//         tokenStore.setToken(newToken);
//         processQueue(null, newToken);

//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError, null);
//         tokenStore.setToken(null);
//         window.location.href = '/';
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// Helper: Fetch with explicit token (bypass interceptor async issues)
export const fetchWithToken = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  token: string,
  data?: unknown
): Promise<AxiosResponse<ApiResponse<T>>> => {
  console.log(`[fetchWithToken] ${method} ${url} with token:`, token?.substring(0, 20) + '...');
  try {
    const response = await axios<ApiResponse<T>>({
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      data,
      timeout: 90000,
    });
    console.log(`[fetchWithToken] ✅ Success:`, response.data);
    return response;
  } catch (error) {
    console.error(`[fetchWithToken] ❌ Error:`, error);
    throw error;
  }
};

// Helper: Parse error from various error types
export const parseError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiResponse<unknown>> | undefined;
    return {
      code: data?.code || error.response?.status || 500,
      message: data?.message || error.message || 'An error occurred',
    };
  }

  if (error instanceof Error) {
    return {
      code: 500,
      message: error.message,
    };
  }

  return {
    code: 500,
    message: 'An unknown error occurred',
  };
};

export default apiClient;