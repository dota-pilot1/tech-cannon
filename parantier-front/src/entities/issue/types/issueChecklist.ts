export interface IssueChecklist {
  id: number
  issueId: number
  content: string
  checked: boolean
  orderNum: number
  createdAt: string
}

export interface CreateChecklistRequest {
  content: string
  orderNum?: number
}

export interface UpdateChecklistRequest {
  content: string
  checked: boolean
  orderNum: number
}
