import { useStore } from "@tanstack/react-store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { authStore } from "@/entities/user/model/authStore";
import { dashboardApi } from "@/api/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

// ─── status 매핑 ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, string> = {
  완료: "DONE",
  "진행 중": "IN_PROGRESS",
  테스트: "TEST",
  대기: "TODO",
  보류: "HOLD",
  막힘: "BLOCKED",
};

// ─── MainPage ────────────────────────────────────────────────────────────────

export function MainPage() {
  const auth = useStore(authStore, (state) => state);
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
    enabled: auth.isAuthenticated,
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  // ─── 클릭 핸들러 ───────────────────────────────────────────────────────────

  const handleWorkBarClick = (payload: { name?: string }) => {
    if (!payload || payload.name === "전체") {
      navigate({ to: "/work" });
    } else {
      const status = payload.name ? STATUS_MAP[payload.name] : undefined;
      if (status) navigate({ to: "/work", search: { status } });
      else navigate({ to: "/work" });
    }
  };

  const handleIssueBarClick = (payload: { name?: string }) => {
    if (!payload || payload.name === "전체") {
      navigate({ to: "/issues" });
    } else {
      const status = payload.name ? STATUS_MAP[payload.name] : undefined;
      if (status) navigate({ to: "/issues", search: { status } });
      else navigate({ to: "/issues" });
    }
  };

  // ─── 인증 체크 ─────────────────────────────────────────────────────────────

  if (!auth.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">로그인이 필요합니다</h2>
          <p className="text-muted-foreground">
            상단 헤더에서 로그인하여 서비스를 이용하세요.
          </p>
        </div>
      </div>
    );
  }

  const workData = stats
    ? [
        { name: "전체", value: stats.totalWorks, color: "#6366f1" },
        { name: "완료", value: stats.doneWorks, color: "#22c55e" },
        { name: "진행 중", value: stats.inProgressWorks, color: "#3b82f6" },
        { name: "테스트", value: stats.testWorks, color: "#a855f7" },
        { name: "대기", value: stats.todoWorks, color: "#94a3b8" },
        { name: "보류", value: stats.holdWorks, color: "#f59e0b" },
        { name: "막힘", value: stats.blockedWorks, color: "#ef4444" },
      ]
    : [];

  const issueData = stats
    ? [
        { name: "전체", value: stats.totalIssues, color: "#6366f1" },
        { name: "완료", value: stats.doneIssues, color: "#22c55e" },
        { name: "진행 중", value: stats.inProgressIssues, color: "#3b82f6" },
        { name: "테스트", value: stats.testIssues, color: "#a855f7" },
        { name: "대기", value: stats.todoIssues, color: "#94a3b8" },
        { name: "보류", value: stats.holdIssues, color: "#f59e0b" },
        { name: "막힘", value: stats.blockedIssues, color: "#ef4444" },
      ]
    : [];

  return (
    <div className="container mx-auto px-6 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-muted-foreground">
          안녕하세요, {auth.user?.username}님
        </p>
      </div>

      {/* 차트 2개 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 업무 현황 카드 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <div className="flex items-center">
                📋 업무 현황
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  전체 {stats?.totalWorks ?? 0}개
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                클릭하여 이동 →
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[65, 80, 55, 70, 45, 60, 50].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 w-14 bg-muted rounded" />
                    <div
                      className="h-7 bg-muted rounded"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={workData.length * 44}>
                <BarChart
                  data={workData}
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                  onClick={(data) => {
                    const payload = (
                      data as {
                        activePayload?: { payload: { name?: string } }[];
                      }
                    )?.activePayload?.[0]?.payload;
                    if (payload) handleWorkBarClick(payload);
                  }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={56}
                    tick={{ fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [value, "건"]}
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 13,
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                    style={{ cursor: "pointer" }}
                  >
                    {workData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        fill: "var(--foreground)",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 이슈 현황 카드 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <div className="flex items-center">
                🚨 이슈 현황
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  전체 {stats?.totalIssues ?? 0}개
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                클릭하여 이동 →
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[65, 80, 55, 70, 45, 60, 50].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 w-14 bg-muted rounded" />
                    <div
                      className="h-7 bg-muted rounded"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={issueData.length * 44}>
                <BarChart
                  data={issueData}
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                  onClick={(data) => {
                    const payload = (
                      data as {
                        activePayload?: { payload: { name?: string } }[];
                      }
                    )?.activePayload?.[0]?.payload;
                    if (payload) handleIssueBarClick(payload);
                  }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={56}
                    tick={{ fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [value, "건"]}
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 13,
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                    style={{ cursor: "pointer" }}
                  >
                    {issueData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        fill: "var(--foreground)",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
