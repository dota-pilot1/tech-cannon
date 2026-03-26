export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED'
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type IssueCategory = 'COMMON' | 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'QUESTION'

export interface Issue {
  id: number
  title: string
  content: string
  category: IssueCategory
  status: IssueStatus
  priority: IssuePriority

  authorId: number
  authorName: string
  authorEmail: string

  assigneeId?: number
  assigneeName?: string
  assigneeEmail?: string

  folderId?: number
  createdAt: string
  updatedAt: string
}

export interface CreateIssueRequest {
  title: string
  content: string
  category: IssueCategory
  status?: IssueStatus
  priority?: IssuePriority
  assigneeId?: number
  folderId?: number
}

export interface UpdateIssueRequest extends CreateIssueRequest {}

export interface IssueListResponse {
  items: Issue[]
  total: number
  page: number
  limit: number
}

export interface IssueFilters {
  status?: IssueStatus
  category?: IssueCategory
  priority?: IssuePriority
  assigneeId?: number
  authorId?: number
  folderId?: number
  keyword?: string
  sortBy?: 'created' | 'priority' | 'status'
}
