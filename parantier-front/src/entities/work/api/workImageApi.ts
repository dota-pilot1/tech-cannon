import { apiClient } from '@/shared/api/axios'
import type { WorkImage, PresignedUrlResponse } from '../types/workImage'

export const workImageApi = {
  // Get presigned URL for upload (공용 엔드포인트 사용)
  getPresignedUrl: async (filename: string, contentType: string): Promise<PresignedUrlResponse> => {
    const response = await apiClient.post<PresignedUrlResponse>('/upload/presign', {
      filename,
      contentType,
    })
    return response.data
  },

  // Upload file to S3 using presigned URL
  uploadToS3: async (presignedUrl: string, file: File): Promise<void> => {
    await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })
  },

  // Get images for a work
  getWorkImages: async (workId: number): Promise<WorkImage[]> => {
    const response = await apiClient.get<WorkImage[]>(`/works/${workId}/images`)
    return response.data
  },

  // Add image to work
  addWorkImage: async (workId: number, url: string, filename: string, fileType?: string): Promise<WorkImage> => {
    const response = await apiClient.post<WorkImage>(`/works/${workId}/images`, {
      url,
      filename,
      fileType: fileType || 'image',
    })
    return response.data
  },

  // Delete image
  deleteWorkImage: async (workId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/works/${workId}/images/${imageId}`)
  },
}
