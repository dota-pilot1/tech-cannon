import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { authActions } from '@/entities/user/model/authStore'
import { authApi } from '@/entities/user/api/authApi'
import { useQueryClient } from '@tanstack/react-query'

export function LogoutButton() {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      authActions.logout()

      // 로그아웃 시 메뉴 쿼리 무효화 (비로그인 사용자용 메뉴로 변경)
      queryClient.invalidateQueries({ queryKey: ['menus'] })

      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="outline">
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </Button>
  )
}
