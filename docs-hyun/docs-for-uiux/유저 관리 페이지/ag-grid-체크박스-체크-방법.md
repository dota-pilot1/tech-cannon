# AG-Grid 체크박스 체크 이벤트 처리 방법

## 핵심 개념

AG-Grid의 체크박스는 **행 선택(Row Selection)** 기능입니다.
체크박스를 체크하면 = 행이 선택됨 = `onSelectionChanged` 이벤트 발생

---

## 1. 체크박스 체크 이벤트는 어떻게 처리되나?

### 이벤트 흐름
```
사용자가 체크박스 클릭
    ↓
AG-Grid가 내부적으로 행의 선택 상태 변경
    ↓
onSelectionChanged 이벤트 자동 발생
    ↓
event.api.getSelectedRows()로 선택된 행들 가져옴
```

### 코드 예시
```typescript
<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  rowSelection={{ mode: 'multiRow' }}  // 다중 선택 허용
  onSelectionChanged={(event) => {
    // 체크박스 체크/해제될 때마다 자동 호출됨
    const selectedRows = event.api.getSelectedRows()
    console.log('현재 선택된 행들:', selectedRows)
    console.log('선택된 개수:', selectedRows.length)
  }}
/>
```

**중요**: 체크박스 자체에 onClick 이벤트를 달 필요가 없습니다!
AG-Grid가 알아서 `onSelectionChanged`를 호출해줍니다.

---

## 2. 체크박스 추가 방법

### 기본 체크박스
```typescript
const columnDefs = [
  {
    headerName: '',
    checkboxSelection: true,  // 이 컬럼에 체크박스 표시
    width: 50,
  },
  { headerName: 'ID', field: 'id' },
  { headerName: '이메일', field: 'email' },
]
```

### 헤더 체크박스 (전체 선택)
```typescript
const columnDefs = [
  {
    headerName: '',
    checkboxSelection: true,           // 행 체크박스
    headerCheckboxSelection: true,     // 헤더에도 체크박스 (전체 선택)
    width: 50,
  },
  { headerName: 'ID', field: 'id' },
]
```

---

## 3. 실제 동작 예시

### 예시 1: 선택된 개수 표시
```typescript
function UsersPage() {
  const [selectedCount, setSelectedCount] = useState(0)

  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows()
    setSelectedCount(selectedRows.length)
  }

  return (
    <div>
      <p>선택된 사용자: {selectedCount}명</p>

      <AgGridReact
        rowData={users}
        columnDefs={columnDefs}
        rowSelection={{ mode: 'multiRow' }}
        onSelectionChanged={handleSelectionChanged}
      />
    </div>
  )
}
```

### 예시 2: 선택된 ID 추출
```typescript
const handleSelectionChanged = (event: SelectionChangedEvent) => {
  const selectedRows = event.api.getSelectedRows()
  const selectedIds = selectedRows.map(row => row.id)

  console.log('선택된 ID들:', selectedIds)
  // 출력 예: [1, 3, 5]
}
```

### 예시 3: 선택된 행으로 작업
```typescript
const handleSelectionChanged = (event: SelectionChangedEvent) => {
  const selectedRows = event.api.getSelectedRows()

  // 선택된 사용자 이메일 목록
  const emails = selectedRows.map(row => row.email)

  // 관리자만 필터링
  const admins = selectedRows.filter(row => row.role === 'ROLE_ADMIN')

  console.log('이메일 목록:', emails)
  console.log('선택된 관리자:', admins)
}
```

---

## 4. 일괄 삭제 버튼과 연동

```typescript
function UsersPage() {
  const gridRef = useRef<AgGridReact>(null)
  const [selectedCount, setSelectedCount] = useState(0)

  // 체크박스 변경 감지
  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows()
    setSelectedCount(selectedRows.length)
  }

  // 삭제 버튼 클릭
  const handleBulkDelete = async () => {
    // gridRef를 통해 선택된 행 가져오기
    const selectedRows = gridRef.current?.api.getSelectedRows()

    if (!selectedRows || selectedRows.length === 0) {
      toast.error('삭제할 사용자를 선택해주세요.')
      return
    }

    const selectedIds = selectedRows.map(row => row.id)
    await adminApi.bulkDeleteUsers(selectedIds)

    toast.success(`${selectedRows.length}명의 사용자가 삭제되었습니다.`)
  }

  return (
    <div>
      <Button
        variant="destructive"
        onClick={handleBulkDelete}
        disabled={selectedCount === 0}
      >
        선택 삭제 ({selectedCount})
      </Button>

      <AgGridReact
        ref={gridRef}
        rowData={users}
        columnDefs={columnDefs}
        rowSelection={{ mode: 'multiRow' }}
        onSelectionChanged={handleSelectionChanged}
      />
    </div>
  )
}
```

---

## 5. 프로그래밍 방식으로 체크박스 제어

### 전체 선택
```typescript
const selectAll = () => {
  gridRef.current?.api.selectAll()
}
```

### 전체 해제
```typescript
const deselectAll = () => {
  gridRef.current?.api.deselectAll()
}
```

### 특정 조건으로 선택
```typescript
// 관리자만 선택
const selectAdmins = () => {
  gridRef.current?.api.forEachNode((node) => {
    if (node.data.role === 'ROLE_ADMIN') {
      node.setSelected(true)
    }
  })
}

// 활성 사용자만 선택
const selectActiveUsers = () => {
  gridRef.current?.api.forEachNode((node) => {
    node.setSelected(node.data.isActive === true)
  })
}
```

