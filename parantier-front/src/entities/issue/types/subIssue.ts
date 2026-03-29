export interface SubIssue {
  id: number
  parentIssueId: number
  title: string
  content?: string
  imageUrl?: string
  isResolved: boolean
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
}

export interface CreateSubIssueRequest {
  title: string
  content?: string
  imageUrl?: string
  isResolved?: boolean
}
