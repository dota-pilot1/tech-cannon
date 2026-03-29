import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pilotMindmapApi } from '@/entities/pilot/api/pilotMindmapApi'
import type { CreatePilotMindmapRequest, UpdatePilotMindmapRequest } from '@/entities/pilot/types/pilotMindmap'
import { toast } from 'sonner'

export function usePilotMindmaps(pilotId: number | null) {
  return useQuery({
    queryKey: ['pilotMindmaps', pilotId],
    queryFn: () => pilotMindmapApi.getMindmaps(pilotId!),
    enabled: !!pilotId,
  })
}

export function useCreatePilotMindmap(pilotId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreatePilotMindmapRequest) =>
      pilotMindmapApi.createMindmap(pilotId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotMindmaps', pilotId] })
      toast.success('마인드맵이 추가되었습니다.')
    },
    onError: () => {
      toast.error('마인드맵 추가에 실패했습니다.')
    },
  })
}

export function useUpdatePilotMindmap(pilotId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      mindmapId,
      request,
    }: {
      mindmapId: number
      request: UpdatePilotMindmapRequest
    }) => pilotMindmapApi.updateMindmap(pilotId, mindmapId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotMindmaps', pilotId] })
      toast.success('마인드맵이 수정되었습니다.')
    },
    onError: () => {
      toast.error('마인드맵 수정에 실패했습니다.')
    },
  })
}

export function useDeletePilotMindmap(pilotId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mindmapId: number) =>
      pilotMindmapApi.deleteMindmap(pilotId, mindmapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotMindmaps', pilotId] })
      toast.success('마인드맵이 삭제되었습니다.')
    },
    onError: () => {
      toast.error('마인드맵 삭제에 실패했습니다.')
    },
  })
}
