import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subIssueApi } from '@/entities/issue/api/subIssueApi'
import type { CreateSubIssueRequest } from '@/entities/issue/types/subIssue'

export function useSubIssues(issueId: number) {
  return useQuery({
    queryKey: ['sub-issues', issueId],
    queryFn: () => subIssueApi.getSubIssues(issueId),
    enabled: !!issueId,
  })
}

export function useCreateSubIssue(issueId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateSubIssueRequest) => subIssueApi.createSubIssue(issueId, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sub-issues', issueId] }),
  })
}

export function useUpdateSubIssue(issueId: number, subIssueId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateSubIssueRequest) => subIssueApi.updateSubIssue(issueId, subIssueId, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sub-issues', issueId] }),
  })
}

export function useToggleSubIssue(issueId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subIssueId: number) => subIssueApi.toggleSubIssue(issueId, subIssueId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sub-issues', issueId] }),
  })
}

export function useDeleteSubIssue(issueId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subIssueId: number) => subIssueApi.deleteSubIssue(issueId, subIssueId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sub-issues', issueId] }),
  })
}
