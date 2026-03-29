import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { authActions, authStore } from "@/entities/user/model/authStore";
import { router } from "@/app/routes";

function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    authActions.restoreAuth().finally(() => {
      // restoreAuth 완료 후 토큰은 있는데 user가 없으면 → 완전 로그아웃 처리
      const { isAuthenticated, user } = authStore.state;
      if (isAuthenticated && !user) {
        authActions.logout();
      }
      setAuthReady(true);
    });
  }, []);

  if (!authReady) return null;

  return (
    <QueryProvider>
      <Toaster position="top-right" richColors closeButton duration={2000} />
      <RouterProvider router={router} />
    </QueryProvider>
  );
}

export default App;
