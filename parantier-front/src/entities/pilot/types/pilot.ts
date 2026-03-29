export type PilotStatus = "TODO" | "IN_PROGRESS" | "DONE" | "HOLD";
export type PilotPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Pilot {
  id: number;
  title: string;
  content: string;
  topic: string; // 자유 텍스트 (React, Java, Docker 등)
  status: PilotStatus;
  priority: PilotPriority;
  reporterId: number;
  reporterName: string;
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  orderNum?: number;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePilotRequest {
  title: string;
  content: string;
  topic: string;
  status?: PilotStatus;
  priority?: PilotPriority;
  assigneeId?: number | null;
  dueDate?: string | null;
}

export interface UpdatePilotRequest {
  title: string;
  content: string;
  topic: string;
  status?: PilotStatus;
  priority?: PilotPriority;
  assigneeId?: number | null;
  dueDate?: string | null;
}

export interface PilotListResponse {
  items: Pilot[];
  total: number;
  page: number;
  limit: number;
}

export interface PilotFilters {
  topic?: string;
  status?: PilotStatus;
  priority?: PilotPriority;
  assigneeId?: number;
  keyword?: string;
  sortBy?: "created" | "priority" | "status" | "dueDate";
  isArchived?: boolean;
  page?: number;
  limit?: number;
}
