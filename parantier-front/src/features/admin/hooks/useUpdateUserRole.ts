import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/entities/user/api/adminApi'
import { toast } from 'sonner'

interface UpdateUserRoleParams {
  userId: number
  newRole: string
  userName: string
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, newRole }: UpdateUserRoleParams) => {
      await adminApi.updateUserRole(userId, newRole)
    },
    onSuccess: (_, { newRole, userName }) => {
      const roleLabel = newRole === 'ROLE_ADMIN' ? '관리자' : '일반 사용자'
      toast.success(`${userName}님의 권한을 ${roleLabel}로 변경했습니다.`)

      // 사용자 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '권한 변경에 실패했습니다.')
    },
  })
}
