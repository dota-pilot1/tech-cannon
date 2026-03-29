import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workMindmapApi } from '@/entities/work/api/workMindmapApi'
import type { CreateWorkMindmapRequest, UpdateWorkMindmapRequest } from '@/entities/work/types/workMindmap'
import { toast } from 'sonner'

export function useWorkMindmaps(workId: number | null) {
  return useQuery({
    queryKey: ['workMindmaps', workId],
    queryFn: () => workMindmapApi.getMindmaps(workId!),
    enabled: !!workId,
  })
}

export function useCreateWorkMindmap(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateWorkMindmapRequest) =>
      workMindmapApi.createMindmap(workId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workMindmaps', workId] })
      toast.success('마인드맵이 추가되었습니다.')
    },
    onError: () => {
      toast.error('마인드맵 추가에 실패했습니다.')
    },
  })
}

export function useUpdateWorkMindmap(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      mindmapId,
      request,
    }: {
      mindmapId: number
      request: UpdateWorkMindmapRequest
    }) => workMindmapApi.updateMindmap(workId, mindmapId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workMindmaps', workId] })
      toast.success('마인드맵이 수정되었습니다.')
    },
    onError: () => {
      toast.error('마인드맵 수정에 실패했습니다.')
    },
  })
}

export function useDeleteWorkMindmap(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mindmapId: number) =>
      workMindmapApi.deleteMindmap(workId, mindmapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workMindmaps', workId] })
      toast.success('마인드맵이 삭제되었습니다.')
    },
    onError: () => {
      toast.error('마인드맵 삭제에 실패했습니다.')
    },
  })
}
