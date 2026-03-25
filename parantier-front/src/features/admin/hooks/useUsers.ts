import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/entities/user/api/adminApi'

export function useUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getAllUsers(),
  })
}
