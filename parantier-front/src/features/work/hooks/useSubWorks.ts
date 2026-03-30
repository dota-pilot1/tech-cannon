import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subWorkApi } from '@/entities/work/api/subWorkApi'
import type { CreateSubWorkRequest } from '@/entities/work/types/subWork'

export function useSubWorks(workId: number) {
  return useQuery({
    queryKey: ['sub-works', workId],
    queryFn: () => subWorkApi.getSubWorks(workId),
    enabled: !!workId,
  })
}

export function useCreateSubWork(workId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateSubWorkRequest) => subWorkApi.createSubWork(workId, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sub-works', workId] }),
  })
}

export function useUpdateSubWork(workId: number, subWorkId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateSubWorkRequest) => subWorkApi.updateSubWork(workId, subWorkId, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sub-works', workId] }),
  })
}

export function useToggleSubWork(workId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subWorkId: number) => subWorkApi.toggleSubWork(workId, subWorkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sub-works', workId] }),
  })
}

export function useDeleteSubWork(workId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subWorkId: number) => subWorkApi.deleteSubWork(workId, subWorkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sub-works', workId] }),
  })
}
