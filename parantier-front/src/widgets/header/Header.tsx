import { useState, useEffect, useCallback } from "react";
// pathname 변경 시 드로어는 각 Link의 onClick에서 닫음
import { createPortal } from "react-dom";
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
import {
  ChevronDown,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { navThemeStore } from "@/entities/ui/model/navThemeStore";
import { NavThemePicker } from "./NavThemePicker";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { DirectChatDrawer } from "@/features/chat/components/DirectChatDrawer";
import { chatApi } from "@/api/chatApi";

export function Header() {
  const auth = useStore(authStore, (state) => state);
  const { themeId } = useStore(navThemeStore, (s) => s);
  const navigate = useNavigate();
  const { data: menus = [] } = useMenuTree();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [directRoomCount, setDirectRoomCount] = useState(0);

  // DIRECT 방 개수 조회
  const loadDirectRoomCount = useCallback(async () => {
    if (!auth.isAuthenticated || !auth.isRestored) return;
    try {
      const rooms = await chatApi.getMyRooms();
      setDirectRoomCount(rooms.filter((r: { roomType: string; isActive: boolean }) => r.roomType === "DIRECT" && r.isActive).length);
    } catch {
      // ignore
    }
  }, [auth.isAuthenticated, auth.isRestored]);

  useEffect(() => {
    loadDirectRoomCount();
  }, [loadDirectRoomCount]);

  const userRole = auth.user?.role || null;

  // 드로어 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
    setMobileOpen(false);
  };

  // 모바일 드로어 (portal로 body에 직접 마운트)
  const mobileDrawer = mobileOpen
    ? createPortal(
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999 }}
          className="flex"
        >
          {/* 딤 오버레이 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
            }}
            onClick={() => setMobileOpen(false)}
          />

          {/* 드로어 패널 */}
          <div
            className="relative w-[280px] max-w-[85vw] h-full flex flex-col bg-background border-r border-border overflow-y-auto"
          >
            {/* 상단: 로고 + 닫기 */}
            <div
              className={cn("nav-theme-" + themeId)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                height: "56px",
                flexShrink: 0,
                borderBottom: "1px solid var(--nav-border)",
                background: "var(--nav-bg)",
              }}
            >
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--nav-logo)",
                  textDecoration: "none",
                }}
              >
                TechCannon
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--nav-text)",
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* 유저 정보 (로그인 시) */}
            {auth.isAuthenticated && (
              <div className="p-4 border-b border-border shrink-0">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <UserAvatar user={auth.user} size="md" />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      className="text-foreground"
                    >
                      {auth.user?.username}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      className="text-muted-foreground"
                    >
                      {auth.user?.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 메뉴 목록 */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {headerMenus.map((menu) => {
                if (menu.children && menu.children.length > 0) {
                  return (
                    <div key={menu.id} style={{ marginBottom: "4px" }}>
                      <div
                        style={{
                          padding: "8px 16px",
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                        className="text-muted-foreground"
                      >
                        {menu.name}
                      </div>
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
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "10px 16px 10px 24px",
                              fontSize: "14px",
                              textDecoration: "none",
                              transition: "background 0.15s",
                              background: isActive
                                ? "var(--accent)"
                                : "transparent",
                              fontWeight: isActive ? 500 : 400,
                            }}
                            className={
                              isActive
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
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
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 16px",
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : 500,
                      textDecoration: "none",
                      background: isActive ? "var(--accent)" : "transparent",
                      transition: "background 0.15s",
                    }}
                    className={
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {menu.name}
                  </Link>
                );
              })}
            </nav>

            {/* 하단: 프로필/로그아웃 or 회원가입 */}
            <div className="border-t border-border px-4 py-3 shrink-0 flex flex-col gap-1">
              {auth.isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: 500,
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                    className="text-foreground hover:bg-accent"
                  >
                    <User style={{ width: "16px", height: "16px" }} />
                    프로필
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: 500,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s",
                      color: "var(--destructive)",
                    }}
                  >
                    <LogOut style={{ width: "16px", height: "16px" }} />
                    로그아웃
                  </button>
                </>
              ) : (
                <div onClick={() => setMobileOpen(false)}>
                  <SignupDialog />
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

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

              {/* 데스크탑 nav (md 이상) */}
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

            {/* ── 우측 영역 ── */}
            <div className="flex items-center gap-2 h-full">
              {/* 데스크탑 우측 (md 이상) */}
              <div className="hidden md:flex items-center gap-2 h-full">
                {auth.isAuthenticated && (
                  <button
                    onClick={() => setChatOpen(true)}
                    className="relative p-2 rounded-lg text-[var(--nav-text)] hover:bg-[var(--nav-item-hover-bg)] transition-colors"
                    title="메시지"
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                    {directRoomCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                        {directRoomCount}
                      </span>
                    )}
                  </button>
                )}
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
                <NavThemePicker />
              </div>

              {/* 모바일 우측 (md 미만) */}
              <div className="flex md:hidden items-center gap-1">
                {auth.isAuthenticated ? (
                  <Link
                    to="/profile"
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:opacity-80 transition-opacity"
                  >
                    <UserAvatar user={auth.user} size="xs" />
                  </Link>
                ) : (
                  <LoginForm />
                )}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-md text-[var(--nav-text)] hover:bg-[var(--nav-item-hover-bg)] transition-colors"
                  aria-label="메뉴 열기"
                >
                  <MenuIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 드로어 (portal) */}
      {mobileDrawer}

      {/* 1:1 채팅 드로워 */}
      <DirectChatDrawer open={chatOpen} onClose={() => { setChatOpen(false); loadDirectRoomCount(); }} onRoomCountChange={setDirectRoomCount} />
    </>
  );
}
