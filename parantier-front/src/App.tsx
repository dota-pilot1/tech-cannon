import { RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { authActions } from '@/entities/user/model/authStore'
import { router } from '@/app/routes'

function App() {
  // 앱 로드 시 로그인 상태 복원
  useEffect(() => {
    authActions.restoreAuth()
  }, [])

  return (
    <QueryProvider>
      <Toaster position="top-right" richColors closeButton duration={2000} />
      <RouterProvider router={router} />
    </QueryProvider>
  )
}

export default App
