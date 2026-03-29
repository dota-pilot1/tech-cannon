import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workMessageApi } from '@/entities/work/api/workMessageApi'
import type { CreateWorkMessageRequest, UpdateWorkMessageRequest } from '@/entities/work/types/workMessage'
import { toast } from 'sonner'

/**
 * 특정 업무의 메시지 목록 조회 (REST API)
 */
export function useWorkMessages(workId: number) {
  return useQuery({
    queryKey: ['work-messages', workId],
    queryFn: () => workMessageApi.getMessages(workId),
    enabled: !!workId,
  })
}

/**
 * 메시지 생성 (REST API)
 */
export function useCreateWorkMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workId, request }: { workId: number; request: CreateWorkMessageRequest }) =>
      workMessageApi.createMessage(workId, request),
    onSuccess: (_, { workId }) => {
      queryClient.invalidateQueries({ queryKey: ['work-messages', workId] })
    },
    onError: () => {
      toast.error('메시지 전송에 실패했습니다.')
    },
  })
}

/**
 * 메시지 수정
 */
export function useUpdateWorkMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workId,
      messageId,
      request,
    }: {
      workId: number
      messageId: number
      request: UpdateWorkMessageRequest
    }) => workMessageApi.updateMessage(workId, messageId, request),
    onSuccess: (_, { workId }) => {
      queryClient.invalidateQueries({ queryKey: ['work-messages', workId] })
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
export function useDeleteWorkMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workId, messageId }: { workId: number; messageId: number }) =>
      workMessageApi.deleteMessage(workId, messageId),
    onSuccess: (_, { workId }) => {
      queryClient.invalidateQueries({ queryKey: ['work-messages', workId] })
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
export function useWorkMessageCount(workId: number) {
  return useQuery({
    queryKey: ['work-message-count', workId],
    queryFn: () => workMessageApi.getMessageCount(workId),
    enabled: !!workId,
  })
}
