export type ProtoBlockType = 'NOTE' | 'MMD' | 'FIGMA' | 'FILE' | 'DBTABLE' | 'GITHUB'

export interface ProtoFolder {
  id: number
  parentId: number | null
  name: string
  sortOrder: number
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface ProtoBlock {
  id?: number
  postId?: number
  blockType: ProtoBlockType
  content: string
  sortOrder?: number
}

export interface ProtoPost {
  id: number
  folderId: number
  title: string
  authorId: number
  authorName: string
  isPinned: boolean
  tags: string
  createdAt: string
  updatedAt: string
  blocks?: ProtoBlock[]
}

// DTOs
export interface ProtoFolderDto {
  id?: number
  parentId: number | null
  name: string
  sortOrder?: number
}

export interface ProtoBlockDto {
  blockType: ProtoBlockType
  content: string
}

export interface ProtoPostDto {
  id?: number
  folderId: number
  title: string
  isPinned?: boolean
  tags?: string[]
  blocks: ProtoBlockDto[]
}

// 타입 메타데이터
export const PROTO_TYPE_META: Record<ProtoBlockType, { icon: string; label: string; color: string }> = {
  NOTE:    { icon: '📝', label: '노트',       color: 'bg-blue-100 text-blue-700' },
  MMD:     { icon: '📊', label: '다이어그램', color: 'bg-purple-100 text-purple-700' },
  FIGMA:   { icon: '🎨', label: 'Figma',      color: 'bg-pink-100 text-pink-700' },
  FILE:    { icon: '📎', label: '첨부파일',   color: 'bg-green-100 text-green-700' },
  DBTABLE: { icon: '🗄️', label: 'DB테이블',  color: 'bg-amber-100 text-amber-700' },
  GITHUB:  { icon: '🐙', label: 'GitHub',     color: 'bg-gray-100 text-gray-700' },
}

// 폴더 트리 빌더
export const buildProtoTree = (folders: ProtoFolder[]) => {
  const children: Record<number, ProtoFolder[]> = {}
  const roots: ProtoFolder[] = []

  folders.forEach((folder) => {
    if (folder.parentId === null) {
      roots.push(folder)
    } else {
      if (!children[folder.parentId]) children[folder.parentId] = []
      children[folder.parentId].push(folder)
    }
  })

  return { roots, children }
}

// tags 문자열 → 배열 파싱
export const parseTags = (tags: string | null | undefined): string[] => {
  if (!tags) return []
  return tags.split(',').map(t => t.trim()).filter(Boolean)
}
