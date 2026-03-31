import axios from "axios";
import { toast } from "sonner";
import { authStore, authActions } from "@/entities/user/model/authStore";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10초 타임아웃
});

// Request Interceptor: 모든 요청에 Access Token 추가
apiClient.interceptors.request.use(
  (config) => {
    const state = authStore.state;
    if (state.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ── 401 처리: 리프레시 진행 중 대기 큐 ──────────────────────────
let isRefreshing = false;
type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response Interceptor: 에러 상황별 안내 + 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ── 네트워크 오류 / 서버 무응답 ──────────────────────────────
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        toast.error("요청 시간이 초과됐습니다.", {
          description: "서버 응답이 느립니다. 잠시 후 다시 시도해주세요.",
        });
      } else {
        toast.error("서버에 연결할 수 없습니다.", {
          description: "네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.",
        });
      }
      return Promise.reject(error);
    }

    // ── 401 Unauthorized: 토큰 갱신 시도 → 실패 시 로그아웃 안내 ──
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 이미 리프레시 진행 중이면 큐에 넣고 대기
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = authStore.state.refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        authActions.updateAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 대기 중인 요청들 모두 새 토큰으로 재시도
        processQueue(null, accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        const wasAuthenticated = authStore.state.isAuthenticated;
        authActions.logout();
        // 실제로 로그인 상태였을 때만 세션 만료 안내
        if (wasAuthenticated) {
          toast.error("세션이 만료됐습니다.", {
            description:
              "보안을 위해 자동 로그아웃됐습니다. 다시 로그인해주세요.",
            duration: 5000,
            action: {
              label: "로그인",
              onClick: () => window.location.replace("/"),
            },
          });
        }
        return Promise.reject(refreshError);
      }
    }

    // ── 403 Forbidden ─────────────────────────────────────────────
    if (status === 403) {
      const { isAuthenticated, isRestored } = authStore.state;

      // restoreAuth 완료 전이거나 비로그인 상태면 조용히 무시
      if (!isAuthenticated || !isRestored) {
        return Promise.reject(error);
      }

      const url = originalRequest?.url ?? "";
      const isAdminApi = url.includes("/admin/");

      if (isAdminApi) {
        // 관리자 전용 API → 권한 없음 안내만
        toast.error("접근 권한이 없습니다.", {
          description: "관리자 권한이 필요합니다.",
        });
      } else {
        // 일반 API에서 403 → 토큰 만료/무효로 간주 → 로그아웃 + 리다이렉트
        authActions.logout();
        toast.error("세션이 만료됐습니다.", {
          description: "다시 로그인해주세요.",
          duration: 4000,
        });
        window.location.replace("/");
      }
      return Promise.reject(error);
    }

    // ── 404 Not Found ─────────────────────────────────────────────
    if (status === 404) {
      // 404는 개별 컴포넌트에서 처리하는 경우가 많으므로 전역 토스트 생략
      return Promise.reject(error);
    }

    // ── 500 Internal Server Error ─────────────────────────────────
    if (status >= 500) {
      toast.error("서버 오류가 발생했습니다.", {
        description: `잠시 후 다시 시도해주세요. (${status})`,
      });
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
