import { apiClient } from '@/shared/api/client'
import type {
  TaskFolder,
  TaskPost,
  TaskComment,
  TaskFolderDto,
  TaskPostDto,
  TaskCommentDto,
} from '../types/task.types'

export const taskApi = {
  // Folders
  getFolders: async (): Promise<TaskFolder[]> => {
    const { data } = await apiClient.get('/api/tasks/folders')
    return data
  },

  getFolder: async (id: number): Promise<TaskFolder> => {
    const { data } = await apiClient.get(`/api/tasks/folders/${id}`)
    return data
  },

  createFolder: async (dto: TaskFolderDto): Promise<number> => {
    const { data } = await apiClient.post('/api/tasks/folders', dto)
    return data
  },

  updateFolder: async (id: number, dto: TaskFolderDto): Promise<void> => {
    await apiClient.put(`/api/tasks/folders/${id}`, dto)
  },

  deleteFolder: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tasks/folders/${id}`)
  },

  // Posts
  getPostsByFolder: async (folderId: number): Promise<TaskPost[]> => {
    const { data } = await apiClient.get('/api/tasks/posts', {
      params: { folderId },
    })
    return data
  },

  getPost: async (id: number): Promise<TaskPost> => {
    const { data } = await apiClient.get(`/api/tasks/posts/${id}`)
    return data
  },

  savePost: async (dto: TaskPostDto): Promise<number> => {
    const { data } = await apiClient.post('/api/tasks/posts', dto)
    return data
  },

  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tasks/posts/${id}`)
  },

  // Comments
  getComments: async (postId: number): Promise<TaskComment[]> => {
    const { data } = await apiClient.get('/api/tasks/comments', {
      params: { postId },
    })
    return data
  },

  createComment: async (dto: TaskCommentDto): Promise<number> => {
    const { data } = await apiClient.post('/api/tasks/comments', dto)
    return data
  },

  deleteComment: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tasks/comments/${id}`)
  },
}
