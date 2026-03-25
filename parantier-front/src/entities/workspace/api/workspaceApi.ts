import { api } from '@/shared/api/client'
import type {
  WorkspaceNode,
  CreateNodeRequest,
  UpdateNodeRequest,
  MoveNodeRequest,
  ReorderNodesRequest,
} from '../model/types'

export const workspaceApi = {
  // 노드 트리 조회
  getNodeTree: (): Promise<WorkspaceNode[]> => {
    return api.get('/workspace/tree').then((res) => res.data)
  },

  // 모든 노드 조회 (플랫)
  getAllNodes: (): Promise<WorkspaceNode[]> => {
    return api.get('/workspace/nodes').then((res) => res.data)
  },

  // 노드 상세 조회
  getNodeById: (id: number): Promise<WorkspaceNode> => {
    return api.get(`/workspace/nodes/${id}`).then((res) => res.data)
  },

  // 자식 노드 조회
  getChildNodes: (id: number): Promise<WorkspaceNode[]> => {
    return api.get(`/workspace/nodes/${id}/children`).then((res) => res.data)
  },

  // 노드 검색
  searchNodes: (query: string): Promise<WorkspaceNode[]> => {
    return api.get('/workspace/nodes/search', { params: { q: query } }).then((res) => res.data)
  },

  // 노드 생성
  createNode: (data: CreateNodeRequest): Promise<WorkspaceNode> => {
    return api.post('/workspace/nodes', data).then((res) => res.data)
  },

  // 노드 수정
  updateNode: (id: number, data: UpdateNodeRequest): Promise<WorkspaceNode> => {
    return api.put(`/workspace/nodes/${id}`, data).then((res) => res.data)
  },

  // 노드 이동
  moveNode: (id: number, data: MoveNodeRequest): Promise<void> => {
    return api.put(`/workspace/nodes/${id}/move`, data).then((res) => res.data)
  },

  // 노드 순서 재정렬
  reorderNodes: (data: ReorderNodesRequest): Promise<void> => {
    return api.put('/workspace/nodes/reorder', data).then((res) => res.data)
  },

  // 노드 삭제
  deleteNode: (id: number): Promise<void> => {
    return api.delete(`/workspace/nodes/${id}`).then((res) => res.data)
  },
}
