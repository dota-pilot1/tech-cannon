export type MenuType = 'HEADER' | 'SIDE' | 'SUB' | 'CATEGORY' | 'PAGE'

export interface Menu {
  id: number
  name: string
  path: string | null
  parentId: number | null
  menuType: MenuType
  orderNum: number
  requiredRole: 'USER' | 'ADMIN' | null
  icon: string | null
  isActive: boolean
  createdAt: string
  children?: Menu[]
  allowedRoles?: string[] | null // 접근 가능한 역할 목록
}

export interface CreateMenuRequest {
  name: string
  path?: string
  parentId?: number
  menuType: MenuType
  orderNum?: number
  requiredRole?: 'USER' | 'ADMIN'
  icon?: string
}
