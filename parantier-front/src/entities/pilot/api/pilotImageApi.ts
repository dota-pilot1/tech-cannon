import { apiClient } from '@/shared/api/axios'
import type { PilotImage, PresignedUrlResponse } from '../types/pilotImage'

export const pilotImageApi = {
  getPresignedUrl: async (filename: string, contentType: string): Promise<PresignedUrlResponse> => {
    const response = await apiClient.post<PresignedUrlResponse>('/upload/presign', {
      filename,
      contentType,
    })
    return response.data
  },

  uploadToS3: async (presignedUrl: string, file: File): Promise<void> => {
    await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })
  },

  getPilotImages: async (pilotId: number): Promise<PilotImage[]> => {
    const response = await apiClient.get<PilotImage[]>(`/pilots/${pilotId}/images`)
    return response.data
  },

  addPilotImage: async (pilotId: number, url: string, filename: string, fileType?: string): Promise<PilotImage> => {
    const response = await apiClient.post<PilotImage>(`/pilots/${pilotId}/images`, {
      url,
      filename,
      fileType: fileType || 'image',
    })
    return response.data
  },

  deletePilotImage: async (pilotId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/pilots/${pilotId}/images/${imageId}`)
  },
}
