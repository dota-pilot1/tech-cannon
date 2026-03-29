export interface WorkMindmap {
  id: number
  workId: number
  title: string
  content: string
  orderNum: number
  createdAt: string
  updatedAt: string
}

export interface CreateWorkMindmapRequest {
  title: string
  content: string
  orderNum?: number
}

export interface UpdateWorkMindmapRequest {
  title: string
  content: string
  orderNum: number
}
