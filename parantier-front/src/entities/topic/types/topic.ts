export interface Topic {
  id: number
  title: string
  content?: string
  contentPlain?: string
  authorId: number
  authorName: string
  viewCount: number
  commentCount: number
  isPinned: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TopicComment {
  id: number
  topicId: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
  updatedAt: string
}
