export interface WorkFigma {
  id: number
  workId: number
  title: string
  url: string
  description?: string
  orderNum: number
  createdAt: string
  updatedAt: string
}

export interface CreateWorkFigmaRequest {
  title: string
  url: string
  description?: string
  orderNum?: number
}

export interface UpdateWorkFigmaRequest {
  title: string
  url: string
  description?: string
  orderNum: number
}
