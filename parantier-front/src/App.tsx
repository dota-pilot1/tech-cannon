import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { authActions } from "@/entities/user/model/authStore";
import { router } from "@/app/routes";

function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    authActions.restoreAuth().finally(() => {
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
