import { Link, useNavigate } from "@tanstack/react-router";
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
    <header className="border-b border-border bg-card">
      <div className="max-w-full px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="text-xl font-bold text-primary hover:opacity-80 transition-opacity cursor-pointer mr-4"
            >
              Palantier
            </Link>

            <nav className="flex items-center">
              {headerMenus.map((menu) => {
                if (menu.children && menu.children.length > 0) {
                  return (
                    <DropdownMenu key={menu.id}>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors outline-none cursor-pointer">
                          {menu.name}
                          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
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

                return (
                  <Link
                    key={menu.id}
                    to={menu.path || "/"}
                    className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                  >
                    {menu.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {auth.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer outline-none">
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
                          {auth.user?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{auth.user?.username}</div>
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
