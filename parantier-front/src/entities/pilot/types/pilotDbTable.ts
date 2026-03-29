export interface PilotDbTable {
  id: number;
  pilotId: number;
  tableName: string;
  tableInfo: string;
  orderNum: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePilotDbTableRequest {
  tableName: string;
  tableInfo: string;
  orderNum?: number;
}

export interface UpdatePilotDbTableRequest {
  tableName: string;
  tableInfo: string;
  orderNum: number;
}

export interface DbColumn {
  column_name: string;
  data_type: string;
  nullable: string;
  pk: string;
  fk: string;
  unique_key: string;
}

export interface DbTableContent {
  tableName: string;
  schema: string;
  category: string;
  description: string;
  queryResult: string;
  columns: DbColumn[];
}

export function parseTsvToColumns(tsv: string): DbColumn[] {
  const lines = tsv.trim().split("\n");
  if (lines.length === 0) return [];

  const rows = lines.map((line) => line.split("\t"));
  const columns: DbColumn[] = [];

  const startIndex =
    rows[0]?.[0]?.trim().toLowerCase() === "column_name" ? 1 : 0;

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    const column_name = row[0]?.trim() || "";
    if (!column_name) continue;

    columns.push({
      column_name,
      data_type: row[1]?.trim() || "",
      nullable: row[2]?.trim() || "",
      pk: row[3]?.trim() || "",
      fk: row[4]?.trim() || "",
      unique_key: row[5]?.trim() || "",
    });
  }

  return columns;
}

export function parseDbTableContent(raw: string): DbTableContent {
  try {
    const parsed = JSON.parse(raw);
    return {
      tableName: parsed.tableName || "",
      schema: parsed.schema || "",
      category: parsed.category || "",
      description: parsed.description || "",
      queryResult: parsed.queryResult || "",
      columns: parsed.columns || [],
    };
  } catch {
    return {
      tableName: "",
      schema: "",
      category: "",
      description: "",
      queryResult: "",
      columns: [],
    };
  }
}
