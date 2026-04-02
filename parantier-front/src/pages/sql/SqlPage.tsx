import { useState, useEffect, useRef, useCallback } from "react";
import { sqlApi } from "@/features/sql/api/sqlApi";
import type { TableInfo } from "@/features/sql/api/sqlApi";
import type { SqlHistoryItem } from "@/features/sql/types/sqlTypes";
import { SqlHistoryItemView } from "@/features/sql/components/SqlHistoryItem";
import { SqlSchemaSidebar } from "@/features/sql/components/SqlSchemaSidebar";
import { SqlInputBar } from "@/features/sql/components/SqlInputBar";
import { Database, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function SqlPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [history, setHistory] = useState<SqlHistoryItem[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadTables = useCallback(async () => {
    setIsLoadingTables(true);
    try {
      const data = await sqlApi.getTables();
      setTables(data);
      if (!selectedTable && data.length > 0) {
        setSelectedTable(data[0].tableName);
      }
    } catch (e) {
      console.error("테이블 로드 실패", e);
    } finally {
      setIsLoadingTables(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const executeQuery = useCallback(async (query: string) => {
    setIsExecuting(true);
    try {
      const response = await sqlApi.execute(query);
      const item: SqlHistoryItem = {
        id: Date.now().toString(),
        query,
        response,
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, item]);

      const upper = query.trim().toUpperCase();
      if (
        upper.startsWith("CREATE") ||
        upper.startsWith("DROP") ||
        upper.startsWith("ALTER") ||
        upper.startsWith("INSERT") ||
        upper.startsWith("UPDATE") ||
        upper.startsWith("DELETE")
      ) {
        const data = await sqlApi.getTables();
        setTables(data);
      }
    } catch (e) {
      console.error("쿼리 실행 실패", e);
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const handleSelectTable = useCallback((tableName: string) => {
    setSelectedTable(tableName);
  }, []);

  return (
    <div className="flex h-[calc(100vh-56px)] bg-background">
      {/* 가운데: 히스토리 + 입력창 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-2 shrink-0">
          <Database className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">SQL 연습장</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            SQLite
          </span>
          <div className="ml-auto">
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHistory([])}
                className="w-7 h-7 text-muted-foreground hover:text-destructive"
                title="히스토리 비우기"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* 히스토리 */}
        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Database className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">SQL을 실행해보세요</p>
              <div className="text-sm space-y-1 text-center">
                <p>아래 입력창에서 SQL을 직접 작성하거나</p>
                <p>오른쪽 ℹ 버튼으로 스키마를 확인하세요</p>
              </div>
              <div className="mt-6 bg-muted rounded-lg p-4 text-left font-mono text-xs space-y-1 max-w-md">
                <p className="text-primary">-- 연습 예시</p>
                <p>SELECT * FROM users WHERE city = '서울';</p>
                <p>SELECT u.name, COUNT(p.id) AS post_count</p>
                <p>FROM users u LEFT JOIN posts p ON u.id = p.user_id</p>
                <p>GROUP BY u.id ORDER BY post_count DESC;</p>
              </div>
            </div>
          ) : (
            <>
              {history.map((item) => (
                <SqlHistoryItemView key={item.id} item={item} />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        <SqlInputBar onExecute={executeQuery} isLoading={isExecuting} />
      </div>

      {/* 오른쪽: 테이블 목록 + 스키마 통합 사이드바 */}
      <SqlSchemaSidebar
        tables={tables}
        selectedTable={selectedTable}
        onSelectTable={handleSelectTable}
        onRefresh={loadTables}
        isLoading={isLoadingTables}
      />
    </div>
  );
}
