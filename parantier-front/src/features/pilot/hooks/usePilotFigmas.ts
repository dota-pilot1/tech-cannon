import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pilotFigmaApi } from '@/entities/pilot/api/pilotFigmaApi'
import type { CreatePilotFigmaRequest, UpdatePilotFigmaRequest } from '@/entities/pilot/types/pilotFigma'
import { toast } from 'sonner'

export function usePilotFigmas(pilotId: number | null) {
  return useQuery({
    queryKey: ['pilotFigmas', pilotId],
    queryFn: () => pilotFigmaApi.getFigmas(pilotId!),
    enabled: !!pilotId,
  })
}

export function useCreatePilotFigma(pilotId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreatePilotFigmaRequest) => pilotFigmaApi.createFigma(pilotId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotFigmas', pilotId] })
      toast.success('피그마 링크가 추가되었습니다.')
    },
    onError: () => toast.error('피그마 링크 추가에 실패했습니다.'),
  })
}

export function useUpdatePilotFigma(pilotId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ figmaId, request }: { figmaId: number; request: UpdatePilotFigmaRequest }) =>
      pilotFigmaApi.updateFigma(pilotId, figmaId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotFigmas', pilotId] })
      toast.success('피그마 링크가 수정되었습니다.')
    },
    onError: () => toast.error('피그마 링크 수정에 실패했습니다.'),
  })
}

export function useDeletePilotFigma(pilotId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (figmaId: number) => pilotFigmaApi.deleteFigma(pilotId, figmaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotFigmas', pilotId] })
      toast.success('피그마 링크가 삭제되었습니다.')
    },
    onError: () => toast.error('피그마 링크 삭제에 실패했습니다.'),
  })
}
