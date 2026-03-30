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

export function Header() {
  const auth = useStore(authStore, (state) => state);
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
    <header className="border-b border-zinc-800 bg-zinc-950 dark:bg-zinc-900">
      <div className="max-w-full px-6 py-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="text-xl font-bold text-white hover:opacity-70 transition-opacity cursor-pointer mr-6"
            >
              Palantier
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
                              ? "text-white bg-white/10"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                          )}
                        >
                          {menu.name}
                          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className={cn(
                          "grid gap-0.5 p-1 bg-zinc-900 border-zinc-700 text-zinc-200",
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
                              className="cursor-pointer rounded-sm px-3 py-2 text-sm text-zinc-200 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5"
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
                        ? "text-white bg-white/10"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                    )}
                  >
                    {menu.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4 py-3">
            {auth.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer outline-none">
                  {auth.user?.profileImageUrl ? (
                    <img
                      src={auth.user.profileImageUrl}
                      alt={auth.user.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {auth.user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  {auth.user?.username}
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[200px] bg-zinc-900 border-zinc-700"
                >
                  <div className="px-2 py-1.5 text-sm">
                    <div className="flex items-center gap-3 mb-2 text-zinc-100">
                      {auth.user?.profileImageUrl ? (
                        <img
                          src={auth.user.profileImageUrl}
                          alt={auth.user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {auth.user?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-zinc-100">
                          {auth.user?.username}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {auth.user?.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {auth.user?.email}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-700" />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="cursor-pointer text-zinc-200 hover:text-white focus:text-white"
                    >
                      <User className="w-4 h-4 mr-2" />
                      프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-700" />
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
