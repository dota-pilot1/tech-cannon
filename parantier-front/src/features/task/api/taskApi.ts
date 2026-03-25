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
    const { data } = await apiClient.get('/tasks/folders')
    return data
  },

  getFolder: async (id: number): Promise<TaskFolder> => {
    const { data } = await apiClient.get(`/tasks/folders/${id}`)
    return data
  },

  createFolder: async (dto: TaskFolderDto): Promise<number> => {
    const { data } = await apiClient.post('/tasks/folders', dto)
    return data
  },

  updateFolder: async (id: number, dto: TaskFolderDto): Promise<void> => {
    await apiClient.put(`/tasks/folders/${id}`, dto)
  },

  deleteFolder: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/folders/${id}`)
  },

  // Posts
  getAllPosts: async (): Promise<TaskPost[]> => {
    const { data } = await apiClient.get('/tasks/posts')
    return data
  },

  getPostsByFolder: async (folderId: number): Promise<TaskPost[]> => {
    const { data } = await apiClient.get('/tasks/posts', {
      params: { folderId },
    })
    return data
  },

  getPost: async (id: number): Promise<TaskPost> => {
    const { data } = await apiClient.get(`/tasks/posts/${id}`)
    return data
  },

  savePost: async (dto: TaskPostDto): Promise<number> => {
    const { data } = await apiClient.post('/tasks/posts', dto)
    return data
  },

  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/posts/${id}`)
  },

  // Comments
  getComments: async (postId: number): Promise<TaskComment[]> => {
    const { data } = await apiClient.get('/tasks/comments', {
      params: { postId },
    })
    return data
  },

  createComment: async (dto: TaskCommentDto): Promise<number> => {
    const { data } = await apiClient.post('/tasks/comments', dto)
    return data
  },

  deleteComment: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/comments/${id}`)
  },
}
