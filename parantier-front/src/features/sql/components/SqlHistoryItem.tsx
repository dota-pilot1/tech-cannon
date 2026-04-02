import type { SqlHistoryItem } from "../types/sqlTypes";
import { SqlResultTable } from "./SqlResultTable";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface SqlHistoryItemProps {
  item: SqlHistoryItem;
}

export function SqlHistoryItemView({ item }: SqlHistoryItemProps) {
  const { query, response, timestamp } = item;

  const timeStr = timestamp.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="mb-6">
      {/* 쿼리 말풍선 (오른쪽) */}
      <div className="flex justify-end mb-2">
        <div className="max-w-[80%]">
          <div className="text-xs text-muted-foreground text-right mb-1">
            {timeStr}
          </div>
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2">
            <pre className="font-mono text-sm whitespace-pre-wrap break-all">
              {query}
            </pre>
          </div>
        </div>
      </div>

      {/* 결과 말풍선 (왼쪽) */}
      <div className="flex justify-start">
        <div className="max-w-[95%] w-full">
          <div
            className={`rounded-2xl rounded-tl-sm px-4 py-3 ${
              response.success
                ? "bg-card border border-border"
                : "bg-destructive/10 border border-destructive/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {response.success ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
              <span
                className={`text-xs font-medium ${
                  response.success
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive"
                }`}
              >
                {response.message}
              </span>
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {response.executionTimeMs}ms
              </span>
            </div>

            {response.success && response.columns && response.rows !== null && (
              <SqlResultTable columns={response.columns} rows={response.rows} />
            )}

            {response.success &&
              response.type !== "SELECT" &&
              !response.columns && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs mr-2">
                    {response.type}
                  </span>
                  영향 받은 행: {response.affectedRows}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
