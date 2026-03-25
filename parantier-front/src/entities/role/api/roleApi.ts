import { api } from '@/shared/api/client'

export interface Role {
  id: number
  name: string
  description: string
  createdAt: string
  authorityIds: number[]
}

export interface CreateRoleRequest {
  name: string
  description: string
}

export interface UpdateRoleAuthoritiesRequest {
  authorityIds: number[]
}

export const roleApi = {
  getAll: async (): Promise<Role[]> => {
    const response = await api.get('/api/roles')
    return response.data
  },

  getById: async (id: number): Promise<Role> => {
    const response = await api.get(`/api/roles/${id}`)
    return response.data
  },

  create: async (data: CreateRoleRequest): Promise<Role> => {
    const response = await api.post('/api/roles', data)
    return response.data
  },

  update: async (id: number, data: CreateRoleRequest): Promise<void> => {
    await api.put(`/api/roles/${id}`, data)
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/roles/${id}`)
  },

  updateAuthorities: async (
    id: number,
    data: UpdateRoleAuthoritiesRequest
  ): Promise<void> => {
    await api.put(`/api/roles/${id}/authorities`, data)
  },

  addAuthority: async (roleId: number, authorityId: number): Promise<void> => {
    await api.post(`/api/roles/${roleId}/authorities/${authorityId}`)
  },

  removeAuthority: async (
    roleId: number,
    authorityId: number
  ): Promise<void> => {
    await api.delete(`/api/roles/${roleId}/authorities/${authorityId}`)
  },
}
