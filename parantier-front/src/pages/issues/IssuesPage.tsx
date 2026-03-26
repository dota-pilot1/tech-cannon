import { useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { useIssues, useUpdateIssueStatus } from '@/features/issue/hooks/useIssues'
import type { Issue, IssueStatus, IssuePriority, IssueCategory } from '@/entities/issue/types/issue'
import { Plus } from 'lucide-react'
import { useConfirm } from '@/shared/hooks/useConfirm'

// AG-Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule])

// 상태 배지 렌더러
function StatusCellRenderer(props: ICellRendererParams<Issue>) {
  const { mutate: updateStatus, isPending } = useUpdateIssueStatus()
  const status = props.value as IssueStatus

  const handleStatusChange = (newStatus: string) => {
    if (!props.data) return

    const previousStatus = props.value
    props.node.setDataValue('status', newStatus)

    updateStatus(
      { id: props.data.id, status: newStatus },
      {
        onError: () => {
          props.node.setDataValue('status', previousStatus)
        },
      }
    )
  }

  const getStatusVariant = (status: IssueStatus) => {
    switch (status) {
      case 'OPEN':
        return 'default'
      case 'IN_PROGRESS':
        return 'secondary'
      case 'RESOLVED':
        return 'outline'
      case 'CLOSED':
        return 'outline'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const statusLabels: Record<IssueStatus, string> = {
    OPEN: '진행 전',
    IN_PROGRESS: '진행 중',
    RESOLVED: '해결됨',
    CLOSED: '종료됨',
    REJECTED: '거부됨',
  }

  return (
    <div className="flex items-center h-full py-1 px-1">
      <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger className="h-8 w-28 text-xs border-gray-300">
          <SelectValue>
            <Badge variant={getStatusVariant(status)} className="text-xs">
              {statusLabels[status]}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="OPEN">진행 전</SelectItem>
          <SelectItem value="IN_PROGRESS">진행 중</SelectItem>
          <SelectItem value="RESOLVED">해결됨</SelectItem>
          <SelectItem value="CLOSED">종료됨</SelectItem>
          <SelectItem value="REJECTED">거부됨</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

// 우선순위 배지 렌더러
function PriorityCellRenderer(props: ICellRendererParams<Issue>) {
  const priority = props.value as IssuePriority

  const getPriorityVariant = (priority: IssuePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'destructive'
      case 'HIGH':
        return 'destructive'
      case 'MEDIUM':
        return 'secondary'
      case 'LOW':
        return 'outline'
      default:
        return 'default'
    }
  }

  const priorityLabels: Record<IssuePriority, string> = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
    CRITICAL: '긴급',
  }

  return (
    <div className="flex items-center h-full">
      <Badge variant={getPriorityVariant(priority)} className="text-xs">
        {priorityLabels[priority]}
      </Badge>
    </div>
  )
}

// 카테고리 배지 렌더러
function CategoryCellRenderer(props: ICellRendererParams<Issue>) {
  const category = props.value as IssueCategory

  const categoryLabels: Record<IssueCategory, string> = {
    COMMON: '일반',
    BUG: '버그',
    FEATURE: '기능',
    IMPROVEMENT: '개선',
    QUESTION: '질문',
  }

  const getCategoryColor = (category: IssueCategory) => {
    switch (category) {
      case 'BUG':
        return 'bg-red-100 text-red-800'
      case 'FEATURE':
        return 'bg-blue-100 text-blue-800'
      case 'IMPROVEMENT':
        return 'bg-green-100 text-green-800'
      case 'QUESTION':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getCategoryColor(category)}`}>
      {categoryLabels[category]}
    </span>
  )
}

// 제목 렌더러 (클릭 가능)
function TitleCellRenderer(props: ICellRendererParams<Issue>) {
  const handleClick = () => {
    if (props.data) {
      // TODO: 이슈 상세 페이지 구현 후 활성화
      console.log('Navigate to issue:', props.data.id)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="text-left hover:text-blue-600 hover:underline w-full"
    >
      {props.value}
    </button>
  )
}

export function IssuesPage() {
  const gridRef = useRef<AgGridReact>(null)
  const [filters] = useState({
    page: 0,
    limit: 20,
  })

  const { data, isLoading, isError, error, refetch } = useIssues(filters)
  const { ConfirmDialog } = useConfirm()

  const issues = data?.items || []

  // AG-Grid 한국어 로케일
  const localeText = useMemo(
    () => ({
      page: '페이지',
      of: '/',
      to: '-',
      pageSizeSelectorLabel: '페이지당',
      pageSizeSelectorLabelText: '행',
    }),
    []
  )

  // 컬럼 정의
  const columnDefs = useMemo<ColDef<Issue>[]>(
    () => [
      {
        headerName: 'ID',
        field: 'id',
        width: 80,
        filter: 'agNumberColumnFilter',
        sortable: true,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
        headerClass: 'ag-header-cell-center',
      },
      {
        headerName: '제목',
        field: 'title',
        flex: 2,
        minWidth: 300,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: TitleCellRenderer,
        cellStyle: { display: 'flex', alignItems: 'center' } as any,
      },
      {
        headerName: '카테고리',
        field: 'category',
        width: 100,
        cellRenderer: CategoryCellRenderer,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
        headerClass: 'ag-header-cell-center',
      },
      {
        headerName: '상태',
        field: 'status',
        width: 140,
        cellRenderer: StatusCellRenderer,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
        headerClass: 'ag-header-cell-center',
      },
      {
        headerName: '우선순위',
        field: 'priority',
        width: 100,
        cellRenderer: PriorityCellRenderer,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
        headerClass: 'ag-header-cell-center',
      },
      {
        headerName: '작성자',
        field: 'authorName',
        width: 120,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
        headerClass: 'ag-header-cell-center',
      },
      {
        headerName: '담당자',
        field: 'assigneeName',
        width: 120,
        filter: 'agTextColumnFilter',
        sortable: true,
        valueGetter: (params) => params.data?.assigneeName || '미지정',
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
        headerClass: 'ag-header-cell-center',
      },
      {
        headerName: '생성일',
        field: 'createdAt',
        width: 140,
        valueFormatter: (params) => {
          return new Date(params.value).toLocaleDateString('ko-KR')
        },
        filter: 'agDateColumnFilter',
        sortable: true,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
        headerClass: 'ag-header-cell-center',
      },
    ],
    []
  )

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      wrapHeaderText: true,
      autoHeaderHeight: true,
    }),
    []
  )

  const handleCreateIssue = () => {
    // TODO: 이슈 생성 모달 또는 페이지로 이동
    console.log('Create issue')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">로딩 중...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-destructive">
          {error instanceof Error ? error.message : '이슈 목록을 불러오지 못했습니다.'}
        </p>
        <Button onClick={() => refetch()}>다시 시도</Button>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">이슈 관리</h1>
          <p className="text-muted-foreground mt-2">
            프로젝트 이슈를 등록하고 관리할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleCreateIssue}>
          <Plus className="w-4 h-4 mr-2" />
          새 이슈
        </Button>
      </div>

      <div style={{ height: '650px', width: '100%' }}>
        <AgGridReact<Issue>
          ref={gridRef}
          rowData={issues}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          animateRows={true}
          suppressRowClickSelection={true}
          suppressCellFocus={true}
          localeText={localeText}
          theme={themeQuartz.withParams({
            headerHeight: 48,
            rowHeight: 48,
            fontSize: 13,
            headerFontSize: 13,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
          })}
        />
      </div>

      {issues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">등록된 이슈가 없습니다.</p>
        </div>
      )}

      <ConfirmDialog />
    </div>
  )
}
