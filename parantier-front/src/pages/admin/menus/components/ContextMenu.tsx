interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onAddChild: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ContextMenu({
  x,
  y,
  onClose,
  onAddChild,
  onEdit,
  onDelete,
}: ContextMenuProps) {
  return (
    <div
      className="fixed bg-white shadow-lg rounded-md border border-gray-200 py-1 min-w-[200px] z-50"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3"
        onClick={() => {
          onAddChild()
          onClose()
        }}
      >
        <span className="text-lg">➕</span>
        <span className="flex-1">하위 메뉴 추가</span>
      </button>
      <div className="border-t border-gray-200 my-1" />
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3"
        onClick={() => {
          onEdit()
          onClose()
        }}
      >
        <span className="text-lg">✏️</span>
        <span className="flex-1">수정</span>
      </button>
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3"
        onClick={() => {
          onDelete()
          onClose()
        }}
      >
        <span className="text-lg">🗑️</span>
        <span className="flex-1">삭제</span>
      </button>
    </div>
  )
}
