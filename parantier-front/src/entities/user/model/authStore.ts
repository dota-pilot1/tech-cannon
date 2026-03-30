import { Store } from "@tanstack/react-store";
import type { AuthState, User } from "@/shared/types/auth";
import { authApi } from "@/entities/user/api/authApi";
import { getRolesFromToken, getAuthoritiesFromToken } from "@/shared/lib/jwt";

// 초기 상태
const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");

const initialState: AuthState = {
  user: null,
  accessToken,
  refreshToken,
  isAuthenticated: !!(accessToken && refreshToken), // 토큰이 둘 다 있으면 인증된 것으로 간주
  isRestored: false, // restoreAuth 완료 전
};

// 인증 스토어 생성
export const authStore = new Store(initialState);

// 액션들
export const authActions = {
  login: (accessToken: string, refreshToken: string, user: User) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    authStore.setState((state) => ({
      ...state,
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    }));
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    authStore.setState(() => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isRestored: true,
    }));
  },

  updateAccessToken: (accessToken: string) => {
    localStorage.setItem("accessToken", accessToken);

    authStore.setState((state) => ({
      ...state,
      accessToken,
    }));
  },

  setUser: (user: User) => {
    authStore.setState((state) => ({
      ...state,
      user,
      isAuthenticated: true,
    }));
  },

  restoreAuth: async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      authStore.setState((state) => ({ ...state, isRestored: true }));
      return;
    }

    try {
      const user = await authApi.getCurrentUser();

      // JWT에서 roles, authorities 배열 추출
      const roles = getRolesFromToken(accessToken);
      const authorities = getAuthoritiesFromToken(accessToken);

      authStore.setState((state) => ({
        ...state,
        user: { ...user, roles, authorities },
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isRestored: true,
      }));
    } catch (error: unknown) {
      // 401 Unauthorized일 때만 로그아웃 (토큰 만료/무효)
      // 네트워크 오류, 서버 오류(5xx) 등은 기존 토큰 유지
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        // 리프레시 토큰으로 재발급 시도
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/auth/refresh`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            },
          );
          if (response.ok) {
            const { accessToken: newToken } = await response.json();
            authActions.updateAccessToken(newToken);
            // 새 토큰으로 유저 정보 재요청
            const user = await authApi.getCurrentUser();
            const roles = getRolesFromToken(newToken);
            const authorities = getAuthoritiesFromToken(newToken);
            authStore.setState((state) => ({
              ...state,
              user: { ...user, roles, authorities },
              isAuthenticated: true,
              isRestored: true,
            }));
          } else if (response.status === 401 || response.status === 403) {
            // 리프레시 토큰 자체가 만료/무효 → 로그아웃
            authActions.logout();
            authStore.setState((state) => ({ ...state, isRestored: true }));
          } else {
            // 서버 오류(5xx) 등 네트워크 문제 → 토큰 유지 (로그아웃 안 함)
            authStore.setState((state) => ({ ...state, isRestored: true }));
          }
        } catch {
          // 네트워크 오류 → 토큰 유지 (로그아웃 안 함)
          authStore.setState((state) => ({ ...state, isRestored: true }));
        }
      }
      // 그 외 오류(네트워크, 5xx 등)는 로컬 토큰 유지 — 서버 재시작 후에도 로그인 유지
      authStore.setState((state) => ({ ...state, isRestored: true }));
    }
  },
};
