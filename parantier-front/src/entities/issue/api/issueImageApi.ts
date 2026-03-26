import { apiClient } from '@/shared/api/axios'
import type { IssueImage, PresignedUrlResponse } from '../types/issueImage'

export const issueImageApi = {
  // Get presigned URL for upload
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

  // Get images for an issue
  getIssueImages: async (issueId: number): Promise<IssueImage[]> => {
    const response = await apiClient.get<IssueImage[]>(`/issues/${issueId}/images`)
    return response.data
  },

  // Add image to issue
  addIssueImage: async (issueId: number, url: string, filename: string): Promise<IssueImage> => {
    const response = await apiClient.post<IssueImage>(`/issues/${issueId}/images`, {
      url,
      filename,
    })
    return response.data
  },

  // Delete image
  deleteIssueImage: async (issueId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}/images/${imageId}`)
  },
}
