import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { authActions, authStore } from "@/entities/user/model/authStore";
import { router } from "@/app/routes";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";

type AuthReadyState = "loading" | "ready" | "server-down";

function App() {
  const [authState, setAuthState] = useState<AuthReadyState>("loading");

  useEffect(() => {
    // 10초 타임아웃: 서버 다운 시 무한 로딩 방지
    const timeout = setTimeout(() => {
      setAuthState("server-down");
    }, 10000);

    authActions.restoreAuth().finally(() => {
      clearTimeout(timeout);

      const { isAuthenticated, user } = authStore.state;
      if (isAuthenticated && !user) {
        authActions.logout();
      }
      setAuthState("ready");
    });

    return () => clearTimeout(timeout);
  }, []);

  // 로딩 중
  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 서버 다운 / 타임아웃
  if (authState === "server-down") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="text-5xl">🔌</div>
          <h2 className="text-xl font-bold text-foreground">
            서버에 연결할 수 없습니다
          </h2>
          <p className="text-sm text-muted-foreground">
            서버가 응답하지 않습니다. 네트워크 상태를 확인하거나 잠시 후 다시
            시도해주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryProvider>
        <Toaster position="top-right" richColors closeButton duration={2000} />
        <RouterProvider router={router} />
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
