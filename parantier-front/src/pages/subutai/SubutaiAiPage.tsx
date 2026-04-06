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
  Check,
  FileText,
  FolderOpen,
} from "lucide-react";

// ─── API 설정 ──────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

// ─── 타입 정의 ─────────────────────────────────────────────────────────────────
interface TreeNode {
  path: string;
  name: string;
  type: "blob" | "tree";
  url: string;
  children?: TreeNode[];
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

// ─── Subutai Doc API ──────────────────────────────────────────────────────────
interface DocFolder {
  id: number;
  name: string;
  orderNum: number;
}

interface DocPost {
  id: number;
  folderId: number;
  title: string;
  orderNum: number;
  sections?: DocSection[];
}

interface DocSection {
  id?: number;
  postId?: number;
  title: string;
  content: string;
  orderNum?: number;
}

const docApi = {
  getFolders: (): Promise<DocFolder[]> =>
    fetch(`${BASE}/subutai/doc/folders`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  createFolder: (name: string): Promise<void> =>
    fetch(`${BASE}/subutai/doc/folders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  updateFolder: (id: number, name: string): Promise<void> =>
    fetch(`${BASE}/subutai/doc/folders/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteFolder: (id: number): Promise<void> =>
    fetch(`${BASE}/subutai/doc/folders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  getPostsByFolder: (folderId: number): Promise<DocPost[]> =>
    fetch(`${BASE}/subutai/doc/folders/${folderId}/posts`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  getPost: (id: number): Promise<DocPost> =>
    fetch(`${BASE}/subutai/doc/posts/${id}`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  createPost: (data: {
    folderId: number;
    title: string;
    sections: DocSection[];
  }): Promise<number> =>
    fetch(`${BASE}/subutai/doc/posts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updatePost: (
    id: number,
    data: { folderId: number; title: string; sections: DocSection[] },
  ): Promise<void> =>
    fetch(`${BASE}/subutai/doc/posts/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deletePost: (id: number): Promise<void> =>
    fetch(`${BASE}/subutai/doc/posts/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),
};

// ─── GitHub API ────────────────────────────────────────────────────────────────
const githubApi = {
  getTree: (repoUrl: string): Promise<TreeNode[]> =>
    fetch(`${BASE}/subutai/github/tree?url=${encodeURIComponent(repoUrl)}`, {
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error("트리 조회 실패");
      return r.json();
    }),

  getContent: (
    owner: string,
    repo: string,
    path: string,
    branch = "main",
  ): Promise<string> =>
    fetch(
      `${BASE}/subutai/github/content?owner=${owner}&repo=${repo}&path=${encodeURIComponent(path)}&branch=${branch}`,
      { headers: getAuthHeaders() },
    ).then((r) => r.text()),
};

// ─── AI API ────────────────────────────────────────────────────────────────────
const subutaiAiApi = {
  chat: (data: {
    question: string;
    postIds: number[];
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

// ─── URL 파싱 유틸 ─────────────────────────────────────────────────────────────
const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
};

// ─── 마크다운 렌더러 ───────────────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];

  const codeBlockRegex = /```[\s\S]*?```/g;
  const parts = text.split(codeBlockRegex);
  const codeBlocks = text.match(codeBlockRegex) ?? [];

  parts.forEach((part, i) => {
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

  // 탭: 문서 / 저장소 / 히스토리
  const [leftTab, setLeftTab] = useState<"doc" | "repos" | "history">("doc");

  // ── 문서 탭 상태 ────────────────────────────────────────────────────────────
  const [docFolders, setDocFolders] = useState<DocFolder[]>([]);
  const [docPosts, setDocPosts] = useState<Record<number, DocPost[]>>({});
  const [expandedDocFolders, setExpandedDocFolders] = useState<Set<number>>(
    new Set(),
  );
  const [selectedPostIds, setSelectedPostIds] = useState<Set<number>>(
    new Set(),
  );
  const [docLoading, setDocLoading] = useState(false);

  const [addingDocFolder, setAddingDocFolder] = useState(false);
  const [newDocFolderName, setNewDocFolderName] = useState("");
  const [isSubmittingFolder, setIsSubmittingFolder] = useState(false);

  const [addingPostFolderId, setAddingPostFolderId] = useState<number | null>(
    null,
  );
  const [newPostTitle, setNewPostTitle] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const [viewPost, setViewPost] = useState<DocPost | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingSections, setEditingSections] = useState<DocSection[]>([]);
  const [isSavingPost, setIsSavingPost] = useState(false);

  // ── 저장소 탭 상태 ──────────────────────────────────────────────────────────
  const [repoUrl, setRepoUrl] = useState("");
  const [repoTree, setRepoTree] = useState<TreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [currentRepoUrl, setCurrentRepoUrl] = useState("");

  // 풀 다이얼로그
  const [isRepoDialogOpen, setIsRepoDialogOpen] = useState(false);
  const [dialogTree, setDialogTree] = useState<TreeNode[]>([]);
  const [dialogExpandedNodes, setDialogExpandedNodes] = useState<Set<string>>(
    new Set(),
  );
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileLoading, setFileLoading] = useState(false);

  // ── 챗봇 상태 ───────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── 히스토리 상태 ───────────────────────────────────────────────────────────
  const [histories, setHistories] = useState<ChatHistory[]>([]);
  const [historiesLoading, setHistoriesLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── 초기 로드 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    loadDocFolders();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── 탭 전환 ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (leftTab === "history") {
      loadHistories();
    }
    if (leftTab === "doc" && docFolders.length === 0) {
      loadDocFolders();
    }
  }, [leftTab, docFolders.length]);

  // ── 문서 탭 API ────────────────────────────────────────────────────────────
  const loadDocFolders = async () => {
    setDocLoading(true);
    try {
      const folders = await docApi.getFolders();
      setDocFolders(folders);
      setExpandedDocFolders(new Set(folders.map((f) => f.id)));
      const postsMap: Record<number, DocPost[]> = {};
      await Promise.all(
        folders.map(async (f) => {
          postsMap[f.id] = await docApi.getPostsByFolder(f.id);
        }),
      );
      setDocPosts(postsMap);
      const allPostIds = new Set(
        Object.values(postsMap)
          .flat()
          .map((p) => p.id),
      );
      setSelectedPostIds(
        (prev) => new Set([...prev].filter((id) => allPostIds.has(id))),
      );
    } catch {
      // 무시
    } finally {
      setDocLoading(false);
    }
  };

  const handleCreateDocFolder = async () => {
    if (isSubmittingFolder) return;
    const name = newDocFolderName.trim();
    if (!name) return;
    setIsSubmittingFolder(true);
    try {
      await docApi.createFolder(name);
      setNewDocFolderName("");
      setAddingDocFolder(false);
      await loadDocFolders();
    } catch {
      // 무시
    } finally {
      setIsSubmittingFolder(false);
    }
  };

  const handleDeleteDocFolder = async (id: number, name: string) => {
    const ok = await confirm({
      title: "폴더 삭제",
      description: `"${name}" 폴더와 하위 문서가 모두 삭제됩니다.`,
      confirmText: "삭제",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await docApi.deleteFolder(id);
      setSelectedPostIds((prev) => {
        const next = new Set(prev);
        (docPosts[id] || []).forEach((p) => next.delete(p.id));
        return next;
      });
      await loadDocFolders();
    } catch {
      // 무시
    }
  };

  const handleCreateDocPost = async (folderId: number) => {
    if (isSubmittingPost) return;
    const title = newPostTitle.trim();
    if (!title) return;
    setIsSubmittingPost(true);
    try {
      await docApi.createPost({ folderId, title, sections: [] });
      setNewPostTitle("");
      setAddingPostFolderId(null);
      await loadDocFolders();
    } catch {
      // 무시
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleDeleteDocPost = async (id: number, title: string) => {
    const ok = await confirm({
      title: "문서 삭제",
      description: `"${title}" 문서를 삭제하시겠습니까?`,
      confirmText: "삭제",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await docApi.deletePost(id);
      setSelectedPostIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await loadDocFolders();
    } catch {
      // 무시
    }
  };

  const toggleDocFolder = (id: number) => {
    setExpandedDocFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePostSelection = (id: number) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openViewDialog = async (post: DocPost) => {
    try {
      const full = await docApi.getPost(post.id);
      setViewPost(full);
      setEditingTitle(full.title);
      setEditingSections(full.sections ?? []);
      setIsViewDialogOpen(true);
    } catch {
      // 무시
    }
  };

  const handleSavePost = async () => {
    if (!viewPost || isSavingPost) return;
    setIsSavingPost(true);
    try {
      await docApi.updatePost(viewPost.id, {
        folderId: viewPost.folderId,
        title: editingTitle,
        sections: editingSections,
      });
      setIsViewDialogOpen(false);
      await loadDocFolders();
    } catch {
      // 무시
    } finally {
      setIsSavingPost(false);
    }
  };

  const addSection = () => {
    setEditingSections((prev) => [
      ...prev,
      { title: "", content: "", orderNum: prev.length },
    ]);
  };

  const removeSection = (idx: number) => {
    setEditingSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSection = (
    idx: number,
    field: "title" | "content",
    value: string,
  ) => {
    setEditingSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  // ── 저장소 탭 핸들러 ────────────────────────────────────────────────────────
  const handleLoadTree = async () => {
    const url = repoUrl.trim();
    if (!url) return;
    setTreeLoading(true);
    setTreeError("");
    try {
      const tree = await githubApi.getTree(url);
      setRepoTree(tree);
      setCurrentRepoUrl(url);
      setExpandedNodes(new Set());
    } catch {
      setTreeError("저장소를 불러오지 못했습니다. URL을 확인해주세요.");
    } finally {
      setTreeLoading(false);
    }
  };

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleDialogNode = (path: string) => {
    setDialogExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleFileClick = async (node: TreeNode) => {
    if (node.type !== "blob") return;
    const parsed = parseRepoUrl(currentRepoUrl);
    if (!parsed) return;

    setIsRepoDialogOpen(true);
    setDialogTree(repoTree);
    setDialogExpandedNodes(new Set(expandedNodes));
    setSelectedFilePath(node.path);
    setFileContent("");
    setFileLoading(true);

    try {
      const content = await githubApi.getContent(
        parsed.owner,
        parsed.repo,
        node.path,
      );
      setFileContent(content);
    } catch {
      setFileContent("// 파일을 불러올 수 없습니다.");
    } finally {
      setFileLoading(false);
    }
  };

  const handleDialogFileClick = async (node: TreeNode) => {
    if (node.type !== "blob") return;
    const parsed = parseRepoUrl(currentRepoUrl);
    if (!parsed) return;

    setSelectedFilePath(node.path);
    setFileContent("");
    setFileLoading(true);
    try {
      const content = await githubApi.getContent(
        parsed.owner,
        parsed.repo,
        node.path,
      );
      setFileContent(content);
    } catch {
      setFileContent("// 파일을 불러올 수 없습니다.");
    } finally {
      setFileLoading(false);
    }
  };

  // ── 트리 렌더 함수 (재귀) ────────────────────────────────────────────────────
  const renderTreeNode = (
    node: TreeNode,
    expandedSet: Set<string>,
    onToggle: (path: string) => void,
    onFileClick: (node: TreeNode) => void,
    selectedPath?: string,
    depth = 0,
  ): React.ReactNode => {
    const isExpanded = expandedSet.has(node.path);
    const isSelected = node.path === selectedPath;
    const isFolder = node.type === "tree";

    return (
      <div key={node.path}>
        <div
          onClick={() => (isFolder ? onToggle(node.path) : onFileClick(node))}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`flex items-center gap-1.5 py-1 pr-2 cursor-pointer rounded-md text-sm transition-colors ${
            isSelected
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-muted/60"
          }`}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              )}
              <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </>
          ) : (
            <>
              <span className="w-3.5 shrink-0" />
              <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) =>
              renderTreeNode(
                child,
                expandedSet,
                onToggle,
                onFileClick,
                selectedPath,
                depth + 1,
              ),
            )}
          </div>
        )}
      </div>
    );
  };

  // ── 히스토리 액션 ──────────────────────────────────────────────────────────
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
    setLeftTab("doc");
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

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await subutaiAiApi.chat({
        question: text,
        postIds: Array.from(selectedPostIds),
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

  // ── 렌더 ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex bg-background text-foreground overflow-hidden"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <ConfirmDialog />

      {/* 문서 보기/편집 다이얼로그 */}
      {isViewDialogOpen && viewPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsViewDialogOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-xl shadow-2xl w-[800px] max-w-[90vw] max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="flex-1 text-lg font-semibold bg-transparent outline-none border-b border-transparent focus:border-primary/50"
                placeholder="문서 제목"
              />
              <button
                onClick={handleSavePost}
                disabled={isSavingPost}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSavingPost ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                저장
              </button>
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 본문 목록 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {editingSections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">본문을 추가해주세요</p>
                </div>
              ) : (
                editingSections.map((section, idx) => (
                  <div
                    key={idx}
                    className="border border-border rounded-lg p-4 space-y-3 bg-muted/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium w-16 shrink-0">
                        본문 제목
                      </span>
                      <input
                        value={section.title}
                        onChange={(e) =>
                          updateSection(idx, "title", e.target.value)
                        }
                        placeholder="본문 제목 (선택)"
                        className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-primary/60"
                      />
                      <button
                        onClick={() => removeSection(idx)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground font-medium w-16 shrink-0 pt-2">
                        내용
                      </span>
                      <textarea
                        value={section.content}
                        onChange={(e) =>
                          updateSection(idx, "content", e.target.value)
                        }
                        placeholder="내용을 입력하세요..."
                        rows={5}
                        className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary/60 resize-y min-h-[80px]"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 푸터: 본문 추가 */}
            <div className="px-6 py-3 border-t border-border shrink-0">
              <button
                onClick={addSection}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> 본문 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 저장소 풀 다이얼로그 */}
      {isRepoDialogOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 bg-card">
            <Github className="w-5 h-5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-muted-foreground truncate">
              {currentRepoUrl.replace("https://github.com/", "")}
            </span>
            {selectedFilePath && (
              <>
                <span className="text-muted-foreground/40 shrink-0">/</span>
                <span className="text-sm font-medium text-foreground truncate">
                  {selectedFilePath}
                </span>
                <a
                  href={`${currentRepoUrl}/blob/main/${selectedFilePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            )}
            <button
              onClick={() => setIsRepoDialogOpen(false)}
              className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 본문: 좌측 트리 + 우측 코드 */}
          <div className="flex flex-1 overflow-hidden">
            {/* 좌측 트리 사이드바 */}
            <div className="w-72 shrink-0 border-r border-border overflow-y-auto bg-card/50">
              <div className="py-2 px-1">
                {dialogTree.map((node) =>
                  renderTreeNode(
                    node,
                    dialogExpandedNodes,
                    toggleDialogNode,
                    handleDialogFileClick,
                    selectedFilePath,
                  ),
                )}
              </div>
            </div>

            {/* 우측 코드 뷰어 */}
            <div className="flex-1 overflow-auto bg-background">
              {fileLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : fileContent ? (
                <pre className="p-4 text-xs font-mono text-foreground whitespace-pre leading-relaxed">
                  <code>{fileContent}</code>
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">왼쪽에서 파일을 선택하세요</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          좌측 패널
      ══════════════════════════════════════════════════════════ */}
      <aside className="w-[600px] shrink-0 border-r border-border flex flex-col overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-border shrink-0">
          <button
            onClick={() => setLeftTab("doc")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${
              leftTab === "doc"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            문서
          </button>
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

        {/* ── 문서 탭 ─────────────────────────────────────────── */}
        {leftTab === "doc" && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* 폴더 추가 버튼 */}
            <div className="px-3 pt-3 pb-1 shrink-0">
              {addingDocFolder ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={newDocFolderName}
                    onChange={(e) => setNewDocFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateDocFolder();
                      }
                      if (e.key === "Escape") {
                        setAddingDocFolder(false);
                        setNewDocFolderName("");
                      }
                    }}
                    placeholder="폴더명 입력..."
                    className="flex-1 bg-muted border border-border rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleCreateDocFolder}
                    disabled={isSubmittingFolder}
                    className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setAddingDocFolder(false);
                      setNewDocFolderName("");
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingDocFolder(true)}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> 폴더 추가
                </button>
              )}
            </div>

            {/* 폴더 목록 */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {docLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : docFolders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">폴더를 추가해주세요</p>
                </div>
              ) : (
                docFolders.map((folder) => {
                  const isOpen = expandedDocFolders.has(folder.id);
                  const posts = docPosts[folder.id] ?? [];
                  const selectedCount = posts.filter((p) =>
                    selectedPostIds.has(p.id),
                  ).length;

                  return (
                    <div key={folder.id} className="mb-1">
                      {/* 폴더 헤더 */}
                      <div className="group flex items-center rounded-md hover:bg-muted/60 transition-colors">
                        <button
                          onClick={() => toggleDocFolder(folder.id)}
                          className="flex-1 flex items-center gap-1.5 px-2 py-2 text-left min-w-0"
                        >
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          )}
                          <FolderOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate text-sm font-medium">
                            {folder.name}
                          </span>
                          {selectedCount > 0 && (
                            <span className="text-xs text-primary font-semibold mr-1">
                              {selectedCount}
                            </span>
                          )}
                        </button>
                        <div className="flex items-center gap-0.5 pr-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              handleDeleteDocFolder(folder.id, folder.name)
                            }
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 문서 목록 */}
                      {isOpen && (
                        <div className="ml-4 border-l border-border pl-2 mt-0.5 space-y-0.5">
                          {posts.map((post) => {
                            const isSelected = selectedPostIds.has(post.id);
                            return (
                              <div
                                key={post.id}
                                onClick={() => togglePostSelection(post.id)}
                                className={`group/post flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted/50 text-foreground"
                                }`}
                              >
                                <FileText
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSelected
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                                <span className="flex-1 text-sm truncate">
                                  {post.title}
                                </span>
                                <div
                                  className="flex items-center gap-1 opacity-0 group-hover/post:opacity-100 transition-opacity shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => openViewDialog(post)}
                                    className="px-2 py-0.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                  >
                                    보기
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteDocPost(post.id, post.title)
                                    }
                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {/* 문서 추가 */}
                          {addingPostFolderId === folder.id ? (
                            <div className="flex items-center gap-1 px-1 py-1">
                              <input
                                autoFocus
                                value={newPostTitle}
                                onChange={(e) =>
                                  setNewPostTitle(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCreateDocPost(folder.id);
                                  }
                                  if (e.key === "Escape") {
                                    setAddingPostFolderId(null);
                                    setNewPostTitle("");
                                  }
                                }}
                                placeholder="문서 제목..."
                                className="flex-1 bg-muted border border-border rounded px-2 py-1 text-xs outline-none focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
                              />
                              <button
                                onClick={() => handleCreateDocPost(folder.id)}
                                disabled={isSubmittingPost}
                                className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setAddingPostFolderId(null);
                                  setNewPostTitle("");
                                }}
                                className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAddingPostFolderId(folder.id);
                                setNewPostTitle("");
                              }}
                              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                            >
                              <Plus className="w-3 h-3" /> 문서 추가
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* 하단: 선택 상태 */}
            {selectedPostIds.size > 0 && (
              <div className="px-3 py-2 border-t border-border shrink-0 flex items-center justify-between">
                <span className="text-xs text-primary font-medium">
                  {selectedPostIds.size}개 문서 선택됨
                </span>
                <button
                  onClick={() => setSelectedPostIds(new Set())}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> 초기화
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── 저장소 탭 ──────────────────────────────────────── */}
        {leftTab === "repos" && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* URL 입력 */}
            <div className="px-3 pt-3 pb-2 shrink-0 space-y-2">
              <div className="flex gap-1.5">
                <input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLoadTree();
                    }
                  }}
                  placeholder="https://github.com/owner/repo"
                  className="flex-1 bg-muted border border-border rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={handleLoadTree}
                  disabled={treeLoading || !repoUrl.trim()}
                  className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1"
                >
                  {treeLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Github className="w-3 h-3" />
                  )}
                  불러오기
                </button>
              </div>
              {treeError && (
                <p className="text-xs text-destructive">{treeError}</p>
              )}
              {currentRepoUrl && !treeLoading && (
                <p className="text-xs text-muted-foreground truncate">
                  ✓ {currentRepoUrl.replace("https://github.com/", "")}
                </p>
              )}
            </div>

            {/* 트리 */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {treeLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    트리 구조 로딩 중...
                  </p>
                </div>
              ) : repoTree.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Github className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">GitHub URL을 입력하고</p>
                  <p className="text-sm">불러오기를 클릭하세요</p>
                </div>
              ) : (
                repoTree.map((node) =>
                  renderTreeNode(
                    node,
                    expandedNodes,
                    toggleNode,
                    handleFileClick,
                  ),
                )
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
          {selectedPostIds.size > 0 && (
            <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              문서 {selectedPostIds.size}개 참조 중
            </span>
          )}
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Subutai AI</h2>
              <p className="text-sm text-muted-foreground">
                {selectedPostIds.size > 0
                  ? `${selectedPostIds.size}개 문서를 참고하여 답변합니다`
                  : "왼쪽 문서 탭에서 참고할 문서를 선택하고 질문하세요"}
              </p>
            </div>
          ) : (
            <div className="space-y-5 max-w-3xl mx-auto">
              {messages.map((msg) =>
                msg.role === "ai" ? (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="max-w-[80%]">
                      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
                        {renderMarkdown(msg.content)}
                      </div>
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
                              {url}
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
                  selectedPostIds.size > 0
                    ? `${selectedPostIds.size}개 문서를 참고하여 질문하세요...`
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
