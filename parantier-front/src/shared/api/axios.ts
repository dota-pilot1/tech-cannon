import axios from 'axios'
import { authStore, authActions } from '@/entities/user/model/authStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: 모든 요청에 Access Token 추가
apiClient.interceptors.request.use(
  (config) => {
    const state = authStore.state
    if (state.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: 401 에러 시 토큰 갱신 처리
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401 에러이고, 재시도가 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const state = authStore.state
        const refreshToken = state.refreshToken

        if (!refreshToken) {
          // Refresh Token이 없으면 로그아웃
          authActions.logout()
          return Promise.reject(error)
        }

        // Refresh Token으로 새로운 Access Token 요청
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data

        // 새로운 Access Token 저장
        authActions.updateAccessToken(accessToken)

        // 원래 요청에 새로운 토큰 적용 후 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh Token도 만료된 경우 로그아웃
        authActions.logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
