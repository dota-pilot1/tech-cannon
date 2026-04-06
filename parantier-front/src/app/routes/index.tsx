import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { Header } from "@/widgets/header/Header";
import { MainPage } from "@/pages/main/MainPage";
import { UsersPage } from "@/pages/admin/users/UsersPage";
import { MenusPage } from "@/pages/admin/menus/MenusPage";

import { AuthoritiesPage } from "@/pages/admin/authorities/AuthoritiesPage";
import { OrganizationsPage } from "@/pages/admin/organizations/OrganizationsPage";
import { RolesPage } from "@/pages/admin/roles/RolesPage";
import TasksPage from "@/features/task/components/TasksPage";
import { WorkPage } from "@/pages/work/WorkPage";
import { ChatRoomsPage } from "@/routes/chat/index";
import { ChatRoomPage } from "@/routes/chat/$roomId";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { IssuesPage } from "@/pages/issues/IssuesPage";
import { StudyPage } from "@/pages/study/StudyPage";
import { NotePage } from "@/pages/note/NotePage";
import { PilotPage } from "@/pages/pilot/PilotPage";
import { WorkStatusPage } from "@/pages/work-status/WorkStatusPage";
import { ToolsPage } from "@/pages/tools/ToolsPage";
import FaqPage from "@/pages/faq/FaqPage";
import { ChallengePage } from "@/pages/challenge/ChallengePage";
import { MeetingPage } from "@/pages/meeting/MeetingPage";
import { WikiPage } from "@/pages/wiki/WikiPage";
import { PromptPage } from "@/pages/prompt/PromptPage";
import { PrototypePage } from "@/pages/prototype/PrototypePage";
import { DbPage } from "@/pages/db/DbPage";
import { SqlPage } from "@/pages/sql/SqlPage";
import ArchitecturePage from "@/pages/architecture/ArchitecturePage";
import FrontendPage from "@/pages/frontend/FrontendPage";
import BackendPage from "@/pages/backend/BackendPage";
import TextbookPage from "@/pages/textbook/TextbookPage";
import ApiDocPage from "@/pages/apidoc/ApiDocPage";
import { HackathonPage } from "@/pages/hackathon/HackathonPage";
import FigmaPage from "@/pages/figma/FigmaPage";
import DevLogPage from "@/pages/devlog/DevLogPage";

import { authStore } from "@/entities/user/model/authStore";
import { toast } from "sonner";

// restoreAuth 완료까지 대기 (최대 5초)
const waitForRestore = async () => {
  if (authStore.state.isRestored) return;
  for (let i = 0; i < 50; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (authStore.state.isRestored) return;
  }
};

// Role 기반 권한 체크 (관리자 페이지 접근용)
const requireRole = async (requiredRole: string) => {
  // restoreAuth 완료 대기
  await waitForRestore();

  const auth = authStore.state;

  if (!auth.isAuthenticated) {
    throw redirect({ to: "/dashboard" });
  }

  // 다시 확인
  const finalAuth = authStore.state;

  // User role 체크
  if (finalAuth.user?.role === requiredRole) {
    return;
  }

  // 권한이 없으면 접근 차단
  toast.error("접근 권한이 없습니다", {
    description: `관리자만 접근할 수 있습니다.`,
  });
  throw redirect({ to: "/dashboard" });
  // 위 toast는 실제 로그인된 사용자가 권한 없는 페이지 접근 시에만 표시
};

// Root Route (레이아웃)
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  ),
});

// Dashboard Route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MainPage,
});

const dashboardAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: MainPage,
});

// Admin: 유저 관리 (ROLE_ADMIN으로 페이지 접근 제어)
const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/users",
  beforeLoad: () => requireRole("ROLE_ADMIN"),
  component: UsersPage,
});

// 메뉴 관리 (ROLE_ADMIN으로 페이지 접근 제어)
const adminMenusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/menus",
  beforeLoad: () => requireRole("ROLE_ADMIN"),
  component: MenusPage,
});

// 권한 관리 (ROLE_ADMIN으로 페이지 접근 제어)
const adminAuthoritiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/authorities",
  beforeLoad: () => requireRole("ROLE_ADMIN"),
  component: AuthoritiesPage,
});

// 조직 관리 (ROLE_ADMIN으로 페이지 접근 제어)
const adminOrganizationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/organizations",
  beforeLoad: () => requireRole("ROLE_ADMIN"),
  component: OrganizationsPage,
});

// 역할 관리 (ROLE_ADMIN으로 페이지 접근 제어)
const adminRolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/roles",
  beforeLoad: () => requireRole("ROLE_ADMIN"),
  component: RolesPage,
});

// 문서 관리 (ROLE_USER 이상)
const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  component: TasksPage,
});

// 업무 관리 (로그인 필요)
const workRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/work",
  beforeLoad: () => requireAuth(),
  component: WorkPage,
});

