import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issueApi } from '@/entities/issue/api/issueApi'
import type { IssueFilters, CreateIssueRequest, UpdateIssueRequest } from '@/entities/issue/types/issue'
import { toast } from 'sonner'

export function useIssues(filters?: IssueFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => issueApi.getIssues(filters),
  })
}

export function useIssue(id: number) {
  return useQuery({
    queryKey: ['issues', id],
    queryFn: () => issueApi.getIssue(id),
    enabled: !!id,
  })
}

export function useCreateIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateIssueRequest) => issueApi.createIssue(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      toast.success('이슈가 생성되었습니다.')
    },
    onError: () => {
      toast.error('이슈 생성에 실패했습니다.')
    },
  })
}

export function useUpdateIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateIssueRequest }) =>
      issueApi.updateIssue(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      toast.success('이슈가 수정되었습니다.')
    },
    onError: () => {
      toast.error('이슈 수정에 실패했습니다.')
    },
  })
}

export function useDeleteIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => issueApi.deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      toast.success('이슈가 삭제되었습니다.')
    },
    onError: () => {
      toast.error('이슈 삭제에 실패했습니다.')
    },
  })
}

export function useUpdateIssueStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      issueApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      toast.success('상태가 변경되었습니다.')
    },
    onError: () => {
      toast.error('상태 변경에 실패했습니다.')
    },
  })
}

export function useUpdateIssueAssignee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: number; assigneeId: number | null }) =>
      issueApi.updateAssignee(id, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      toast.success('담당자가 변경되었습니다.')
    },
    onError: () => {
      toast.error('담당자 변경에 실패했습니다.')
    },
  })
}
