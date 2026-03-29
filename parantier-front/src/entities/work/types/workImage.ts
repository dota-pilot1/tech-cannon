export interface WorkImage {
  id: number
  workId: number
  url: string
  filename: string
  fileType: string
  createdAt: string
}

export interface PresignedUrlResponse {
  presignedUrl: string
  publicUrl: string
  key: string
}
