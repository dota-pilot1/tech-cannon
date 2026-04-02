import type { TableInfo } from "../api/sqlApi";
import { Table2, RefreshCw, Info, Key, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";

interface SqlSchemaSidebarProps {
  tables: TableInfo[];
  selectedTable: string | null;
  onSelectTable: (tableName: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

interface SchemaDialogProps {
  table: TableInfo;
  onClose: () => void;
}

function SchemaDialog({ table, onClose }: SchemaDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 다이얼로그 */}
      <div
        className="relative z-10 bg-card border border-border rounded-xl shadow-2xl w-[420px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Table2 className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground font-mono">
              {table.tableName}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {table.rowCount}행 · {table.columns.length}열
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-7 h-7 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 컬럼 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 text-muted-foreground font-medium w-5"></th>
                <th className="text-left pb-2 text-muted-foreground font-medium">
                  컬럼명
                </th>
                <th className="text-left pb-2 text-muted-foreground font-medium">
                  타입
                </th>
                <th className="text-left pb-2 text-muted-foreground font-medium">
                  옵션
                </th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((col) => (
                <tr
                  key={col.name}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-2 pr-2">
                    {col.primaryKey ? (
                      <Key className="w-3 h-3 text-yellow-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="font-mono font-medium text-foreground">
                      {col.name}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="font-mono text-muted-foreground">
                      {col.type || "ANY"}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      {col.primaryKey && (
                        <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          PK
                        </span>
                      )}
                      {col.notNull && !col.primaryKey && (
                        <span className="bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          NOT NULL
                        </span>
                      )}
                      {col.defaultValue && (
                        <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {col.defaultValue}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SqlSchemaSidebar({
  tables,
  selectedTable,
  onSelectTable,
  onRefresh,
  isLoading,
}: SqlSchemaSidebarProps) {
  const [schemaDialog, setSchemaDialog] = useState<TableInfo | null>(null);

  return (
    <>
      <div className="w-56 border-l border-border bg-card flex flex-col shrink-0">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-foreground text-sm">테이블 정보</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="w-7 h-7"
          >
            <RefreshCw
              className={"w-3.5 h-3.5 " + (isLoading ? "animate-spin" : "")}
            />
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
            <div className="p-2 space-y-0.5">
              {tables.map((table) => {
                const isSelected = selectedTable === table.tableName;
                return (
                  <div
                    key={table.tableName}
                    className={
                      "group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer " +
                      (isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted")
                    }
                    onClick={() => onSelectTable(table.tableName)}
                  >
                    <Table2 className="w-3.5 h-3.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {table.tableName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {table.rowCount}행 · {table.columns.length}열
                      </div>
                    </div>
                    {/* 스키마 보기 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSchemaDialog(table);
                      }}
                      className={
                        "shrink-0 p-1 rounded transition-all opacity-0 group-hover:opacity-100 " +
                        (isSelected
                          ? "hover:bg-primary/20 text-primary"
                          : "hover:bg-muted-foreground/20 text-muted-foreground")
                      }
                      title="스키마 보기"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 스키마 다이얼로그 */}
      {schemaDialog && (
        <SchemaDialog
          table={schemaDialog}
          onClose={() => setSchemaDialog(null)}
        />
      )}
    </>
  );
}
