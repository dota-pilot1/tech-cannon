interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddChild: () => void;
  onMove: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onAddChild,
  onMove,
  onEdit,
  onDelete,
}: ContextMenuProps) {
  return (
    <div
      className="fixed bg-card shadow-lg rounded-md border border-border py-1 min-w-[200px] z-50"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-3"
        onClick={() => {
          onAddChild();
          onClose();
        }}
      >
        <span className="text-lg">➕</span>
        <span className="flex-1">하위 메뉴 추가</span>
      </button>
      <div className="border-t border-border my-1" />
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-3"
        onClick={() => {
          onMove();
          onClose();
        }}
      >
        <span className="text-lg">🚚</span>
        <span className="flex-1">이동</span>
      </button>
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-3"
        onClick={() => {
          onEdit();
          onClose();
        }}
      >
        <span className="text-lg">✏️</span>
        <span className="flex-1">수정</span>
      </button>
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-3"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <span className="text-lg">🗑️</span>
        <span className="flex-1">삭제</span>
      </button>
    </div>
  );
}
