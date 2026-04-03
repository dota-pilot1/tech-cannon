import type { Menu } from "@/types/menu";
import { InlineMenuInput } from "./InlineMenuInput";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface TreeNodeProps {
  menu: Menu;
  depth: number;
  allMenus: Menu[];
  expandedIds: Set<number>;
  selectedId: number | null;
  addingChildToId: number | null;
  highlightedIds: Set<number>;
  activeId: number | null;
  overId: number | null;
  onSelect: (menu: Menu) => void;
  onToggle: (id: number) => void;
  onContextMenu: (x: number, y: number, menu: Menu) => void;
  onInlineSubmit: (parentId: number, name: string) => void;
  onInlineCancel: () => void;
}

export function TreeNode({
  menu,
  depth,
  allMenus,
  expandedIds,
  selectedId,
  addingChildToId,
  highlightedIds,
  activeId,
  overId,
  onSelect,
  onToggle,
  onContextMenu,
  onInlineSubmit,
  onInlineCancel,
}: TreeNodeProps) {
  const children = allMenus
    .filter((m) => m.parentId === menu.id)
    .sort((a, b) => a.orderNum - b.orderNum);

  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(menu.id);
  const isSelected = menu.id === selectedId;
  const isHighlighted = highlightedIds.has(menu.id);

  // 현재 이 노드가 드래그 중인 노드인지
  const isDraggingThis = menu.id === activeId;
  // 현재 이 노드 위에 드롭 대상이 올라와 있는지 (drop indicator)
  const isDropTarget = menu.id === overId && menu.id !== activeId;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isDraggingThis ? 0.4 : undefined,
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e.clientX, e.clientY, menu);
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drop indicator: 이 노드 위에 드래그가 올라왔을 때 상단 라인 표시 */}
      {isDropTarget && (
        <div
          className="border-t-2 border-primary mx-3 rounded-full"
          style={{ marginLeft: `${depth * 20 + 12}px` }}
        />
      )}

      <div
        className={[
          "flex cursor-pointer items-center rounded px-3 py-2 transition-colors",
          "hover:bg-muted",
          isSelected
            ? "bg-primary/10 font-semibold text-primary"
            : isHighlighted
              ? "bg-accent font-medium"
              : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onClick={() => onSelect(menu)}
        onContextMenu={handleContextMenu}
      >
        {/* 드래그 핸들 - 핸들로만 드래그 시작 가능 */}
        <span
          className="mr-1 flex cursor-grab items-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </span>

        {/* 확장/축소 토글 */}
        {hasChildren && (
          <button
            className="mr-1 flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(menu.id);
            }}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        )}

        {/* 빈 공간 (자식 없는 경우 정렬용) */}
        {!hasChildren && <span className="mr-1 w-4" />}

        {/* 아이콘 */}
        <span className="mr-2 text-base">
          {menu.menuType === "HEADER" ? "📁" : "📄"}
        </span>

        {/* 메뉴명 */}
        <span className="flex-1 truncate">{menu.name}</span>

        {/* 비활성 뱃지 */}
        {!menu.isActive && (
          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            비활성
          </span>
        )}
      </div>

      {/* 자식 노드들 (재귀) - 단일 DndContext이므로 별도 컨텍스트 없이 바로 렌더링 */}
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
              activeId={activeId}
              overId={overId}
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
  );
}
