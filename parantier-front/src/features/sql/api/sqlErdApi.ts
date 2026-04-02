const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// VITE_API_URL에 이미 /api가 포함된 경우를 처리
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

export interface SqlErd {
  id: number;
  title: string;
  content: string; // mmd 텍스트
  description?: string;
  orderNum: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateErdRequest {
  title: string;
  content: string;
  description?: string;
  orderNum?: number;
}

export interface UpdateErdRequest {
  title: string;
  content: string;
  description?: string;
  orderNum?: number;
}

export const sqlErdApi = {
  getAll: async (): Promise<SqlErd[]> => {
    const res = await fetch(`${BASE}/sql/erds`);
    if (!res.ok) throw new Error("ERD 목록 조회 실패");
    return res.json();
  },

  create: async (request: CreateErdRequest): Promise<SqlErd> => {
    const res = await fetch(`${BASE}/sql/erds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error("ERD 생성 실패");
    return res.json();
  },

  update: async (id: number, request: UpdateErdRequest): Promise<SqlErd> => {
    const res = await fetch(`${BASE}/sql/erds/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error("ERD 수정 실패");
    return res.json();
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE}/sql/erds/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("ERD 삭제 실패");
  },

  generateErd: async (
    tables: import("./sqlApi").TableInfo[],
  ): Promise<{ mmd: string }> => {
    const res = await fetch(`${BASE}/sql/erds/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tables }),
    });
    if (!res.ok) throw new Error("ERD AI 생성 실패");
    return res.json();
  },
};
