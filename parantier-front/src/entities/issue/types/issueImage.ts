export interface IssueImage {
  id: number
  issueId: number
  url: string
  filename: string
  createdAt: string
}

export interface PresignedUrlResponse {
  presignedUrl: string
  publicUrl: string
  key: string
}
