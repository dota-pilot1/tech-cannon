import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { menuApi } from '@/entities/menu/api/menuApi'
import { authStore } from '@/entities/user/model/authStore'

export function useMenuTree() {
  const auth = useStore(authStore, (state) => state)

  return useQuery({
    queryKey: ['menus', 'tree', auth.isAuthenticated],
    queryFn: menuApi.getMenuTree,
    enabled: auth.isAuthenticated, // 인증된 경우에만 메뉴 조회
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  })
}
