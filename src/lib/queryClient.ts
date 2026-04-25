import { QueryClient } from '@tanstack/react-query';
import { parseError } from '../services/apiClient';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (cache time)
      retry: (failureCount, error: any) => {
        // Don't retry on 401 (auth will handle refresh)
        if (error?.response?.status === 401) return false;
        // Don't retry on 403 (permission denied)
        if (error?.response?.status === 403) return false;
        // Retry up to 2 times on other errors
        return failureCount < 2;
      },
      throwOnError: (error) => {
        const parsed = parseError(error);
        return parsed;
      },
    },
    mutations: {
      retry: 1,
      throwOnError: true,
    },
  },
});
