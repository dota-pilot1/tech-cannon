export interface IssueMindmap {
  id: number
  issueId: number
  title: string
  content: string
  orderNum: number
  createdAt: string
  updatedAt: string
}

export interface CreateMindmapRequest {
  title: string
  content: string
  orderNum?: number
}

export interface UpdateMindmapRequest {
  title: string
  content: string
  orderNum: number
}
