import type { SqlExecuteResponse } from "../api/sqlApi";

export interface SqlHistoryItem {
  id: string;
  query: string;
  response: SqlExecuteResponse;
  timestamp: Date;
}
