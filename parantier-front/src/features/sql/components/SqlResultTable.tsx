interface SqlResultTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

export function SqlResultTable({ columns, rows }: SqlResultTableProps) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm italic">결과 없음 (0행)</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-border max-w-full">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left font-semibold text-foreground border-b border-border whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-3 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate"
                  title={String(row[col] ?? "")}
                >
                  {row[col] === null ? (
                    <span className="text-muted-foreground italic">NULL</span>
                  ) : (
                    String(row[col])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
