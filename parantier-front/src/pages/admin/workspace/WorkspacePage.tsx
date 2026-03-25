import { useState } from 'react'
import { useWorkspaceTree } from '@/features/workspace/hooks/useWorkspaceTree'
import type { WorkspaceNode } from '@/entities/workspace/model/types'
import { Sidebar } from './components/Sidebar'
import { NodeDetail } from './components/NodeDetail'

export function WorkspacePage() {
  const { data: nodes = [], isLoading } = useWorkspaceTree()
  const [selectedNode, setSelectedNode] = useState<WorkspaceNode | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* 좌측 사이드바 */}
      <Sidebar nodes={nodes} selectedNode={selectedNode} onSelectNode={setSelectedNode} />

      {/* 우측 상세 정보 */}
      <NodeDetail node={selectedNode} />
    </div>
  )
}
