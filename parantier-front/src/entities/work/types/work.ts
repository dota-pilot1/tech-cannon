export type WorkType = "CANNON" | "SPEAR" | "SHIP" | "APACHE" | "DRONE" | "SNIPER" | "HAMMER" | "ROCKET" | "MISSILE" | "BOOK";
export type WorkStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "TEST"
  | "DONE"
  | "HOLD"
  | "BLOCKED";
export type WorkPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Work {
  id: number;
  title: string;
  content: string;
  workType: WorkType;
  status: WorkStatus;
  priority: WorkPriority;
  reporterId: number;
  reporterName: string;
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string; // 'YYYY-MM-DDTHH:mm'
  orderNum?: number;
  isArchived?: boolean;
  prize: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkRequest {
  title: string;
  content: string;
  workType: WorkType;
  status?: WorkStatus;
  priority?: WorkPriority;
  assigneeId?: number | null;
  dueDate?: string | null; // 'YYYY-MM-DDTHH:mm'
  prize?: number;
}

export interface UpdateWorkRequest {
  title: string;
  content: string;
  workType: WorkType;
  status?: WorkStatus;
  priority?: WorkPriority;
  assigneeId?: number | null;
  dueDate?: string | null; // 'YYYY-MM-DDTHH:mm'
  prize?: number;
}

export interface WorkListResponse {
  items: Work[];
  total: number;
  page: number;
  limit: number;
}

export interface WorkFilters {
  workType?: WorkType;
  status?: WorkStatus;
  priority?: WorkPriority;
  assigneeId?: number;
  keyword?: string;
  sortBy?: "created" | "priority" | "status" | "dueDate";
  isArchived?: boolean;
  page?: number;
  limit?: number;
}