### 특정 행만 선택
```typescript
// ID가 1인 행 선택
const selectUserById = (userId: number) => {
  gridRef.current?.api.forEachNode((node) => {
    if (node.data.id === userId) {
      node.setSelected(true)
    }
  })
}
```

---

## 6. 행 클릭으로 선택 방지 (체크박스만 허용)

기본적으로 AG-Grid는 행을 클릭해도 체크박스가 체크됩니다.
체크박스만 클릭했을 때만 선택되게 하려면:

```typescript
<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  rowSelection={{ mode: 'multiRow' }}
  suppressRowClickSelection={true}  // 행 클릭으로 선택 방지
  onSelectionChanged={handleSelectionChanged}
/>
```

---

## 7. 이벤트 객체 (event) 상세 정보

```typescript
const handleSelectionChanged = (event: SelectionChangedEvent) => {
  // 선택된 행들
  const selectedRows = event.api.getSelectedRows()

  // 선택된 행의 개수
  const count = selectedRows.length

  // 선택된 노드들 (더 상세한 정보)
  const selectedNodes = event.api.getSelectedNodes()

  // 모든 행 순회
  event.api.forEachNode((node) => {
    console.log('행 ID:', node.data.id)
    console.log('선택됨?:', node.isSelected())
  })

  // 현재 표시된 행 개수 (필터링 적용 후)
  const displayedCount = event.api.getDisplayedRowCount()
}
```

---

## 8. 단일 선택 vs 다중 선택

### 단일 선택 (라디오 버튼처럼)
```typescript
<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  rowSelection={{ mode: 'singleRow' }}  // 하나만 선택 가능
  onSelectionChanged={(event) => {
    const selectedRows = event.api.getSelectedRows()
    console.log('선택된 행:', selectedRows[0])  // 배열이지만 항상 1개
  }}
/>
```

### 다중 선택 (체크박스)
```typescript
<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  rowSelection={{ mode: 'multiRow' }}  // 여러 개 선택 가능
  onSelectionChanged={(event) => {
    const selectedRows = event.api.getSelectedRows()
    console.log('선택된 행들:', selectedRows)  // 배열, 0~N개
  }}
/>
```

---

## 9. 실전 예시: 일괄 권한 변경

```typescript
function UsersPage() {
  const gridRef = useRef<AgGridReact>(null)
  const [selectedCount, setSelectedCount] = useState(0)

  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows()
    setSelectedCount(selectedRows.length)
  }

  const handleBulkChangeRole = async (newRole: string) => {
    const selectedRows = gridRef.current?.api.getSelectedRows()

    if (!selectedRows || selectedRows.length === 0) {
      toast.error('사용자를 선택해주세요.')
      return
    }

    const roleLabel = newRole === 'ROLE_ADMIN' ? '관리자' : '일반 사용자'

    if (!confirm(`${selectedRows.length}명을 ${roleLabel}로 변경하시겠습니까?`)) {
      return
    }

    try {
      const selectedIds = selectedRows.map(row => row.id)
      await adminApi.bulkUpdateRole(selectedIds, newRole)

      toast.success(`${selectedRows.length}명의 권한이 변경되었습니다.`)

      // 선택 해제
      gridRef.current?.api.deselectAll()

      // 데이터 새로고침
      refetch()
    } catch (error) {
      toast.error('권한 변경 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => handleBulkChangeRole('ROLE_ADMIN')}
          disabled={selectedCount === 0}
        >
          선택 → 관리자 ({selectedCount})
        </Button>
        <Button
          onClick={() => handleBulkChangeRole('ROLE_USER')}
          disabled={selectedCount === 0}
        >
          선택 → 일반 사용자 ({selectedCount})
        </Button>
      </div>

      <AgGridReact
        ref={gridRef}
        rowData={users}
        columnDefs={columnDefs}
        rowSelection={{ mode: 'multiRow' }}
        onSelectionChanged={handleSelectionChanged}
        suppressRowClickSelection={true}
      />
    </div>
  )
}
```

---

## 10. 핵심 요약

### Q: 체크박스 체크 이벤트는 어떻게 처리되나요?
**A: `onSelectionChanged` 이벤트가 자동으로 발생합니다.**

### Q: 체크박스에 직접 onClick을 달아야 하나요?
**A: 아니요! AG-Grid가 알아서 처리합니다.**

### Q: 선택된 행은 어떻게 가져오나요?
**A: `event.api.getSelectedRows()` 사용**

### Q: 체크박스만 클릭했을 때만 선택되게 하려면?
**A: `suppressRowClickSelection={true}` 설정**

### 핵심 패턴
```typescript
// 1. columnDefs에 체크박스 추가
checkboxSelection: true

// 2. rowSelection 설정
rowSelection={{ mode: 'multiRow' }}

// 3. 이벤트 핸들러 등록
onSelectionChanged={(event) => {
  const selected = event.api.getSelectedRows()
  // selected 배열로 원하는 작업 수행
}}

// 4. gridRef로 나중에 가져오기
const selected = gridRef.current?.api.getSelectedRows()
```

**정말 간단합니다!** 체크박스는 AG-Grid가 자동으로 관리하고,
우리는 `onSelectionChanged`만 처리하면 됩니다.
