import { apiClient } from '@/shared/api/client'
import type { User } from '@/types/user'

export const profileApi = {
  // 내 프로필 조회
  getMyProfile: async (): Promise<User> => {
    const { data } = await apiClient.get('/profile')
    return data
  },

  // 프로필 수정 (사용자명)
  updateProfile: async (username: string): Promise<User> => {
    const { data } = await apiClient.put('/profile', { username })
    return data
  },

  // 비밀번호 변경
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/profile/password', {
      currentPassword,
      newPassword,
    })
  },

  // 프로필 이미지 업로드
  uploadProfileImage: async (file: File): Promise<User> => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await apiClient.post('/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },
}
