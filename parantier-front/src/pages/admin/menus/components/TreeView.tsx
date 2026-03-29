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

  const getMenusByParent = (parentId: number | null) =>
    menus.filter((m) => m.parentId === parentId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeMenu = menus.find((m) => m.id === active.id);
    const overMenu = menus.find((m) => m.id === over.id);
    if (!activeMenu || !overMenu) return;
    // 같은 parentId 끼리만 허용
    if (activeMenu.parentId !== overMenu.parentId) return;

    const siblings = getMenusByParent(activeMenu.parentId)
      .slice()
      .sort((a, b) => a.orderNum - b.orderNum);

    const oldIndex = siblings.findIndex((m) => m.id === active.id);
    const newIndex = siblings.findIndex((m) => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(siblings, oldIndex, newIndex);
    const updates = reordered.map((m, idx) => ({ id: m.id, orderNum: idx }));
    reorderMutation.mutate(updates);
  };

  const flattenMenus = (menuList: Menu[]): Menu[] => {
    const result: Menu[] = [];
    menuList.forEach((menu) => {
      result.push(menu);
      if (menu.children && menu.children.length > 0) {
        result.push(...flattenMenus(menu.children));
      }
    });
    return result;
  };

  const allMenus = flattenMenus(menus);
  const rootMenus = menus
    .filter((m) => m.parentId === null)
    .sort((a, b) => a.orderNum - b.orderNum);

  const activeMenu = activeId ? allMenus.find((m) => m.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={rootMenus.map((m) => m.id)}
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
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
              onInlineSubmit={onInlineSubmit}
              onInlineCancel={onInlineCancel}
              onReorder={(items) => reorderMutation.mutate(items)}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeMenu && (
          <div className="bg-card border rounded px-3 py-2 text-sm shadow-lg opacity-90">
            {activeMenu.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
