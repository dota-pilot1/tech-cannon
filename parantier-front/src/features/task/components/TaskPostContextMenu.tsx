import { useRef, useEffect } from "react";

export type PostCtxMenu = {
  x: number;
  y: number;
  postId: number;
  postTitle: string;
} | null;

export default function TaskPostContextMenu({
  menu,
  onClose,
  onDelete,
}: {
  menu: PostCtxMenu;
  onClose: () => void;
  onDelete: (id: number, title: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!menu) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white border rounded shadow-xl py-1 min-w-[160px] text-sm"
      style={{ top: menu.y, left: menu.x }}
    >
      <button
        className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
        onClick={() => {
          onDelete(menu.postId, menu.postTitle);
          onClose();
        }}
      >
        <span>🗑️</span> 문서 삭제
      </button>
    </div>
  );
}
