import type { TableInfo } from "../api/sqlApi";
import { Table2, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface SqlTableListProps {
  tables: TableInfo[];
  selectedTable: string | null;
  onSelectTable: (tableName: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function SqlTableList({
  tables,
  selectedTable,
  onSelectTable,
  onRefresh,
  isLoading,
}: SqlTableListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-bold text-foreground">테이블 목록</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="w-7 h-7"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {tables.length === 0 ? (
          <p className="text-sm text-muted-foreground p-2">
            테이블이 없습니다.
            <br />
            CREATE TABLE로 만들어보세요!
          </p>
        ) : (
          tables.map((table) => (
            <button
              key={table.tableName}
              onClick={() => onSelectTable(table.tableName)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
                selectedTable === table.tableName
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Table2 className="w-4 h-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">
                  {table.tableName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {table.rowCount}행 · {table.columns.length}열
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
