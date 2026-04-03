import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Menu } from "@/types/menu";
import { TreeNode } from "./TreeNode";
import { menuApi } from "@/entities/menu/api/menuApi";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useState } from "react";

interface TreeViewProps {
  menus: Menu[];
  expandedIds: Set<number>;
  selectedId: number | null;
  addingChildToId: number | null;
  highlightedIds: Set<number>;
  onSelect: (menu: Menu) => void;
  onToggle: (id: number) => void;
  onContextMenu: (x: number, y: number, menu: Menu) => void;
  onInlineSubmit: (parentId: number, name: string) => void;
  onInlineCancel: () => void;
}

export function TreeView({
  menus,
  expandedIds,
  selectedId,
  addingChildToId,
  highlightedIds,
  onSelect,
  onToggle,
  onContextMenu,
  onInlineSubmit,
  onInlineCancel,
}: TreeViewProps) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const reorderMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      menuApi.reorderMenus(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus", "tree"] });
      toast.success("순서가 변경되었습니다");
    },
    onError: () => toast.error("순서 변경에 실패했습니다"),
  });

  const flattenAll = (menuList: Menu[]): Menu[] => {
    const result: Menu[] = [];
    for (const menu of menuList) {
      result.push(menu);
      if (menu.children && menu.children.length > 0) {
        result.push(...flattenAll(menu.children));
      }
    }
    return result;
  };

  // 화면에 보이는 노드만 평탄화 (SortableContext 등록용)
  const flattenVisible = (menuList: Menu[]): Menu[] => {
    const result: Menu[] = [];
    const sorted = [...menuList].sort((a, b) => a.orderNum - b.orderNum);
    for (const menu of sorted) {
      result.push(menu);
      if (
        menu.children &&
        menu.children.length > 0 &&
        expandedIds.has(menu.id)
      ) {
        result.push(...flattenVisible(menu.children));
      }
    }
    return result;
  };

  const allMenus = flattenAll(menus);
  const visibleMenus = flattenVisible(menus);

  const rootMenus = menus
    .filter((m) => m.parentId === null)
    .sort((a, b) => a.orderNum - b.orderNum);

  const activeMenu = activeId ? allMenus.find((m) => m.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const draggedId = active.id as number;
    const targetId = over.id as number;

    const draggedMenu = allMenus.find((m) => m.id === draggedId);
    const targetMenu = allMenus.find((m) => m.id === targetId);
    if (!draggedMenu || !targetMenu) return;

    // 같은 부모일 때만 순서 변경, 다른 부모면 무시
    if (draggedMenu.parentId !== targetMenu.parentId) return;

    const siblings = allMenus
      .filter((m) => m.parentId === draggedMenu.parentId)
      .sort((a, b) => a.orderNum - b.orderNum);

    const oldIndex = siblings.findIndex((m) => m.id === draggedId);
    const newIndex = siblings.findIndex((m) => m.id === targetId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(siblings, oldIndex, newIndex);
    const updates = reordered.map((m, idx) => ({ id: m.id, orderNum: idx }));
    reorderMutation.mutate(updates);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleMenus.map((m) => m.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0.5">
          {rootMenus.map((menu) => (
            <TreeNode
              key={menu.id}
              menu={menu}
              depth={0}
              allMenus={allMenus}
              expandedIds={expandedIds}
              selectedId={selectedId}
              addingChildToId={addingChildToId}
              highlightedIds={highlightedIds}
              activeId={activeId}
              overId={null}
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
              onInlineSubmit={onInlineSubmit}
              onInlineCancel={onInlineCancel}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeMenu && (
          <div className="bg-card border border-border rounded px-3 py-2 text-sm shadow-lg opacity-90">
            {activeMenu.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
