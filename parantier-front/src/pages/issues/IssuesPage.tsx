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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useIssues, useIssue, useUpdateIssue, useCreateIssue, useDeleteIssue, useUpdateIssueStatus, useUpdateIssueAssignee } from '@/features/issue/hooks/useIssues'
import { useIssueImages, useUploadIssueImage, useDeleteIssueImage } from '@/features/issue/hooks/useIssueImages'
import { useIssueAssignees, useUpdateIssueAssignees } from '@/features/issue/hooks/useIssueAssignees'
import { useIssueChecklists, useCreateChecklist, useToggleChecklist, useDeleteChecklist } from '@/features/issue/hooks/useIssueChecklists'
import { useIssueMindmaps, useCreateMindmap, useUpdateMindmap, useDeleteMindmap } from '@/features/issue/hooks/useIssueMindmaps'
import { useIssueTasks, useLinkTask, useUnlinkTask } from '@/features/issue/hooks/useIssueTasks'
import { useIssueDbTables, useCreateDbTable, useUpdateDbTable, useDeleteDbTable } from '@/features/issue/hooks/useIssueDbTables'
import type { Issue, IssueStatus, IssuePriority, IssueCategory } from '@/entities/issue/types/issue'
import type { DbColumn, DbTableContent } from '@/entities/issue/types/issueDbTable'
import { parseTsvToColumns, parseDbTableContent } from '@/entities/issue/types/issueDbTable'
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon, Users, ChevronRight, ChevronLeft, FileText, Database } from 'lucide-react'
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
  const mmdInputRef = useRef<HTMLInputElement>(null)

  // 체크리스트 관련
  const { data: checklists } = useIssueChecklists(selectedIssueId)
  const { mutate: createChecklist } = useCreateChecklist(selectedIssueId!)
  const { mutate: toggleChecklist } = useToggleChecklist(selectedIssueId!)
  const { mutate: deleteChecklist } = useDeleteChecklist(selectedIssueId!)
  const [newChecklistContent, setNewChecklistContent] = useState('')

  // 마인드맵 관련
  const { data: mindmaps } = useIssueMindmaps(selectedIssueId)
  const { mutate: createMindmap } = useCreateMindmap(selectedIssueId!)
  const { mutate: updateMindmap } = useUpdateMindmap(selectedIssueId!)
  const { mutate: deleteMindmap } = useDeleteMindmap(selectedIssueId!)
  const [selectedMindmapId, setSelectedMindmapId] = useState<number | null>(null)
  const [mindmapTitle, setMindmapTitle] = useState('')
  const [mindmapContent, setMindmapContent] = useState('')
  const [isMindmapDialogOpen, setIsMindmapDialogOpen] = useState(false)

  // 업무 연결 관련
  const { data: linkedTasks } = useIssueTasks(selectedIssueId)
  const { mutate: linkTask } = useLinkTask(selectedIssueId!)
  const { mutate: unlinkTask } = useUnlinkTask(selectedIssueId!)
  const [taskIdInput, setTaskIdInput] = useState('')

  // DB 테이블 관련
  const { data: dbTables } = useIssueDbTables(selectedIssueId)
  const { mutate: createDbTable } = useCreateDbTable(selectedIssueId!)
  const { mutate: updateDbTable } = useUpdateDbTable(selectedIssueId!)
  const { mutate: deleteDbTable } = useDeleteDbTable(selectedIssueId!)
  const [selectedDbTableId, setSelectedDbTableId] = useState<number | null>(null)
  const [dbTableContent, setDbTableContent] = useState<DbTableContent>({
    tableName: '',
    schema: '',
    category: '',
    description: '',
    columns: [],
  })
  const [isDbTableDialogOpen, setIsDbTableDialogOpen] = useState(false)

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

    // 수정된 행 자동 선택 (체크박스)
    params.node.setSelected(true)

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

  // 체크리스트 추가
  const handleAddChecklist = () => {
    if (!newChecklistContent.trim()) {
      toast.error('체크리스트 내용을 입력하세요')
      return
    }

    const orderNum = (checklists?.length || 0)
    createChecklist({ content: newChecklistContent, orderNum })
    setNewChecklistContent('')
  }

  // 체크리스트 삭제
  const handleDeleteChecklistItem = async (checklistId: number) => {
    const confirmed = await confirm({
      title: '체크리스트 삭제',
      description: '이 항목을 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'destructive',
    })

    if (confirmed) {
      deleteChecklist(checklistId)
    }
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
      uploadImage({ file, fileType: 'image' })
    })
  }

  // 마인드맵 추가/수정 다이얼로그 열기
  const handleOpenMindmapDialog = (mindmapId?: number) => {
    if (mindmapId) {
      const mindmap = mindmaps?.find((m) => m.id === mindmapId)
      if (mindmap) {
        setSelectedMindmapId(mindmapId)
        setMindmapTitle(mindmap.title)
        setMindmapContent(mindmap.content)
      }
    } else {
      setSelectedMindmapId(null)
      setMindmapTitle('')
      setMindmapContent('')
    }
    setIsMindmapDialogOpen(true)
  }

  // 마인드맵 저장
  const handleSaveMindmap = () => {
    if (!mindmapTitle.trim()) {
      toast.error('제목을 입력하세요')
      return
    }
    if (!mindmapContent.trim()) {
      toast.error('내용을 입력하세요')
      return
    }

    if (selectedMindmapId) {
      // 수정
      const mindmap = mindmaps?.find((m) => m.id === selectedMindmapId)
      updateMindmap({
        mindmapId: selectedMindmapId,
        request: {
          title: mindmapTitle,
          content: mindmapContent,
          orderNum: mindmap?.orderNum || 0,
        },
      })
    } else {
      // 새로 추가
      const orderNum = (mindmaps?.length || 0)
      createMindmap({
        title: mindmapTitle,
        content: mindmapContent,
        orderNum,
      })
    }

    setIsMindmapDialogOpen(false)
    setMindmapTitle('')
    setMindmapContent('')
    setSelectedMindmapId(null)
  }

  // 마인드맵 삭제
  const handleDeleteMindmap = async (mindmapId: number) => {
    const confirmed = await confirm({
      title: '마인드맵 삭제',
      description: '이 마인드맵을 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'destructive',
    })

    if (confirmed) {
      deleteMindmap(mindmapId)
    }
  }

  // 업무 연결
  const handleLinkTask = () => {
    const taskPostId = parseInt(taskIdInput)
    if (isNaN(taskPostId)) {
      toast.error('올바른 업무 ID를 입력하세요')
      return
    }

    const orderNum = (linkedTasks?.length || 0)
    linkTask({ taskPostId, orderNum })
    setTaskIdInput('')
  }

  // 업무 연결 해제
  const handleUnlinkTask = async (linkId: number) => {
    const confirmed = await confirm({
      title: '업무 연결 해제',
      description: '이 업무와의 연결을 해제하시겠습니까?',
      confirmText: '해제',
      cancelText: '취소',
      variant: 'destructive',
    })

    if (confirmed) {
      unlinkTask(linkId)
    }
  }

  // DB 테이블 다이얼로그 열기
  const handleOpenDbTableDialog = (dbTableId?: number) => {
    if (dbTableId) {
      const dbTable = dbTables?.find((t) => t.id === dbTableId)
      if (dbTable) {
        setSelectedDbTableId(dbTableId)
        const content = parseDbTableContent(dbTable.tableInfo)
        setDbTableContent(content)
      }
    } else {
      setSelectedDbTableId(null)
      setDbTableContent({
        tableName: '',
        schema: '',
        category: '',
        description: '',
        columns: [],
      })
    }
    setIsDbTableDialogOpen(true)
  }

  // DB 테이블 저장
  const handleSaveDbTable = () => {
    if (!dbTableContent.tableName.trim()) {
      toast.error('테이블명을 입력하세요')
      return
    }
    if (dbTableContent.columns.length === 0) {
      toast.error('최소 1개 이상의 컬럼을 추가하세요')
      return
    }

    const tableInfo = JSON.stringify(dbTableContent)
    const tableName = dbTableContent.tableName

    if (selectedDbTableId) {
      const dbTable = dbTables?.find((t) => t.id === selectedDbTableId)
      updateDbTable({
        dbTableId: selectedDbTableId,
        request: {
          tableName,
          tableInfo,
          orderNum: dbTable?.orderNum || 0,
        },
      })
    } else {
      const orderNum = (dbTables?.length || 0)
      createDbTable({
        tableName,
        tableInfo,
        orderNum,
      })
    }

    setIsDbTableDialogOpen(false)
    setDbTableContent({
      tableName: '',
      schema: '',
      category: '',
      description: '',
      columns: [],
    })
    setSelectedDbTableId(null)
  }

  // TSV 붙여넣기 핸들러
  const handleTsvPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text/plain')
    if (text.includes('\t')) {
      e.preventDefault()
      const parsed = parseTsvToColumns(text)
      if (parsed.length > 0) {
        setDbTableContent((prev) => ({
          ...prev,
          columns: parsed,
        }))
        toast.success(`${parsed.length}개 컬럼 파싱 완료`)
      } else {
        toast.error('유효한 테이블 컬럼 데이터를 찾을 수 없습니다')
      }
    }
  }

  // 컬럼 추가
  const handleAddColumn = () => {
    const newCol: DbColumn = {
      no: dbTableContent.columns.length + 1,
      name: '',
      comment: '',
      type: 'VARCHAR',
      size: '',
      pk: false,
      notNull: false,
      note: '',
    }
    setDbTableContent((prev) => ({
      ...prev,
      columns: [...prev.columns, newCol],
    }))
  }

  // 컬럼 삭제
  const handleDeleteColumn = (index: number) => {
    setDbTableContent((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index).map((col, i) => ({ ...col, no: i + 1 })),
    }))
  }

  // 컬럼 업데이트
  const handleUpdateColumn = (index: number, field: keyof DbColumn, value: string | number | boolean) => {
    setDbTableContent((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) => (i === index ? { ...col, [field]: value } : col)),
    }))
  }

  // DB 테이블 삭제
  const handleDeleteDbTable = async (dbTableId: number) => {
    const confirmed = await confirm({
      title: 'DB 테이블 삭제',
      description: '이 DB 테이블 정보를 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'destructive',
    })

    if (confirmed) {
      deleteDbTable(dbTableId)
    }
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

              {/* 첨부 파일 */}
              <div className="border rounded-lg p-4 mb-6" onPaste={handlePaste}>
                <Tabs defaultValue="images" className="w-full">
                  <TabsList className="mb-3">
                    <TabsTrigger value="images">이미지</TabsTrigger>
                    <TabsTrigger value="mmd">마인드맵 (MMD)</TabsTrigger>
                    <TabsTrigger value="tasks">DB 테이블</TabsTrigger>
                  </TabsList>

                  {/* 이미지 탭 */}
                  <TabsContent value="images">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">이미지 첨부</h3>
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
                      {issueImages && issueImages.filter((img) => img.fileType === 'image' || !img.fileType).length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {issueImages.filter((img) => img.fileType === 'image' || !img.fileType).map((image) => (
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
                  </TabsContent>

                  {/* MMD 탭 */}
                  <TabsContent value="mmd">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">마인드맵 (MMD)</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenMindmapDialog()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        마인드맵 추가
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {mindmaps && mindmaps.length > 0 ? (
                        mindmaps.map((mindmap) => (
                          <div
                            key={mindmap.id}
                            className="flex items-center justify-between p-3 border rounded hover:bg-accent group cursor-pointer"
                            onClick={() => handleOpenMindmapDialog(mindmap.id)}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm font-medium">{mindmap.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteMindmap(mindmap.id)
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">마인드맵을 추가하세요</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* DB 테이블 탭 */}
                  <TabsContent value="tasks">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">DB 테이블 정보</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDbTableDialog()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        테이블 정보 추가
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {dbTables && dbTables.length > 0 ? (
                        dbTables.map((dbTable) => {
                          const content = parseDbTableContent(dbTable.tableInfo)
                          return (
                            <div
                              key={dbTable.id}
                              className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                              {/* 테이블 헤더 */}
                              <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Database className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <h4 className="font-semibold text-base">{content.tableName}</h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                      {content.schema && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                          {content.schema}
                                        </span>
                                      )}
                                      {content.category && (
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                          {content.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleOpenDbTableDialog(dbTable.id)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteDbTable(dbTable.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>

                              {/* 테이블 설명 */}
                              {content.description && (
                                <div className="px-4 py-2 bg-blue-50 border-b text-sm text-blue-900">
                                  💬 {content.description}
                                </div>
                              )}

                              {/* DDL 또는 컬럼 테이블 */}
                              {content.ddl ? (
                                <div className="p-4">
                                  <pre className="bg-gray-50 border rounded p-3 text-xs font-mono overflow-x-auto">
                                    {content.ddl}
                                  </pre>
                                </div>
                              ) : (
                                <>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-700 text-white">
                                        <tr>
                                          <th className="px-3 py-2 text-center w-12">No</th>
                                          <th className="px-3 py-2 text-left">컬럼명</th>
                                          <th className="px-3 py-2 text-left">설명</th>
                                          <th className="px-3 py-2 text-left">타입</th>
                                          <th className="px-3 py-2 text-center w-16">크기</th>
                                          <th className="px-3 py-2 text-center w-12">PK</th>
                                          <th className="px-3 py-2 text-center w-12">NN</th>
                                          <th className="px-3 py-2 text-left">비고</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {content.columns.map((col, idx) => (
                                          <tr
                                            key={idx}
                                            className={`border-t hover:bg-blue-50 ${
                                              col.pk ? 'bg-amber-50' : ''
                                            }`}
                                          >
                                            <td className="px-3 py-2 text-center text-muted-foreground">
                                              {col.no}
                                            </td>
                                            <td className="px-3 py-2 font-medium font-mono text-sm">
                                              {col.name}
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">
                                              {col.comment}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs text-blue-600">
                                              {col.type}
                                            </td>
                                            <td className="px-3 py-2 text-center text-muted-foreground">
                                              {col.size}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                              {col.pk && <span className="text-amber-600">✓</span>}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                              {col.notNull && <span className="text-blue-600">✓</span>}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-muted-foreground">
                                              {col.note}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}

                              {/* 푸터 */}
                              <div className="px-4 py-2 bg-gray-50 border-t text-xs text-muted-foreground">
                                {content.ddl ? 'DDL 형식' : `${content.columns.length}개 컬럼`}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">DB 테이블 정보를 추가하세요</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* 내용 */}
              <div className="border rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold">내용</h3>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    편집
                  </Button>
                </div>
                <div className="whitespace-pre-wrap text-sm">{issueDetail.content}</div>
              </div>

              {/* 체크리스트 */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-3">체크리스트</h3>

                {/* 체크리스트 목록 */}
                <div className="space-y-2 mb-3">
                  {checklists && checklists.length > 0 ? (
                    checklists.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded group">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleChecklist(item.id)}
                        />
                        <span className={`flex-1 text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                          {item.content}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteChecklistItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      체크리스트가 없습니다
                    </p>
                  )}
                </div>

                {/* 새 항목 추가 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistContent}
                    onChange={(e) => setNewChecklistContent(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddChecklist()}
                    placeholder="새 항목 추가..."
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                  />
                  <Button size="sm" onClick={handleAddChecklist}>
                    <Plus className="w-4 h-4 mr-1" />
                    추가
                  </Button>
                </div>
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

      {/* DB 테이블/마인드맵 작성/편집 다이얼로그 */}
      <Dialog open={isMindmapDialogOpen} onOpenChange={setIsMindmapDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMindmapId ? 'DB 테이블/마인드맵 수정' : 'DB 테이블/마인드맵 추가'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">제목</label>
              <input
                type="text"
                value={mindmapTitle}
                onChange={(e) => setMindmapTitle(e.target.value)}
                placeholder="테이블명 또는 마인드맵 제목 입력"
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                내용
                <span className="text-muted-foreground font-normal ml-2">
                  (DB 테이블 정보 또는 마인드맵 형식으로 작성)
                </span>
              </label>
              <textarea
                value={mindmapContent}
                onChange={(e) => setMindmapContent(e.target.value)}
                placeholder={`DB 테이블 예시:\nCREATE TABLE users (\n  id BIGSERIAL PRIMARY KEY,\n  username VARCHAR(50) NOT NULL,\n  email VARCHAR(100) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n또는 마인드맵 예시:\n프로젝트\n  기획\n    요구사항 정의\n    화면 설계\n  개발\n    프론트엔드\n    백엔드`}
                className="w-full px-3 py-2 border border-input rounded-md text-sm font-mono"
                rows={15}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMindmapDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveMindmap}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DB 테이블 작성/편집 다이얼로그 */}
      <Dialog open={isDbTableDialogOpen} onOpenChange={setIsDbTableDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedDbTableId ? 'DB 테이블 정보 수정' : 'DB 테이블 정보 추가'}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* 테이블 메타데이터 */}
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">
                  테이블명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={dbTableContent.tableName}
                  onChange={(e) => setDbTableContent((prev) => ({ ...prev, tableName: e.target.value }))}
                  placeholder="예: users, task_posts"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">스키마</label>
                <input
                  type="text"
                  value={dbTableContent.schema}
                  onChange={(e) => setDbTableContent((prev) => ({ ...prev, schema: e.target.value }))}
                  placeholder="예: public"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">분류</label>
                <input
                  type="text"
                  value={dbTableContent.category}
                  onChange={(e) => setDbTableContent((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="예: 사용자, 업무"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">테이블 설명</label>
              <input
                type="text"
                value={dbTableContent.description}
                onChange={(e) => setDbTableContent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="이 테이블이 무엇을 저장하는지 설명하세요"
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>

            {/* TSV 붙여넣기 영역 */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-md p-3">
                  <label className="text-sm font-semibold mb-2 block text-amber-900">
                    📋 DBeaver/Excel에서 붙여넣기 (TSV)
                  </label>
              <textarea
                onPaste={handleTsvPaste}
                placeholder={`DBeaver/Excel에서 범위 선택 후 Ctrl+C → 여기에 Ctrl+V\n\n예시:\nNo\t컬럼명\t설명\t타입\t크기\tPK\tNN\t비고\n1\tid\t사용자ID\tBIGINT\t\tY\tY\tPK\n2\tusername\t사용자명\tVARCHAR\t50\t\tY\t`}
                className="w-full px-3 py-2 border border-amber-300 rounded-md text-sm font-mono bg-white"
                rows={4}
              />
              <p className="text-xs text-amber-700 mt-1.5">
                DBeaver에서 테이블 컬럼 정보를 선택하고 복사한 후 위 영역에 붙여넣으면 자동으로 파싱됩니다
              </p>
            </div>

            {/* 컬럼 편집 테이블 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold">컬럼 정보</label>
                <Button variant="outline" size="sm" onClick={handleAddColumn}>
                  <Plus className="w-4 h-4 mr-1" />
                  행 추가
                </Button>
              </div>

              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {dbTableContent.columns.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                          위의 TSV 붙여넣기 영역에 데이터를 붙여넣거나 "행 추가" 버튼을 클릭하세요
                        </td>
                      </tr>
                    ) : (
                      dbTableContent.columns.map((col, idx) => (
                        <tr key={idx} className={`border-t hover:bg-blue-50 ${col.pk ? 'bg-amber-50' : ''}`}>
                          <td className="px-2 py-1.5 text-center text-muted-foreground">{col.no}</td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={col.name}
                              onChange={(e) => handleUpdateColumn(idx, 'name', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="컬럼명"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={col.comment}
                              onChange={(e) => handleUpdateColumn(idx, 'comment', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="설명"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={col.type}
                              onChange={(e) => handleUpdateColumn(idx, 'type', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm font-mono"
                              placeholder="VARCHAR"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={col.size}
                              onChange={(e) => handleUpdateColumn(idx, 'size', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm text-center"
                              placeholder=""
                            />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <Checkbox
                              checked={col.pk}
                              onCheckedChange={(checked) => handleUpdateColumn(idx, 'pk', checked as boolean)}
                            />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <Checkbox
                              checked={col.notNull}
                              onCheckedChange={(checked) => handleUpdateColumn(idx, 'notNull', checked as boolean)}
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={col.note}
                              onChange={(e) => handleUpdateColumn(idx, 'note', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="FK 등"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <button
                              onClick={() => handleDeleteColumn(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {dbTableContent.columns.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {dbTableContent.columns.length}개 컬럼
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDbTableDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveDbTable}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog />
    </div>
  )
}
