import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { useMenuTree } from '@/features/menu/hooks/useMenuTree'
import { cn } from '@/shared/lib/utils'

export function AdminLayout() {
  const location = useLocation()
  const { data: menus = [] } = useMenuTree()

  // SIDE 타입 메뉴만 필터링 (관리자 사이드바)
  const sideMenus = menus.filter((menu) => menu.menuType === 'SIDE')

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* 좌측 사이드바 */}
      <aside className="w-64 border-r bg-card overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">관리자</h2>
          <nav className="space-y-1">
            {sideMenus.map((menu) => {
              const isActive = location.pathname === menu.path
              return (
                <Link
                  key={menu.id}
                  to={menu.path || '/'}
                  className={cn(
                    'block px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {menu.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* 우측 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
