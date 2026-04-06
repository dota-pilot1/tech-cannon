import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useConfirm } from "@/shared/hooks/useConfirm";
import {
  Bot,
  User,
  Send,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  History,
  Github,
  X,
  RotateCcw,
  Loader2,
  Pencil,
  Check,
} from "lucide-react";

// ─── API 설정 ──────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

// ─── 타입 정의 ─────────────────────────────────────────────────────────────────
interface GithubItem {
  id: number;
  folderId: number;
  label: string;
  githubUrl: string;
  orderNum: number;
}

interface GithubFolder {
  id: number;
  name: string;
  orderNum: number;
  items: GithubItem[];
}

interface ChatHistory {
  id: number;
  userId: number;
  question: string;
  answer: string;
  githubUrls: string[];
  createdAt: string;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  referencedUrls?: string[];
}

// ─── API 함수 ──────────────────────────────────────────────────────────────────
const subutaiAiApi = {
  getFolders: (): Promise<GithubFolder[]> =>
    fetch(`${BASE}/subutai/ai/folders`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  createFolder: (name: string): Promise<void> =>
    fetch(`${BASE}/subutai/ai/folders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    }).then((r) => {
      if (!r.ok) throw new Error("폴더 생성 실패");
    }),

  updateFolder: (id: number, name: string): Promise<void> =>
    fetch(`${BASE}/subutai/ai/folders/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteFolder: (id: number): Promise<void> =>
    fetch(`${BASE}/subutai/ai/folders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error("폴더 삭제 실패");
    }),

  createItem: (data: {
    folderId: number;
    label: string;
    githubUrl: string;
  }): Promise<void> =>
    fetch(`${BASE}/subutai/ai/items`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error("아이템 생성 실패");
    }),

  updateItem: (
    id: number,
    data: { label: string; githubUrl: string },
  ): Promise<void> =>
    fetch(`${BASE}/subutai/ai/items/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteItem: (id: number): Promise<void> =>
    fetch(`${BASE}/subutai/ai/items/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error("아이템 삭제 실패");
    }),

  chat: (data: {
    question: string;
    githubItemIds: number[];
  }): Promise<{ answer: string; referencedUrls: string[] }> =>
    fetch(`${BASE}/subutai/ai/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getHistories: (): Promise<ChatHistory[]> =>
    fetch(`${BASE}/subutai/ai/histories`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  deleteHistory: (id: number): Promise<void> =>
    fetch(`${BASE}/subutai/ai/histories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error("히스토리 삭제 실패");
    }),
};

// ─── 마크다운 렌더러 ───────────────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];

  // 코드블록 ```...``` 처리
  const codeBlockRegex = /```[\s\S]*?```/g;
  const parts = text.split(codeBlockRegex);
  const codeBlocks = text.match(codeBlockRegex) ?? [];

  parts.forEach((part, i) => {
    // 인라인 파싱 (bold, inline code, 줄바꿈)
    nodes.push(...parseInline(part, `part-${i}`));

    if (codeBlocks[i]) {
      const code = codeBlocks[i]
        .replace(/^```[^\n]*\n?/, "")
        .replace(/```$/, "");
      nodes.push(
        <pre
          key={`code-${i}`}
          className="bg-muted font-mono text-sm p-3 rounded-lg my-2 overflow-x-auto whitespace-pre-wrap break-words"
        >
          {code}
        </pre>,
      );
    }
  });

  return nodes;
}

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const paragraphs = text.split(/\n\n+/);

  paragraphs.forEach((para, pIdx) => {
    if (!para) return;

    const lines = para.split("\n");
    const lineNodes: React.ReactNode[] = [];

    lines.forEach((line, lIdx) => {
      if (!line && lIdx === 0) return;

      // **bold** 및 `inline code` 파싱
      const segments = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
      segments.forEach((seg, sIdx) => {
        if (seg.startsWith("**") && seg.endsWith("**")) {
          lineNodes.push(
            <strong key={`${keyPrefix}-p${pIdx}-l${lIdx}-s${sIdx}`}>
              {seg.slice(2, -2)}
            </strong>,
          );
        } else if (seg.startsWith("`") && seg.endsWith("`")) {
          lineNodes.push(
            <code
              key={`${keyPrefix}-p${pIdx}-l${lIdx}-s${sIdx}`}
              className="bg-muted font-mono text-sm px-1.5 py-0.5 rounded"
            >
              {seg.slice(1, -1)}
            </code>,
          );
        } else {
          lineNodes.push(
            <span key={`${keyPrefix}-p${pIdx}-l${lIdx}-s${sIdx}`}>{seg}</span>,
          );
        }
      });

      if (lIdx < lines.length - 1) {
        lineNodes.push(<br key={`${keyPrefix}-p${pIdx}-br${lIdx}`} />);
      }
    });

    nodes.push(
      <p key={`${keyPrefix}-para${pIdx}`} className={pIdx > 0 ? "mt-3" : ""}>
        {lineNodes}
      </p>,
    );
  });

  return nodes;
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function SubutaiAiPage() {
  const { confirm, ConfirmDialog } = useConfirm();

  // 탭
  const [leftTab, setLeftTab] = useState<"repos" | "history">("repos");

  // 저장소
  const [folders, setFolders] = useState<GithubFolder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set(),
  );
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [foldersLoading, setFoldersLoading] = useState(false);

  // 폴더 추가
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // 폴더 수정
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  // 아이템 추가
  const [addingItemFolderId, setAddingItemFolderId] = useState<number | null>(
    null,
  );
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");

  // 아이템 수정
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemLabel, setEditingItemLabel] = useState("");
  const [editingItemUrl, setEditingItemUrl] = useState("");

  // 챗봇
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 히스토리
  const [histories, setHistories] = useState<ChatHistory[]>([]);
  const [historiesLoading, setHistoriesLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);
  const newItemLabelRef = useRef<HTMLInputElement>(null);
  const editFolderInputRef = useRef<HTMLInputElement>(null);
  const editItemLabelRef = useRef<HTMLInputElement>(null);

  // ── 초기 로드 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (addingFolder && newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [addingFolder]);

  useEffect(() => {
    if (addingItemFolderId !== null && newItemLabelRef.current) {
      newItemLabelRef.current.focus();
    }
  }, [addingItemFolderId]);

  // ── 탭 전환 ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (leftTab === "history") {
      loadHistories();
    }
  }, [leftTab]);

  // ── 수정 모드 포커스 ────────────────────────────────────────────────────────
  useEffect(() => {
    if (editingFolderId !== null && editFolderInputRef.current) {
      editFolderInputRef.current.focus();
      editFolderInputRef.current.select();
    }
  }, [editingFolderId]);

  useEffect(() => {
    if (editingItemId !== null && editItemLabelRef.current) {
      editItemLabelRef.current.focus();
      editItemLabelRef.current.select();
    }
  }, [editingItemId]);

  // ── API 로더 ───────────────────────────────────────────────────────────────
  const loadFolders = async () => {
    setFoldersLoading(true);
    try {
      const data = await subutaiAiApi.getFolders();
      setFolders(data);
      // 모든 폴더 자동 펼침
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        data.forEach((f) => next.add(f.id));
        return next;
      });
      // 모든 아이템 자동 선택 (기존에 선택된 것은 유지, 새 것만 추가)
      setSelectedItems((prev) => {
        const next = new Set(prev);
        data.forEach((f) => f.items.forEach((item) => next.add(item.id)));
        return next;
      });
    } catch {
      // 무시
    } finally {
      setFoldersLoading(false);
    }
  };

  const loadHistories = async () => {
    setHistoriesLoading(true);
    try {
      const data = await subutaiAiApi.getHistories();
      setHistories(data);
    } catch {
      // 무시
    } finally {
      setHistoriesLoading(false);
    }
  };

  // ── 폴더 액션 ──────────────────────────────────────────────────────────────
  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await subutaiAiApi.createFolder(name);
      setNewFolderName("");
      setAddingFolder(false);
      await loadFolders();
    } catch {
      // 무시
    }
  };

  const handleUpdateFolder = async (id: number) => {
    const name = editingFolderName.trim();
    if (!name) return;
    try {
      await subutaiAiApi.updateFolder(id, name);
      setEditingFolderId(null);
      setEditingFolderName("");
      await loadFolders();
    } catch {
      // 무시
    }
  };

  const handleDeleteFolder = async (id: number, name: string) => {
    const ok = await confirm({
      title: "폴더 삭제",
      description: `"${name}" 폴더와 하위 URL 항목이 모두 삭제됩니다. 계속하시겠습니까?`,
      confirmText: "삭제",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await subutaiAiApi.deleteFolder(id);
      const folder = folders.find((f) => f.id === id);
      if (folder) {
        setSelectedItems((prev) => {
          const next = new Set(prev);
          folder.items.forEach((item) => next.delete(item.id));
          return next;
        });
      }
      await loadFolders();
    } catch {
      // 무시
    }
  };

  const toggleFolder = (id: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── 아이템 액션 ────────────────────────────────────────────────────────────
  const handleCreateItem = async (folderId: number) => {
    const label = newItemLabel.trim();
    const githubUrl = newItemUrl.trim();
    if (!label || !githubUrl) return;
    try {
      await subutaiAiApi.createItem({ folderId, label, githubUrl });
      setNewItemLabel("");
      setNewItemUrl("");
      setAddingItemFolderId(null);
      await loadFolders(); // loadFolders 내에서 자동 선택 처리
    } catch {
      // 무시
    }
  };

  const handleUpdateItem = async (id: number) => {
    const label = editingItemLabel.trim();
    const githubUrl = editingItemUrl.trim();
    if (!label || !githubUrl) return;
    try {
      await subutaiAiApi.updateItem(id, { label, githubUrl });
      setEditingItemId(null);
      setEditingItemLabel("");
      setEditingItemUrl("");
      await loadFolders();
    } catch {
      // 무시
    }
  };

  const handleDeleteItem = async (id: number, label: string) => {
    const ok = await confirm({
      title: "항목 삭제",
      description: `"${label}" 항목을 삭제하시겠습니까?`,
      confirmText: "삭제",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await subutaiAiApi.deleteItem(id);
      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await loadFolders();
    } catch {
      // 무시
    }
  };

  const toggleItem = (id: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── 히스토리 액션 ──────────────────────────────────────────────────────────
  const handleDeleteHistory = async (id: number) => {
    const ok = await confirm({
      title: "히스토리 삭제",
      description: "이 대화 기록을 삭제하시겠습니까?",
      confirmText: "삭제",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await subutaiAiApi.deleteHistory(id);
      setHistories((prev) => prev.filter((h) => h.id !== id));
    } catch {
      // 무시
    }
  };

  const handleHistoryClick = (history: ChatHistory) => {
    const userMsg: Message = {
      id: `hist-u-${history.id}`,
      role: "user",
      content: history.question,
      timestamp: formatDate(history.createdAt),
    };
    const aiMsg: Message = {
      id: `hist-a-${history.id}`,
      role: "ai",
      content: history.answer,
      timestamp: formatDate(history.createdAt),
      referencedUrls: history.githubUrls,
    };
    setMessages([userMsg, aiMsg]);
    setLeftTab("repos");
  };

  // ── 챗봇 전송 ──────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const now = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: Message = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: text,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    // textarea 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await subutaiAiApi.chat({
        question: text,
        githubItemIds: Array.from(selectedItems),
      });
      const aiMsg: Message = {
        id: `msg-${Date.now()}-a`,
        role: "ai",
        content: res.answer,
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        referencedUrls: res.referencedUrls,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: "ai",
        content: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  };

  // ── 유틸 ───────────────────────────────────────────────────────────────────
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const getLabelByUrl = (url: string): string => {
    for (const folder of folders) {
      for (const item of folder.items) {
        if (item.githubUrl === url) return item.label;
      }
    }
    return url;
  };

  // ── 렌더 ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex bg-background text-foreground overflow-hidden"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <ConfirmDialog />
      {/* ══════════════════════════════════════════════════════════
          좌측 패널
      ══════════════════════════════════════════════════════════ */}
      <aside className="w-72 shrink-0 border-r border-border flex flex-col overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-border shrink-0">
          <button
            onClick={() => setLeftTab("repos")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${
              leftTab === "repos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            저장소
          </button>
          <button
            onClick={() => setLeftTab("history")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${
              leftTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            히스토리
          </button>
        </div>

        {/* ── 저장소 탭 ──────────────────────────────────────── */}
        {leftTab === "repos" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* 폴더 추가 버튼 */}
            <div className="px-3 pt-3 pb-1 shrink-0">
              {addingFolder ? (
                <div className="flex items-center gap-1.5">
                  <input
                    ref={newFolderInputRef}
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateFolder();
                      }
                      if (e.key === "Escape") {
                        setAddingFolder(false);
                        setNewFolderName("");
                      }
                    }}
                    placeholder="폴더명 입력..."
                    className="flex-1 bg-muted border border-border rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setAddingFolder(false);
                      setNewFolderName("");
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingFolder(true)}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  폴더 추가
                </button>
              )}
            </div>

            {/* 폴더 목록 */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {foldersLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-xs">불러오는 중...</span>
                </div>
              ) : folders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Github className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">폴더를 추가해보세요</p>
                </div>
              ) : (
                folders.map((folder) => {
                  const isOpen = expandedFolders.has(folder.id);
                  const isAddingItem = addingItemFolderId === folder.id;

                  return (
                    <div key={folder.id} className="mb-1">
                      {/* 폴더 헤더 */}
                      {editingFolderId === folder.id ? (
                        // 수정 모드
                        <div className="flex items-center gap-1 px-2 py-1.5">
                          <input
                            ref={editFolderInputRef}
                            value={editingFolderName}
                            onChange={(e) =>
                              setEditingFolderName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUpdateFolder(folder.id);
                              }
                              if (e.key === "Escape") {
                                setEditingFolderId(null);
                                setEditingFolderName("");
                              }
                            }}
                            className="flex-1 bg-muted border border-primary/60 rounded px-2 py-0.5 text-xs outline-none text-foreground"
                          />
                          <button
                            onClick={() => handleUpdateFolder(folder.id)}
                            className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingFolderId(null);
                              setEditingFolderName("");
                            }}
                            className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        // 일반 모드
                        <div className="group flex items-center rounded-md hover:bg-muted/60 transition-colors">
                          <button
                            onClick={() => toggleFolder(folder.id)}
                            className="flex-1 flex items-center gap-1.5 px-2 py-1.5 text-left min-w-0"
                          >
                            {isOpen ? (
                              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            )}
                            <Github className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="flex-1 truncate text-xs font-medium">
                              {folder.name}
                            </span>
                          </button>
                          {/* 호버 시 나타나는 수정/삭제 버튼 */}
                          <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => {
                                setEditingFolderId(folder.id);
                                setEditingFolderName(folder.name);
                              }}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteFolder(folder.id, folder.name)
                              }
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 폴더 내용 */}
                      {isOpen && (
                        <div className="ml-5 border-l border-border pl-2 mt-0.5">
                          {folder.items.map((item) => {
                            const isSelected = selectedItems.has(item.id);
                            return (
                              <div key={item.id}>
                                {editingItemId === item.id ? (
                                  // 아이템 수정 모드
                                  <div className="mr-1 my-0.5 flex flex-col gap-1">
                                    <input
                                      ref={editItemLabelRef}
                                      value={editingItemLabel}
                                      onChange={(e) =>
                                        setEditingItemLabel(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Escape") {
                                          setEditingItemId(null);
                                          setEditingItemLabel("");
                                          setEditingItemUrl("");
                                        }
                                      }}
                                      placeholder="라벨"
                                      className="w-full bg-muted border border-primary/60 rounded px-2 py-1 text-xs outline-none text-foreground placeholder:text-muted-foreground"
                                    />
                                    <input
                                      value={editingItemUrl}
                                      onChange={(e) =>
                                        setEditingItemUrl(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleUpdateItem(item.id);
                                        }
                                        if (e.key === "Escape") {
                                          setEditingItemId(null);
                                          setEditingItemLabel("");
                                          setEditingItemUrl("");
                                        }
                                      }}
                                      placeholder="GitHub URL"
                                      className="w-full bg-muted border border-primary/60 rounded px-2 py-1 text-xs outline-none text-foreground placeholder:text-muted-foreground"
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() =>
                                          handleUpdateItem(item.id)
                                        }
                                        className="flex-1 py-0.5 rounded bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors"
                                      >
                                        저장
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingItemId(null);
                                          setEditingItemLabel("");
                                          setEditingItemUrl("");
                                        }}
                                        className="px-2 py-0.5 rounded border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // 아이템 일반 모드
                                  <div
                                    className={`group/item flex items-center gap-1 py-0.5 pr-1 rounded-md mb-0.5 transition-colors ${
                                      isSelected
                                        ? "bg-primary/10"
                                        : "hover:bg-muted/50"
                                    }`}
                                  >
                                    <button
                                      onClick={() => toggleItem(item.id)}
                                      className="flex items-center gap-1.5 flex-1 min-w-0 px-1.5 py-1 text-left"
                                    >
                                      <span
                                        className={`text-xs truncate ${
                                          isSelected
                                            ? "text-primary font-medium"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        {isSelected ? "☑" : "☐"} {item.label}
                                      </span>
                                    </button>
                                    {/* 호버 시 아이콘들 */}
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                                      <button
                                        onClick={() => {
                                          setEditingItemId(item.id);
                                          setEditingItemLabel(item.label);
                                          setEditingItemUrl(item.githubUrl);
                                        }}
                                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <a
                                        href={item.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                      <button
                                        onClick={() =>
                                          handleDeleteItem(item.id, item.label)
                                        }
                                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* 아이템 추가 */}
                          {isAddingItem ? (
                            <div className="mt-1 space-y-1.5 pb-1">
                              <input
                                ref={newItemLabelRef}
                                value={newItemLabel}
                                onChange={(e) =>
                                  setNewItemLabel(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") {
                                    setAddingItemFolderId(null);
                                    setNewItemLabel("");
                                    setNewItemUrl("");
                                  }
                                }}
                                placeholder="라벨 (예: JWT 필터)"
                                className="w-full bg-muted border border-border rounded px-2 py-1 text-xs outline-none focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
                              />
                              <input
                                value={newItemUrl}
                                onChange={(e) => setNewItemUrl(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCreateItem(folder.id);
                                  }
                                  if (e.key === "Escape") {
                                    setAddingItemFolderId(null);
                                    setNewItemLabel("");
                                    setNewItemUrl("");
                                  }
                                }}
                                placeholder="GitHub URL"
                                className="w-full bg-muted border border-border rounded px-2 py-1 text-xs outline-none focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleCreateItem(folder.id)}
                                  className="flex-1 py-1 rounded bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors"
                                >
                                  추가
                                </button>
                                <button
                                  onClick={() => {
                                    setAddingItemFolderId(null);
                                    setNewItemLabel("");
                                    setNewItemUrl("");
                                  }}
                                  className="flex-1 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70 transition-colors"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAddingItemFolderId(folder.id);
                                setNewItemLabel("");
                                setNewItemUrl("");
                              }}
                              className="w-full flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors mt-0.5"
                            >
                              <Plus className="w-3 h-3" />
                              URL 추가
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* 하단 선택 상태 */}
            <div className="px-3 py-2.5 border-t border-border shrink-0">
              {selectedItems.size > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-medium">
                    {selectedItems.size}개 참조 선택됨
                  </span>
                  <button
                    onClick={() => setSelectedItems(new Set())}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    초기화
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  참조할 항목을 선택하세요
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── 히스토리 탭 ────────────────────────────────────── */}
        {leftTab === "history" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {historiesLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-xs">불러오는 중...</span>
                </div>
              ) : histories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">대화 히스토리가 없습니다</p>
                </div>
              ) : (
                histories.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => handleHistoryClick(h)}
                    className="group relative bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/40 hover:bg-card/80 transition-colors"
                  >
                    <p className="text-xs font-medium truncate text-foreground mb-1">
                      Q: {h.question}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      A: {h.answer}
                    </p>
                    {h.githubUrls && h.githubUrls.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        📎 {h.githubUrls.length}개 참조
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(h.createdAt)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(h.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </aside>

      {/* ══════════════════════════════════════════════════════════
          우측: 챗봇 패널
      ══════════════════════════════════════════════════════════ */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {/* 챗봇 헤더 */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Subutai AI</span>
            <span className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium border border-amber-500/20">
              Beta
            </span>
          </div>
          {selectedItems.size > 0 && (
            <span className="ml-auto text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">
              {selectedItems.size}개 참조 선택됨
            </span>
          )}
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            /* 초기 상태 */
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Subutai AI</h2>
              {selectedItems.size > 0 ? (
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-medium">
                    {selectedItems.size}개 참조
                  </span>
                  가 선택되었습니다. 질문을 입력하세요
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  왼쪽에서 GitHub 저장소를 선택하고 질문하세요
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-5 max-w-3xl mx-auto">
              {messages.map((msg) =>
                msg.role === "ai" ? (
                  /* AI 말풍선 (좌측) */
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="max-w-[80%]">
                      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
                        {renderMarkdown(msg.content)}
                      </div>
                      {/* 참조 URL */}
                      {msg.referencedUrls && msg.referencedUrls.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 ml-1">
                          <span className="text-xs text-muted-foreground">
                            📎 참조:
                          </span>
                          {msg.referencedUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                            >
                              {getLabelByUrl(url)}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground mt-1 ml-1 block">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* 사용자 말풍선 (우측) */
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 flex-row-reverse"
                  >
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="max-w-[80%] flex flex-col items-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 mr-1 block">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ),
              )}

              {/* 로딩 인디케이터 */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 하단 입력창 */}
        <div className="px-6 py-4 border-t border-border shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-card border border-border rounded-xl px-4 py-3 focus-within:border-primary/50 transition-colors">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedItems.size > 0
                    ? `${selectedItems.size}개 참조를 기반으로 질문하세요...`
                    : "질문을 입력하세요..."
                }
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground leading-relaxed max-h-40"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-xs font-mono">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-xs font-mono">
                Enter
              </kbd>{" "}
              로 빠르게 전송
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
