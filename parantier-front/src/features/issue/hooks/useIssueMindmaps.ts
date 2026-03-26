import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issueMindmapApi } from '@/entities/issue/api/issueMindmapApi'
import type { CreateMindmapRequest, UpdateMindmapRequest } from '@/entities/issue/types/issueMindmap'
import { toast } from 'sonner'

export function useIssueMindmaps(issueId: number | null) {
  return useQuery({
    queryKey: ['issueMindmaps', issueId],
    queryFn: () => issueMindmapApi.getMindmaps(issueId!),
    enabled: !!issueId,
  })
}

export function useCreateMindmap(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateMindmapRequest) => issueMindmapApi.createMindmap(issueId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueMindmaps', issueId] })
      toast.success('마인드맵이 추가되었습니다.')
    },
    onError: () => {
      toast.error('마인드맵 추가에 실패했습니다.')
    },
  })
}

export function useUpdateMindmap(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mindmapId, request }: { mindmapId: number; request: UpdateMindmapRequest }) =>
      issueMindmapApi.updateMindmap(issueId, mindmapId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueMindmaps', issueId] })
      toast.success('마인드맵이 수정되었습니다.')
    },
    onError: () => {
      toast.error('마인드맵 수정에 실패했습니다.')
    },
  })
}

export function useDeleteMindmap(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mindmapId: number) => issueMindmapApi.deleteMindmap(issueId, mindmapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueMindmaps', issueId] })
      toast.success('마인드맵이 삭제되었습니다.')
    },
    onError: () => {
      toast.error('마인드맵 삭제에 실패했습니다.')
    },
  })
}
