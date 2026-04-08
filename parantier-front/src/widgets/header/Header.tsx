import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { Menu } from "@/types/menu";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import { LoginForm } from "@/features/auth/login/LoginForm";
import { SignupDialog } from "@/features/auth/signup/SignupDialog";
import { useMenuTree } from "@/features/menu/hooks/useMenuTree";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { ChevronDown, User, LogOut, Menu as MenuIcon, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { navThemeStore } from "@/entities/ui/model/navThemeStore";
import { NavThemePicker } from "./NavThemePicker";
import { UserAvatar } from "@/shared/ui/UserAvatar";

export function Header() {
  const auth = useStore(authStore, (state) => state);
  const { themeId } = useStore(navThemeStore, (s) => s);
  const navigate = useNavigate();
  const { data: menus = [] } = useMenuTree();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = auth.user?.role || null;

  const isMenuAccessible = (menu: Menu) => {
    if (!menu.allowedRoles || menu.allowedRoles.length === 0) return true;
    return userRole && menu.allowedRoles.includes(userRole);
  };

  const headerMenus = menus
    .filter((menu) => menu.parentId === null && menu.menuType === "HEADER")
    .filter(isMenuAccessible)
    .map((menu) => ({
      ...menu,
      children: menu.children?.filter(isMenuAccessible),
    }));

  const handleLogout = () => {
    authStore.setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    }));
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate({ to: "/" });
  };

  return (
    <>
      <header
        className={cn(
          "border-b nav-theme-" + themeId,
          "bg-[var(--nav-bg)] border-[var(--nav-border)]",
        )}
      >
        <div className="max-w-full px-6 py-0">
          <div className="flex items-center justify-between h-14">
            {/* ── 좌측: 로고 + 데스크탑 nav ── */}
            <div className="flex items-center gap-1 h-full">
              <Link
                to="/"
                className="text-xl font-bold transition-opacity cursor-pointer mr-6 text-[var(--nav-logo)] hover:text-[var(--nav-logo-hover)]"
              >
                TechCannon
              </Link>

              {/* 데스크탑 네비게이션 (md 이상에서만 표시) */}
              <nav className="hidden md:flex items-center gap-0.5 h-full">
                {headerMenus.map((menu) => {
                  if (menu.children && menu.children.length > 0) {
                    const isChildActive = menu.children?.some((child: Menu) =>
                      pathname.startsWith(child.path || "__never__"),
                    );
                    return (
                      <DropdownMenu key={menu.id}>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              "flex items-center gap-1 px-3 py-3 text-sm font-medium transition-all outline-none cursor-pointer rounded-md mx-0.5",
                              isChildActive
                                ? "text-[var(--nav-text-active)] bg-[var(--nav-item-active-bg)]"
                                : "text-[var(--nav-text)] hover:text-[var(--nav-text-hover)] hover:bg-[var(--nav-item-hover-bg)]",
                            )}
                          >
                            {menu.name}
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          data-nav-dropdown
                          className={cn(
                            "grid gap-0.5 p-1",
                            menu.children.length <= 4
                              ? "w-[200px] grid-cols-1"
                              : menu.children.length <= 8
                                ? "w-[360px] grid-cols-2"
                                : "w-[480px] grid-cols-3",
                          )}
                        >
                          {menu.children.map((child: Menu) => (
                            <DropdownMenuItem key={child.id} asChild>
                              <Link
                                to={child.path || "/"}
                                className="cursor-pointer rounded-sm px-3 py-2 text-sm"
                              >
                                {child.name}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  }

                  const isActive =
                    menu.path === "/"
                      ? pathname === "/"
                      : pathname === menu.path ||
                        pathname.startsWith((menu.path || "__never__") + "/");
                  return (
                    <Link
                      key={menu.id}
                      to={menu.path || "/"}
                      className={cn(
                        "px-3 py-3 text-sm font-medium transition-all rounded-md mx-0.5",
                        isActive
                          ? "text-[var(--nav-text-active)] bg-[var(--nav-item-active-bg)]"
                          : "text-[var(--nav-text)] hover:text-[var(--nav-text-hover)] hover:bg-[var(--nav-item-hover-bg)]",
                      )}
                    >
                      {menu.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* ── 우측 ── */}
            <div className="flex items-center gap-2 h-full">
              {/* 데스크탑 우측 영역 (md 이상에서만 표시) */}
              <div className="hidden md:flex items-center gap-2 h-full">
                <NavThemePicker />
                {auth.isAuthenticated ? (
                  <div className="flex items-center gap-0 h-9 rounded-lg border border-[var(--nav-border)] bg-[var(--nav-item-active-bg)]/20 overflow-hidden shadow-sm transition-all hover:border-[var(--nav-border)]/80">
                    <Link
                      to="/profile"
                      className="flex items-center justify-center w-9 h-9 border-r border-[var(--nav-border)] hover:bg-[var(--nav-item-hover-bg)] transition-colors shrink-0"
                      title="프로필로 이동"
                    >
                      <UserAvatar user={auth.user} size="xs" />
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium transition-colors cursor-pointer outline-none text-[var(--nav-user-text)] hover:bg-[var(--nav-item-hover-bg)] hover:text-[var(--nav-user-hover)]">
                        <span className="max-w-[100px] truncate">
                          {auth.user?.username}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        data-nav-dropdown
                        className="min-w-[200px]"
                      >
                        <div className="px-2 py-1.5 text-sm">
                          <div className="flex items-center gap-3 mb-2 text-popover-foreground">
                            <UserAvatar user={auth.user} size="md" />
                            <div>
                              <div className="font-medium text-popover-foreground">
                                {auth.user?.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {auth.user?.role}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {auth.user?.email}
                          </div>
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
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          로그아웃
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <>
                    <LoginForm />
                    <SignupDialog />
                  </>
                )}
              </div>

              {/* 모바일 우측 영역 (md 미만에서만 표시) */}
              <div className="flex md:hidden items-center gap-2">
                {/* 로그인 상태: UserAvatar 아이콘 / 비로그인: 로그인 버튼 */}
                {auth.isAuthenticated ? (
                  <Link
                    to="/profile"
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:opacity-80 transition-opacity"
                    title="프로필로 이동"
                  >
                    <UserAvatar user={auth.user} size="xs" />
                  </Link>
                ) : (
                  <LoginForm />
                )}

                {/* 햄버거 버튼 */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-md text-[var(--nav-text)] hover:bg-[var(--nav-item-hover-bg)] hover:text-[var(--nav-text-hover)] transition-colors"
                  aria-label="메뉴 열기"
                >
                  <MenuIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 모바일 드로어 ── */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full rounded-none border-r p-0 flex flex-col gap-0 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left">
          {/* 접근성을 위한 visually hidden DialogTitle */}
          <DialogTitle className="sr-only">모바일 메뉴</DialogTitle>

          {/* 드로어 상단: 로고 + 닫기 버튼 */}
          <div
            className={cn(
              "flex items-center justify-between px-4 h-14 border-b shrink-0 nav-theme-" +
                themeId,
              "bg-[var(--nav-bg)] border-[var(--nav-border)]",
            )}
          >
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="text-xl font-bold text-[var(--nav-logo)] hover:text-[var(--nav-logo-hover)] transition-colors"
            >
              TechCannon
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-md text-[var(--nav-text)] hover:bg-[var(--nav-item-hover-bg)] transition-colors"
              aria-label="메뉴 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 스크롤 가능한 메뉴 영역 */}
          <div className="flex-1 overflow-y-auto">
            {/* 로그인 상태 표시 */}
            {auth.isAuthenticated && (
              <div className="px-4 py-4 border-b">
                <div className="flex items-center gap-3">
                  <UserAvatar user={auth.user} size="md" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {auth.user?.username}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {auth.user?.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 메뉴 목록 */}
            <nav className="py-2">
              {headerMenus.map((menu) => {
                if (menu.children && menu.children.length > 0) {
                  return (
                    <div key={menu.id} className="mb-1">
                      {/* 부모 메뉴: 섹션 헤더 */}
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {menu.name}
                      </div>
                      {/* 자식 메뉴 링크 목록 */}
                      <div>
                        {menu.children.map((child: Menu) => {
                          const isActive =
                            pathname === child.path ||
                            pathname.startsWith(
                              (child.path || "__never__") + "/",
                            );
                          return (
                            <Link
                              key={child.id}
                              to={child.path || "/"}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center px-6 py-2.5 text-sm transition-colors",
                                isActive
                                  ? "text-foreground bg-accent font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                              )}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // 자식 없는 단순 메뉴
                const isActive =
                  menu.path === "/"
                    ? pathname === "/"
                    : pathname === menu.path ||
                      pathname.startsWith((menu.path || "__never__") + "/");
                return (
                  <Link
                    key={menu.id}
                    to={menu.path || "/"}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    )}
                  >
                    {menu.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 드로어 하단: 로그인/회원가입 or 로그아웃 */}
          <div className="border-t px-4 py-4 shrink-0 space-y-2">
            {auth.isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <User className="w-4 h-4" />
                  프로필
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <div onClick={() => setMobileOpen(false)}>
                  <SignupDialog />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
