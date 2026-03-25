export interface Organization {
  id: number
  name: string
  code: string
  description?: string
  parentId?: number
  orgType: 'COMPANY' | 'DEPARTMENT' | 'TEAM'
  level: number
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
  children?: Organization[]
}

export interface CreateOrganizationRequest {
  name: string
  code: string
  description?: string
  parentId?: number
  orgType: 'COMPANY' | 'DEPARTMENT' | 'TEAM'
  level: number
  displayOrder: number
}
