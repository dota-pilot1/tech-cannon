import { Link, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { authStore } from '@/entities/user/model/authStore'
import { LoginForm } from '@/features/auth/login/LoginForm'
import { SignupDialog } from '@/features/auth/signup/SignupDialog'
import { useMenuTree } from '@/features/menu/hooks/useMenuTree'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ChevronDown, User, LogOut } from 'lucide-react'

export function Header() {
  const auth = useStore(authStore, (state) => state)
  const navigate = useNavigate()
  const { data: menus = [] } = useMenuTree()

  // 디버깅: 메뉴 데이터 확인
  console.log('[Header] 전체 메뉴 데이터:', menus)
  console.log('[Header] 인증 상태:', auth.isAuthenticated)
  console.log('[Header] 사용자 정보:', auth.user)

  // 현재 사용자의 역할
  const userRole = auth.user?.role || null

  // 역할 기반 메뉴 필터링 헬퍼
  const isMenuAccessible = (menu: any) => {
    // allowedRoles가 없으면 모든 사용자 접근 가능
    if (!menu.allowedRoles || menu.allowedRoles.length === 0) {
      return true
    }
    // 사용자 역할이 allowedRoles에 포함되어 있으면 접근 가능
    return userRole && menu.allowedRoles.includes(userRole)
  }

  // 헤더 메뉴만 필터링 (HEADER 또는 CATEGORY 타입, parent_id가 null인 1차 메뉴)
  const headerMenus = menus
    .filter((menu) => menu.parentId === null && (menu.menuType === 'HEADER' || menu.menuType === 'CATEGORY'))
    .filter(isMenuAccessible)
    .map((menu) => ({
      ...menu,
      // 하위 메뉴도 필터링
      children: menu.children?.filter(isMenuAccessible),
    }))

  console.log('[Header] 필터링 후 헤더 메뉴:', headerMenus)
  console.log('[Header] 사용자 역할:', userRole)

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
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer outline-none">
                  {/* 프로필 이미지 또는 아바타 */}
                  {auth.user?.profileImageUrl ? (
                    <img
                      src={auth.user.profileImageUrl}
                      alt={auth.user.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {auth.user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  {auth.user?.username}
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px]">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="flex items-center gap-3 mb-2">
                      {auth.user?.profileImageUrl ? (
                        <img
                          src={auth.user.profileImageUrl}
                          alt={auth.user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {auth.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{auth.user?.username}</div>
                        <div className="text-xs text-muted-foreground">{auth.user?.role}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{auth.user?.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => {
                      authStore.setState((prev) => ({ ...prev, isAuthenticated: false, user: null, accessToken: null, refreshToken: null }))
                      localStorage.removeItem('accessToken')
                      localStorage.removeItem('refreshToken')
                      navigate({ to: '/' })
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
