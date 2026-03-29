import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { useSubIssues, useCreateSubIssue, useToggleSubIssue, useDeleteSubIssue, useUpdateSubIssue } from '../hooks/useSubIssues'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import type { SubIssue } from '@/entities/issue/types/subIssue'

interface SubIssueSectionProps {
  issueId: number
}

export function SubIssueSection({ issueId }: SubIssueSectionProps) {
  const { data: subIssues = [] } = useSubIssues(issueId)
  const createMutation = useCreateSubIssue(issueId)
  const toggleMutation = useToggleSubIssue(issueId)
  const deleteMutation = useDeleteSubIssue(issueId)

  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const resolved = subIssues.filter(s => s.isResolved).length
  const total = subIssues.length

  const handleCreate = () => {
    if (!newTitle.trim()) return
    createMutation.mutate(
      { title: newTitle.trim(), content: newContent.trim() || undefined, imageUrl: newImageUrl.trim() || undefined },
      {
        onSuccess: () => {
          setIsAdding(false)
          setNewTitle('')
          setNewContent('')
          setNewImageUrl('')
        },
      }
    )
  }

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">하위 이슈</h3>
          {total > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {resolved}/{total} 해결
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          추가
        </Button>
      </div>

      {/* 진행률 바 */}
      {total > 0 && (
        <div className="w-full bg-muted rounded-full h-1.5 mb-3">
          <div
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${(resolved / total) * 100}%` }}
          />
        </div>
      )}

      {/* 하위 이슈 목록 */}
      <div className="space-y-2">
        {subIssues.map((sub) => (
          <SubIssueItem
            key={sub.id}
            sub={sub}
            issueId={issueId}
            isExpanded={expandedIds.has(sub.id)}
            onToggleExpand={() => toggleExpand(sub.id)}
            onToggleResolved={() => toggleMutation.mutate(sub.id)}
            onDelete={() => deleteMutation.mutate(sub.id)}
          />
        ))}
      </div>

      {/* 새 하위 이슈 입력 폼 */}
      {isAdding && (
        <div className="mt-3 border rounded-lg p-4 bg-muted/30 space-y-3">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setIsAdding(false) }}
            placeholder="하위 이슈 제목..."
            className="w-full text-sm bg-background border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="내용 (선택사항)"
            rows={2}
            className="w-full text-sm bg-background border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <input
            value={newImageUrl}
            onChange={e => setNewImageUrl(e.target.value)}
            placeholder="이미지 URL (선택사항)"
            className="w-full text-sm bg-background border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>취소</Button>
            <Button size="sm" onClick={handleCreate} disabled={!newTitle.trim() || createMutation.isPending}>
              추가
            </Button>
          </div>
        </div>
      )}

      {total === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground text-center py-4">
          하위 이슈가 없습니다. 추가 버튼으로 등록하세요.
        </p>
      )}
    </div>
  )
}

function SubIssueItem({
  sub,
  issueId,
  isExpanded,
  onToggleExpand,
  onToggleResolved,
  onDelete,
}: {
  sub: SubIssue
  issueId: number
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleResolved: () => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(sub.title)
  const [editContent, setEditContent] = useState(sub.content || '')
  const [editImageUrl, setEditImageUrl] = useState(sub.imageUrl || '')
  const updateMutation = useUpdateSubIssue(issueId, sub.id)

  const handleUpdate = () => {
    updateMutation.mutate(
      { title: editTitle, content: editContent || undefined, imageUrl: editImageUrl || undefined, isResolved: sub.isResolved },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  return (
    <div className={cn(
      "border rounded-lg transition-colors",
      sub.isResolved ? "bg-muted/30 border-muted" : "bg-card"
    )}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button onClick={onToggleResolved} className="shrink-0">
          {sub.isResolved
            ? <CheckCircle2 className="w-4 h-4 text-primary" />
            : <Circle className="w-4 h-4 text-muted-foreground" />
          }
        </button>
        <span className={cn(
          "flex-1 text-sm",
          sub.isResolved && "line-through text-muted-foreground"
        )}>
          {sub.title}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => { setIsEditing(!isEditing); onToggleExpand() }}
            className="p-1 hover:bg-muted rounded"
          >
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-muted rounded">
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
          </button>
          <button onClick={onToggleExpand} className="p-1 hover:bg-muted rounded">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && !isEditing && (
        <div className="px-9 pb-3 space-y-2">
          {sub.content && <p className="text-sm text-muted-foreground">{sub.content}</p>}
          {sub.imageUrl && (
            <img
              src={sub.imageUrl}
              alt="첨부 이미지"
              className="max-w-sm rounded border"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          )}
          <p className="text-xs text-muted-foreground">
            {sub.authorName} · {new Date(sub.createdAt.endsWith('Z') ? sub.createdAt : sub.createdAt + 'Z').toLocaleDateString('ko-KR')}
          </p>
        </div>
      )}

      {isEditing && (
        <div className="px-9 pb-3 space-y-2">
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="w-full text-sm bg-background border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={2}
            className="w-full text-sm bg-background border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="내용"
          />
          <input
            value={editImageUrl}
            onChange={e => setEditImageUrl(e.target.value)}
            className="w-full text-sm bg-background border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="이미지 URL"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>취소</Button>
            <Button size="sm" onClick={handleUpdate} disabled={updateMutation.isPending}>저장</Button>
          </div>
        </div>
      )}
    </div>
  )
}
