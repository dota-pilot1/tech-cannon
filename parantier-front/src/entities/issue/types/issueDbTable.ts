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
  columns: DbColumn[]
  ddl?: string // DDL 모드로 입력된 경우
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

// TSV 파싱 유틸리티 - 다양한 형식 자동 감지
export function parseTsvToColumns(tsv: string): DbColumn[] {
  const lines = tsv.trim().split('\n')
  if (lines.length === 0) return []

  const rows = lines.map((line) => line.split('\t'))

  // 유효한 SQL 타입 목록
  const validTypes = [
    'VARCHAR',
    'CHAR',
    'TEXT',
    'INTEGER',
    'INT',
    'BIGINT',
    'SMALLINT',
    'DECIMAL',
    'NUMERIC',
    'FLOAT',
    'DOUBLE',
    'REAL',
    'DATE',
    'TIME',
    'TIMESTAMP',
    'DATETIME',
    'BOOLEAN',
    'BOOL',
    'SERIAL',
    'BIGSERIAL',
    'UUID',
    'JSON',
    'JSONB',
    'BLOB',
    'CLOB',
  ]

  // 첫 행 분석으로 헤더 감지
  const firstCell = rows[0]?.[0]?.trim() || ''
  const hasHeader =
    isNaN(Number(firstCell)) &&
    (firstCell.toLowerCase().includes('no') ||
      firstCell.includes('번호') ||
      firstCell.toLowerCase().includes('seq') ||
      firstCell.toLowerCase().includes('column'))

  const dataRows = hasHeader ? rows.slice(1) : rows

  // DBeaver 데이터 그리드 형식 감지
  // 헤더: column_name | data_type | character_maximum_length | is_nullable
  // 데이터: id | bigint | [NULL] | NO
  const isDbaverGridFormat =
    hasHeader &&
    dataRows.length > 0 &&
    dataRows.every((row) => {
      if (row.length < 3) return false
      const typeCell = row[1]?.trim().toLowerCase() || ''
      const nullableCell = row[row.length - 1]?.trim().toUpperCase() || ''
      // data_type 컬럼이 SQL 타입을 포함하고, 마지막 컬럼이 YES/NO
      return (
        validTypes.some((vt) => typeCell.toUpperCase().includes(vt)) &&
        (nullableCell === 'YES' || nullableCell === 'NO' || nullableCell === '[NULL]')
      )
    })

  // DBeaver 간단 형식 감지: 컬럼명 | 타입 | 크기 | is_nullable 형식 (헤더 없음)
  // 예: id	bigint		NO
  const isDbaverSimpleFormat =
    !hasHeader &&
    dataRows.length > 0 &&
    dataRows.every((row) => {
      if (row.length < 2) return false
      const typeIdx = row.findIndex((cell) => {
        const upper = cell.trim().toUpperCase()
        return validTypes.some((vt) => upper.includes(vt))
      })
      return typeIdx === 1 // 타입이 두 번째 컬럼에 있으면 DBeaver 간단 형식
    })

  const parsedColumns: DbColumn[] = []

  for (const row of dataRows) {
    if (row.length < 2) continue

    // 타입 컬럼 찾기
    const typeIdx = row.findIndex((cell) => {
      const upper = cell.trim().toUpperCase()
      return validTypes.some((vt) => upper.includes(vt))
    })

    if (typeIdx === -1) continue

    if (isDbaverGridFormat) {
      // DBeaver 데이터 그리드 형식: column_name | data_type | character_maximum_length | is_nullable | ...
      const name = row[0]?.trim() || ''
      const typeRaw = row[1]?.trim() || ''
      const sizeRaw = row[2]?.trim() || ''
      const isNullable = row[3]?.trim().toUpperCase() || ''

      // data_type 파싱 (예: "character varying" -> "VARCHAR")
      let type = typeRaw.toUpperCase()
      if (type.includes('CHARACTER VARYING')) type = 'VARCHAR'
      else if (type.includes('TIMESTAMP WITHOUT')) type = 'TIMESTAMP'
      else if (type.includes('TIMESTAMP WITH')) type = 'TIMESTAMPTZ'

      // size 파싱 ([NULL] 제거)
      const size = sizeRaw === '[NULL]' || !sizeRaw ? '' : sizeRaw

      if (name && !name.includes(' ')) {
        parsedColumns.push({
          no: parsedColumns.length + 1,
          name,
          comment: '',
          type,
          size,
          pk: false, // DBeaver 형식에서는 PK 정보가 없으므로 수동 설정 필요
          notNull: isNullable === 'NO',
          note: '',
        })
      }
    } else if (isDbaverSimpleFormat) {
      // DBeaver 간단 형식: 컬럼명 | 타입 | 크기 | is_nullable
      const name = row[0]?.trim() || ''
      const type = row[1]?.trim() || ''
      const size = row[2]?.trim() || ''
      const isNullable = row[3]?.trim().toUpperCase() || ''

      if (name && !name.includes(' ')) {
        parsedColumns.push({
          no: parsedColumns.length + 1,
          name,
          comment: '',
          type: type.toUpperCase(),
          size: size || '',
          pk: false,
          notNull: isNullable === 'NO',
          note: '',
        })
      }
    } else {
      // 기존 커스텀 형식: No | 컬럼명 | 설명 | 타입 | 크기 | PK | NN | 비고
      const hasNoCol = row[0]?.trim() && !isNaN(Number(row[0].trim()))
      const offset = hasNoCol ? 1 : 0

      const no = hasNoCol ? Number(row[0].trim()) : parsedColumns.length + 1
      const name = row[offset]?.trim() || ''
      const comment = row[offset + 1]?.trim() || ''
      const type = row[offset + 2]?.trim() || ''
      const size = row[offset + 3]?.trim() || ''
      const pkVal = row[offset + 4]?.trim().toLowerCase() || ''
      const nnVal = row[offset + 5]?.trim().toLowerCase() || ''
      const note = row[offset + 6]?.trim() || ''

      const pk = ['y', 'true', '✓', 'o'].includes(pkVal)
      const notNull = ['y', 'true', '✓', 'o'].includes(nnVal)

      if (name && !name.includes(' ') && !name.includes(':')) {
        parsedColumns.push({
          no,
          name,
          comment,
          type,
          size: isNaN(Number(size)) ? size : Number(size),
          pk,
          notNull,
          note,
        })
      }
    }
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
      columns: parsed.columns || [],
    }
  } catch {
    return {
      tableName: '',
      schema: '',
      category: '',
      description: '',
      columns: [],
    }
  }
}
