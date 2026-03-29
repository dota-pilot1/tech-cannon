import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workChecklistApi } from '@/entities/work/api/workChecklistApi'
import type { CreateWorkChecklistRequest, UpdateWorkChecklistRequest } from '@/entities/work/types/workChecklist'
import { toast } from 'sonner'

export function useWorkChecklists(workId: number | null) {
  return useQuery({
    queryKey: ['work-checklists', workId],
    queryFn: () => workChecklistApi.getChecklists(workId!),
    enabled: !!workId,
  })
}

export function useCreateWorkChecklist(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateWorkChecklistRequest) =>
      workChecklistApi.createChecklist(workId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-checklists', workId] })
      toast.success('체크리스트 항목이 추가되었습니다.')
    },
    onError: () => {
      toast.error('체크리스트 항목 추가에 실패했습니다.')
    },
  })
}

export function useUpdateWorkChecklist(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      checklistId,
      request,
    }: {
      checklistId: number
      request: UpdateWorkChecklistRequest
    }) => workChecklistApi.updateChecklist(workId, checklistId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-checklists', workId] })
    },
    onError: () => {
      toast.error('체크리스트 항목 수정에 실패했습니다.')
    },
  })
}

export function useToggleWorkChecklist(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (checklistId: number) =>
      workChecklistApi.toggleChecklist(workId, checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-checklists', workId] })
    },
    onError: () => {
      toast.error('체크 상태 변경에 실패했습니다.')
    },
  })
}

export function useDeleteWorkChecklist(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (checklistId: number) =>
      workChecklistApi.deleteChecklist(workId, checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-checklists', workId] })
      toast.success('체크리스트 항목이 삭제되었습니다.')
    },
    onError: () => {
      toast.error('체크리스트 항목 삭제에 실패했습니다.')
    },
  })
}
