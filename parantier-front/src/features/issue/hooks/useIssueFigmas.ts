import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issueFigmaApi } from '@/entities/issue/api/issueFigmaApi'
import type { CreateFigmaRequest, UpdateFigmaRequest } from '@/entities/issue/types/issueFigma'
import { toast } from 'sonner'

export function useIssueFigmas(issueId: number | null) {
  return useQuery({
    queryKey: ['issueFigmas', issueId],
    queryFn: () => issueFigmaApi.getFigmas(issueId!),
    enabled: !!issueId,
  })
}

export function useCreateFigma(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateFigmaRequest) => issueFigmaApi.createFigma(issueId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueFigmas', issueId] })
      toast.success('피그마가 추가되었습니다.')
    },
    onError: () => {
      toast.error('피그마 추가에 실패했습니다.')
    },
  })
}

export function useUpdateFigma(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ figmaId, request }: { figmaId: number; request: UpdateFigmaRequest }) =>
      issueFigmaApi.updateFigma(issueId, figmaId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueFigmas', issueId] })
      toast.success('피그마가 수정되었습니다.')
    },
    onError: () => {
      toast.error('피그마 수정에 실패했습니다.')
    },
  })
}

export function useDeleteFigma(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (figmaId: number) => issueFigmaApi.deleteFigma(issueId, figmaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueFigmas', issueId] })
      toast.success('피그마가 삭제되었습니다.')
    },
    onError: () => {
      toast.error('피그마 삭제에 실패했습니다.')
    },
  })
}
