import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pilotApi } from '@/entities/pilot/api/pilotApi'
import type { PilotFilters, CreatePilotRequest, UpdatePilotRequest } from '@/entities/pilot/types/pilot'
import { toast } from 'sonner'

export function usePilots(filters?: PilotFilters) {
  return useQuery({
    queryKey: ['pilots', filters],
    queryFn: () => pilotApi.getPilots(filters),
  })
}

export function usePilot(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['pilots', id],
    queryFn: () => pilotApi.getPilot(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  })
}

export function useCreatePilot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreatePilotRequest) => pilotApi.createPilot(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] })
      toast.success('파일럿이 생성되었습니다.')
    },
    onError: () => {
      toast.error('파일럿 생성에 실패했습니다.')
    },
  })
}

export function useUpdatePilot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdatePilotRequest }) =>
      pilotApi.updatePilot(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] })
      toast.success('파일럿이 수정되었습니다.')
    },
    onError: () => {
      toast.error('파일럿 수정에 실패했습니다.')
    },
  })
}

export function useDeletePilot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pilotApi.deletePilot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] })
      toast.success('파일럿이 삭제되었습니다.')
    },
    onError: () => {
      toast.error('파일럿 삭제에 실패했습니다.')
    },
  })
}

export function useUpdatePilotStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      pilotApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] })
      toast.success('상태가 변경되었습니다.')
    },
    onError: () => {
      toast.error('상태 변경에 실패했습니다.')
    },
  })
}

export function useUpdatePilotAssignee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: number; assigneeId: number | null }) =>
      pilotApi.updateAssignee(id, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] })
      toast.success('담당자가 변경되었습니다.')
    },
    onError: () => {
      toast.error('담당자 변경에 실패했습니다.')
    },
  })
}

export function useUpdatePilotPriority() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: string }) =>
      pilotApi.updatePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] })
      toast.success('우선순위가 변경되었습니다.')
    },
    onError: () => {
      toast.error('우선순위 변경에 실패했습니다.')
    },
  })
}

export function useCreatePilotSilent() {
  return useMutation({
    mutationFn: (request: CreatePilotRequest) => pilotApi.createPilot(request),
  })
}

export function useUpdatePilotSilent() {
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdatePilotRequest }) =>
      pilotApi.updatePilot(id, request),
  })
}
