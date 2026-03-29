import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pilotChecklistApi } from '@/entities/pilot/api/pilotChecklistApi'
import type { CreatePilotChecklistRequest, UpdatePilotChecklistRequest } from '@/entities/pilot/types/pilotChecklist'
import { toast } from 'sonner'

export function usePilotChecklists(pilotId: number | null) {
  return useQuery({
    queryKey: ['pilotChecklists', pilotId],
    queryFn: () => pilotChecklistApi.getChecklists(pilotId!),
    enabled: !!pilotId,
  })
}

export function useCreatePilotChecklist(pilotId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreatePilotChecklistRequest) =>
      pilotChecklistApi.createChecklist(pilotId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotChecklists', pilotId] })
      toast.success('체크리스트 항목이 추가되었습니다.')
    },
    onError: () => toast.error('체크리스트 항목 추가에 실패했습니다.'),
  })
}

export function useUpdatePilotChecklist(pilotId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ checklistId, request }: { checklistId: number; request: UpdatePilotChecklistRequest }) =>
      pilotChecklistApi.updateChecklist(pilotId, checklistId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pilotChecklists', pilotId] }),
    onError: () => toast.error('체크리스트 항목 수정에 실패했습니다.'),
  })
}

export function useTogglePilotChecklist(pilotId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (checklistId: number) =>
      pilotChecklistApi.toggleChecklist(pilotId, checklistId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pilotChecklists', pilotId] }),
    onError: () => toast.error('체크 상태 변경에 실패했습니다.'),
  })
}

export function useDeletePilotChecklist(pilotId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (checklistId: number) =>
      pilotChecklistApi.deleteChecklist(pilotId, checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotChecklists', pilotId] })
      toast.success('체크리스트 항목이 삭제되었습니다.')
    },
    onError: () => toast.error('체크리스트 항목 삭제에 실패했습니다.'),
  })
}
