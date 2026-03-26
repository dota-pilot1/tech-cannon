import { useMemo, useRef, useState } from 'react'
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
import { useIssues, useIssue, useUpdateIssue, useCreateIssue, useDeleteIssue, useUpdateIssueStatus } from '@/features/issue/hooks/useIssues'
import { useIssueImages, useUploadIssueImage, useDeleteIssueImage } from '@/features/issue/hooks/useIssueImages'
import type { Issue, IssueStatus, IssuePriority, IssueCategory } from '@/entities/issue/types/issue'
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { toast } from 'sonner'

// AG-Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule])

export function IssuesPage() {
  const gridRef = useRef<AgGridReact>(null)

  // 상태 관리
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)

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
  const { confirm, ConfirmDialog } = useConfirm()

  // 이미지 관련
  const { data: issueImages } = useIssueImages(selectedIssueId)
  const { mutate: uploadImage, isPending: isUploading } = useUploadIssueImage(selectedIssueId!)
  const { mutate: deleteImage } = useDeleteIssueImage(selectedIssueId!)
  const [isDragging, setIsDragging] = useState(false)
  const [isPasteMode, setIsPasteMode] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const uploadAreaRef = useRef<HTMLDivElement>(null)

  const issues = issuesData?.items || []

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

  // 컬럼 정의 (좌측 목록용 - 간소화)
  const columnDefs = useMemo<ColDef<Issue>[]>(
    () => [
      {
        headerName: 'ID',
        field: 'id',
        width: 70,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
      },
      {
        headerName: '제목',
        field: 'title',
        flex: 1,
        minWidth: 200,
        cellStyle: { display: 'flex', alignItems: 'center' } as any,
      },
      {
        headerName: '상태',
        field: 'status',
        width: 100,
        cellRenderer: (params: any) => {
          const status = params.value as IssueStatus
          const statusLabels: Record<IssueStatus, string> = {
            OPEN: '진행 전',
            IN_PROGRESS: '진행 중',
            CLOSED: '완료',
          }
          return statusLabels[status] || status
        },
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
      },
      {
        headerName: '우선순위',
        field: 'priority',
        width: 100,
        cellRenderer: (params: any) => {
          const priority = params.value as IssuePriority
          const priorityLabels: Record<IssuePriority, string> = {
            LOW: '낮음',
            MEDIUM: '보통',
            HIGH: '높음',
            CRITICAL: '긴급',
          }
          return priorityLabels[priority] || priority
        },
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as any,
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

  // 행 선택 이벤트
  const onRowSelected = (event: RowSelectedEvent) => {
    if (event.node.isSelected()) {
      setSelectedIssueId(event.data.id)
      setIsEditing(false)
    }
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

  const statusLabels: Record<IssueStatus, string> = {
    OPEN: '진행 전',
    IN_PROGRESS: '진행 중',
    CLOSED: '완료',
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
        <div className="w-[45%] border-r border-border p-4 overflow-hidden flex flex-col">
          <div className="flex-1" style={{ height: '100%' }}>
            <AgGridReact<Issue>
              ref={gridRef}
              rowData={issues}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="single"
              onRowSelected={onRowSelected}
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
            <div className="max-w-3xl">
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
            <div className="max-w-3xl">
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
                      <td className="px-4 py-2">{issueDetail.assigneeName || '미지정'}</td>
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
    </div>
  )
}
