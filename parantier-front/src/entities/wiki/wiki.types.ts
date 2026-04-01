export type WikiBlockType = 'NOTE' | 'MMD' | 'FIGMA' | 'FILE' | 'DBTABLE'

export interface WikiFolder {
  id: number
  parentId: number | null
  name: string
  sortOrder: number
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface WikiBlock {
  id?: number
  postId?: number
  blockType: WikiBlockType
  content: string
  sortOrder?: number
}

export interface WikiPost {
  id: number
  folderId: number
  title: string
  authorId: number
  authorName: string
  isPinned: boolean
  tags: string        // 콤마 구분 문자열: "컨벤션,TypeScript,필독"
  createdAt: string
  updatedAt: string
  blocks?: WikiBlock[]
}

// DTOs
export interface WikiFolderDto {
  id?: number
  parentId: number | null
  name: string
  sortOrder?: number
}

export interface WikiBlockDto {
  blockType: WikiBlockType
  content: string
}

export interface WikiPostDto {
  id?: number
  folderId: number
  title: string
  isPinned?: boolean
  tags?: string[]
  blocks: WikiBlockDto[]
}

// 타입 메타데이터 (PilotPage와 동일하게 재사용)
export const WIKI_TYPE_META: Record<WikiBlockType, { icon: string; label: string; color: string }> = {
  NOTE:    { icon: '📝', label: '노트',       color: 'bg-blue-100 text-blue-700' },
  MMD:     { icon: '📊', label: '다이어그램', color: 'bg-purple-100 text-purple-700' },
  FIGMA:   { icon: '🎨', label: 'Figma',      color: 'bg-pink-100 text-pink-700' },
  FILE:    { icon: '📎', label: '첨부파일',   color: 'bg-green-100 text-green-700' },
  DBTABLE: { icon: '🗄️', label: 'DB테이블',  color: 'bg-amber-100 text-amber-700' },
}

// 폴더 트리 빌더
export const buildWikiTree = (folders: WikiFolder[]) => {
  const children: Record<number, WikiFolder[]> = {}
  const roots: WikiFolder[] = []

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
