import { apiClient } from '@/shared/api/axios'
import type { LoginRequest, LoginResponse, SignupRequest, User } from '@/shared/types/auth'

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  signup: async (data: SignupRequest) => {
    const response = await apiClient.post('/auth/signup', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  checkEmailDuplicate: async (email: string): Promise<boolean> => {
    const response = await apiClient.get<boolean>('/auth/check-email', {
      params: { email },
    })
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },
}
