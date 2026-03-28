import { cn } from '@/shared/lib/utils'
import type { StudyPost } from '../types/study.types'

interface StudyPostCardProps {
  post: StudyPost
  onClick: () => void
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '오늘'
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  return `${Math.floor(days / 30)}개월 전`
}

export function StudyPostCard({ post, onClick }: StudyPostCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-52 h-[108px] rounded-xl border bg-card text-left p-3',
        'flex flex-col justify-between',
        'hover:shadow-md hover:border-primary/40 transition-all duration-150',
      )}
    >
      <div className="min-w-0">
        <div className="flex items-start gap-1 mb-1">
          {post.isPinned && <span className="text-xs shrink-0">📌</span>}
          {!post.isPublic && <span className="text-xs shrink-0">🔒</span>}
          <p className="text-sm font-medium text-card-foreground line-clamp-2 leading-snug">
            {post.title}
          </p>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {post.authorName} · {relativeDate(post.createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>👁 {post.viewCount}</span>
        <span>💬 {post.commentCount}</span>
        <span>👍 {post.likeCount}</span>
      </div>
    </button>
  )
}
