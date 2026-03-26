import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issueDbTableApi } from '@/entities/issue/api/issueDbTableApi'
import type { CreateDbTableRequest, UpdateDbTableRequest } from '@/entities/issue/types/issueDbTable'
import { toast } from 'sonner'

export function useIssueDbTables(issueId: number | null) {
  return useQuery({
    queryKey: ['issueDbTables', issueId],
    queryFn: () => issueDbTableApi.getDbTables(issueId!),
    enabled: !!issueId,
  })
}

export function useCreateDbTable(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateDbTableRequest) => issueDbTableApi.createDbTable(issueId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueDbTables', issueId] })
      toast.success('DB 테이블이 추가되었습니다.')
    },
    onError: () => {
      toast.error('DB 테이블 추가에 실패했습니다.')
    },
  })
}

export function useUpdateDbTable(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ dbTableId, request }: { dbTableId: number; request: UpdateDbTableRequest }) =>
      issueDbTableApi.updateDbTable(issueId, dbTableId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueDbTables', issueId] })
      toast.success('DB 테이블이 수정되었습니다.')
    },
    onError: () => {
      toast.error('DB 테이블 수정에 실패했습니다.')
    },
  })
}

export function useDeleteDbTable(issueId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dbTableId: number) => issueDbTableApi.deleteDbTable(issueId, dbTableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueDbTables', issueId] })
      toast.success('DB 테이블이 삭제되었습니다.')
    },
    onError: () => {
      toast.error('DB 테이블 삭제에 실패했습니다.')
    },
  })
}
