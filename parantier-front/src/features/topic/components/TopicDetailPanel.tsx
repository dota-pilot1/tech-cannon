import { useState } from 'react'
import { useTopic, useUpdateTopic, useDeleteTopic, useToggleTopicPin } from '../hooks/useTopic'
import { TopicCommentList } from './TopicCommentList'
import { LexicalViewer } from '@/shared/ui/lexical/LexicalViewer'
import { LexicalEditor } from '@/shared/ui/lexical/LexicalEditor'
import { useStore } from '@tanstack/react-store'
import { authStore } from '@/entities/user/model/authStore'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Eye, Pin, PinOff, Pencil, Trash2, X, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface TopicDetailPanelProps {
  topicId: number
  onClose: () => void
}

export function TopicDetailPanel({ topicId, onClose }: TopicDetailPanelProps) {
  const { data: topic, isLoading } = useTopic(topicId)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [copied, setCopied] = useState(false)

  const currentUser = useStore(authStore, (state) => state.user)
  const isAuthor = currentUser?.id === topic?.authorId

  const updateTopic = useUpdateTopic(topicId, () => setIsEditing(false))
  const deleteTopic = useDeleteTopic(() => onClose())
  const togglePin = useToggleTopicPin()
  const { confirm, ConfirmDialog } = useConfirm()

  const handleEdit = () => {
    if (!topic) return
    setEditTitle(topic.title)
    setEditContent(topic.content || '')
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!editTitle.trim()) return
    updateTopic.mutate({ title: editTitle.trim(), content: editContent })
  }

  const handleDelete = async () => {
    const ok = await confirm({
      title: '토픽 삭제',
      description: '정말로 삭제하시겠습니까?',
      confirmText: '삭제',
      variant: 'destructive',
    })
    if (ok) deleteTopic.mutate(topicId)
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/topic?topicId=${topicId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('링크가 복사되었습니다')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        로딩 중...
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        토픽을 찾을 수 없습니다
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ConfirmDialog />

      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {topic.isPinned && <Pin className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
          <h2 className="text-base font-semibold truncate">
            {isEditing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm bg-background"
              />
            ) : (
              topic.title
            )}
          </h2>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button onClick={handleCopyLink} className="p-1.5 hover:bg-muted rounded" title="링크 복사">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          {isAuthor && (
            <>
              <button
                onClick={() => togglePin.mutate(topicId)}
                className="p-1.5 hover:bg-muted rounded"
                title={topic.isPinned ? '고정 해제' : '고정'}
              >
                {topic.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={updateTopic.isPending}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1.5 hover:bg-muted rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleEdit} className="p-1.5 hover:bg-muted rounded" title="수정">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={handleDelete} className="p-1.5 hover:bg-muted rounded text-destructive" title="삭제">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          )}
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground border-b shrink-0">
        <span>{topic.authorName}</span>
        <span>{topic.createdAt.slice(0, 10)}</span>
        <span className="flex items-center gap-0.5">
          <Eye className="w-3 h-3" /> {topic.viewCount}
        </span>
      </div>

      {/* 본문 + 댓글 (스크롤) */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {isEditing ? (
            <div className="border rounded-lg overflow-hidden">
              <LexicalEditor
                initialState={editContent}
                onChange={setEditContent}
                placeholder="내용을 입력하세요..."
                minHeight="300px"
              />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              {topic.content ? (
                <LexicalViewer content={topic.content} />
              ) : (
                <p className="text-muted-foreground">내용이 없습니다</p>
              )}
            </div>
          )}
        </div>

        {/* 댓글 */}
        {!isEditing && (
          <div className="px-4 pb-4">
            <TopicCommentList topicId={topicId} />
          </div>
        )}
      </div>
    </div>
  )
}
