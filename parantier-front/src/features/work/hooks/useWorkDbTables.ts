import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workDbTableApi } from '@/entities/work/api/workDbTableApi'
import type { CreateWorkDbTableRequest, UpdateWorkDbTableRequest } from '@/entities/work/types/workDbTable'
import { toast } from 'sonner'

export function useWorkDbTables(workId: number | null) {
  return useQuery({
    queryKey: ['workDbTables', workId],
    queryFn: () => workDbTableApi.getDbTables(workId!),
    enabled: !!workId,
  })
}

export function useCreateWorkDbTable(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateWorkDbTableRequest) =>
      workDbTableApi.createDbTable(workId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workDbTables', workId] })
      toast.success('DB 테이블이 추가되었습니다.')
    },
    onError: () => {
      toast.error('DB 테이블 추가에 실패했습니다.')
    },
  })
}

export function useUpdateWorkDbTable(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      dbTableId,
      request,
    }: {
      dbTableId: number
      request: UpdateWorkDbTableRequest
    }) => workDbTableApi.updateDbTable(workId, dbTableId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workDbTables', workId] })
      toast.success('DB 테이블이 수정되었습니다.')
    },
    onError: () => {
      toast.error('DB 테이블 수정에 실패했습니다.')
    },
  })
}

export function useDeleteWorkDbTable(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dbTableId: number) =>
      workDbTableApi.deleteDbTable(workId, dbTableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workDbTables', workId] })
      toast.success('DB 테이블이 삭제되었습니다.')
    },
    onError: () => {
      toast.error('DB 테이블 삭제에 실패했습니다.')
    },
  })
}
