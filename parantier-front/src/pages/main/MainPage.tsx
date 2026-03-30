import { useStore } from "@tanstack/react-store";
import { useQuery } from "@tanstack/react-query";
import { authStore } from "@/entities/user/model/authStore";
import { dashboardApi } from "@/api/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Briefcase,
  AlertCircle,
  Calendar,
  CheckCircle,
  Users,
  TrendingUp,
} from "lucide-react";

function StatCard({
  title,
  icon: Icon,
  value,
  sub,
  loading,
  accent,
}: {
  title: string;
  icon: React.ElementType;
  value: string | number;
  sub: string;
  loading: boolean;
  accent?: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-16 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ) : (
          <>
            <div className={`text-3xl font-bold ${accent ?? ""}`}>{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function MainPage() {
  const auth = useStore(authStore, (state) => state);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
    enabled: auth.isAuthenticated,
    staleTime: 60_000, // 1분간 캐시 유지 → 페이지 이동 시 즉시 표시
    refetchInterval: 60_000, // 1분마다 백그라운드 갱신
  });

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

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-muted-foreground">
          안녕하세요, {auth.user?.username}님
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="내 진행 중 업무"
          icon={Briefcase}
          value={stats?.myInProgressWorks ?? 0}
          sub="현재 담당 중인 업무"
          loading={isLoading}
        />
        <StatCard
          title="오늘 마감 업무"
          icon={Calendar}
          value={stats?.todayDueWorks ?? 0}
          sub="오늘까지 완료해야 하는 업무"
          loading={isLoading}
          accent={(stats?.todayDueWorks ?? 0) > 0 ? "text-red-500" : ""}
        />
        <StatCard
          title="미해결 이슈"
          icon={AlertCircle}
          value={stats?.openIssues ?? 0}
          sub="진행 전 + 진행 중 이슈"
          loading={isLoading}
          accent={(stats?.openIssues ?? 0) > 0 ? "text-orange-500" : ""}
        />
        <StatCard
          title="이번 주 완료"
          icon={CheckCircle}
          value={stats?.weekDoneWorks ?? 0}
          sub="이번 주 완료된 내 업무"
          loading={isLoading}
        />
        <StatCard
          title="팀원"
          icon={Users}
          value={stats?.totalUsers ?? 0}
          sub="활성 사용자"
          loading={isLoading}
        />
        <StatCard
          title="이번 주 완료율"
          icon={TrendingUp}
          value={`${stats?.weekCompletionRate ?? 0}%`}
          sub="이번 주 업무 달성률"
          loading={isLoading}
          accent={
            (stats?.weekCompletionRate ?? 0) >= 80
              ? "text-green-500"
              : (stats?.weekCompletionRate ?? 0) >= 50
                ? "text-yellow-500"
                : "text-muted-foreground"
          }
        />
      </div>
    </div>
  );
}
