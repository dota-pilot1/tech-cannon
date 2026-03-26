import { useMemo, useRef, useState, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, RowSelectedEvent } from 'ag-grid-community'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog'
import { Checkbox } from '@/shared/ui/checkbox'
import { useIssues, useIssue, useUpdateIssue, useCreateIssue, useDeleteIssue, useUpdateIssueStatus, useUpdateIssueAssignee } from '@/features/issue/hooks/useIssues'
import { useIssueImages, useUploadIssueImage, useDeleteIssueImage } from '@/features/issue/hooks/useIssueImages'
import { useIssueAssignees, useUpdateIssueAssignees } from '@/features/issue/hooks/useIssueAssignees'
import type { Issue, IssueStatus, IssuePriority, IssueCategory } from '@/entities/issue/types/issue'
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon, Users, ChevronRight, ChevronLeft } from 'lucide-react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { toast } from 'sonner'
import { useUsers } from '@/features/admin/hooks/useUsers'

// AG-Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule])

export function IssuesPage() {
  const gridRef = useRef<AgGridReact>(null)

  // 상태 관리
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // 수정된 행 추적
  const [modifiedRowIds, setModifiedRowIds] = useState<Set<number>>(new Set())

  // 필터 상태
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [searchKeyword, setSearchKeyword] = useState('')

  // 폼 데이터
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCategory, setFormCategory] = useState<IssueCategory>('COMMON')
  const [formStatus, setFormStatus] = useState<IssueStatus>('OPEN')
  const [formPriority, setFormPriority] = useState<IssuePriority>('MEDIUM')

  // API 호출
  const { data: issuesData } = useIssues({
    status: filterStatus === 'ALL' ? undefined : (filterStatus as IssueStatus),
    category: filterCategory === 'ALL' ? undefined : (filterCategory as IssueCategory),
    keyword: searchKeyword || undefined,
  })

  const { data: issueDetail } = useIssue(selectedIssueId!, {
    enabled: !!selectedIssueId && !isEditing,
  })

  const { mutate: createIssue } = useCreateIssue()
  const { mutate: updateIssue } = useUpdateIssue()
  const { mutate: deleteIssue } = useDeleteIssue()
  const { mutate: updateStatus } = useUpdateIssueStatus()
  const { mutate: updateAssignee } = useUpdateIssueAssignee()
  const { confirm, ConfirmDialog } = useConfirm()

  // 사용자 목록 (담당자 선택용)
  const { data: usersData } = useUsers()
  const users = usersData || []

  // 담당자 관련
  const [assigneeDialogIssueId, setAssigneeDialogIssueId] = useState<number | null>(null)
  const { data: issueAssignees } = useIssueAssignees(assigneeDialogIssueId || selectedIssueId)
  const { mutate: updateAssignees } = useUpdateIssueAssignees(assigneeDialogIssueId || selectedIssueId!)
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [userSearchKeyword, setUserSearchKeyword] = useState('')

  // 이미지 관련
  const { data: issueImages } = useIssueImages(selectedIssueId)
  const { mutate: uploadImage, isPending: isUploading } = useUploadIssueImage(selectedIssueId!)
  const { mutate: deleteImage } = useDeleteIssueImage(selectedIssueId!)
  const [isDragging, setIsDragging] = useState(false)
  const [isPasteMode, setIsPasteMode] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const uploadAreaRef = useRef<HTMLDivElement>(null)

  const issues = issuesData?.items || []

  // 담당자 다이얼로그 열릴 때 현재 담당자 목록 로드
  useEffect(() => {
    if (isAssigneeDialogOpen && issueAssignees) {
      const currentAssigneeIds = issueAssignees.map((a) => a.userId)
      setSelectedUserIds(currentAssigneeIds)
      setUserSearchKeyword('') // 검색어 초기화
    }
  }, [isAssigneeDialogOpen, issueAssignees])

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

  // 상태 레이블
  const statusLabels: Record<IssueStatus, string> = {
    OPEN: '진행 전',
    IN_PROGRESS: '진행 중',
    CLOSED: '완료',
  }

  // 셀 값 변경 핸들러 (수정 플래그만 설정, 저장은 안함)
  const onCellValueChanged = (params: any) => {
    const { data, newValue, oldValue } = params

    if (newValue === oldValue) return

    // 수정된 행 ID 추가
    setModifiedRowIds((prev) => new Set(prev).add(data.id))

    // 그리드 행 스타일 업데이트를 위해 리프레시
    params.api.refreshCells({ rowNodes: [params.node], force: true })
  }

  // 새 행 추가
  const handleAddRow = () => {
    const newRow: Partial<Issue> = {
      id: -(Date.now()), // 음수 ID = 신규
      title: '',
      content: '',
      category: 'COMMON',
      status: 'OPEN',
      priority: 'MEDIUM',
      assigneeName: '',
    }

    gridRef.current?.api.applyTransaction({ add: [newRow as Issue], addIndex: 0 })
    setModifiedRowIds((prev) => new Set(prev).add(newRow.id!))
  }

  // 선택된 행 삭제
  const handleDeleteSelected = async () => {
    const selectedRows = gridRef.current?.api.getSelectedRows() || []

    if (selectedRows.length === 0) {
      toast.info('삭제할 행을 선택하세요.')
      return
    }

    const confirmed = await confirm({
      title: '행 삭제',
      description: `선택한 ${selectedRows.length}개 행을 삭제하시겠습니까?`,
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'destructive',
    })

    if (!confirmed) return

    // 기존 이슈 삭제 (API 호출)
    const existingIssues = selectedRows.filter((r) => r.id > 0)
    for (const row of existingIssues) {
      await deleteIssue(row.id)
    }

    // 그리드에서 제거
    gridRef.current?.api.applyTransaction({ remove: selectedRows })

    // 수정 플래그에서 제거
    const idsToRemove = selectedRows.map((r) => r.id)
    setModifiedRowIds((prev) => {
      const newSet = new Set(prev)
      idsToRemove.forEach((id) => newSet.delete(id))
      return newSet
    })

    toast.success(`${selectedRows.length}개 항목이 삭제되었습니다.`)
  }

  // 수정/신규 행 일괄 저장
  const handleSaveModified = async () => {
    if (modifiedRowIds.size === 0) {
      toast.info('수정된 항목이 없습니다.')
      return
    }

    const modifiedRows: Issue[] = []
    gridRef.current?.api.forEachNode((node) => {
      if (modifiedRowIds.has(node.data.id)) {
        modifiedRows.push(node.data)
      }
    })

    // 신규/수정 구분
    const newRows = modifiedRows.filter((r) => r.id < 0)
    const updatedRows = modifiedRows.filter((r) => r.id > 0)

    // 신규 행 생성
    for (const row of newRows) {
      await createIssue({
        title: row.title || '제목 없음',
        content: row.content || '',
        category: row.category,
        status: row.status,
        priority: row.priority,
      })
    }

    // 수정된 행 업데이트
    for (const row of updatedRows) {
      await updateIssue({
        id: row.id,
        request: {
          title: row.title,
          content: row.content,
          category: row.category,
          status: row.status,
          priority: row.priority,
        },
      })
    }

    // 저장 후 그리드에서 음수 ID 행 제거
    if (newRows.length > 0) {
      gridRef.current?.api.applyTransaction({ remove: newRows })
    }

    // 수정 플래그 초기화
    setModifiedRowIds(new Set())
    toast.success(`신규 ${newRows.length}개, 수정 ${updatedRows.length}개 항목이 저장되었습니다.`)
  }

  // 컬럼 정의 (좌측 목록용 - 간소화)
  const columnDefs = useMemo<ColDef<Issue>[]>(
    () => [
      {
        headerName: '',
        width: 50,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        suppressMovable: true,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
      },
      {
        headerName: '제목',
        field: 'title',
        flex: 1,
        minWidth: 200,
        editable: true,
        cellStyle: { display: 'flex', alignItems: 'center' } as any,
      },
      {
        headerName: '상태',
        field: 'status',
        width: 100,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
        },
        valueFormatter: (params: any) => {
          const status = params.value as IssueStatus
          return statusLabels[status] || status
        },
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
      },
      {
        headerName: '요청자',
        field: 'authorName',
        width: 100,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
      },
      {
        headerName: '담당자',
        field: 'assigneeName',
        width: 120,
        cellRenderer: (params: any) => {
          const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            setAssigneeDialogIssueId(params.data.id)
            setIsAssigneeDialogOpen(true)
          }

          // 담당자 정보 조회 (useQuery 대신 간단하게 표시)
          const AssigneeCell = () => {
            const { data: assignees } = useIssueAssignees(params.data.id)
            const count = assignees?.length || 0

            if (count === 0) {
              return <span className="text-muted-foreground">미지정</span>
            } else if (count === 1) {
              return <span>{assignees![0].username}</span>
            } else {
              return <span>{assignees![0].username} 외 {count - 1}명</span>
            }
          }

          return (
            <div
              onClick={handleClick}
              className="cursor-pointer hover:text-blue-600 hover:underline w-full h-full flex items-center justify-center"
            >
              <AssigneeCell />
            </div>
          )
        },
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 } as any,
      },
    ],
    []
  )

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  )

  // 수정된 행 및 선택된 행에 스타일 적용
  const rowClassRules = useMemo(
    () => ({
      'bg-yellow-50': (params: any) => modifiedRowIds.has(params.data.id),
      'bg-blue-50': (params: any) => params.data.id === selectedIssueId,
    }),
    [modifiedRowIds, selectedIssueId]
  )

  // 행 클릭 이벤트 (상세 보기)
  const onRowClicked = (event: any) => {
    setSelectedIssueId(event.data.id)
    setIsEditing(false)
  }

  // 신규 작성
  const handleNew = () => {
    setSelectedIssueId(null)
    setFormTitle('')
    setFormContent('')
    setFormCategory('COMMON')
    setFormStatus('OPEN')
    setFormPriority('MEDIUM')
    setIsEditing(true)
  }

  // 수정 모드로 전환
  const handleEdit = () => {
    if (!issueDetail) return
    setFormTitle(issueDetail.title)
    setFormContent(issueDetail.content)
    setFormCategory(issueDetail.category)
    setFormStatus(issueDetail.status)
    setFormPriority(issueDetail.priority)
    setIsEditing(true)
  }

  // 저장
  const handleSave = () => {
    if (!formTitle.trim()) {
      toast.error('제목을 입력하세요')
      return
    }
    if (!formContent.trim()) {
      toast.error('내용을 입력하세요')
      return
    }

    const data = {
      title: formTitle,
      content: formContent,
      category: formCategory,
      status: formStatus,
      priority: formPriority,
    }

    if (selectedIssueId) {
      // 수정
      updateIssue({ id: selectedIssueId, request: data }, {
        onSuccess: () => {
          setIsEditing(false)
        },
      })
    } else {
      // 신규 생성
      createIssue(data, {
        onSuccess: () => {
          setIsEditing(false)
          setSelectedIssueId(null)
        },
      })
    }
  }

  // 취소
  const handleCancel = () => {
    if (selectedIssueId) {
      setIsEditing(false)
    } else {
      setIsEditing(false)
      setSelectedIssueId(null)
    }
  }

  // 삭제
  const handleDelete = async () => {
    if (!selectedIssueId) return

    const confirmed = await confirm({
      title: '이슈 삭제',
      description: '정말로 이 이슈를 삭제하시겠습니까? 모든 댓글과 체크리스트도 함께 삭제됩니다.',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'destructive',
    })

    if (confirmed) {
      deleteIssue(selectedIssueId, {
        onSuccess: () => {
          setSelectedIssueId(null)
          setIsEditing(false)
        },
      })
    }
  }

  // 상태 변경
  const handleStatusChange = (newStatus: IssueStatus) => {
    if (!selectedIssueId) return
    updateStatus({ id: selectedIssueId, status: newStatus })
  }

  // 우선순위 변경
  const handlePriorityChange = (newPriority: IssuePriority) => {
    if (!selectedIssueId || !issueDetail) return
    updateIssue({
      id: selectedIssueId,
      request: {
        title: issueDetail.title,
        content: issueDetail.content,
        category: issueDetail.category,
        status: issueDetail.status,
        priority: newPriority,
      },
    })
  }

  // 카테고리 변경
  const handleCategoryChange = (newCategory: IssueCategory) => {
    if (!selectedIssueId || !issueDetail) return
    updateIssue({
      id: selectedIssueId,
      request: {
        title: issueDetail.title,
        content: issueDetail.content,
        category: newCategory,
        status: issueDetail.status,
        priority: issueDetail.priority,
      },
    })
  }

  // 담당자 Dialog 열기
  const openAssigneeDialog = () => {
    if (!selectedIssueId) return
    // 현재 담당자 목록으로 초기화
    const currentAssigneeIds = issueAssignees?.map((a) => a.userId) || []
    setSelectedUserIds(currentAssigneeIds)
    setIsAssigneeDialogOpen(true)
  }

  // 담당자 변경 저장
  const handleSaveAssignees = () => {
    const targetIssueId = assigneeDialogIssueId || selectedIssueId
    if (!targetIssueId) return
    updateAssignees(selectedUserIds, {
      onSuccess: () => {
        setIsAssigneeDialogOpen(false)
        setAssigneeDialogIssueId(null)
      },
    })
  }

  // 담당자 추가 (왼쪽 → 오른쪽)
  const addAssignee = (userId: number) => {
    setSelectedUserIds((prev) => [...prev, userId])
  }

  // 담당자 제거 (오른쪽 → 왼쪽)
  const removeAssignee = (userId: number) => {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId))
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter((file) => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      toast.error('이미지 파일만 업로드 가능합니다.')
      return
    }

    imageFiles.forEach((file) => {
      uploadImage(file)
    })
  }

  // 드래그앤드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files)
    }
  }

  // 업로드 영역 클릭 (활성화)
  const handleUploadAreaClick = () => {
    setIsPasteMode(true)
    uploadAreaRef.current?.focus()
  }

  // 포커스를 잃으면 비활성화
  const handleUploadAreaBlur = () => {
    setIsPasteMode(false)
  }

  // 붙여넣기 핸들러 (활성화 상태일 때만)
  const handlePaste = (e: React.ClipboardEvent) => {
    if (!isPasteMode) return

    const items = e.clipboardData?.items
    if (!items) return

    const imageItems = Array.from(items).filter((item) => item.type.startsWith('image/'))
    if (imageItems.length === 0) return

    const files = imageItems.map((item) => item.getAsFile()).filter((file): file is File => file !== null)
    if (files.length > 0) {
      handleImageUpload(files)
    }
  }

  const getStatusBadgeVariant = (status: IssueStatus) => {
    switch (status) {
      case 'OPEN':
        return 'destructive'
      case 'IN_PROGRESS':
        return 'default'
      case 'CLOSED':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getPriorityBadgeVariant = (priority: IssuePriority) => {
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

  const categoryLabels: Record<IssueCategory, string> = {
    COMMON: '일반',
    BUG: '버그',
    FEATURE: '기능',
    IMPROVEMENT: '개선',
    QUESTION: '질문',
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 헤더 */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">이슈 관리</h1>
            <p className="text-muted-foreground mt-1">프로젝트 이슈를 등록하고 관리할 수 있습니다.</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            새 이슈
          </Button>
        </div>

        {/* 필터 */}
        <div className="flex gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value="OPEN">진행 전</SelectItem>
              <SelectItem value="IN_PROGRESS">진행 중</SelectItem>
              <SelectItem value="CLOSED">완료</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 카테고리</SelectItem>
              <SelectItem value="COMMON">일반</SelectItem>
              <SelectItem value="BUG">버그</SelectItem>
              <SelectItem value="FEATURE">기능</SelectItem>
              <SelectItem value="IMPROVEMENT">개선</SelectItem>
              <SelectItem value="QUESTION">질문</SelectItem>
            </SelectContent>
          </Select>

          <input
            type="text"
            placeholder="제목 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="px-3 py-2 border border-input rounded-md flex-1 max-w-md"
          />
        </div>
      </div>

      {/* 메인 컨텐츠: 좌우 분할 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: 이슈 목록 */}
        <div className="w-[55%] border-r border-border p-4 overflow-hidden flex flex-col">
          {/* Grid Toolbar */}
          <div className="flex justify-end gap-2 mb-2 pb-2 border-b">
            <Button onClick={handleAddRow} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              행 추가
            </Button>
            {modifiedRowIds.size > 0 && (
              <Button onClick={handleSaveModified} size="sm" variant="default">
                저장 ({modifiedRowIds.size})
              </Button>
            )}
            <Button onClick={handleDeleteSelected} size="sm" variant="destructive">
              <Trash2 className="w-4 h-4 mr-1" />
              삭제
            </Button>
          </div>

          <div className="flex-1" style={{ height: '100%' }}>
            <AgGridReact<Issue>
              ref={gridRef}
              rowData={issues}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              onRowClicked={onRowClicked}
              onCellValueChanged={onCellValueChanged}
              rowClassRules={rowClassRules}
              animateRows={true}
              theme={themeQuartz.withParams({
                headerHeight: 40,
                rowHeight: 40,
                fontSize: 13,
                headerFontSize: 13,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              })}
              localeText={localeText}
            />
          </div>
        </div>

        {/* 우측: 이슈 상세 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isEditing ? (
            /* 편집 모드 */
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedIssueId ? '이슈 수정' : '새 이슈 작성'}
                </h2>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>저장</Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    취소
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">카테고리</label>
                    <Select value={formCategory} onValueChange={(v) => setFormCategory(v as IssueCategory)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMMON">일반</SelectItem>
                        <SelectItem value="BUG">버그</SelectItem>
                        <SelectItem value="FEATURE">기능</SelectItem>
                        <SelectItem value="IMPROVEMENT">개선</SelectItem>
                        <SelectItem value="QUESTION">질문</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">상태</label>
                    <Select value={formStatus} onValueChange={(v) => setFormStatus(v as IssueStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">진행 전</SelectItem>
                        <SelectItem value="IN_PROGRESS">진행 중</SelectItem>
                        <SelectItem value="CLOSED">완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">우선순위</label>
                  <Select value={formPriority} onValueChange={(v) => setFormPriority(v as IssuePriority)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">낮음</SelectItem>
                      <SelectItem value="MEDIUM">보통</SelectItem>
                      <SelectItem value="HIGH">높음</SelectItem>
                      <SelectItem value="CRITICAL">긴급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">제목 *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                    placeholder="이슈 제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">내용 *</label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm"
                    placeholder="이슈 내용을 입력하세요"
                  />
                </div>
              </div>
            </div>
          ) : issueDetail ? (
            /* 조회 모드 */
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{issueDetail.title}</h2>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <span>#{issueDetail.id}</span>
                    <span>•</span>
                    <span>{issueDetail.authorName}</span>
                    <span>•</span>
                    <span>{new Date(issueDetail.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    수정
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="border rounded-lg overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="bg-muted px-4 py-2 font-medium w-32">카테고리</td>
                      <td className="px-4 py-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-accent"
                            >
                              {categoryLabels[issueDetail.category]}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-2">
                            <div className="space-y-1">
                              {(Object.keys(categoryLabels) as IssueCategory[]).map((cat) => (
                                <div
                                  key={cat}
                                  className={`px-3 py-2 rounded cursor-pointer hover:bg-accent ${
                                    cat === issueDetail.category ? 'bg-accent' : ''
                                  }`}
                                  onClick={() => handleCategoryChange(cat)}
                                >
                                  {categoryLabels[cat]}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="bg-muted px-4 py-2 font-medium w-32">작성자</td>
                      <td className="px-4 py-2">{issueDetail.authorName}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-muted px-4 py-2 font-medium">상태</td>
                      <td className="px-4 py-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge
                              variant={getStatusBadgeVariant(issueDetail.status)}
                              className="cursor-pointer hover:opacity-80"
                            >
                              {statusLabels[issueDetail.status]}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-2">
                            <div className="space-y-1">
                              {(Object.keys(statusLabels) as IssueStatus[]).map((status) => (
                                <div
                                  key={status}
                                  className={`px-3 py-2 rounded cursor-pointer hover:bg-accent ${
                                    status === issueDetail.status ? 'bg-accent' : ''
                                  }`}
                                  onClick={() => handleStatusChange(status)}
                                >
                                  {statusLabels[status]}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="bg-muted px-4 py-2 font-medium">우선순위</td>
                      <td className="px-4 py-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge
                              variant={getPriorityBadgeVariant(issueDetail.priority)}
                              className="cursor-pointer hover:opacity-80"
                            >
                              {priorityLabels[issueDetail.priority]}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-2">
                            <div className="space-y-1">
                              {(Object.keys(priorityLabels) as IssuePriority[]).map((priority) => (
                                <div
                                  key={priority}
                                  className={`px-3 py-2 rounded cursor-pointer hover:bg-accent ${
                                    priority === issueDetail.priority ? 'bg-accent' : ''
                                  }`}
                                  onClick={() => handlePriorityChange(priority)}
                                >
                                  {priorityLabels[priority]}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-muted px-4 py-2 font-medium">담당자</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {issueAssignees && issueAssignees.length > 0 ? (
                            <>
                              {issueAssignees.map((assignee) => (
                                <Badge key={assignee.userId} variant="outline">
                                  {assignee.username}
                                </Badge>
                              ))}
                            </>
                          ) : (
                            <span className="text-muted-foreground">미지정</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={openAssigneeDialog}
                            className="h-6 px-2"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            변경
                          </Button>
                        </div>
                      </td>
                      <td className="bg-muted px-4 py-2 font-medium">폴더</td>
                      <td className="px-4 py-2">{issueDetail.folderId || '-'}</td>
                    </tr>
                    <tr>
                      <td className="bg-muted px-4 py-2 font-medium">작성일</td>
                      <td className="px-4 py-2">{new Date(issueDetail.createdAt).toLocaleString('ko-KR')}</td>
                      <td className="bg-muted px-4 py-2 font-medium">수정일</td>
                      <td className="px-4 py-2">{new Date(issueDetail.updatedAt).toLocaleString('ko-KR')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 이미지 */}
              <div className="border rounded-lg p-4 mb-6" onPaste={handlePaste}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold">첨부 이미지</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? '업로드 중...' : '이미지 추가'}
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  />
                </div>

                {/* 드래그앤드롭 영역 */}
                <div
                  ref={uploadAreaRef}
                  tabIndex={0}
                  className={`border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer outline-none ${
                    isPasteMode
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={handleUploadAreaClick}
                  onBlur={handleUploadAreaBlur}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {issueImages && issueImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {issueImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative group aspect-square rounded overflow-hidden border bg-gray-100"
                        >
                          <img
                            src={image.url}
                            alt={image.filename}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => window.open(image.url, '_blank')}
                          />
                          <button
                            onClick={() => deleteImage(image.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center transition-opacity leading-none"
                          >
                            ✕
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.filename}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      {isPasteMode ? (
                        <p className="text-sm text-primary font-medium">
                          Ctrl+V로 이미지를 붙여넣으세요
                        </p>
                      ) : (
                        <p className="text-sm">
                          이미지를 드래그하여 놓거나, 클릭하여 활성화 후 Ctrl+V로 붙여넣으세요
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 내용 */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-3">내용</h3>
                <div className="whitespace-pre-wrap text-sm">{issueDetail.content}</div>
              </div>

              {/* TODO: 체크리스트 섹션 */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-3">체크리스트</h3>
                <p className="text-sm text-muted-foreground">구현 예정</p>
              </div>

              {/* TODO: 댓글 섹션 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold mb-3">댓글</h3>
                <p className="text-sm text-muted-foreground">구현 예정</p>
              </div>
            </div>
          ) : (
            /* 선택 안됨 */
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>왼쪽 목록에서 이슈를 선택하거나 새 이슈를 작성하세요.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog />

      {/* 담당자 선택 Dialog */}
      <Dialog open={isAssigneeDialogOpen} onOpenChange={setIsAssigneeDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>담당자 선택</DialogTitle>
          </DialogHeader>

          <div className="flex gap-6 py-4">
            {/* 왼쪽: 선택된 담당자 */}
            <div className="flex-1 border rounded-md p-4 bg-blue-50">
              <h3 className="font-semibold mb-3 text-sm">선택된 담당자</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {users
                  .filter((user) => selectedUserIds.includes(user.id))
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-blue-100 rounded cursor-pointer"
                      onClick={() => removeAssignee(user.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                {selectedUserIds.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    선택된 담당자가 없습니다
                  </div>
                )}
              </div>
            </div>

            {/* 가운데: 화살표 버튼 */}
            <div className="flex flex-col justify-center gap-2">
              <div className="text-muted-foreground text-xs text-center">클릭하여<br />이동</div>
            </div>

            {/* 오른쪽: 선택 가능한 사용자 */}
            <div className="flex-1 border rounded-md p-4">
              <h3 className="font-semibold mb-3 text-sm">사용자 목록</h3>

              {/* 검색 입력 */}
              <input
                type="text"
                placeholder="이름 또는 이메일 검색..."
                value={userSearchKeyword}
                onChange={(e) => setUserSearchKeyword(e.target.value)}
                className="w-full px-3 py-2 mb-3 border border-input rounded-md text-sm"
              />

              <div className="space-y-1 max-h-80 overflow-y-auto">
                {users
                  .filter((user) => !selectedUserIds.includes(user.id))
                  .filter((user) => {
                    if (!userSearchKeyword) return true
                    const keyword = userSearchKeyword.toLowerCase()
                    return (
                      user.username.toLowerCase().includes(keyword) ||
                      user.email.toLowerCase().includes(keyword)
                    )
                  })
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                      onClick={() => addAssignee(user.id)}
                    >
                      <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 ml-2">
                        <div className="font-medium text-sm">{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssigneeDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveAssignees}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
