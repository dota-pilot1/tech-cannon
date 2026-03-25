import { useState } from 'react'
import { ChevronRight, Folder, FileText, CheckSquare, Plus } from 'lucide-react'
import type { WorkspaceNode, NodeType } from '@/entities/workspace/model/types'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

interface SidebarProps {
  nodes: WorkspaceNode[]
  selectedNode: WorkspaceNode | null
  onSelectNode: (node: WorkspaceNode) => void
}

export function Sidebar({ nodes, selectedNode, onSelectNode }: SidebarProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getNodeIcon = (nodeType: NodeType) => {
    switch (nodeType) {
      case 'FOLDER':
        return <Folder className="w-4 h-4" />
      case 'TASK':
        return <CheckSquare className="w-4 h-4" />
      case 'DOCUMENT':
        return <FileText className="w-4 h-4" />
    }
  }

  const renderNode = (node: WorkspaceNode, level = 0) => {
    const isExpanded = expandedIds.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isSelected = selectedNode?.id === node.id

    return (
      <div key={node.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-accent transition-colors',
            isSelected && 'bg-accent'
          )}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => onSelectNode(node)}
        >
          {hasChildren && (
            <button onClick={(e) => {
              e.stopPropagation()
              toggleExpand(node.id)
            }} className="hover:bg-muted rounded p-0.5">
              <ChevronRight
                className={cn('w-4 h-4 transition-transform', isExpanded && 'transform rotate-90')}
              />
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          <div className="flex items-center gap-2 flex-1">
            {getNodeIcon(node.nodeType)}
            <span className="text-sm">{node.name}</span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>{node.children!.map((child) => renderNode(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="w-80 border-r bg-card overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">업무 관리</h2>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            새 폴더
          </Button>
        </div>
      </div>

      <div className="py-2">{nodes.map((node) => renderNode(node))}</div>

      {nodes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">노드가 없습니다</p>
          <Button size="sm" variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            첫 폴더 만들기
          </Button>
        </div>
      )}
    </div>
  )
}
