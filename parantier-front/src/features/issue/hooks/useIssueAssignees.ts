import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issueAssigneeApi } from '@/entities/issue/api/issueAssigneeApi'
import { toast } from 'sonner'

export function useIssueAssignees(issueId: number | null) {
  return useQuery({
    queryKey: ['issueAssignees', issueId],
    queryFn: () => issueAssigneeApi.getIssueAssignees(issueId!),
    enabled: !!issueId,
  })
}

export function useUpdateIssueAssignees(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userIds: number[]) => issueAssigneeApi.updateAssignees(issueId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueAssignees', issueId] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      toast.success('담당자가 변경되었습니다.')
    },
    onError: () => {
      toast.error('담당자 변경에 실패했습니다.')
    },
  })
}