// 인증 체크 (로그인 필요)
const requireAuth = async () => {
  // restoreAuth 완료 대기
  await waitForRestore();

  const finalAuth = authStore.state;

  if (!finalAuth.isAuthenticated || !finalAuth.user) {
    // 조용히 대시보드로 이동 (토스트 없음 - 정상적인 비로그인 접근)
    throw redirect({ to: "/dashboard" });
  }
};

// 채팅방 목록 (로그인 필요)
const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  beforeLoad: () => requireAuth(),
  component: ChatRoomsPage,
});

// 채팅방 상세 (로그인 필요)
const chatRoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$roomId",
  beforeLoad: () => requireAuth(),
  component: ChatRoomPage,
});

// 프로필 페이지 (로그인 필요)
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  beforeLoad: () => requireAuth(),
  component: ProfilePage,
});

// 이슈 관리 (로그인 필요)
const issuesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/issues",
  beforeLoad: () => requireAuth(),
  component: IssuesPage,
});

// 파일럿 관리 (로그인 필요)
const pilotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pilot",
  beforeLoad: () => requireAuth(),
  component: PilotPage,
});

// 스터디 페이지 (로그인 필요)
const studyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/study",
  beforeLoad: () => requireAuth(),
  component: StudyPage,
});

// 내 노트 페이지 (로그인 필요)
const noteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/note",
  beforeLoad: () => requireAuth(),
  component: NotePage,
});

// 도구 페이지 (로그인 필요)
const toolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tools",
  beforeLoad: () => requireAuth(),
  component: ToolsPage,
});

// 회의실 페이지 (로그인 필요)
const meetingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/meeting",
  beforeLoad: () => requireAuth(),
  component: MeetingPage,
});

// 프롬프트 관리 (로그인 필요)
const promptRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prompt",
  beforeLoad: () => requireAuth(),
  component: PromptPage,
});

// Tech Wiki (로그인 필요)
const wikiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wiki",
  beforeLoad: () => requireAuth(),
  component: WikiPage,
});

// DB 관리 (로그인 필요)
const dbRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/db",
  beforeLoad: () => requireAuth(),
  component: DbPage,
});

// SQL 연습장 (로그인 필요)
const sqlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sql",
  beforeLoad: () => requireAuth(),
  component: SqlPage,
});

// FAQ 페이지 (로그인 필요)
const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faq",
  beforeLoad: () => requireAuth(),
  component: FaqPage,
});

// 챌린지 페이지 (로그인 필요)
const challengeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenge",
  beforeLoad: () => requireAuth(),
  component: ChallengePage,
});

// 아키텍처 페이지 (로그인 필요)
const architectureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/architecture",
  beforeLoad: () => requireAuth(),
  component: ArchitecturePage,
});

// 프론트엔드 페이지 (로그인 필요)
const frontendRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/frontend",
  beforeLoad: () => requireAuth(),
  component: FrontendPage,
});

// Backend 페이지 (로그인 필요)
const coreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/backend",
  beforeLoad: () => requireAuth(),
  component: BackendPage,
});

// TextBook 페이지 (로그인 필요)
const textbookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/textbook",
  beforeLoad: () => requireAuth(),
  component: TextbookPage,
});

// API 문서 테스터 페이지 (로그인 필요)
const apiDocRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api-doc",
  beforeLoad: () => requireAuth(),
  component: ApiDocPage,
});

// 해커톤 (로그인 필요)
const hackathonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hackathon",
  beforeLoad: () => requireAuth(),
  component: HackathonPage,
});

// Figma 페이지 (로그인 필요)
const figmaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/figma",
  beforeLoad: () => requireAuth(),
  component: FigmaPage,
});

// 개발일지 페이지 (로그인 필요)
const devLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/devlog",
  beforeLoad: () => requireAuth(),
  component: DevLogPage,
});

// Prototype (로그인 필요)
const prototypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prototype",
  beforeLoad: () => requireAuth(),
  component: PrototypePage,
});

// 업무 현황 페이지 (로그인 필요)
const workStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/work-status",
  beforeLoad: () => requireAuth(),
  component: WorkStatusPage,
});

// 404 Not Found Route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => null,
});

// Route Tree
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  dashboardAliasRoute,
  adminUsersRoute,
  adminMenusRoute,
  adminAuthoritiesRoute,
  adminOrganizationsRoute,
  adminRolesRoute,
  tasksRoute,
  workRoute,
  workStatusRoute,
  chatRoute,
  chatRoomRoute,
  profileRoute,
  issuesRoute,
  pilotRoute,
  wikiRoute,
  promptRoute,
  dbRoute,
  sqlRoute,
  prototypeRoute,
  studyRoute,
  noteRoute,
  toolsRoute,
  meetingRoute,
  challengeRoute,
  faqRoute,
  architectureRoute,
  hackathonRoute,
  frontendRoute,
  coreRoute,
  textbookRoute,
  apiDocRoute,
  figmaRoute,
  devLogRoute,
  notFoundRoute,
]);

// Router 생성
export const router = createRouter({
  routeTree,
  defaultPreload: "intent", // 링크 hover 시 프리로드
});

// TypeScript 타입 선언
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
