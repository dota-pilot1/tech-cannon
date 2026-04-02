import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/axios";
import { LexicalEditor } from "@/shared/ui/lexical/LexicalEditor";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { BookMarked, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface DevLog {
  id: number;
  title: string;
  content: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const DEVLOGS_KEY = ["devlogs"] as const;

function useDevLogs() {
  return useQuery({
    queryKey: DEVLOGS_KEY,
    queryFn: async (): Promise<DevLog[]> => {
      const { data } = await apiClient.get<DevLog[]>("/devlogs");
      return data;
    },
  });
}

function useCreateDevLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      content: string;
      sortOrder?: number;
    }): Promise<DevLog> => {
      const { data } = await apiClient.post<DevLog>("/devlogs", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVLOGS_KEY });
    },
  });
}

function useUpdateDevLog() {
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
    }): Promise<DevLog> => {
      const { data } = await apiClient.put<DevLog>(`/devlogs/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVLOGS_KEY });
    },
  });
}

function useDeleteDevLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiClient.delete(`/devlogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVLOGS_KEY });
    },
  });
}

const getTodayString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function DevLogsTab() {
  const { data: devLogs, isLoading } = useDevLogs();
  const createDevLog = useCreateDevLog();
  const updateDevLog = useUpdateDevLog();
  const deleteDevLog = useDeleteDevLog();

  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleSelectLog = (log: DevLog) => {
    setSelectedLogId(log.id);
    setIsNewMode(false);
    setEditTitle(log.title);
    setEditContent(log.content);
  };

  const handleNewLog = () => {
    setSelectedLogId(null);
    setIsNewMode(true);
    setEditTitle(getTodayString());
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

    if (selectedLogId !== null) {
      updateDevLog.mutate(
        { id: selectedLogId, title: editTitle.trim(), content: editContent },
        {
          onSuccess: () => toast.success("개발 일지가 저장되었습니다."),
          onError: () => toast.error("개발 일지 저장에 실패했습니다."),
        },
      );
    } else {
      createDevLog.mutate(
        {
          title: editTitle.trim(),
          content: editContent,
          sortOrder: (devLogs?.length ?? 0) + 1,
        },
        {
          onSuccess: (newLog) => {
            toast.success("개발 일지가 생성되었습니다.");
            setIsNewMode(false);
            setSelectedLogId(newLog.id);
            setEditTitle(newLog.title);
            setEditContent(newLog.content);
          },
          onError: () => toast.error("개발 일지 생성에 실패했습니다."),
        },
      );
    }
  };

  const handleDelete = () => {
    if (selectedLogId === null) return;
    deleteDevLog.mutate(selectedLogId, {
      onSuccess: () => {
        toast.success("개발 일지가 삭제되었습니다.");
        setSelectedLogId(null);
        setIsNewMode(false);
        setEditTitle("");
        setEditContent("");
      },
      onError: () => toast.error("개발 일지 삭제에 실패했습니다."),
    });
  };

  const isMutating =
    createDevLog.isPending || updateDevLog.isPending || deleteDevLog.isPending;

  return (
    <div className="flex gap-3 h-[500px]">
      {/* 왼쪽 목록 */}
      <div className="w-44 shrink-0 border-r border-border flex flex-col gap-1 pr-3 overflow-y-auto">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed mb-1 shrink-0"
          onClick={handleNewLog}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />새 일지
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
        ) : !devLogs || devLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground text-xs text-center px-2 gap-1">
            <BookMarked className="w-5 h-5 opacity-40" />
            <span>개발 일지가 없습니다</span>
          </div>
        ) : (
          devLogs.map((log) => (
            <button
              key={log.id}
              onClick={() => handleSelectLog(log)}
              className={`w-full text-left px-2 py-2 rounded-md transition-colors shrink-0 flex flex-col ${
                selectedLogId === log.id
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <span className="truncate font-medium text-xs">
                {log.title || "제목 없음"}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                {log.updatedAt.slice(0, 10)}
              </span>
            </button>
          ))
        )}
      </div>

      {/* 오른쪽 에디터 */}
      <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
        {selectedLogId === null && !isNewMode ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-2">
            <BookMarked className="w-8 h-8 opacity-30" />
            <p className="text-sm">개발 일지를 선택하거나 새로 만드세요.</p>
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
                key={selectedLogId ?? "new"}
                initialState={editContent || undefined}
                onChange={handleContentChange}
                placeholder="개발 일지 내용을 입력하세요..."
                minHeight="280px"
              />
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2 justify-end shrink-0">
              {selectedLogId !== null && (
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
