import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workFigmaApi } from '@/entities/work/api/workFigmaApi'
import type { CreateWorkFigmaRequest, UpdateWorkFigmaRequest } from '@/entities/work/types/workFigma'
import { toast } from 'sonner'

export function useWorkFigmas(workId: number | null) {
  return useQuery({
    queryKey: ['workFigmas', workId],
    queryFn: () => workFigmaApi.getFigmas(workId!),
    enabled: !!workId,
  })
}

export function useCreateWorkFigma(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateWorkFigmaRequest) =>
      workFigmaApi.createFigma(workId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workFigmas', workId] })
      toast.success('피그마 링크가 추가되었습니다.')
    },
    onError: () => {
      toast.error('피그마 링크 추가에 실패했습니다.')
    },
  })
}

export function useUpdateWorkFigma(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      figmaId,
      request,
    }: {
      figmaId: number
      request: UpdateWorkFigmaRequest
    }) => workFigmaApi.updateFigma(workId, figmaId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workFigmas', workId] })
      toast.success('피그마 링크가 수정되었습니다.')
    },
    onError: () => {
      toast.error('피그마 링크 수정에 실패했습니다.')
    },
  })
}

export function useDeleteWorkFigma(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (figmaId: number) =>
      workFigmaApi.deleteFigma(workId, figmaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workFigmas', workId] })
      toast.success('피그마 링크가 삭제되었습니다.')
    },
    onError: () => {
      toast.error('피그마 링크 삭제에 실패했습니다.')
    },
  })
}
