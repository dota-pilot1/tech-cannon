// DB 컬럼 정보
export interface DbColumn {
  no: number
  name: string
  comment: string
  type: string
  size: number | string
  pk: boolean
  notNull: boolean
  note: string
}

// DB 테이블 컨텐츠 (JSON으로 저장됨)
export interface DbTableContent {
  tableName: string
  schema: string
  category: string
  description: string
  headers?: string[]
  columns: DbColumn[]
}

export interface IssueDbTable {
  id: number
  issueId: number
  tableName: string
  tableInfo: string // JSON stringified DbTableContent
  orderNum: number
  createdAt: string
  updatedAt: string
}

export interface CreateDbTableRequest {
  tableName: string
  tableInfo: string // JSON stringified DbTableContent
  orderNum?: number
}

export interface UpdateDbTableRequest {
  tableName: string
  tableInfo: string // JSON stringified DbTableContent
  orderNum: number
}

// TSV 파싱 유틸리티 - DBeaver 출력 그대로 저장
export function parseTsvToColumns(tsv: string): DbColumn[] {
  const lines = tsv.trim().split('\n')
  if (lines.length === 0) return []

  const rows = lines.map((line) => line.split('\t'))
  const parsedColumns: DbColumn[] = []

  for (const row of rows) {
    if (row.length < 2) continue

    // DBeaver 형식: column_name | data_type | size | is_nullable
    // 예: id | bigint | [NULL] | NO
    // 예: email | character varying | 255 | NO
    const name = row[0]?.trim() || ''
    const typeRaw = row[1]?.trim() || ''
    const sizeRaw = row[2]?.trim() || ''
    const isNullable = row[3]?.trim().toUpperCase() || ''

    if (!name) continue

    // data_type 변환 (가독성 향상)
    let type = typeRaw
    if (typeRaw.toLowerCase().includes('character varying')) type = 'VARCHAR'
    else if (typeRaw.toLowerCase().includes('timestamp without')) type = 'TIMESTAMP'
    else if (typeRaw.toLowerCase().includes('timestamp with')) type = 'TIMESTAMPTZ'
    else type = typeRaw.toUpperCase()

    // size 정리 ([NULL] 제거)
    const size = sizeRaw === '[NULL]' || !sizeRaw ? '' : sizeRaw

    parsedColumns.push({
      no: parsedColumns.length + 1,
      name,
      comment: '',
      type,
      size,
      pk: false, // DBeaver는 PK 정보를 제공하지 않으므로 수동 설정
      notNull: isNullable === 'NO',
      note: '',
    })
  }

  return parsedColumns
}

// JSON 파싱 헬퍼
export function parseDbTableContent(raw: string): DbTableContent {
  try {
    const parsed = JSON.parse(raw)
    return {
      tableName: parsed.tableName || '',
      schema: parsed.schema || '',
      category: parsed.category || '',
      description: parsed.description || '',
      headers: parsed.headers || [],
      columns: parsed.columns || [],
    }
  } catch {
    return {
      tableName: '',
      schema: '',
      category: '',
      description: '',
      headers: [],
      columns: [],
    }
  }
}
