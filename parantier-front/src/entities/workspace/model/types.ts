// NodeType Enum
export enum NodeType {
  FOLDER = 'FOLDER',
  TASK = 'TASK',
  DOCUMENT = 'DOCUMENT',
}

// NodeStatus Enum
export enum NodeStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
}

// NodePriority Enum
export enum NodePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// WorkspaceNode 인터페이스
export interface WorkspaceNode {
  id: number
  name: string
  description?: string
  nodeType: NodeType
  status?: NodeStatus
  priority?: NodePriority
  parentId?: number
  orderNum: number
  createdBy: number
  assignedTo?: number
  dueDate?: string
  createdAt: string
  updatedAt: string
  isActive: boolean

  // 프론트엔드 전용
  children?: WorkspaceNode[]
  isExpanded?: boolean
  createdByUsername?: string
  assignedToUsername?: string
}

// API Request Types
export interface CreateNodeRequest {
  name: string
  description?: string
  nodeType: NodeType
  status?: NodeStatus
  priority?: NodePriority
  parentId?: number
  orderNum?: number
  assignedTo?: number
  dueDate?: string
}

export interface UpdateNodeRequest {
  name: string
  description?: string
  nodeType: NodeType
  status?: NodeStatus
  priority?: NodePriority
  parentId?: number
  orderNum?: number
  assignedTo?: number
  dueDate?: string
  isActive: boolean
}

export interface MoveNodeRequest {
  parentId?: number
  orderNum: number
}

export interface ReorderNodesRequest {
  parentId?: number
  nodeIds: number[]
}
