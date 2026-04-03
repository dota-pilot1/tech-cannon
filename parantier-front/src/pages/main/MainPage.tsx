import { useStore } from "@tanstack/react-store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authStore } from "@/entities/user/model/authStore";
import { dashboardApi } from "@/api/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ExternalLink } from "lucide-react";

// ─── status 매핑 ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, string> = {
  완료: "DONE",
  "진행 중": "IN_PROGRESS",
  테스트: "TEST",
  대기: "TODO",
  보류: "HOLD",
  막힘: "BLOCKED",
};

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface BarItem {
  name: string;
  value: number;
  color: string;
  status?: string; // 없으면 전체
}

// ─── 커스텀 바 차트 컴포넌트 ─────────────────────────────────────────────────

function CustomBarChart({
  data,
  onNavigate,
}: {
  data: BarItem[];
  onNavigate: (status?: string) => void;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-2 group">
          {/* 레이블 */}
          <div className="w-14 text-sm text-muted-foreground text-right shrink-0">
            {item.name}
          </div>

          {/* 막대 + 숫자 */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex-1 bg-muted/40 rounded-full h-6 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: item.value > 0 ? `${(item.value / max) * 100}%` : "0%",
                  backgroundColor: item.color,
                  minWidth: item.value > 0 ? "1.5rem" : "0",
                }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground w-6 text-right shrink-0">
              {item.value}
            </span>
          </div>

          {/* 보기 버튼 */}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={() => onNavigate(item.status)}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            보기
          </Button>
        </div>
      ))}
    </div>
  );
}

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

  const handleWorkNavigate = (status?: string) => {
    if (status) navigate({ to: "/work", search: { status } });
    else navigate({ to: "/work" });
  };

  const handleIssueNavigate = (status?: string) => {
    if (status) navigate({ to: "/issues", search: { status } });
    else navigate({ to: "/issues" });
  };

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

  const workData: BarItem[] = [
    { name: "전체", value: stats?.totalWorks ?? 0, color: "#6366f1" },
    {
      name: "완료",
      value: stats?.doneWorks ?? 0,
      color: "#22c55e",
      status: STATUS_MAP["완료"],
    },
    {
      name: "진행 중",
      value: stats?.inProgressWorks ?? 0,
      color: "#3b82f6",
      status: STATUS_MAP["진행 중"],
    },
    {
      name: "테스트",
      value: stats?.testWorks ?? 0,
      color: "#a855f7",
      status: STATUS_MAP["테스트"],
    },
    {
      name: "대기",
      value: stats?.todoWorks ?? 0,
      color: "#94a3b8",
      status: STATUS_MAP["대기"],
    },
    {
      name: "보류",
      value: stats?.holdWorks ?? 0,
      color: "#f59e0b",
      status: STATUS_MAP["보류"],
    },
    {
      name: "막힘",
      value: stats?.blockedWorks ?? 0,
      color: "#ef4444",
      status: STATUS_MAP["막힘"],
    },
  ];

  const issueData: BarItem[] = [
    { name: "전체", value: stats?.totalIssues ?? 0, color: "#6366f1" },
    {
      name: "완료",
      value: stats?.doneIssues ?? 0,
      color: "#22c55e",
      status: STATUS_MAP["완료"],
    },
    {
      name: "진행 중",
      value: stats?.inProgressIssues ?? 0,
      color: "#3b82f6",
      status: STATUS_MAP["진행 중"],
    },
    {
      name: "테스트",
      value: stats?.testIssues ?? 0,
      color: "#a855f7",
      status: STATUS_MAP["테스트"],
    },
    {
      name: "대기",
      value: stats?.todoIssues ?? 0,
      color: "#94a3b8",
      status: STATUS_MAP["대기"],
    },
    {
      name: "보류",
      value: stats?.holdIssues ?? 0,
      color: "#f59e0b",
      status: STATUS_MAP["보류"],
    },
    {
      name: "막힘",
      value: stats?.blockedIssues ?? 0,
      color: "#ef4444",
      status: STATUS_MAP["막힘"],
    },
  ];

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
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>📋 업무 현황</span>
                <span className="text-sm font-normal text-muted-foreground">
                  전체 {stats?.totalWorks ?? 0}개
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => handleWorkNavigate()}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                전체 보기
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[65, 80, 55, 70, 45, 60, 50].map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-14 bg-muted rounded" />
                    <div
                      className="h-6 bg-muted rounded flex-1"
                      style={{ width: `${w}%` }}
                    />
                    <div className="h-4 w-6 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <CustomBarChart data={workData} onNavigate={handleWorkNavigate} />
            )}
          </CardContent>
        </Card>

        {/* 이슈 현황 카드 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🚨 이슈 현황</span>
                <span className="text-sm font-normal text-muted-foreground">
                  전체 {stats?.totalIssues ?? 0}개
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => handleIssueNavigate()}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                전체 보기
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[65, 80, 55, 70, 45, 60, 50].map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-14 bg-muted rounded" />
                    <div
                      className="h-6 bg-muted rounded flex-1"
                      style={{ width: `${w}%` }}
                    />
                    <div className="h-4 w-6 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <CustomBarChart
                data={issueData}
                onNavigate={handleIssueNavigate}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
