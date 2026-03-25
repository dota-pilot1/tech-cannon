import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useMenuTree } from '@/features/menu/hooks/useMenuTree'
import { menuApi } from '@/entities/menu/api/menuApi'
import { Button } from '@/shared/ui/button'
import type { Menu, CreateMenuRequest } from '@/types/menu'
import { TreeView } from './components/TreeView'
import { MenuEditForm } from './components/MenuEditForm'
import { ContextMenu } from './components/ContextMenu'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import { DebugPanel } from './components/DebugPanel'

export function MenusPage() {
  const queryClient = useQueryClient()
  const { data: menus = [], isLoading } = useMenuTree()
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [parentMenu, setParentMenu] = useState<Menu | null>(null)
  const [addingChildToId, setAddingChildToId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    menu: Menu
  } | null>(null)

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateMenuRequest) => menuApi.createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus', 'tree'] })
      toast.success('메뉴가 추가되었습니다')
      setIsCreating(false)
      setSelectedMenu(null)
      setParentMenu(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '메뉴 추가에 실패했습니다')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateMenuRequest }) =>
      menuApi.updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus', 'tree'] })
      toast.success('메뉴가 수정되었습니다')
      setSelectedMenu(null)
      setParentMenu(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '메뉴 수정에 실패했습니다')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => menuApi.deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus', 'tree'] })
      toast.success('메뉴가 삭제되었습니다')
      setSelectedMenu(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '메뉴 삭제에 실패했습니다')
    },
  })

  // 확장/축소 토글
  const handleToggle = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // 메뉴 선택
  const handleSelect = (menu: Menu) => {
    setSelectedMenu(menu)
    setIsCreating(false)
  }

  // 새 메뉴 추가 모드
  const handleCreateNew = () => {
    setSelectedMenu(null)
    setIsCreating(true)
  }

  // 저장 처리
  const handleSave = (menuData: Partial<Menu>) => {
    const requestData: CreateMenuRequest = {
      name: menuData.name!,
      path: menuData.path || undefined,
      parentId: menuData.parentId || undefined,
      menuType: menuData.menuType!,
      orderNum: menuData.orderNum,
      requiredRole: menuData.requiredRole || undefined,
      icon: menuData.icon || undefined,
    }

    if (menuData.id) {
      // 수정
      updateMutation.mutate({ id: menuData.id, data: requestData })
    } else {
      // 생성
      createMutation.mutate(requestData)
    }
  }

  // 하위 메뉴 개수 계산
  const countChildren = (menuId: number): number => {
    const flattenMenus = (menuList: Menu[]): Menu[] => {
      const result: Menu[] = []
      menuList.forEach((menu) => {
        result.push(menu)
        if (menu.children && menu.children.length > 0) {
          result.push(...flattenMenus(menu.children))
        }
      })
      return result
    }

    const allMenus = flattenMenus(menus)
    const children = allMenus.filter((m) => m.parentId === menuId)

    let count = children.length
    children.forEach((child) => {
      count += countChildren(child.id)
    })

    return count
  }

  // 삭제 처리 (다이얼로그 열기)
  const handleDelete = (id: number) => {
    const menu = menus.find((m) => m.id === id)
    if (!menu) {
      // 중첩된 메뉴 검색
      const flattenMenus = (menuList: Menu[]): Menu[] => {
        const result: Menu[] = []
        menuList.forEach((m) => {
          result.push(m)
          if (m.children && m.children.length > 0) {
            result.push(...flattenMenus(m.children))
          }
        })
        return result
      }
      const allMenus = flattenMenus(menus)
      const foundMenu = allMenus.find((m) => m.id === id)
      if (foundMenu) {
        setDeleteTarget(foundMenu)
      }
    } else {
      setDeleteTarget(menu)
    }
  }

  // 삭제 확인
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  // 삭제 취소
  const handleCancelDelete = () => {
    setDeleteTarget(null)
  }

  // 취소
  const handleCancel = () => {
    setSelectedMenu(null)
    setIsCreating(false)
  }

  // 메뉴 필터링 및 매칭된 메뉴의 부모 자동 확장
  const getFilteredMenusAndExpandedIds = (): {
    filteredMenus: Menu[]
    highlightedIds: Set<number>
    autoExpandedIds: Set<number>
  } => {
    if (!searchQuery.trim()) {
      return {
        filteredMenus: menus,
        highlightedIds: new Set(),
        autoExpandedIds: new Set(),
      }
    }

    const query = searchQuery.toLowerCase()
    const flattenMenus = (menuList: Menu[]): Menu[] => {
      const result: Menu[] = []
      menuList.forEach((menu) => {
        result.push(menu)
        if (menu.children && menu.children.length > 0) {
          result.push(...flattenMenus(menu.children))
        }
      })
      return result
    }

    const allMenus = flattenMenus(menus)

    // 매칭된 메뉴 찾기
    const matchedMenus = allMenus.filter((menu) =>
      menu.name.toLowerCase().includes(query)
    )

    const highlightedIds = new Set(matchedMenus.map((m) => m.id))

    // 매칭된 메뉴의 모든 부모 ID 수집
    const getParentIds = (menuId: number | null): number[] => {
      if (!menuId) return []
      const parent = allMenus.find((m) => m.id === menuId)
      if (!parent || !parent.parentId) return []
      return [parent.parentId, ...getParentIds(parent.parentId)]
    }

    const autoExpandedIds = new Set<number>()
    matchedMenus.forEach((menu) => {
      const parentIds = getParentIds(menu.id)
      parentIds.forEach((id) => autoExpandedIds.add(id))
    })

    return {
      filteredMenus: menus,
      highlightedIds,
      autoExpandedIds,
    }
  }

  const { filteredMenus, highlightedIds, autoExpandedIds } =
    getFilteredMenusAndExpandedIds()

  // 검색어가 있을 때 자동 확장 적용
  useEffect(() => {
    if (searchQuery.trim()) {
      if (autoExpandedIds.size > 0) {
        // 검색 결과가 있으면 매칭된 메뉴의 부모만 확장
        setExpandedIds(autoExpandedIds)
      } else {
        // 검색 결과가 없으면 모두 접기
        setExpandedIds(new Set())
      }
    }
  }, [searchQuery, autoExpandedIds])

  // 전체 펼치기
  const handleExpandAll = () => {
    const flattenMenus = (menuList: Menu[]): number[] => {
      const ids: number[] = []
      menuList.forEach((menu) => {
        ids.push(menu.id)
        if (menu.children && menu.children.length > 0) {
          ids.push(...flattenMenus(menu.children))
        }
      })
      return ids
    }
    setExpandedIds(new Set(flattenMenus(menus)))
  }

  // 전체 접기
  const handleCollapseAll = () => {
    setExpandedIds(new Set())
  }

  // 컨텍스트 메뉴 열기
  const handleContextMenu = (x: number, y: number, menu: Menu) => {
    setContextMenu({ x, y, menu })
  }

  // 컨텍스트 메뉴 닫기
  const closeContextMenu = () => {
    setContextMenu(null)
  }

  // 하위 메뉴 추가 (인라인 입력 모드)
  const handleAddChildMenu = () => {
    if (contextMenu) {
      // 부모 메뉴 자동 확장
      setExpandedIds((prev) => new Set(prev).add(contextMenu.menu.id))
      // 인라인 입력 모드 활성화
      setAddingChildToId(contextMenu.menu.id)
    }
  }

  // 인라인 입력에서 메뉴 이름 제출
  const handleInlineSubmit = (parentId: number, name: string) => {
    const requestData: CreateMenuRequest = {
      name,
      parentId,
      menuType: 'SUB', // 기본값: 하위 메뉴는 SUB 타입
      orderNum: 0,
    }

    createMutation.mutate(requestData, {
      onSuccess: (newMenu) => {
        // 생성된 메뉴 자동 선택 (상세 편집 가능)
        setSelectedMenu(newMenu)
        setIsCreating(false)
        setParentMenu(null)
        setAddingChildToId(null)
      },
    })
  }

  // 인라인 입력 취소
  const handleInlineCancel = () => {
    setAddingChildToId(null)
  }

  // 컨텍스트 메뉴에서 편집
  const handleEditFromContext = () => {
    if (contextMenu) {
      setSelectedMenu(contextMenu.menu)
      setIsCreating(false)
      setParentMenu(null)
    }
  }

  // 컨텍스트 메뉴에서 삭제
  const handleDeleteFromContext = () => {
    if (contextMenu) {
      handleDelete(contextMenu.menu.id)
    }
  }

  // Outside click & ESC 키 감지
  useEffect(() => {
    if (!contextMenu) return

    const handleClickOutside = () => closeContextMenu()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu()
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">메뉴 관리</h1>
        <p className="text-muted-foreground mt-2">
          시스템 메뉴를 계층적으로 관리합니다.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-[500px] items-center justify-center rounded-lg border bg-card">
          <div className="text-center text-muted-foreground">
            메뉴를 불러오는 중...
          </div>
        </div>
      ) : menus.length === 0 ? (
        <div className="flex h-[500px] flex-col items-center justify-center rounded-lg border bg-card">
          <div className="text-center text-muted-foreground mb-4">
            등록된 메뉴가 없습니다.
          </div>
          <Button onClick={handleCreateNew}>+ 첫 메뉴 추가</Button>
        </div>
      ) : (
        <div className="grid grid-cols-[400px_1fr] gap-6">
          {/* 왼쪽: 트리 뷰 */}
          <div className="rounded-lg border bg-card">
            <div className="border-b p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">메뉴 구조</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleExpandAll}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    전체 펼치기
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleCollapseAll}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    전체 접기
                  </button>
                </div>
              </div>

              {/* 검색 입력창과 추가 버튼 */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSearchQuery(inputValue)
                        e.currentTarget.blur()
                      }
                    }}
                    placeholder="메뉴 검색 후 Enter..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {(inputValue || searchQuery) && (
                    <button
                      onClick={() => {
                        setInputValue('')
                        setSearchQuery('')
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <Button onClick={handleCreateNew} size="sm" className="flex-shrink-0">
                  +
                </Button>
              </div>

              {/* 검색 결과 카운트 */}
              {searchQuery && (
                <div className="mt-2 text-xs text-gray-600">
                  {highlightedIds.size > 0
                    ? `${highlightedIds.size}개의 메뉴 찾음`
                    : '검색 결과 없음'}
                </div>
              )}
            </div>
            <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 350px)' }}>
              <TreeView
                menus={filteredMenus}
                expandedIds={expandedIds}
                selectedId={selectedMenu?.id || null}
                addingChildToId={addingChildToId}
                highlightedIds={highlightedIds}
                onSelect={handleSelect}
                onToggle={handleToggle}
                onContextMenu={handleContextMenu}
                onInlineSubmit={handleInlineSubmit}
                onInlineCancel={handleInlineCancel}
              />
            </div>
          </div>

          {/* 컨텍스트 메뉴 */}
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={closeContextMenu}
              onAddChild={handleAddChildMenu}
              onEdit={handleEditFromContext}
              onDelete={handleDeleteFromContext}
            />
          )}

          {/* 오른쪽: 상세 편집 */}
          <div className="rounded-lg border bg-card p-6">
            {selectedMenu || isCreating ? (
              <MenuEditForm
                menu={selectedMenu}
                parentMenu={parentMenu}
                onSave={handleSave}
                onDelete={handleDelete}
                onCancel={handleCancel}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <svg
                  className="mb-4 h-16 w-16 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-600 mb-2">
                  메뉴를 선택하세요
                </p>
                <p className="text-sm text-gray-500">
                  왼쪽에서 편집할 메뉴를 선택하거나
                  <br />새 메뉴를 추가할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {deleteTarget && (
        <DeleteConfirmDialog
          menu={deleteTarget}
          childCount={countChildren(deleteTarget.id)}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {/* 디버그 패널 (최하단 토글) */}
      {menus.length > 0 && <DebugPanel data={menus} title="트리 구조 확인 (Debug)" />}
    </div>
  )
}
