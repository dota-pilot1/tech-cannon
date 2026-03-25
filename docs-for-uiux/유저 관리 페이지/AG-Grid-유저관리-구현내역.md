# AG-Grid 유저 관리 페이지 구현 내역

## 개요

**날짜**: 2026-03-22
**목적**: 엔터프라이즈급 유저 관리 기능을 위한 AG-Grid Community 도입
**페이지**: `/admin/users` (관리자 전용)

---

## 1. 기술 스택 선정

### AG-Grid Community 선택 이유

- **엔터프라이즈급 기능**: 채용 관리 + 업무 관리 프로젝트에 적합
- **풍부한 기능**: 정렬, 필터링, 페이지네이션, 컬럼 리사이즈 기본 제공
- **확장성**: 향후 복잡한 데이터 그리드 요구사항에 대응 가능
- **번들 크기**: ~140KB (gzipped) - 내부 관리 도구로 허용 가능한 수준

### 대안 비교

| 라이브러리 | 장점 | 단점 | 선택 여부 |
|---|---|---|---|
| **AG-Grid Community** | 엔터프라이즈급 기능, 풍부한 기능 | 번들 크기 큼 (140KB) | ✅ 선택 |
| TanStack Table | 가벼움 (14KB), headless | 직접 구현 필요 | ❌ |
| 기본 HTML Table | 가장 가벼움 | 기능 제한적 | ❌ |

---

## 2. 설치 패키지

```bash
npm install ag-grid-react ag-grid-community
```

**설치된 패키지**:
- `ag-grid-react`: React 컴포넌트 래퍼
- `ag-grid-community`: AG-Grid 코어 라이브러리

---

## 3. 구현 파일

### 프론트엔드

#### 📄 `parantier-front/src/pages/admin/users/UsersPage.tsx`

**주요 변경사항**:
- 기본 HTML `<table>` → AG-Grid 교체
- 커스텀 Cell Renderer 2개 추가
  - `RoleCellRenderer`: 권한 변경 Select
  - `StatusCellRenderer`: 활성/비활성 배지

**컬럼 정의**:
```typescript
const columnDefs = [
  { headerName: 'ID', field: 'id', width: 80, filter: 'agNumberColumnFilter' },
  { headerName: '이메일', field: 'email', flex: 1, filter: 'agTextColumnFilter' },
  { headerName: '이름', field: 'username', width: 150, filter: 'agTextColumnFilter' },
  { headerName: '권한', field: 'role', width: 180, cellRenderer: RoleCellRenderer },
  { headerName: '상태', field: 'isActive', width: 100, cellRenderer: StatusCellRenderer },
  { headerName: '가입일', field: 'createdAt', width: 150, filter: 'agDateColumnFilter' }
]
```

**AG-Grid 설정**:
```typescript
<AgGridReact
  rowData={users}
  columnDefs={columnDefs}
  defaultColDef={defaultColDef}
  pagination={true}
  paginationPageSize={20}
  paginationPageSizeSelector={[10, 20, 50, 100]}
  animateRows={true}
  rowSelection="single"
/>
```

### 백엔드

#### 📄 `parantier-api/src/main/java/com/mapo/palantier/user/presentation/AdminUserController.java`

**새로 생성된 컨트롤러**:

```java
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        // 전체 사용자 목록 조회
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<Void> updateUserRole(
        @PathVariable Long userId,
        @RequestBody @Valid UpdateRoleRequest request
    ) {
        // 사용자 권한 변경
    }
}
```

#### 📄 `parantier-api/src/main/java/com/mapo/palantier/user/application/UserService.java`

**새로 추가된 메서드**:
- `getAllUsers()`: 전체 사용자 목록 조회
- `updateUserRole(Long userId, UserRole role)`: 권한 변경

#### 📄 DTO 파일들

- `UserResponse.java`: 사용자 정보 응답
- `UpdateRoleRequest.java`: 권한 변경 요청

---

## 4. 주요 기능

### 4.1 데이터 그리드 기능

| 기능 | 설명 | 구현 여부 |
|---|---|---|
| **정렬** | 모든 컬럼 클릭으로 오름차순/내림차순 정렬 | ✅ |
| **필터링** | 텍스트, 숫자, 날짜 필터 | ✅ |
| **페이지네이션** | 10/20/50/100개씩 보기 | ✅ |
| **컬럼 리사이즈** | 드래그로 컬럼 너비 조절 | ✅ |
| **행 선택** | 단일 행 선택 | ✅ |
| **애니메이션** | 행 변경 시 부드러운 전환 | ✅ |

### 4.2 커스텀 Cell Renderer

#### RoleCellRenderer (권한 변경)

