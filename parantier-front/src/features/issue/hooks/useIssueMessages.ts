import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issueMessageApi } from '@/entities/issue/api/issueMessageApi'
import type { CreateMessageRequest, UpdateMessageRequest } from '@/entities/issue/types/issueMessage'
import { toast } from 'sonner'

/**
 * 특정 이슈의 메시지 목록 조회 (REST API)
 */
export function useIssueMessages(issueId: number) {
  return useQuery({
    queryKey: ['issue-messages', issueId],
    queryFn: () => issueMessageApi.getMessages(issueId),
    enabled: !!issueId,
  })
}

/**
 * 메시지 생성 (REST API)
 */
export function useCreateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issueId, request }: { issueId: number; request: CreateMessageRequest }) =>
      issueMessageApi.createMessage(issueId, request),
    onSuccess: (_, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: ['issue-messages', issueId] })
    },
    onError: () => {
      toast.error('메시지 전송에 실패했습니다.')
    },
  })
}

/**
 * 메시지 수정
 */
export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      issueId,
      messageId,
      request,
    }: {
      issueId: number
      messageId: number
      request: UpdateMessageRequest
    }) => issueMessageApi.updateMessage(issueId, messageId, request),
    onSuccess: (_, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: ['issue-messages', issueId] })
      toast.success('메시지가 수정되었습니다.')
    },
    onError: () => {
      toast.error('메시지 수정에 실패했습니다.')
    },
  })
}

/**
 * 메시지 삭제
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issueId, messageId }: { issueId: number; messageId: number }) =>
      issueMessageApi.deleteMessage(issueId, messageId),
    onSuccess: (_, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: ['issue-messages', issueId] })
      toast.success('메시지가 삭제되었습니다.')
    },
    onError: () => {
      toast.error('메시지 삭제에 실패했습니다.')
    },
  })
}

/**
 * 메시지 개수 조회
 */
export function useMessageCount(issueId: number) {
  return useQuery({
    queryKey: ['issue-message-count', issueId],
    queryFn: () => issueMessageApi.getMessageCount(issueId),
    enabled: !!issueId,
  })
}
