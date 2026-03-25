# AG-Grid 기본 사용법 및 이벤트 처리

## 1. AG-Grid 기본 구조

AG-Grid는 매우 심플한 구조입니다:
- rowData: 표시할 데이터 배열
- columnDefs: 컬럼 정의 배열
- 나머지는 옵션 (정렬, 필터, 페이지네이션 등)

```typescript
<AgGridReact
  rowData={users}              // 데이터
  columnDefs={columnDefs}      // 컬럼 정의
  onSelectionChanged={...}     // 이벤트 핸들러
/>
```

---

## 2. 행 선택 (Row Selection)

### 단일 선택
```typescript
<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  rowSelection={{ mode: 'singleRow' }}
  onSelectionChanged={(event) => {
    const selectedRows = event.api.getSelectedRows()
    console.log('선택된 행:', selectedRows[0])
  }}
/>
```

### 다중 선택 (체크박스)
```typescript
const columnDefs = [
  {
    headerName: '',
    checkboxSelection: true,  // 체크박스 표시
    headerCheckboxSelection: true,  // 헤더에도 체크박스 (전체 선택)
    width: 50,
  },
  { headerName: 'ID', field: 'id' },
  { headerName: '이메일', field: 'email' },
]

<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  rowSelection={{ mode: 'multiRow' }}  // 다중 선택 허용
  onSelectionChanged={(event) => {
    const selectedRows = event.api.getSelectedRows()
    console.log('선택된 행들:', selectedRows)
    console.log('선택된 개수:', selectedRows.length)
  }}
/>
```

---

## 3. 행 클릭 이벤트

### 행 전체 클릭
```typescript
<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  onRowClicked={(event) => {
    console.log('클릭한 행 데이터:', event.data)
    console.log('행 인덱스:', event.rowIndex)
  }}
/>
```

### 셀 클릭
```typescript
<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  onCellClicked={(event) => {
    console.log('클릭한 셀 값:', event.value)
    console.log('컬럼:', event.colDef.field)
    console.log('행 데이터:', event.data)
  }}
/>
```

---

## 4. 행 데이터 관리

### 4.1 데이터 추가
```typescript
const gridRef = useRef<AgGridReact>(null)

const addUser = () => {
  const newUser = { id: 3, email: 'new@example.com', username: '신규' }

  // 방법 1: rowData state 업데이트 (권장)
  setUsers([...users, newUser])

  // 방법 2: Grid API 사용
  gridRef.current?.api.applyTransaction({
    add: [newUser]
  })
}

<AgGridReact ref={gridRef} ... />
```

### 4.2 데이터 수정
```typescript
const updateUser = (userId: number, newEmail: string) => {
  // 방법 1: rowData state 업데이트 (권장)
  setUsers(users.map(u =>
    u.id === userId ? { ...u, email: newEmail } : u
  ))

  // 방법 2: Grid API 사용
  const rowNode = gridRef.current?.api.getRowNode(String(userId))
  if (rowNode) {
    rowNode.setDataValue('email', newEmail)
  }
}
```

### 4.3 데이터 삭제
```typescript
const deleteUser = (userId: number) => {
  // 방법 1: rowData state 업데이트 (권장)
  setUsers(users.filter(u => u.id !== userId))

  // 방법 2: Grid API 사용
  const selectedRows = gridRef.current?.api.getSelectedRows() || []
  gridRef.current?.api.applyTransaction({
    remove: selectedRows
  })
}
```

### 4.4 선택된 행 가져오기
```typescript
const getSelectedUsers = () => {
  const selectedRows = gridRef.current?.api.getSelectedRows()
  return selectedRows || []
}
```

---

## 5. 체크박스 관련 이벤트

### 선택 변경 감지
```typescript
const [selectedCount, setSelectedCount] = useState(0)

<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  rowSelection={{ mode: 'multiRow' }}
  onSelectionChanged={(event) => {
    const selectedRows = event.api.getSelectedRows()
    setSelectedCount(selectedRows.length)

    // 선택된 ID들만 추출
    const selectedIds = selectedRows.map(row => row.id)
    console.log('선택된 ID:', selectedIds)
  }}
/>

<div>선택된 사용자: {selectedCount}명</div>
```

### 프로그래밍 방식으로 선택/해제
```typescript
// 모든 행 선택
const selectAll = () => {
  gridRef.current?.api.selectAll()
}

// 모든 선택 해제
const deselectAll = () => {
  gridRef.current?.api.deselectAll()
}

// 특정 조건으로 선택
const selectAdmins = () => {
  gridRef.current?.api.forEachNode((node) => {
    if (node.data.role === 'ROLE_ADMIN') {
      node.setSelected(true)
    }
  })
}
```

---

## 6. 실제 사용 예시: 일괄 삭제 기능

