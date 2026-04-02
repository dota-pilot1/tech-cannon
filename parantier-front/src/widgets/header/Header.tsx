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
import { ChevronDown, User, LogOut } from "lucide-react";
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

  return (
    <header
      className={cn(
        "border-b nav-theme-" + themeId,
        "bg-[var(--nav-bg)] border-[var(--nav-border)]",
      )}
    >
      <div className="max-w-full px-6 py-0">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1 h-full">
            <Link
              to="/"
              className="text-xl font-bold transition-opacity cursor-pointer mr-6 text-[var(--nav-logo)] hover:text-[var(--nav-logo-hover)]"
            >
              TechCannon
            </Link>

            <nav className="flex items-center gap-0.5 h-full">
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

          <div className="flex items-center gap-2 h-full">
            {/* 테마 피커 */}
            <NavThemePicker />

            {auth.isAuthenticated ? (
              <div className="flex items-center gap-0 h-9 rounded-lg border border-[var(--nav-border)] bg-[var(--nav-item-active-bg)]/10 overflow-hidden">
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
                      onClick={() => {
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
                      }}
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
        </div>
      </div>
    </header>
  );
}
