import { Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { authStore } from '@/entities/user/model/authStore'
import { LoginForm } from '@/features/auth/login/LoginForm'
import { LogoutButton } from '@/features/auth/logout/LogoutButton'
import { SignupDialog } from '@/features/auth/signup/SignupDialog'
import { useMenuTree } from '@/features/menu/hooks/useMenuTree'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

export function Header() {
  const auth = useStore(authStore, (state) => state)
  const { data: menus = [] } = useMenuTree()

  // 헤더 메뉴만 필터링 (HEADER 또는 CATEGORY 타입, parent_id가 null인 1차 메뉴)
  const headerMenus = menus.filter(
    (menu) => menu.parentId === null && (menu.menuType === 'HEADER' || menu.menuType === 'CATEGORY')
  )

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-full px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-xl font-bold text-primary hover:opacity-80 transition-opacity cursor-pointer"
            >
              Palantier
            </Link>
            <nav className="flex items-center gap-6">
              {headerMenus.map((menu) => {
                // CATEGORY: 드롭다운 메뉴
                if (menu.menuType === 'CATEGORY' && menu.children && menu.children.length > 0) {
                  return (
                    <DropdownMenu key={menu.id}>
                      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors cursor-pointer outline-none">
                        {menu.name}
                        <ChevronDown className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[180px]">
                        {menu.children.map((child) => (
                          <DropdownMenuItem key={child.id} asChild>
                            <Link
                              to={child.path || '/'}
                              className="cursor-pointer"
                            >
                              {child.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }

                // HEADER: 직접 링크
                return (
                  <Link
                    key={menu.id}
                    to={menu.path || '/'}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {menu.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {auth.isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {auth.user?.username} ({auth.user?.role})
                </span>
                <LogoutButton />
              </>
            ) : (
              <>
                <LoginForm />
                <SignupDialog />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
