const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

export interface DevLog {
  id: number;
  userId: number;
  title: string;
  content?: string;
  summary?: string;
  logDate?: string; // "YYYY-MM-DD"
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDevLogRequest {
  title: string;
  content?: string;
  summary?: string;
  logDate?: string;
  sortOrder?: number;
}

export interface UpdateDevLogRequest {
  title: string;
  content?: string;
  summary?: string;
  logDate?: string;
  sortOrder?: number;
}

export const devlogApi = {
  getMyDevLogs: (): Promise<DevLog[]> =>
    fetch(`${BASE}/devlogs`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  createDevLog: (data: CreateDevLogRequest): Promise<number> =>
    fetch(`${BASE}/devlogs`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateDevLog: (id: number, data: UpdateDevLogRequest): Promise<void> =>
    fetch(`${BASE}/devlogs/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error("업데이트 실패");
    }),

  deleteDevLog: (id: number): Promise<void> =>
    fetch(`${BASE}/devlogs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error("삭제 실패");
    }),

  getLinkedIssues: (id: number): Promise<number[]> =>
    fetch(`${BASE}/devlogs/${id}/linked-issues`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  linkIssue: (id: number, issueId: number): Promise<void> =>
    fetch(`${BASE}/devlogs/${id}/link-issue/${issueId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error("이슈 연결 실패");
    }),

  unlinkIssue: (id: number, issueId: number): Promise<void> =>
    fetch(`${BASE}/devlogs/${id}/link-issue/${issueId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error("이슈 연결 해제 실패");
    }),

  getLinkedWorks: (id: number): Promise<number[]> =>
    fetch(`${BASE}/devlogs/${id}/linked-works`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  linkWork: (id: number, workId: number): Promise<void> =>
    fetch(`${BASE}/devlogs/${id}/link-work/${workId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error("업무 연결 실패");
    }),

  unlinkWork: (id: number, workId: number): Promise<void> =>
    fetch(`${BASE}/devlogs/${id}/link-work/${workId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error("업무 연결 해제 실패");
    }),
};

export interface LinkableItem {
  id: number;
  title: string;
  status: string;
}

// 이슈 목록 조회 (연결용)
export const issueSearchApi = {
  getIssues: (): Promise<LinkableItem[]> =>
    fetch(`${BASE}/issues`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => d.items ?? d.issues ?? (Array.isArray(d) ? d : [])),
};

// 업무 목록 조회 (연결용)
export const workSearchApi = {
  getWorks: (): Promise<LinkableItem[]> =>
    fetch(`${BASE}/works`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => d.items ?? d.works ?? (Array.isArray(d) ? d : [])),
};
