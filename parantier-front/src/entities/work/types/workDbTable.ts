// DB 컬럼 정보 (읽기 전용 표시용)
export interface DbColumn {
  column_name: string
  data_type: string
  nullable: string
  pk: string
  fk: string
  unique_key: string
}

// DB 테이블 컨텐츠
export interface DbTableContent {
  tableName: string
  schema: string
  category: string
  description: string
  queryResult: string // 원본 쿼리 결과 (텍스트)
  columns: DbColumn[] // 파싱된 컬럼 데이터 (표시용)
}

export interface WorkDbTable {
  id: number
  workId: number
  tableName: string
  tableInfo: string // JSON stringified DbTableContent
  orderNum: number
  createdAt: string
  updatedAt: string
}

export interface CreateWorkDbTableRequest {
  tableName: string
  tableInfo: string // JSON stringified DbTableContent
  orderNum?: number
}

export interface UpdateWorkDbTableRequest {
  tableName: string
  tableInfo: string // JSON stringified DbTableContent
  orderNum: number
}

// TSV를 파싱해서 컬럼 배열로 변환
export function parseTsvToColumns(tsv: string): DbColumn[] {
  const lines = tsv.trim().split('\n')
  if (lines.length === 0) return []

  const rows = lines.map((line) => line.split('\t'))
  const columns: DbColumn[] = []

  // 첫 번째 줄이 헤더인지 확인
  const startIndex = rows[0]?.[0]?.trim().toLowerCase() === 'column_name' ? 1 : 0

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i]
    if (row.length < 2) continue

    const column_name = row[0]?.trim() || ''
    if (!column_name) continue

    columns.push({
      column_name,
      data_type: row[1]?.trim() || '',
      nullable: row[2]?.trim() || '',
      pk: row[3]?.trim() || '',
      fk: row[4]?.trim() || '',
      unique_key: row[5]?.trim() || '',
    })
  }

  return columns
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
      queryResult: parsed.queryResult || '',
      columns: parsed.columns || [],
    }
  } catch {
    return {
      tableName: '',
      schema: '',
      category: '',
      description: '',
      queryResult: '',
      columns: [],
    }
  }
}
