export interface IssueTaskLink {
  linkId: number
  issueId: number
  taskPostId: number
  orderNum: number
  linkedAt: string
  taskId: number
  taskTitle: string
  folderId: number
  authorId: number
  taskCreatedAt: string
  taskUpdatedAt: string
}

export interface LinkTaskRequest {
  taskPostId: number
  orderNum?: number
}