```typescript
export function UsersPage() {
  const gridRef = useRef<AgGridReact>(null)
  const [users, setUsers] = useState<UserResponse[]>([])
  const [selectedCount, setSelectedCount] = useState(0)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: 'left',  // 왼쪽 고정
    },
    { headerName: 'ID', field: 'id', width: 80 },
    { headerName: '이메일', field: 'email', flex: 1 },
    { headerName: '이름', field: 'username', width: 150 },
  ], [])

  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows()
    setSelectedCount(selectedRows.length)
  }

  const handleBulkDelete = async () => {
    const selectedRows = gridRef.current?.api.getSelectedRows()
    if (!selectedRows || selectedRows.length === 0) {
      toast.error('삭제할 사용자를 선택해주세요.')
      return
    }

    if (!confirm(`${selectedRows.length}명의 사용자를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const selectedIds = selectedRows.map(row => row.id)
      await adminApi.bulkDeleteUsers(selectedIds)

      // 삭제 후 데이터 갱신
      setUsers(users.filter(u => !selectedIds.includes(u.id)))
      toast.success(`${selectedRows.length}명의 사용자가 삭제되었습니다.`)
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Button
          variant="destructive"
          onClick={handleBulkDelete}
          disabled={selectedCount === 0}
        >
          선택 삭제 ({selectedCount})
        </Button>
      </div>

      <div style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={users}
          columnDefs={columnDefs}
          rowSelection={{ mode: 'multiRow' }}
          onSelectionChanged={handleSelectionChanged}
          suppressRowClickSelection={true}  // 행 클릭으로 선택 방지 (체크박스만)
        />
      </div>
    </div>
  )
}
```

---

## 7. 행 더블클릭으로 상세 페이지 이동

```typescript
<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  onRowDoubleClicked={(event) => {
    const userId = event.data.id
    window.history.pushState({}, '', `/admin/users/${userId}`)
    // 또는 모달 열기
    setSelectedUserId(userId)
    setIsModalOpen(true)
  }}
/>
```

---

## 8. 컨텍스트 메뉴 (우클릭)

```typescript
const getContextMenuItems = useCallback((params: GetContextMenuItemsParams) => {
  return [
    {
      name: '사용자 편집',
      action: () => {
        console.log('편집:', params.node?.data)
      },
    },
    {
      name: '삭제',
      action: () => {
        if (confirm('정말 삭제하시겠습니까?')) {
          console.log('삭제:', params.node?.data)
        }
      },
    },
    'separator',
    'copy',
    'export',
  ]
}, [])

<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  getContextMenuItems={getContextMenuItems}
/>
```

---

## 9. 정렬/필터 변경 이벤트

```typescript
<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  onSortChanged={(event) => {
    const sortModel = event.api.getColumnState()
      .filter(col => col.sort != null)
      .map(col => ({ field: col.colId, sort: col.sort }))
    console.log('정렬 변경:', sortModel)
  }}
  onFilterChanged={(event) => {
    const filterModel = event.api.getFilterModel()
    console.log('필터 변경:', filterModel)

    // 필터링된 행 개수
    const rowCount = event.api.getDisplayedRowCount()
    console.log('표시된 행:', rowCount)
  }}
/>
```

---

## 10. Grid API 주요 메서드

```typescript
const gridRef = useRef<AgGridReact>(null)

// 모든 행 데이터 가져오기
const getAllRows = () => {
  const rowData: any[] = []
  gridRef.current?.api.forEachNode((node) => rowData.push(node.data))
  return rowData
}

// 필터링된 행만 가져오기
const getFilteredRows = () => {
  const rowData: any[] = []
  gridRef.current?.api.forEachNodeAfterFilter((node) => rowData.push(node.data))
  return rowData
}

// 특정 행 찾기
const findRow = (userId: number) => {
  let foundNode = null
  gridRef.current?.api.forEachNode((node) => {
    if (node.data.id === userId) {
      foundNode = node
    }
  })
  return foundNode
}

// 컬럼 크기 자동 조정
const autoSizeAll = () => {
  const allColumnIds = gridRef.current?.api.getColumns()?.map(col => col.getId())
  gridRef.current?.api.autoSizeColumns(allColumnIds || [])
}

// CSV 내보내기
const exportToCsv = () => {
  gridRef.current?.api.exportDataAsCsv({
    fileName: 'users.csv'
  })
}
```

---

## 11. 요약

**AG-Grid는 정말 심플합니다:**
1. rowData에 데이터 넣기
2. columnDefs로 컬럼 정의
3. 이벤트 핸들러로 상호작용 처리

**핵심 패턴:**
- 데이터 관리는 React state로 (setUsers)
- 행 선택은 onSelectionChanged로
- 체크박스는 checkboxSelection: true
- 복잡한 조작은 gridRef.current?.api 사용

**추천 방식:**
- React 스타일: rowData state 업데이트 (불변성 유지)
- AG-Grid API는 필요할 때만 사용 (선택, 필터, 정렬 조회 등)
