import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issueChecklistApi } from '@/entities/issue/api/issueChecklistApi'
import type { CreateChecklistRequest, UpdateChecklistRequest } from '@/entities/issue/types/issueChecklist'
import { toast } from 'sonner'

export function useIssueChecklists(issueId: number | null) {
  return useQuery({
    queryKey: ['issue-checklists', issueId],
    queryFn: () => issueChecklistApi.getChecklists(issueId!),
    enabled: !!issueId,
  })
}

export function useCreateChecklist(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateChecklistRequest) => issueChecklistApi.createChecklist(issueId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue-checklists', issueId] })
      toast.success('체크리스트 항목이 추가되었습니다.')
    },
    onError: () => {
      toast.error('체크리스트 항목 추가에 실패했습니다.')
    },
  })
}

export function useUpdateChecklist(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ checklistId, request }: { checklistId: number; request: UpdateChecklistRequest }) =>
      issueChecklistApi.updateChecklist(issueId, checklistId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue-checklists', issueId] })
    },
    onError: () => {
      toast.error('체크리스트 항목 수정에 실패했습니다.')
    },
  })
}

export function useToggleChecklist(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (checklistId: number) => issueChecklistApi.toggleChecklist(issueId, checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue-checklists', issueId] })
    },
    onError: () => {
      toast.error('체크 상태 변경에 실패했습니다.')
    },
  })
}

export function useDeleteChecklist(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (checklistId: number) => issueChecklistApi.deleteChecklist(issueId, checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue-checklists', issueId] })
      toast.success('체크리스트 항목이 삭제되었습니다.')
    },
    onError: () => {
      toast.error('체크리스트 항목 삭제에 실패했습니다.')
    },
  })
}
