import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community'
import { useTopics } from '@/features/topic/hooks/useTopic'
import { TopicDetailPanel } from '@/features/topic/components/TopicDetailPanel'
import { TopicCreateDialog } from '@/features/topic/components/TopicCreateDialog'
import type { Topic } from '@/entities/topic/types/topic'
import { Plus, Search, Pin, MessageSquare } from 'lucide-react'

ModuleRegistry.registerModules([AllCommunityModule])

export function TopicPage() {
  const search = useSearch({ strict: false }) as { topicId?: string }
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const gridRef = useRef<AgGridReact<Topic>>(null)

  const { data: topics = [], isLoading } = useTopics(keyword || undefined)

  // 딥링크: ?topicId=123
  useEffect(() => {
    if (search?.topicId) {
      setSelectedTopicId(Number(search.topicId))
    }
  }, [search?.topicId])

  const handleSearch = useCallback(() => {
    setKeyword(searchInput.trim())
  }, [searchInput])

  const handleRowClick = useCallback((e: RowClickedEvent<Topic>) => {
    if (e.data) {
      setSelectedTopicId(e.data.id)
    }
  }, [])

  const columnDefs = useMemo<ColDef<Topic>[]>(() => [
    {
      headerName: '',
      field: 'isPinned',
      width: 36,
      cellRenderer: (params: { value: boolean }) =>
        params.value ? <Pin className="w-3.5 h-3.5 text-orange-500 mx-auto" /> : null,
      sortable: false,
      filter: false,
    },
    {
      headerName: '제목',
      field: 'title',
      flex: 1,
      minWidth: 200,
      cellRenderer: (params: { data: Topic }) => (
        <div className="flex items-center gap-1.5">
          <span className="truncate">{params.data.title}</span>
          {params.data.commentCount > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
              <MessageSquare className="w-3 h-3" />
              {params.data.commentCount}
            </span>
          )}
        </div>
      ),
    },
    {
      headerName: '작성자',
      field: 'authorName',
      width: 100,
    },
    {
      headerName: '조회',
      field: 'viewCount',
      width: 70,
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: '날짜',
      field: 'createdAt',
      width: 100,
      valueFormatter: (params) => params.value?.slice(0, 10) || '',
    },
  ], [])

  return (
    <div className="flex gap-3 p-3 h-[calc(100vh-48px)]">
      {/* 좌측: 목록 */}
      <div
        className="flex flex-col w-[40%] border rounded-lg bg-background shadow-sm overflow-hidden shrink-0"
      >
        {/* 검색 + 새 토픽 버튼 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              placeholder="제목, 내용 검색..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 shrink-0"
          >
            <Plus className="w-4 h-4" />
            새 토픽
          </button>
        </div>

        {/* ag-grid */}
        <div className="flex-1">
          <AgGridReact<Topic>
            ref={gridRef}
            rowData={topics}
            columnDefs={columnDefs}
            theme={themeQuartz}
            loading={isLoading}
            onRowClicked={handleRowClick}
            rowSelection="single"
            getRowId={(params) => String(params.data.id)}
            rowClassRules={{
              '!bg-primary/5': (params) => params.data?.id === selectedTopicId,
            }}
            suppressCellFocus
            domLayout="normal"
            rowHeight={40}
            headerHeight={36}
          />
        </div>
      </div>

      {/* 우측: 상세 */}
      <div className="flex-1 border rounded-lg bg-background shadow-sm overflow-hidden">
        {selectedTopicId ? (
          <TopicDetailPanel
            key={selectedTopicId}
            topicId={selectedTopicId}
            onClose={() => setSelectedTopicId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center h-full text-muted-foreground text-sm">
            토픽을 선택하면 내용이 표시됩니다
          </div>
        )}
      </div>

      {/* 새 토픽 다이얼로그 */}
      <TopicCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
