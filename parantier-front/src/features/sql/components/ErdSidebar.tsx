import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Network,
  Database,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Mermaid } from "@/shared/ui/mermaid";
import { toast } from "sonner";
import mermaid from "mermaid";
import {
  useSqlErds,
  useCreateErd,
  useUpdateErd,
  useDeleteErd,
} from "@/features/sql/hooks/useSqlErds";
import type { SqlErd } from "@/features/sql/api/sqlErdApi";
import { sqlErdApi } from "@/features/sql/api/sqlErdApi";
import { sqlApi } from "@/features/sql/api/sqlApi";
import type { TableInfo } from "@/features/sql/api/sqlApi";

const DEFAULT_PLACEHOLDER = `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains`;

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/* ─────────────────────────── ERD with DB 다이얼로그 ──────────────────────────── */
interface ErdWithDbDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (mmd: string) => void;
  initialMmd?: string;
}

function ErdWithDbDialog({
  open,
  onOpenChange,
  onApply,
  initialMmd,
}: ErdWithDbDialogProps) {
  const [mmd, setMmd] = useState(initialMmd ?? "");
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTableNames, setSelectedTableNames] = useState<Set<string>>(
    new Set(),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // 다이얼로그 열릴 때마다 테이블 로드 및 state 초기화
  useEffect(() => {
    if (!open) return;

    setMmd(initialMmd ?? "");
    setSelectedTableNames(new Set());

    const fetchTables = async () => {
      setIsLoadingTables(true);
      try {
        const data = await sqlApi.getTables();
        setTables(data);
      } catch {
        toast.error("테이블 목록을 불러오지 못했습니다");
      } finally {
        setIsLoadingTables(false);
      }
    };

    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // initialMmd는 의도적으로 제외 (열릴 때 1회만 적용)

  const allSelected =
    tables.length > 0 && selectedTableNames.size === tables.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedTableNames(new Set());
    } else {
      setSelectedTableNames(new Set(tables.map((t) => t.tableName)));
    }
  };

  const handleToggleTable = (tableName: string) => {
    setSelectedTableNames((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (selectedTableNames.size === 0) return;
    setIsGenerating(true);
    try {
      const selectedTables = tables.filter((t) =>
        selectedTableNames.has(t.tableName),
      );
      const result = await sqlErdApi.generateErd(selectedTables);
      setMmd(result.mmd);
      toast.success("ERD가 생성되었습니다!");
    } catch {
      toast.error("AI 생성 실패");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onApply(mmd);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            ERD with DB
          </DialogTitle>
        </DialogHeader>

        {/* 본문 */}
        <div className="flex flex-1 gap-4 overflow-hidden px-6 py-4">
          {/* 왼쪽: MMD 코드 편집 */}
          <div className="flex-1 flex flex-col min-w-0">
            <label className="text-sm font-medium mb-1.5 shrink-0 text-foreground">
              MMD 코드
            </label>
            <textarea
              value={mmd}
              onChange={(e) => setMmd(e.target.value)}
              placeholder={DEFAULT_PLACEHOLDER}
              className="flex-1 w-full px-3 py-2 border border-input rounded-md text-sm font-mono bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* 가운데: AI 생성 버튼 */}
          <div className="w-20 flex flex-col items-center justify-center gap-2 shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerate}
              disabled={selectedTableNames.size === 0 || isGenerating}
              className="flex flex-col items-center gap-1 h-auto py-3 px-2 w-full text-center"
              title={
                selectedTableNames.size === 0
                  ? "오른쪽에서 테이블을 선택하세요"
                  : "선택한 테이블로 ERD 생성"
              }
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  <span className="text-[10px] leading-tight">생성 중</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-pre-line text-center">
                    {"AI\n생성"}
                  </span>
                </>
              )}
            </Button>
            <ArrowLeft className="w-4 h-4 text-muted-foreground opacity-60" />
          </div>

          {/* 오른쪽: DB 테이블 목록 */}
          <div className="w-72 flex flex-col shrink-0 border border-border rounded-md overflow-hidden bg-card">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 shrink-0">
              <span className="text-sm font-medium text-foreground">
                DB 테이블
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleAll}
                disabled={isLoadingTables || tables.length === 0}
                className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
              >
                {allSelected ? "전체 해제" : "전체 선택"}
              </Button>
            </div>

            {/* 목록 */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingTables ? (
                <div className="flex items-center justify-center h-full text-muted-foreground p-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    <p className="text-xs">테이블 로딩 중...</p>
                  </div>
                </div>
              ) : tables.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                  <Database className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs text-center">
                    연결된 DB에 테이블이 없습니다
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {tables.map((table) => {
                    const isChecked = selectedTableNames.has(table.tableName);
                    return (
                      <label
                        key={table.tableName}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors group"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleTable(table.tableName)}
                          className="w-3.5 h-3.5 accent-primary shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate text-foreground">
                            {table.tableName}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {table.columns.length}개 컬럼 ·{" "}
                            {table.rowCount.toLocaleString()}행
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <DialogFooter className="px-6 py-4 border-t border-border shrink-0 flex items-center">
          <span className="text-sm text-muted-foreground mr-auto">
            {selectedTableNames.size > 0 ? (
              <span className="text-primary font-medium">
                {selectedTableNames.size}개
              </span>
            ) : (
              "0개"
            )}{" "}
            선택됨
          </span>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            취소
          </Button>
          <Button onClick={handleApply} disabled={isGenerating}>
            이 MMD 사용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────────── 편집 다이얼로그 ───────────────────────────── */
interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingErd: SqlErd | null;
  onSaved: () => void;
}

function EditDialog({
  open,
  onOpenChange,
  editingErd,
  onSaved,
}: EditDialogProps) {
  const isEdit = editingErd !== null;

  const [title, setTitle] = useState(editingErd?.title ?? "");
  const [content, setContent] = useState(editingErd?.content ?? "");
  const [description, setDescription] = useState(editingErd?.description ?? "");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  // ERD with DB 다이얼로그 state
  const [erdWithDbOpen, setErdWithDbOpen] = useState(false);

  // open 될 때마다 값 초기화를 위해 key prop으로 처리하므로 별도 useEffect 불필요

  const { mutate: createErd, isPending: isCreating } = useCreateErd();
  const { mutate: updateErd, isPending: isUpdating } = useUpdateErd();
  const isPending = isCreating || isUpdating;

  const handleValidate = async () => {
    if (!content.trim()) {
      setValidationResult({
        isValid: false,
        error: "Mermaid 코드를 입력하세요",
      });
      toast.error("Mermaid 코드를 입력하세요");
      return;
    }
    try {
      await mermaid.parse(content, { suppressErrors: false });
      setValidationResult({ isValid: true });
      toast.success("✅ Mermaid 문법이 올바릅니다");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setValidationResult({ isValid: false, error: errorMessage });
      toast.error("❌ Mermaid 문법 오류가 있습니다");
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("제목을 입력하세요");
      return;
    }
    if (!content.trim()) {
      toast.error("Mermaid 코드를 입력하세요");
      return;
    }

    if (isEdit) {
      updateErd(
        {
          id: editingErd.id,
          request: {
            title: title.trim(),
            content: content.trim(),
            description: description.trim() || undefined,
            orderNum: editingErd.orderNum,
          },
        },
        { onSuccess: onSaved },
      );
    } else {
      createErd(
        {
          title: title.trim(),
          content: content.trim(),
          description: description.trim() || undefined,
        },
        { onSuccess: onSaved },
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "ERD 수정" : "ERD 추가"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* 왼쪽: 입력 영역 */}
            <div className="space-y-3">
              {/* 제목 */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ERD 제목 입력"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                />
              </div>

              {/* 설명 (optional) */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  설명 <span className="font-normal">(선택)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="간단한 설명"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                />
              </div>

              {/* Mermaid 코드 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">
                    Mermaid 코드
                    <span className="text-muted-foreground font-normal ml-2 text-xs">
                      (실시간 미리보기로 확인하세요)
                    </span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {/* ERD with DB 버튼 */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setErdWithDbOpen(true)}
                      className="h-7 text-xs"
                    >
                      <Database className="w-3 h-3 mr-1" />
                      ERD with DB
                    </Button>
                    {/* 문법 검증 버튼 */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleValidate}
                      className="h-7 text-xs"
                    >
                      문법 검증
                    </Button>
                  </div>
                </div>

                {/* 검증 결과 */}
                {validationResult && (
                  <div
                    className={`mb-2 p-2 rounded-md text-sm border ${
                      validationResult.isValid
                        ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                        : "bg-destructive/10 border-destructive/30 text-destructive"
                    }`}
                  >
                    {validationResult.isValid ? (
                      <p className="flex items-center gap-1 font-semibold">
                        ✅ 문법이 올바릅니다
                      </p>
                    ) : (
                      <div>
                        <p className="font-semibold mb-1">❌ 문법 오류</p>
                        <pre className="text-xs whitespace-pre-wrap">
                          {validationResult.error}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder={DEFAULT_PLACEHOLDER}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm font-mono bg-background text-foreground resize-none"
                  rows={20}
                />
              </div>
            </div>

            {/* 오른쪽: 실시간 미리보기 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium block">미리보기</label>
              <div
                className="border border-border rounded-md p-4 bg-muted/30 overflow-auto"
                style={{ height: "calc(100% - 28px)" }}
              >
                {content.trim() ? (
                  <Mermaid chart={content} className="mermaid-erd-preview" />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    왼쪽에 Mermaid 코드를 입력하면
                    <br />
                    여기에 다이어그램이 표시됩니다
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ERD with DB 다이얼로그 */}
      <ErdWithDbDialog
        open={erdWithDbOpen}
        onOpenChange={setErdWithDbOpen}
        initialMmd={content}
        onApply={(newMmd) => {
          setContent(newMmd);
          setValidationResult(null);
          setErdWithDbOpen(false);
        }}
      />
    </>
  );
}

/* ────────────────────────────── 뷰 다이얼로그 ──────────────────────────────── */
interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  erd: SqlErd | null;
}

function ViewDialog({ open, onOpenChange, erd }: ViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{erd?.title ?? "ERD 다이어그램"}</DialogTitle>
        </DialogHeader>

        {erd?.description && (
          <p className="text-sm text-muted-foreground -mt-1">
            {erd.description}
          </p>
        )}

        <div className="flex-1 overflow-auto border border-border rounded-md p-4 bg-muted/30 min-h-[400px]">
          {erd?.content ? (
            <Mermaid chart={erd.content} className="mermaid-erd-view" />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              다이어그램 데이터가 없습니다
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────────── ErdSidebar (메인) ─────────────────────────────── */
export function ErdSidebar() {
  const { data: erds = [], isLoading } = useSqlErds();
  const { mutate: deleteErd } = useDeleteErd();

  // 편집 다이얼로그
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingErd, setEditingErd] = useState<SqlErd | null>(null);
  // dialog key: 열릴 때마다 EditDialog 내부 state 초기화
  const [editDialogKey, setEditDialogKey] = useState(0);

  // 뷰 다이얼로그
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingErd, setViewingErd] = useState<SqlErd | null>(null);

  const openCreate = () => {
    setEditingErd(null);
    setEditDialogKey((k) => k + 1);
    setEditDialogOpen(true);
  };

  const openEdit = (erd: SqlErd, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingErd(erd);
    setEditDialogKey((k) => k + 1);
    setEditDialogOpen(true);
  };

  const openView = (erd: SqlErd) => {
    setViewingErd(erd);
    setViewDialogOpen(true);
  };

  const handleDelete = (erd: SqlErd, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`"${erd.title}" ERD를 삭제하시겠습니까?`)) return;
    deleteErd(erd.id);
  };

  const handleEditSaved = () => {
    setEditDialogOpen(false);
  };

  return (
    <>
      <div className="w-56 border-r border-border bg-card flex flex-col shrink-0">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-foreground text-sm">ERD 목록</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={openCreate}
            className="w-7 h-7"
            title="새 ERD 추가"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground p-6">
              <p className="text-sm">불러오는 중...</p>
            </div>
          ) : erds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
              <Network className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm text-center">
                ERD가 없습니다.
                <br />
                <button
                  onClick={openCreate}
                  className="mt-1 text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  새로 만들어보세요!
                </button>
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {erds.map((erd) => (
                <div
                  key={erd.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer text-foreground hover:bg-muted"
                  onClick={() => openView(erd)}
                >
                  <Network className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {erd.title}
                    </div>
                    {erd.description && (
                      <div className="text-[11px] text-muted-foreground truncate">
                        {erd.description}
                      </div>
                    )}
                  </div>

                  {/* hover 시 편집/삭제 버튼 */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => openEdit(erd, e)}
                      className="p-1 rounded hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
                      title="편집"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(erd, e)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 편집 다이얼로그 */}
      <EditDialog
        key={editDialogKey}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editingErd={editingErd}
        onSaved={handleEditSaved}
      />

      {/* 뷰 다이얼로그 */}
      <ViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        erd={viewingErd}
      />
    </>
  );
}
