export type MenuType = 'HEADER' | 'SIDE' | 'SUB'

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
