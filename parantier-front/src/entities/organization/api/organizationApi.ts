import { api } from '@/shared/api/client'
import type { Organization, CreateOrganizationRequest } from '@/types/organization'

export const organizationApi = {
  // 조직 트리 구조 조회
  getTree: async (): Promise<Organization[]> => {
    const response = await api.get<Organization[]>('/organizations/tree')
    return response.data
  },

  // ID로 조직 조회
  getById: async (id: number): Promise<Organization> => {
    const response = await api.get<Organization>(`/organizations/${id}`)
    return response.data
  },

  // 부모 ID로 자식 조직 조회
  getChildren: async (parentId: number): Promise<Organization[]> => {
    const response = await api.get<Organization[]>(`/organizations/children/${parentId}`)
    return response.data
  },

  // 조직 타입으로 조회
  getByType: async (orgType: string): Promise<Organization[]> => {
    const response = await api.get<Organization[]>(`/organizations/type/${orgType}`)
    return response.data
  },

  // 조직 생성
  create: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await api.post<Organization>('/organizations', data)
    return response.data
  },

  // 조직 수정
  update: async (id: number, data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await api.put<Organization>(`/organizations/${id}`, data)
    return response.data
  },

  // 조직 삭제
  delete: async (id: number): Promise<void> => {
    await api.delete(`/organizations/${id}`)
  },
}
