export interface WorkChecklist {
  id: number
  workId: number
  content: string
  checked: boolean
  imageUrl?: string
  imageFilename?: string
  orderNum: number
  createdAt: string
}

export interface CreateWorkChecklistRequest {
  content: string
  orderNum?: number
}

export interface UpdateWorkChecklistRequest {
  content: string
  checked: boolean
  orderNum: number
}
