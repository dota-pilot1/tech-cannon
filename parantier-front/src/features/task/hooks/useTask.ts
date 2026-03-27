import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '../api/taskApi'
import type { TaskFolderDto, TaskPostDto, TaskCommentDto } from '../types/task.types'
import { toast } from 'sonner'

// Folder hooks
export function useTaskFolders() {
  return useQuery({
    queryKey: ['taskFolders'],
    queryFn: () => taskApi.getFolders(),
  })
}

export function useCreateFolderMutation(onSuccess?: (parentId: number | null) => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: TaskFolderDto) => taskApi.createFolder(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taskFolders'] })
      toast.success('폴더가 생성되었습니다')
      if (onSuccess) onSuccess(variables.parentId)
    },
    onError: (error: any) => {
      console.error('[useCreateFolderMutation] 에러:', error)
      toast.error('폴더 생성 실패: ' + (error?.message || '알 수 없는 오류'))
    },
  })
}

export function useRenameFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: TaskFolderDto }) =>
      taskApi.updateFolder(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskFolders'] })
      toast.success('폴더명이 변경되었습니다')
      if (onSuccess) onSuccess()
    },
  })
}

export function useDeleteFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => taskApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskFolders'] })
      toast.success('폴더가 삭제되었습니다')
      if (onSuccess) onSuccess()
    },
  })
}

// Post hooks
export function useAllTaskPosts() {
  return useQuery({
    queryKey: ['taskPosts'],
    queryFn: () => taskApi.getAllPosts(),
  })
}

export function useTaskPosts(folderId: number | null) {
  return useQuery({
    queryKey: ['taskPosts', folderId],
    queryFn: () => taskApi.getPostsByFolder(folderId!),
    enabled: !!folderId,
  })
}

export function useTaskPostDetail(postId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['taskPost', postId],
    queryFn: () => taskApi.getPost(postId!),
    enabled: !!postId && enabled,
  })
}

export function useSaveTaskMutation(
  _folderId: number | null,
  postId: number | null,
  onSuccess?: (newId: number) => void
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: TaskPostDto) => taskApi.savePost(dto),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ['taskPosts'] })
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ['taskPost', postId] })
      }
      toast.success('저장되었습니다')
      if (onSuccess) onSuccess(newId)
    },
  })
}

export function useDeleteTaskMutation(_folderId: number | null, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => taskApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskPosts'] })
      toast.success('삭제되었습니다')
      if (onSuccess) onSuccess()
    },
  })
}

// Comment hooks
export function useTaskComments(postId: number | null) {
  return useQuery({
    queryKey: ['taskComments', postId],
    queryFn: () => taskApi.getComments(postId!),
    enabled: !!postId,
  })
}

export function useCreateCommentMutation(postId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: TaskCommentDto) => taskApi.createComment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', postId] })
      toast.success('댓글이 작성되었습니다')
    },
  })
}

export function useDeleteCommentMutation(postId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => taskApi.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', postId] })
      toast.success('댓글이 삭제되었습니다')
    },
  })
}
