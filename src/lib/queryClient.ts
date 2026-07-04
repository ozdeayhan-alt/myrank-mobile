import { QueryClient } from "@tanstack/react-query";
import { isRetryableQueryError } from "@/lib/apiError";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (!isRetryableQueryError(error)) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
      refetchOnWindowFocus: false,
    },
  },
});
