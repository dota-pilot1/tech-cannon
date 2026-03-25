export type BlockType = 'NOTE' | 'MMD' | 'FIGMA' | 'FILE' | 'DBTABLE'

export interface TaskFolder {
  id: number
  parentId: number | null
  name: string
  sortOrder: number
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface TaskBlock {
  id?: number
  postId?: number
  blockType: BlockType
  content: string
  sortOrder?: number
}

export interface TaskPost {
  id: number
  folderId: number
  title: string
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
  blocks?: TaskBlock[]
}

export interface TaskComment {
  id: number
  postId: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
}

// DTO types
export interface TaskFolderDto {
  id?: number
  parentId: number | null
  name: string
  sortOrder?: number
}

export interface TaskBlockDto {
  blockType: BlockType
  content: string
}

export interface TaskPostDto {
  id?: number
  folderId: number
  title: string
  blocks: TaskBlockDto[]
}

export interface TaskCommentDto {
  postId: number
  content: string
}

// JSON content types
export interface FileContent {
  url: string
  filename: string
  description: string
}

export interface DbColumn {
  no: number
  name: string
  comment: string
  type: string
  size: string
  pk: boolean
  notNull: boolean
  note: string
}

export interface DbTableContent {
  tableName: string
  schema: string
  category: string
  description: string
  columns: DbColumn[]
}

// Block metadata
export const TYPE_META: Record<BlockType, { icon: string; label: string; color: string }> = {
  NOTE: { icon: '📝', label: '노트', color: 'bg-blue-100 text-blue-700' },
  MMD: { icon: '📊', label: '다이어그램', color: 'bg-purple-100 text-purple-700' },
  FIGMA: { icon: '🎨', label: 'Figma', color: 'bg-pink-100 text-pink-700' },
  FILE: { icon: '📎', label: '첨부파일', color: 'bg-green-100 text-green-700' },
  DBTABLE: { icon: '🗄️', label: 'DB테이블', color: 'bg-amber-100 text-amber-700' },
}

// Helper functions
export const parseFileContent = (content: string): FileContent => {
  try {
    return JSON.parse(content)
  } catch {
    return { url: '', filename: '', description: '' }
  }
}

export const parseDbTableContent = (content: string): DbTableContent => {
  try {
    return JSON.parse(content)
  } catch {
    return { tableName: '', schema: '', category: '', description: '', columns: [] }
  }
}

export const parseTsvToColumns = (tsv: string): DbColumn[] => {
  const lines = tsv.trim().split('\n')
  if (lines.length < 2) return []

  return lines.slice(1).map((line, idx) => {
    const cols = line.split('\t')
    return {
      no: idx + 1,
      name: cols[1] || '',
      comment: cols[2] || '',
      type: cols[3] || 'VARCHAR',
      size: cols[4] || '',
      pk: cols[5]?.toUpperCase() === 'Y',
      notNull: cols[6]?.toUpperCase() === 'Y',
      note: cols[7] || '',
    }
  })
}

// Tree builder
export const buildTree = (folders: TaskFolder[]) => {
  const children: Record<number, TaskFolder[]> = {}
  const roots: TaskFolder[] = []

  folders.forEach((folder) => {
    if (folder.parentId === null) {
      roots.push(folder)
    } else {
      if (!children[folder.parentId]) {
        children[folder.parentId] = []
      }
      children[folder.parentId].push(folder)
    }
  })

  return { roots, children }
}
