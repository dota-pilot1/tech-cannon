import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pilotDbTableApi } from '@/entities/pilot/api/pilotDbTableApi'
import type { CreatePilotDbTableRequest, UpdatePilotDbTableRequest } from '@/entities/pilot/types/pilotDbTable'
import { toast } from 'sonner'

export function usePilotDbTables(pilotId: number | null) {
  return useQuery({
    queryKey: ['pilotDbTables', pilotId],
    queryFn: () => pilotDbTableApi.getDbTables(pilotId!),
    enabled: !!pilotId,
  })
}

export function useCreatePilotDbTable(pilotId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreatePilotDbTableRequest) =>
      pilotDbTableApi.createDbTable(pilotId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotDbTables', pilotId] })
      toast.success('DB 테이블이 추가되었습니다.')
    },
    onError: () => {
      toast.error('DB 테이블 추가에 실패했습니다.')
    },
  })
}

export function useUpdatePilotDbTable(pilotId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ dbTableId, request }: { dbTableId: number; request: UpdatePilotDbTableRequest }) =>
      pilotDbTableApi.updateDbTable(pilotId, dbTableId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotDbTables', pilotId] })
      toast.success('DB 테이블이 수정되었습니다.')
    },
    onError: () => {
      toast.error('DB 테이블 수정에 실패했습니다.')
    },
  })
}

export function useDeletePilotDbTable(pilotId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dbTableId: number) =>
      pilotDbTableApi.deleteDbTable(pilotId, dbTableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotDbTables', pilotId] })
      toast.success('DB 테이블이 삭제되었습니다.')
    },
    onError: () => {
      toast.error('DB 테이블 삭제에 실패했습니다.')
    },
  })
}
