import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        // 401, 403은 재시도 안 함
        if (status === 401 || status === 403) return false;
        // 네트워크 오류는 최대 2회 재시도
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000), // 1s → 2s → 4s 지수 백오프
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5분
    },
    mutations: {
      onError: (error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        // axios 인터셉터에서 이미 처리하는 케이스는 스킵
        if (status === 401 || status === 403 || status === 500 || !status)
          return;
        // 그 외 mutation 에러 (422 등)
        const message = (
          error as { response?: { data?: { message?: string } } }
        )?.response?.data?.message;
        if (message) {
          toast.error(message);
        }
      },
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
