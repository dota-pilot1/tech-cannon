export interface SubWork {
  id: number
  parentWorkId: number
  title: string
  content?: string
  imageUrl?: string
  isResolved: boolean
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
}

export interface CreateSubWorkRequest {
  title: string
  content?: string
  imageUrl?: string
  isResolved?: boolean
}
