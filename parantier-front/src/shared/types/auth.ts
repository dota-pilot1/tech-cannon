export interface User {
  id?: number; // 사용자 ID (선택)
  email: string;
  username: string;
  role: string; // 사용자의 역할 (ROLE_ADMIN, ROLE_USER)
  roles: string[]; // 접근 가능한 역할 배열 (역할 계층 포함)
  authorities: string[]; // 실제 권한 배열 (MENU:ADMIN:READ, PROJECT:CREATE 등)
  organizationId?: number; // 소속 조직 ID (선택)
  profileImageUrl?: string; // 프로필 이미지 URL (선택)
  createdAt?: string; // 생성일시 (선택)
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isRestored: boolean; // restoreAuth 완료 여부
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  username: string;
  role: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}
