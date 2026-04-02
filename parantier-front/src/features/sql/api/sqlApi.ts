const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// VITE_API_URL에 이미 /api가 포함된 경우를 처리
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notNull: boolean;
  defaultValue: string | null;
  primaryKey: boolean;
}

export interface TableInfo {
  tableName: string;
  columns: ColumnInfo[];
  rowCount: number;
}

export interface SqlExecuteResponse {
  success: boolean;
  type: string;
  columns: string[] | null;
  rows: Record<string, unknown>[] | null;
  affectedRows: number;
  message: string;
  executionTimeMs: number;
}

export const sqlApi = {
  execute: async (query: string): Promise<SqlExecuteResponse> => {
    const res = await fetch(`${BASE}/sql/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    return res.json();
  },

  getTables: async (): Promise<TableInfo[]> => {
    const res = await fetch(`${BASE}/sql/tables`);
    return res.json();
  },

  getTable: async (tableName: string): Promise<TableInfo> => {
    const res = await fetch(`${BASE}/sql/tables/${tableName}`);
    return res.json();
  },
};
