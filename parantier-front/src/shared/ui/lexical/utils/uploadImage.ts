import { apiClient } from '@/shared/api/client'

interface PresignedUrlResponse {
  presignedUrl: string
  publicUrl: string
  key: string
}

export async function uploadImageToS3(file: File): Promise<string> {
  // 1. Presigned URL 요청
  const { data } = await apiClient.post<PresignedUrlResponse>('/upload/presign', {
    filename: file.name,
    contentType: file.type,
  })

  // 2. S3에 직접 업로드
  await fetch(data.presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  // 3. public URL 반환
  return data.publicUrl
}
