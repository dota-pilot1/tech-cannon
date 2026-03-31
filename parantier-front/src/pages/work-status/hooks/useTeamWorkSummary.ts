import { useQuery } from "@tanstack/react-query";
import { workApi } from "@/entities/work/api/workApi";
import type {
  TeamMemberWorkSummary,
  TeamMemberWork,
} from "@/api/workStatusApi";

export function useTeamWorkSummary() {
  return useQuery({
    queryKey: ["team-work-summary"],
    queryFn: async (): Promise<TeamMemberWorkSummary[]> => {
      const result = await workApi.getWorks({ limit: 999, isArchived: false });
      const works = result.items;

      // assigneeId + assigneeName 기준으로 그룹핑
      // 담당자 없음 그룹을 위한 sentinel 값
      const UNASSIGNED_ID = -1;
      const UNASSIGNED_NAME = "담당자 없음";

      const map = new Map<number, TeamMemberWorkSummary>();

      for (const work of works) {
        const userId = work.assigneeId ?? UNASSIGNED_ID;
        const username = work.assigneeName ?? UNASSIGNED_NAME;

        if (!map.has(userId)) {
          map.set(userId, {
            userId,
            username,
            todoCount: 0,
            inProgressCount: 0,
            doneCount: 0,
            holdCount: 0,
            testCount: 0,
            blockedCount: 0,
            totalCount: 0,
            works: [],
          });
        }

        const summary = map.get(userId)!;
        summary.totalCount += 1;

        switch (work.status) {
          case "TODO":
            summary.todoCount += 1;
            break;
          case "IN_PROGRESS":
            summary.inProgressCount += 1;
            break;
          case "DONE":
            summary.doneCount += 1;
            break;
          case "HOLD":
            summary.holdCount += 1;
            break;
          case "TEST":
            summary.testCount += 1;
            break;
          case "BLOCKED":
            summary.blockedCount += 1;
            break;
        }

        const memberWork: TeamMemberWork = {
          id: work.id,
          title: work.title,
          status: work.status,
          priority: work.priority,
          workType: work.workType,
          dueDate: work.dueDate ?? null,
        };
        summary.works.push(memberWork);
      }

      // 담당자 있는 그룹을 먼저, 담당자 없음을 마지막으로 정렬
      // 같은 그룹 내에서는 진행 중 업무 수 내림차순 정렬
      const summaries = Array.from(map.values());

      summaries.sort((a, b) => {
        if (a.userId === UNASSIGNED_ID) return 1;
        if (b.userId === UNASSIGNED_ID) return -1;
        // 진행 중 업무 많은 사람 먼저
        if (b.inProgressCount !== a.inProgressCount) {
          return b.inProgressCount - a.inProgressCount;
        }
        // 이름 오름차순
        return a.username.localeCompare(b.username);
      });

      return summaries;
    },
    refetchInterval: 30000, // 30초마다 갱신
  });
}
