export interface User {
  email: string
  username: string
  role: string                  // 사용자의 역할 (ROLE_ADMIN, ROLE_USER)
  roles: string[]               // 접근 가능한 역할 배열 (역할 계층 포함)
  authorities: string[]         // 실제 권한 배열 (MENU:ADMIN:READ, PROJECT:CREATE 등)
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  email: string
  username: string
  role: string
}

export interface SignupRequest {
  email: string
  password: string
  username: string
}
