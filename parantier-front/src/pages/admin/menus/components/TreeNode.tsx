import type { Menu } from '@/types/menu'
import { InlineMenuInput } from './InlineMenuInput'

interface TreeNodeProps {
  menu: Menu
  depth: number
  allMenus: Menu[]
  expandedIds: Set<number>
  selectedId: number | null
  addingChildToId: number | null
  highlightedIds: Set<number>
  onSelect: (menu: Menu) => void
  onToggle: (id: number) => void
  onContextMenu: (x: number, y: number, menu: Menu) => void
  onInlineSubmit: (parentId: number, name: string) => void
  onInlineCancel: () => void
}

export function TreeNode({
  menu,
  depth,
  allMenus,
  expandedIds,
  selectedId,
  addingChildToId,
  highlightedIds,
  onSelect,
  onToggle,
  onContextMenu,
  onInlineSubmit,
  onInlineCancel,
}: TreeNodeProps) {
  const children = allMenus.filter((m) => m.parentId === menu.id)
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.has(menu.id)
  const isSelected = menu.id === selectedId
  const isHighlighted = highlightedIds.has(menu.id)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu(e.clientX, e.clientY, menu)
  }

  return (
    <div>
      <div
        className={`flex cursor-pointer items-center rounded px-3 py-2 transition-colors hover:bg-gray-100 ${
          isSelected
            ? 'bg-blue-50 font-semibold text-blue-700'
            : isHighlighted
              ? 'bg-yellow-50 font-medium'
              : ''
        }`}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onClick={() => onSelect(menu)}
        onContextMenu={handleContextMenu}
      >
        {/* 확장/축소 토글 */}
        {hasChildren && (
          <button
            className="mr-1 flex h-4 w-4 items-center justify-center text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation()
              onToggle(menu.id)
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}

        {/* 빈 공간 (자식 없는 경우 정렬용) */}
        {!hasChildren && <span className="mr-1 w-4" />}

        {/* 아이콘 */}
        <span className="mr-2 text-base">
          {menu.menuType === 'HEADER' ? '📁' : '📄'}
        </span>

        {/* 메뉴명 */}
        <span className="flex-1 truncate">{menu.name}</span>

        {/* 비활성 뱃지 */}
        {!menu.isActive && (
          <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800">
            비활성
          </span>
        )}
      </div>

      {/* 자식 노드들 (재귀) */}
      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              menu={child}
              depth={depth + 1}
              allMenus={allMenus}
              expandedIds={expandedIds}
              selectedId={selectedId}
              addingChildToId={addingChildToId}
              highlightedIds={highlightedIds}
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
              onInlineSubmit={onInlineSubmit}
              onInlineCancel={onInlineCancel}
            />
          ))}
        </div>
      )}

      {/* 인라인 입력 (하위 메뉴 추가) */}
      {isExpanded && addingChildToId === menu.id && (
        <InlineMenuInput
          depth={depth + 1}
          onSubmit={(name) => onInlineSubmit(menu.id, name)}
          onCancel={onInlineCancel}
        />
      )}
    </div>
  )
}
