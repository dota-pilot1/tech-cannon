import type { WorkspaceNode } from '@/entities/workspace/model/types'
import { Button } from '@/shared/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface NodeDetailProps {
  node: WorkspaceNode | null
}

export function NodeDetail({ node }: NodeDetailProps) {
  if (!node) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">노드를 선택하세요</p>
      </div>
    )
  }

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'FOLDER':
        return '폴더'
      case 'TASK':
        return '태스크'
      case 'DOCUMENT':
        return '문서'
      default:
        return type
    }
  }

  const getStatusLabel = (status?: string) => {
    if (!status) return '-'
    switch (status) {
      case 'TODO':
        return '대기'
      case 'IN_PROGRESS':
        return '진행중'
      case 'DONE':
        return '완료'
      case 'BLOCKED':
        return '차단'
      default:
        return status
    }
  }

  const getPriorityLabel = (priority?: string) => {
    if (!priority) return '-'
    switch (priority) {
      case 'LOW':
        return '낮음'
      case 'MEDIUM':
        return '보통'
      case 'HIGH':
        return '높음'
      case 'URGENT':
        return '긴급'
      default:
        return priority
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{node.name}</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Pencil className="w-4 h-4 mr-2" />
              수정
            </Button>
            <Button size="sm" variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">타입</h3>
            <p>{getNodeTypeLabel(node.nodeType)}</p>
          </div>

          {node.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">설명</h3>
              <p className="whitespace-pre-wrap">{node.description}</p>
            </div>
          )}

          {node.nodeType === 'TASK' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">상태</h3>
                  <p>{getStatusLabel(node.status)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">우선순위</h3>
                  <p>{getPriorityLabel(node.priority)}</p>
                </div>
              </div>

              {node.assignedToUsername && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">담당자</h3>
                  <p>{node.assignedToUsername}</p>
                </div>
              )}

              {node.dueDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">마감일</h3>
                  <p>{new Date(node.dueDate).toLocaleDateString('ko-KR')}</p>
                </div>
              )}
            </>
          )}

          <div className="pt-6 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p>생성자: {node.createdByUsername || '-'}</p>
                <p>생성일: {new Date(node.createdAt).toLocaleDateString('ko-KR')}</p>
              </div>
              <div>
                <p>수정일: {new Date(node.updatedAt).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
