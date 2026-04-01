import { apiClient } from "@/shared/api/axios";
import type { UserResponse } from "./adminApi";

export const userApi = {
  /**
   * 전체 사용자 목록 조회 (로그인한 사용자라면 누구나 접근 가능)
   * 담당자 지정 등에 사용
   */
  getAllUsers: async (): Promise<UserResponse[]> => {
    const response = await apiClient.get<UserResponse[]>("/users");
    return response.data;
  },
};
