import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/entities/user/api/userApi'

export function useAllUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAllUsers(),
  })
}
