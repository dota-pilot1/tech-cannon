import { useRef, useEffect } from "react";

export type FolderCtxMenu = {
  x: number;
  y: number;
  folderId: number;
  folderName: string;
} | null;

export default function TaskFolderContextMenu({
  menu,
  onClose,
  onAddSubFolder,
  onAddDoc,
  onRename,
  onDelete,
}: {
  menu: FolderCtxMenu;
  onClose: () => void;
  onAddSubFolder: (parentId: number) => void;
  onAddDoc: (folderId: number) => void;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number, name: string) => void;
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
      className="fixed z-50 bg-white border rounded shadow-xl py-1 min-w-[180px] text-sm"
      style={{ top: menu.y, left: menu.x }}
    >
      <button
        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
        onClick={() => {
          onAddSubFolder(menu.folderId);
          onClose();
        }}
      >
        <span>📁</span> 하위 폴더 추가
      </button>
      <button
        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
        onClick={() => {
          onAddDoc(menu.folderId);
          onClose();
        }}
      >
        <span>📄</span> 새 문서 추가
      </button>
      <div className="border-t my-1" />
      <button
        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
        onClick={() => {
          onRename(menu.folderId, menu.folderName);
          onClose();
        }}
      >
        <span>✏️</span> 이름 변경
      </button>
      <button
        className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
        onClick={() => {
          onDelete(menu.folderId, menu.folderName);
          onClose();
        }}
      >
        <span>🗑️</span> 폴더 삭제
      </button>
    </div>
  );
}
