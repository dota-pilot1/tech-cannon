export interface TablePreset {
  id: number
  userId: number
  name: string
  headers: string[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTablePresetRequest {
  name: string
  headers: string[]
  isDefault?: boolean
}

export interface UpdateTablePresetRequest {
  name: string
  headers: string[]
  isDefault?: boolean
}
