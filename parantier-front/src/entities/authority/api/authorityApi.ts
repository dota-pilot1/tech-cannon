import { api } from '@/shared/api/client'
import type {
  Authority,
  CreateAuthorityRequest,
  UpdateRoleMappingRequest,
  UserAuthorityResponse,
  GrantUserAuthorityRequest,
} from '@/types/authority'

export const authorityApi = {
  // 모든 권한 조회
  getAll: async (): Promise<Authority[]> => {
    const response = await api.get<Authority[]>('/authorities')
    return response.data
  },

  // 카테고리별 권한 조회
  getByCategory: async (category: string): Promise<Authority[]> => {
    const response = await api.get<Authority[]>(`/authorities/category/${category}`)
    return response.data
  },

  // 역할별 권한 조회
  getByRole: async (role: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/authorities/role/${role}`)
    return response.data
  },

  // 권한 생성
  create: async (data: CreateAuthorityRequest): Promise<Authority> => {
    const response = await api.post<Authority>('/authorities', data)
    return response.data
  },

  // 권한 수정
  update: async (id: number, data: CreateAuthorityRequest): Promise<Authority> => {
    const response = await api.put<Authority>(`/authorities/${id}`, data)
    return response.data
  },

  // 권한 삭제
  delete: async (id: number): Promise<void> => {
    await api.delete(`/authorities/${id}`)
  },

  // 역할-권한 매핑 업데이트
  updateRoleMapping: async (role: string, data: UpdateRoleMappingRequest): Promise<void> => {
    await api.put(`/authorities/role/${role}/mapping`, data)
  },

  // ==================== 사용자별 권한 관리 ====================

  // 사용자의 개별 권한 목록 조회
  getUserAuthorities: async (userId: number): Promise<UserAuthorityResponse[]> => {
    const response = await api.get<UserAuthorityResponse[]>(`/authorities/user/${userId}`)
    return response.data
  },

  // 사용자의 유효한 권한만 조회
  getValidUserAuthorities: async (userId: number): Promise<UserAuthorityResponse[]> => {
    const response = await api.get<UserAuthorityResponse[]>(`/authorities/user/${userId}/valid`)
    return response.data
  },

  // 사용자에게 권한 부여
  grantUserAuthority: async (
    userId: number,
    data: GrantUserAuthorityRequest
  ): Promise<void> => {
    await api.post(`/authorities/user/${userId}`, data)
  },

  // 사용자 권한 회수
  revokeUserAuthority: async (userId: number, authorityId: number): Promise<void> => {
    await api.delete(`/authorities/user/${userId}/authority/${authorityId}`)
  },

  // 사용자의 모든 개별 권한 회수
  revokeAllUserAuthorities: async (userId: number): Promise<void> => {
    await api.delete(`/authorities/user/${userId}`)
  },
}
