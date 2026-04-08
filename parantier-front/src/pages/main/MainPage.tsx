import { useStore } from "@tanstack/react-store";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authStore } from "@/entities/user/model/authStore";
import { dashboardApi } from "@/api/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ExternalLink, Briefcase, AlertCircle } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";

const STATUS_MAP: Record<string, string> = {
  완료: "DONE",
  "진행 중": "IN_PROGRESS",
  테스트: "TEST",
  대기: "TODO",
  보류: "HOLD",
  막힘: "BLOCKED",
};

interface BarItem {
  name: string;
  value: number;
  color: string;
  status?: string;
}

type PeriodTab = "today" | "week" | "month";

const PERIOD_TABS: { key: PeriodTab; label: string }[] = [
  { key: "today", label: "오늘" },
  { key: "week", label: "이번 주" },
  { key: "month", label: "이번 달" },
];

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
          <div className="w-14 text-sm text-muted-foreground text-right shrink-0">
            {item.name}
          </div>
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

export function MainPage() {
  const auth = useStore(authStore, (state) => state);
  const navigate = useNavigate();
  const [periodTab, setPeriodTab] = useState<PeriodTab>("today");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
    enabled: auth.isAuthenticated,
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const { data: userStats, isLoading: isUserStatsLoading } = useQuery({
    queryKey: ["dashboard", "userCompletion", periodTab],
    queryFn: () => dashboardApi.getUserCompletionStats(periodTab),
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
    const features = [
      {
        icon: "📋",
        title: "업무 관리",
        description: "태스크 생성, 진행상황 추적",
      },
      {
        icon: "🚨",
        title: "이슈 트래킹",
        description: "버그, 개선사항 관리",
      },
      {
        icon: "📚",
        title: "기술 문서",
        description: "Backend/Frontend/Security 지식 공유",
      },
      {
        icon: "💬",
        title: "팀 채팅",
        description: "실시간 채팅룸",
      },
      {
        icon: "🎨",
        title: "Figma 연동",
        description: "디자인 링크 관리",
      },
      {
        icon: "📊",
        title: "대시보드",
        description: "팀 업무/이슈 현황 한눈에",
      },
    ];

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* 히어로 섹션 */}
        <div className="py-16 sm:py-24 text-center">
          <div className="text-5xl sm:text-6xl font-bold text-foreground mb-4 tracking-tight">
            TechCannon
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10">
            개발팀을 위한 올인원 협업 플랫폼
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-lg px-4 py-2.5 bg-card">
            <span className="text-base">↑</span>
            <span>상단에서 로그인하여 시작하세요</span>
          </div>
        </div>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card border border-border rounded-xl p-5 sm:p-6"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <div className="text-sm font-semibold text-foreground mb-1">
                {feature.title}
              </div>
              <div className="text-sm text-muted-foreground">
                {feature.description}
              </div>
            </div>
          ))}
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

  const userCompletionMax = Math.max(
    ...(userStats ?? []).flatMap((u) => [u.doneWorks, u.doneIssues]),
    1,
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

        {/* 멤버별 완료 현황 — 헤더 + 탭 */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-base font-semibold text-foreground">
              👥 멤버별 완료 현황
            </span>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              {PERIOD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPeriodTab(tab.key)}
                  className={[
                    "px-3 py-1 text-xs font-medium rounded-md transition-all duration-150",
                    periodTab === tab.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 멤버 카드 그리드 */}
          {isUserStatsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="h-5 bg-muted rounded" />
                      <div className="h-5 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (userStats ?? []).length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  완료된 항목이 없습니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(userStats ?? []).map((user) => (
                <Card
                  key={user.userId}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-5 space-y-4">
                    {/* 유저 정보 */}
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* 업무 완료 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          업무 완료
                        </span>
                        <span className="font-semibold text-foreground text-sm">
                          {user.doneWorks}
                        </span>
                      </div>
                      <div className="bg-muted/40 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width:
                              user.doneWorks > 0
                                ? `${(user.doneWorks / userCompletionMax) * 100}%`
                                : "0%",
                            backgroundColor: "#22c55e",
                            minWidth: user.doneWorks > 0 ? "0.5rem" : "0",
                          }}
                        />
                      </div>
                    </div>

                    {/* 이슈 완료 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          이슈 완료
                        </span>
                        <span className="font-semibold text-foreground text-sm">
                          {user.doneIssues}
                        </span>
                      </div>
                      <div className="bg-muted/40 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width:
                              user.doneIssues > 0
                                ? `${(user.doneIssues / userCompletionMax) * 100}%`
                                : "0%",
                            backgroundColor: "#3b82f6",
                            minWidth: user.doneIssues > 0 ? "0.5rem" : "0",
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
