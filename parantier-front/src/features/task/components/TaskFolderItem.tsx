import React from "react";
import { FolderOpen, FileText } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TaskFolder, TaskPost } from "../types/task.types";

interface TaskFolderItemProps {
  folder: TaskFolder;
  depth?: number;
  // 선택 상태
  selectedFolderId: number | null;
  selectedPostId: number | null;
  // 확장 상태
  expandedFolders: Set<number>;
  // 폴더 트리
  folderChildren: Record<number, TaskFolder[]>;
  // 게시글
  postsByFolder: Map<number, TaskPost[]>;
  // 인라인 입력 상태
  inlineFolderInput: { parentId: number | null } | null;
  inlineDocInput: { folderId: number } | null;
  editingFolderId: number | null;
  editingFolderName: string;
  // 핸들러
  onFolderClick: (id: number) => void;
  onPostClick: (post: TaskPost) => void;
  onOpenNewDoc: (folderId: number) => void;
  onStartEditFolder: (id: number, name: string) => void;
  onDeleteFolder: (id: number, name: string) => void;
  onSetFolderCtxMenu: (menu: { x: number; y: number; folderId: number; folderName: string } | null) => void;
  onSetPostCtxMenu: (menu: { x: number; y: number; postId: number; postTitle: string } | null) => void;
  onEditingFolderNameChange: (name: string) => void;
  onRenameFolderConfirm: (id: number, name: string, parentId: number | null) => void;
  onRenameFolderCancel: () => void;
  // 인라인 입력 컴포넌트
  renderInlineFolderInput: (depth: number) => React.ReactNode;
  renderInlineDocInput: (depth: number) => React.ReactNode;
}

export default function TaskFolderItem({
  folder,
  depth = 0,
  selectedFolderId,
  selectedPostId,
  expandedFolders,
  folderChildren,
  postsByFolder,
  inlineFolderInput,
  inlineDocInput,
  editingFolderId,
  editingFolderName,
  onFolderClick,
  onPostClick,
  onOpenNewDoc,
  onStartEditFolder,
  onDeleteFolder,
  onSetFolderCtxMenu,
  onSetPostCtxMenu,
  onEditingFolderNameChange,
  onRenameFolderConfirm,
  onRenameFolderCancel,
  renderInlineFolderInput,
  renderInlineDocInput,
}: TaskFolderItemProps) {
  const isSelected = selectedFolderId === folder.id;
  const isExpanded = expandedFolders.has(folder.id);
  const subFolders = folderChildren[folder.id] ?? [];
  const isEditingThis = editingFolderId === folder.id;

  return (
    <div key={folder.id} className={depth > 0 ? "ml-4" : ""}>
      <div
        className={cn(
          "group flex items-center gap-2 py-2 px-3 rounded cursor-pointer transition-colors",
          isSelected
            ? "bg-primary text-primary-foreground font-medium"
            : "hover:bg-accent",
        )}
        onClick={() => onFolderClick(folder.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          onSetFolderCtxMenu({
            x: e.clientX,
            y: e.clientY,
            folderId: folder.id,
            folderName: folder.name,
          });
        }}
      >
        <span className="shrink-0 text-sm">{isExpanded ? "▼" : "▶"}</span>
        <FolderOpen
          className={cn(
            "w-4 h-4 shrink-0",
            isSelected ? "text-primary-foreground" : "text-muted-foreground",
          )}
        />
        {isEditingThis ? (
          <input
            autoFocus
            value={editingFolderName}
            onChange={(e) => onEditingFolderNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === "Enter")
                onRenameFolderConfirm(folder.id, editingFolderName, folder.parentId);
              if (e.key === "Escape") onRenameFolderCancel();
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 border rounded px-1 py-0 text-xs min-w-0 text-foreground bg-background"
          />
        ) : (
          <span className="flex-1 truncate min-w-0 text-sm">
            {folder.name}
          </span>
        )}
        {!isEditingThis && (
          <div className="hidden group-hover:flex gap-0.5 shrink-0">
            <button
              className={cn(
                "text-xs px-1 rounded",
                isSelected
                  ? "text-primary-foreground/70 hover:text-primary-foreground"
                  : "text-muted-foreground hover:text-primary",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onOpenNewDoc(folder.id);
              }}
              title="새 문서"
            >
              +
            </button>
            <button
              className={cn(
                "text-xs px-1 rounded",
                isSelected
                  ? "text-primary-foreground/70 hover:text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onStartEditFolder(folder.id, folder.name);
              }}
              title="이름 변경"
            >
              ✏️
            </button>
            <button
              className={cn(
                "text-xs px-1 rounded",
                isSelected
                  ? "text-primary-foreground/70 hover:text-destructive"
                  : "text-muted-foreground hover:text-destructive",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(folder.id, folder.name);
              }}
              title="삭제"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          {subFolders.map((sub) => (
            <TaskFolderItem
              key={sub.id}
              folder={sub}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              selectedPostId={selectedPostId}
              expandedFolders={expandedFolders}
              folderChildren={folderChildren}
              postsByFolder={postsByFolder}
              inlineFolderInput={inlineFolderInput}
              inlineDocInput={inlineDocInput}
              editingFolderId={editingFolderId}
              editingFolderName={editingFolderName}
              onFolderClick={onFolderClick}
              onPostClick={onPostClick}
              onOpenNewDoc={onOpenNewDoc}
              onStartEditFolder={onStartEditFolder}
              onDeleteFolder={onDeleteFolder}
              onSetFolderCtxMenu={onSetFolderCtxMenu}
              onSetPostCtxMenu={onSetPostCtxMenu}
              onEditingFolderNameChange={onEditingFolderNameChange}
              onRenameFolderConfirm={onRenameFolderConfirm}
              onRenameFolderCancel={onRenameFolderCancel}
              renderInlineFolderInput={renderInlineFolderInput}
              renderInlineDocInput={renderInlineDocInput}
            />
          ))}
          {inlineFolderInput?.parentId === folder.id &&
            renderInlineFolderInput(depth + 1)}
          {inlineDocInput?.folderId === folder.id &&
            renderInlineDocInput(depth + 1)}
          {(postsByFolder.get(folder.id) || []).map((post) => {
            return (
              <div
                key={post.id}
                onClick={() => onPostClick(post)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSetPostCtxMenu({
                    x: Math.min(e.clientX, window.innerWidth - 180),
                    y: Math.min(e.clientY, window.innerHeight - 80),
                    postId: post.id,
                    postTitle: post.title,
                  });
                }}
                className={cn(
                  "ml-4 flex items-center gap-2 py-2 px-3 rounded cursor-pointer text-sm transition-colors",
                  selectedPostId === post.id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-accent text-foreground",
                )}
              >
                <FileText
                  className={cn(
                    "w-4 h-4 shrink-0",
                    selectedPostId === post.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                />
                <span className="truncate min-w-0">{post.title}</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
