import { Store } from '@tanstack/react-store'
import type { AuthState, User } from '@/shared/types/auth'
import { authApi } from '@/entities/user/api/authApi'
import { getRolesFromToken, getAuthoritiesFromToken } from '@/shared/lib/jwt'

// 초기 상태
const accessToken = localStorage.getItem('accessToken')
const refreshToken = localStorage.getItem('refreshToken')

const initialState: AuthState = {
  user: null,
  accessToken,
  refreshToken,
  isAuthenticated: !!(accessToken && refreshToken), // 토큰이 둘 다 있으면 인증된 것으로 간주
}

// 인증 스토어 생성
export const authStore = new Store(initialState)

// 액션들
export const authActions = {
  login: (accessToken: string, refreshToken: string, user: User) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    authStore.setState((state) => ({
      ...state,
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    }))
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    authStore.setState(() => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    }))
  },

  updateAccessToken: (accessToken: string) => {
    localStorage.setItem('accessToken', accessToken)

    authStore.setState((state) => ({
      ...state,
      accessToken,
    }))
  },

  setUser: (user: User) => {
    authStore.setState((state) => ({
      ...state,
      user,
      isAuthenticated: true,
    }))
  },

  restoreAuth: async () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!accessToken || !refreshToken) {
      return
    }

    try {
      const user = await authApi.getCurrentUser()

      // JWT에서 roles, authorities 배열 추출
      const roles = getRolesFromToken(accessToken)
      const authorities = getAuthoritiesFromToken(accessToken)

      authStore.setState((state) => ({
        ...state,
        user: { ...user, roles, authorities },
        accessToken,
        refreshToken,
        isAuthenticated: true,
      }))
    } catch (error) {
      // 토큰이 유효하지 않으면 로그아웃
      authActions.logout()
    }
  },
}