```typescript
function RoleCellRenderer(props: ICellRendererParams<UserResponse>) {
  const [updating, setUpdating] = useState(false)

  const handleRoleChange = async (newRole: string) => {
    setUpdating(true)
    await adminApi.updateUserRole(props.data.id, newRole)
    props.node.setDataValue('role', newRole)
    setUpdating(false)
  }

  return (
    <Select
      value={props.value}
      onValueChange={handleRoleChange}
      disabled={updating}
    >
      <SelectTrigger className="w-full h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ROLE_USER">일반 사용자</SelectItem>
        <SelectItem value="ROLE_ADMIN">관리자</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

**특징**:
- 인라인 권한 변경 (페이지 이동 없음)
- 로딩 상태 표시 (Select 비활성화)
- 즉시 UI 업데이트 (`props.node.setDataValue`)

#### StatusCellRenderer (상태 배지)

```typescript
function StatusCellRenderer(props: ICellRendererParams<UserResponse>) {
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
      props.value
        ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-800'
    }`}>
      {props.value ? '활성' : '비활성'}
    </span>
  )
}
```

**특징**:
- 시각적 배지 표시
- 활성(초록색) / 비활성(회색) 구분

### 4.3 보안

- `@PreAuthorize("hasRole('ADMIN')")`: 관리자만 접근 가능
- JWT 인증 필수
- 프론트엔드 라우팅 보호 (App.tsx)

---

## 5. API 엔드포인트

### GET /api/admin/users

**설명**: 전체 사용자 목록 조회

**권한**: `ROLE_ADMIN`

**응답 예시**:
```json
[
  {
    "id": 1,
    "email": "terecal@daum.net",
    "username": "오현석",
    "role": "ROLE_ADMIN",
    "isActive": true,
    "createdAt": "2026-03-21T12:00:00",
    "updatedAt": "2026-03-22T12:00:00"
  }
]
```

### PATCH /api/admin/users/{userId}/role

**설명**: 사용자 권한 변경

**권한**: `ROLE_ADMIN`

**요청 바디**:
```json
{
  "role": "ROLE_ADMIN"
}
```

**응답**: `204 No Content`

---

## 6. 스타일링

### AG-Grid 테마

```typescript
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
```

**사용 테마**: `ag-theme-quartz`
- 현대적인 디자인
- 다크모드 지원 준비
- Tailwind CSS와 조화

### 컨테이너 스타일

```typescript
<div className="ag-theme-quartz" style={{ height: '600px', width: '100%' }}>
```

**설정**:
- 높이: 600px (고정)
- 너비: 100% (반응형)
- 최대 너비: 7xl (1280px)

---

## 7. 파일 구조

```
parantier-front/
└── src/
    └── pages/
        └── admin/
            └── users/
                └── UsersPage.tsx

parantier-api/
└── src/main/java/com/mapo/palantier/
    └── user/
        ├── application/
        │   └── UserService.java
        ├── presentation/
        │   ├── AdminUserController.java (신규)
        │   └── dto/
        │       ├── UserResponse.java (신규)
        │       └── UpdateRoleRequest.java (신규)
        └── domain/
            └── UserRepository.java
```

---

## 8. 향후 개선 사항

### 추가 가능한 기능

1. **엑셀 내보내기**
   - AG-Grid Enterprise 기능
   - CSV 내보내기는 Community에서 가능

2. **컬럼 숨김/표시**
   - 사용자가 원하는 컬럼만 표시

3. **고급 필터링**
   - 복합 조건 필터
   - 저장된 필터 프리셋

4. **일괄 작업**
   - 다중 선택으로 권한 일괄 변경
   - 사용자 일괄 비활성화

5. **실시간 업데이트**
   - WebSocket으로 실시간 사용자 상태 반영

### 성능 최적화

- **서버 사이드 페이지네이션**: 사용자 1000명 이상 시
- **가상 스크롤링**: 대용량 데이터 처리
- **컬럼 가상화**: 많은 컬럼 표시 시

---

## 9. 테스트 체크리스트

- [ ] 관리자 로그인 후 유저 관리 메뉴 표시 확인
- [ ] 일반 사용자는 유저 관리 메뉴 미표시 확인
- [ ] 전체 사용자 목록 조회
- [ ] 권한 변경 (일반 사용자 → 관리자)
- [ ] 권한 변경 (관리자 → 일반 사용자)
- [ ] 정렬 기능 테스트 (ID, 이메일, 이름, 가입일)
- [ ] 필터 기능 테스트
- [ ] 페이지네이션 동작 확인
- [ ] 컬럼 리사이즈 동작 확인

---

## 10. 참고 자료

- [AG-Grid React 공식 문서](https://www.ag-grid.com/react-data-grid/)
- [AG-Grid Community vs Enterprise 비교](https://www.ag-grid.com/react-data-grid/licensing/)
- [Cell Renderer 가이드](https://www.ag-grid.com/react-data-grid/cell-rendering/)
