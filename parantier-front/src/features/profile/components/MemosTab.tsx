import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/axios";
import { LexicalEditor } from "@/shared/ui/lexical/LexicalEditor";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { NotebookPen, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface Memo {
  id: number;
  title: string;
  content: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const MEMOS_KEY = ["memos"] as const;

function useMemos() {
  return useQuery({
    queryKey: MEMOS_KEY,
    queryFn: async (): Promise<Memo[]> => {
      const { data } = await apiClient.get<Memo[]>("/memos");
      return data;
    },
  });
}

function useCreateMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      content: string;
      sortOrder?: number;
    }): Promise<Memo> => {
      const { data } = await apiClient.post<Memo>("/memos", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMOS_KEY });
    },
  });
}

function useUpdateMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number;
      title: string;
      content: string;
      sortOrder?: number;
    }): Promise<Memo> => {
      const { data } = await apiClient.put<Memo>(`/memos/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMOS_KEY });
    },
  });
}

function useDeleteMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiClient.delete(`/memos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMOS_KEY });
    },
  });
}

export function MemosTab() {
  const { data: memos, isLoading } = useMemos();
  const createMemo = useCreateMemo();
  const updateMemo = useUpdateMemo();
  const deleteMemo = useDeleteMemo();

  const [selectedMemoId, setSelectedMemoId] = useState<number | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleSelectMemo = (memo: Memo) => {
    setSelectedMemoId(memo.id);
    setIsNewMode(false);
    setEditTitle(memo.title);
    setEditContent(memo.content);
  };

  const handleNewMemo = () => {
    setSelectedMemoId(null);
    setIsNewMode(true);
    setEditTitle("");
    setEditContent("");
  };

  const handleContentChange = useCallback((state: string) => {
    setEditContent(state);
  }, []);

  const handleSave = () => {
    if (!editTitle.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (selectedMemoId !== null) {
      updateMemo.mutate(
        { id: selectedMemoId, title: editTitle.trim(), content: editContent },
        {
          onSuccess: () => toast.success("메모가 저장되었습니다."),
          onError: () => toast.error("메모 저장에 실패했습니다."),
        },
      );
    } else {
      createMemo.mutate(
        {
          title: editTitle.trim(),
          content: editContent,
          sortOrder: (memos?.length ?? 0) + 1,
        },
        {
          onSuccess: (newMemo) => {
            toast.success("메모가 생성되었습니다.");
            setIsNewMode(false);
            setSelectedMemoId(newMemo.id);
            setEditTitle(newMemo.title);
            setEditContent(newMemo.content);
          },
          onError: () => toast.error("메모 생성에 실패했습니다."),
        },
      );
    }
  };

  const handleDelete = () => {
    if (selectedMemoId === null) return;
    deleteMemo.mutate(selectedMemoId, {
      onSuccess: () => {
        toast.success("메모가 삭제되었습니다.");
        setSelectedMemoId(null);
        setIsNewMode(false);
        setEditTitle("");
        setEditContent("");
      },
      onError: () => toast.error("메모 삭제에 실패했습니다."),
    });
  };

  const isMutating =
    createMemo.isPending || updateMemo.isPending || deleteMemo.isPending;

  return (
    <div className="flex gap-3 h-[500px]">
      {/* 왼쪽 목록 */}
      <div className="w-44 shrink-0 border-r border-border flex flex-col gap-1 pr-3 overflow-y-auto">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed mb-1 shrink-0"
          onClick={handleNewMemo}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />새 메모
        </Button>

        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-md bg-muted animate-pulse shrink-0"
              />
            ))}
          </>
        ) : !memos || memos.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground text-xs text-center px-2 gap-1">
            <NotebookPen className="w-5 h-5 opacity-40" />
            <span>메모가 없습니다</span>
          </div>
        ) : (
          memos.map((memo) => (
            <button
              key={memo.id}
              onClick={() => handleSelectMemo(memo)}
              className={`w-full text-left text-xs px-2 py-2 rounded-md truncate transition-colors shrink-0 ${
                selectedMemoId === memo.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {memo.title || "제목 없음"}
            </button>
          ))
        )}
      </div>

      {/* 오른쪽 에디터 */}
      <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
        {selectedMemoId === null && !isNewMode ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-2">
            <NotebookPen className="w-8 h-8 opacity-30" />
            <p className="text-sm">메모를 선택하거나 새로 만드세요.</p>
          </div>
        ) : (
          <>
            {/* 제목 */}
            <Input
              placeholder="제목을 입력하세요"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="shrink-0 font-medium"
            />

            {/* 에디터 영역 */}
            <div className="flex-1 overflow-y-auto rounded-md border border-border bg-background min-h-0">
              <LexicalEditor
                key={selectedMemoId ?? "new"}
                initialState={editContent || undefined}
                onChange={handleContentChange}
                placeholder="메모 내용을 입력하세요..."
                minHeight="280px"
              />
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2 justify-end shrink-0">
              {selectedMemoId !== null && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isMutating}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  삭제
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={isMutating}>
                <Save className="w-3.5 h-3.5 mr-1" />
                {isMutating ? "저장 중..." : "저장"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
