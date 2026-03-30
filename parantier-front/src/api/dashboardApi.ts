import { apiClient } from '@/shared/api/axios'

export interface DashboardStats {
  myInProgressWorks: number
  todayDueWorks: number
  openIssues: number
  weekDoneWorks: number
  totalUsers: number
  weekCompletionRate: number
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/dashboard/stats')
    return data
  },
}
