import { Users, Building2, Shield, Menu as MenuIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface SidebarItem {
  label: string
  path: string
  icon: LucideIcon
  authority?: string
}

export interface SidebarSection {
  title: string
  items: SidebarItem[]
}

export const sidebarConfig: Record<string, SidebarSection[]> = {
  // "관리자" 카테고리 클릭 시 표시할 사이드바
  admin: [
    {
      title: '사용자 관리',
      items: [
        {
          label: '유저 관리',
          path: '/admin/users',
          icon: Users,
          authority: 'USER:READ',
        },
        {
          label: '조직 관리',
          path: '/admin/organizations',
          icon: Building2,
          authority: 'ORGANIZATION:READ',
        },
      ],
    },
    {
      title: '시스템 관리',
      items: [
        {
          label: '권한 관리',
          path: '/admin/authorities',
          icon: Shield,
          authority: 'AUTHORITY:READ',
        },
        {
          label: '업무 관리',
          path: '/admin/workspace',
          icon: MenuIcon,
          authority: 'WORKSPACE:READ',
        },
      ],
    },
  ],
}

// 사용자 권한을 체크하는 헬퍼 함수
export function filterSidebarByAuthority(
  sections: SidebarSection[],
  userAuthorities: string[]
): SidebarSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.authority ? userAuthorities.includes(item.authority) : true
      ),
    }))
    .filter((section) => section.items.length > 0)
}
