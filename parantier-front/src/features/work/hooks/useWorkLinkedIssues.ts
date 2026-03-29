import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workLinkedIssueApi } from '@/entities/work/api/workLinkedIssueApi'
import { toast } from 'sonner'

export function useWorkLinkedIssues(workId: number | null) {
  return useQuery({
    queryKey: ['work-linked-issues', workId],
    queryFn: () => workLinkedIssueApi.getLinkedIssues(workId!),
    enabled: !!workId,
  })
}

export function useLinkIssue(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (issueId: number) => workLinkedIssueApi.linkIssue(workId, issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-linked-issues', workId] })
      toast.success('이슈가 연결되었습니다.')
    },
    onError: () => {
      toast.error('이슈 연결에 실패했습니다.')
    },
  })
}

export function useUnlinkIssue(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkId: number) => workLinkedIssueApi.unlinkIssue(workId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-linked-issues', workId] })
      toast.success('이슈 연결이 해제되었습니다.')
    },
    onError: () => {
      toast.error('이슈 연결 해제에 실패했습니다.')
    },
  })
}
