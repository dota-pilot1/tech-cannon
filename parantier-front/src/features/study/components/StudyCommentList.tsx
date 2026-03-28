import { useState } from 'react'
import { useStudyComments, useCreateStudyComment, useDeleteStudyComment } from '../hooks/useStudy'
import { useStore } from '@tanstack/react-store'
import { authStore } from '@/entities/user/model/authStore'
import { Trash2 } from 'lucide-react'
import { useConfirm } from '@/shared/hooks/useConfirm'

interface StudyCommentListProps {
  postId: number
}

export function StudyCommentList({ postId }: StudyCommentListProps) {
  const [commentText, setCommentText] = useState('')
  const { data: comments = [] } = useStudyComments(postId)
  const createComment = useCreateStudyComment(postId)
  const deleteComment = useDeleteStudyComment(postId)
  const currentUser = useStore(authStore, (state) => state.user)
  const { confirm, ConfirmDialog } = useConfirm()

  const handleSubmit = () => {
    if (!commentText.trim()) return
    createComment.mutate({ content: commentText.trim() })
    setCommentText('')
  }

  const handleDelete = async (commentId: number) => {
    const ok = await confirm({
      title: '댓글 삭제',
      description: '정말로 삭제하시겠습니까?',
      confirmText: '삭제',
      variant: 'destructive',
    })
    if (ok) deleteComment.mutate(commentId)
  }

  return (
    <div className="space-y-3">
      <ConfirmDialog />
      <h3 className="text-sm font-semibold border-t pt-4 text-foreground">
        댓글 {comments.length}개
      </h3>

      {/* 댓글 목록 */}
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-muted/40 rounded-lg px-3 py-2 text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-xs text-foreground">{comment.authorName}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  {comment.createdAt.slice(0, 10)}
                </span>
                {currentUser?.id === comment.authorId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
      </div>

      {/* 댓글 작성 */}
      <div className="flex gap-2">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) handleSubmit()
          }}
          placeholder="댓글을 입력하세요... (Ctrl+Enter로 등록)"
          rows={2}
          className="flex-1 border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
        />
        <button
          onClick={handleSubmit}
          disabled={!commentText.trim() || createComment.isPending}
          className="px-3 py-2 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 shrink-0"
        >
          등록
        </button>
      </div>
    </div>
  )
}
