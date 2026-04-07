import { FolderOpen, FileText } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TaskFolder, TaskPost } from "../types/task.types";

interface Props {
  searchQuery: string;
  folders: TaskFolder[];
  postsByFolder: Map<number, TaskPost[]>;
  selectedFolderId: number | null;
  selectedPostId: number | null;
  onFolderClick: (id: number) => void;
  onPostClick: (post: TaskPost) => void;
}

export default function TaskSearchResult({
  searchQuery,
  folders,
  postsByFolder,
  selectedFolderId,
  selectedPostId,
  onFolderClick,
  onPostClick,
}: Props) {
  const q = searchQuery.trim().toLowerCase();

  const matchedFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(q)
  );

  const allPosts = Array.from(postsByFolder.entries()).flatMap(
    ([folderId, posts]) =>
      posts
        .filter((p) => p.title.toLowerCase().includes(q))
        .map((p) => ({ ...p, folderId }))
  );

  if (matchedFolders.length === 0 && allPosts.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        검색 결과가 없습니다.
      </p>
    );
  }

  return (
    <div>
      {matchedFolders.length > 0 && (
        <>
          <p className="text-[10px] text-muted-foreground px-3 pt-2 pb-0.5 font-medium">
            폴더
          </p>
          {matchedFolders.map((f) => (
            <div
              key={f.id}
              onClick={() => onFolderClick(f.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded transition-colors",
                selectedFolderId === f.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-accent"
              )}
            >
              <FolderOpen
                className={cn(
                  "w-4 h-4 shrink-0",
                  selectedFolderId === f.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                )}
              />
              <span className="truncate">{f.name}</span>
            </div>
          ))}
        </>
      )}
      {allPosts.length > 0 && (
        <>
          <p className="text-[10px] text-muted-foreground px-3 pt-2 pb-0.5 font-medium">
            문서
          </p>
          {allPosts.map((p) => (
            <div
              key={p.id}
              onClick={() => onPostClick(p)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded transition-colors",
                selectedPostId === p.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <FileText
                className={cn(
                  "w-4 h-4 shrink-0",
                  selectedPostId === p.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                )}
              />
              <span className="truncate">{p.title}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
