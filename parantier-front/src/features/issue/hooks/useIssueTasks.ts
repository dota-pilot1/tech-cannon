import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issueTaskApi } from '@/entities/issue/api/issueTaskApi'
import type { LinkTaskRequest } from '@/entities/issue/types/issueTask'
import { toast } from 'sonner'

export function useIssueTasks(issueId: number | null) {
  return useQuery({
    queryKey: ['issueTasks', issueId],
    queryFn: () => issueTaskApi.getLinkedTasks(issueId!),
    enabled: !!issueId,
  })
}

export function useLinkTask(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: LinkTaskRequest) => issueTaskApi.linkTask(issueId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueTasks', issueId] })
      toast.success('업무가 연결되었습니다.')
    },
    onError: () => {
      toast.error('업무 연결에 실패했습니다.')
    },
  })
}

export function useUnlinkTask(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkId: number) => issueTaskApi.unlinkTask(issueId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueTasks', issueId] })
      toast.success('업무 연결이 해제되었습니다.')
    },
    onError: () => {
      toast.error('업무 연결 해제에 실패했습니다.')
    },
  })
}
