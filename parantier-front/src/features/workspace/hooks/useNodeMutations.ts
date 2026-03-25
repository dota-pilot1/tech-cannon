import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceApi } from '@/entities/workspace/api/workspaceApi'
import type {
  CreateNodeRequest,
  UpdateNodeRequest,
  MoveNodeRequest,
  ReorderNodesRequest,
} from '@/entities/workspace/model/types'
import { toast } from 'sonner'

export function useNodeMutations() {
  const queryClient = useQueryClient()

  const createNode = useMutation({
    mutationFn: (data: CreateNodeRequest) => workspaceApi.createNode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'tree'] })
      toast.success('노드가 생성되었습니다')
    },
    onError: () => {
      toast.error('노드 생성에 실패했습니다')
    },
  })

  const updateNode = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNodeRequest }) =>
      workspaceApi.updateNode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'tree'] })
      toast.success('노드가 수정되었습니다')
    },
    onError: () => {
      toast.error('노드 수정에 실패했습니다')
    },
  })

  const moveNode = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MoveNodeRequest }) =>
      workspaceApi.moveNode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'tree'] })
      toast.success('노드가 이동되었습니다')
    },
    onError: () => {
      toast.error('노드 이동에 실패했습니다')
    },
  })

  const reorderNodes = useMutation({
    mutationFn: (data: ReorderNodesRequest) => workspaceApi.reorderNodes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'tree'] })
    },
    onError: () => {
      toast.error('노드 정렬에 실패했습니다')
    },
  })

  const deleteNode = useMutation({
    mutationFn: (id: number) => workspaceApi.deleteNode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'tree'] })
      toast.success('노드가 삭제되었습니다')
    },
    onError: () => {
      toast.error('노드 삭제에 실패했습니다')
    },
  })

  return {
    createNode,
    updateNode,
    moveNode,
    reorderNodes,
    deleteNode,
  }
}
