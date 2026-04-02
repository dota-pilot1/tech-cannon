import type { TableInfo } from "../api/sqlApi";
import { Key, Table2, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";

interface SqlSchemaSidebarProps {
  tables: TableInfo[];
  selectedTable: string | null;
  onSelectTable: (tableName: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function SqlSchemaSidebar({
  tables,
  selectedTable,
  onSelectTable,
  onRefresh,
  isLoading,
}: SqlSchemaSidebarProps) {
  const [expanded, setExpanded] = useState<string | null>(selectedTable);

  const handleSelect = (tableName: string) => {
    onSelectTable(tableName);
    setExpanded((prev) => (prev === tableName ? null : tableName));
  };

  return (
    <div className="w-64 border-l border-border bg-card flex flex-col shrink-0">
      {/* 헤더 */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">테이블 정보</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="w-7 h-7"
        >
          <RefreshCw className={"w-3.5 h-3.5 " + (isLoading ? "animate-spin" : "")} />
        </Button>
      </div>

      {/* 테이블 목록 */}
      <div className="flex-1 overflow-y-auto">
        {tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <Table2 className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm text-center">
              테이블이 없습니다.
              <br />
              CREATE TABLE로 만들어보세요!
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {tables.map((table) => {
              const isExpanded = expanded === table.tableName;
              const isSelected = selectedTable === table.tableName;
              return (
                <div key={table.tableName}>
                  {/* 테이블 행 */}
                  <button
                    onClick={() => handleSelect(table.tableName)}
                    className={
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors " +
                      (isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted")
                    }
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <Table2 className="w-4 h-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{table.tableName}</div>
                      <div className="text-xs text-muted-foreground">
                        {table.rowCount}행 · {table.columns.length}열
                      </div>
                    </div>
                  </button>

                  {/* 컬럼 목록 (펼쳐진 경우) */}
                  {isExpanded && (
                    <div className="ml-4 mt-1 mb-2 border-l-2 border-primary/20 pl-3 space-y-1">
                      {table.columns.map((col) => (
                        <div key={col.name} className="flex items-start gap-2 py-1">
                          {col.primaryKey ? (
                            <Key className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-muted-foreground/30 mt-0.5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="font-mono text-xs font-medium text-foreground">{col.name}</span>
                              {col.primaryKey && (
                                <span className="text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-1 rounded">PK</span>
                              )}
                              {col.notNull && !col.primaryKey && (
                                <span className="text-[10px] bg-red-500/10 text-red-500 px-1 rounded">NN</span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {col.type || "ANY"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
