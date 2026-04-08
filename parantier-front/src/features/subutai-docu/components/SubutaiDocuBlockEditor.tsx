import { useState, useEffect, useRef, useCallback } from "react";
import { LexicalEditor } from "@/shared/ui/lexical/LexicalEditor";
import { Mermaid } from "@/shared/ui/mermaid";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  SubutaiDocuBlock,
  BlockType,
  DbColumn,
  DbTableContent,
  GithubContent,
} from "../types/subutaiDocu.types";
import {
  TYPE_META,
  parseDbTableContent,
  parseGithubContent,
  parseTsvToColumns,
} from "../types/subutaiDocu.types";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";
import { tablePresetApi } from "@/shared/api/tablePreset.api";
import type { TablePreset } from "@/shared/types/tablePreset";

interface Props {
  title: string;
  setTitle: (title: string) => void;
  blocks: SubutaiDocuBlock[];
  setBlocks: (blocks: SubutaiDocuBlock[]) => void;
  hideTitle?: boolean;
}

export default function SubutaiDocuBlockEditor({
  title,
  setTitle,
  blocks,
  setBlocks,
  hideTitle = false,
}: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [addingBlockType, setAddingBlockType] = useState<BlockType | null>(
    null,
  );
  const [addingBlockTitle, setAddingBlockTitle] = useState("");

  // 사이드바 리사이즈
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("blockEditorSidebarWidth");
    return saved ? Number(saved) : 260;
  });
  const isResizing = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const parent = document.getElementById("block-editor-container");
      if (!parent) return;
      const left = parent.getBoundingClientRect().left;
      setSidebarWidth(Math.max(150, Math.min(400, e.clientX - left)));
    };
    const onUp = () => {
      if (isResizing.current) {
        localStorage.setItem("blockEditorSidebarWidth", String(sidebarWidth));
      }
      isResizing.current = false;
      document.body.style.cursor = "default";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  // 블록 드래그앤드롭
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // 블록마다 고유 ID 부여 (index 기반)
  const blockIds = blocks.map((_, i) => `block-${i}`);

  const handleBlockDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = blockIds.indexOf(active.id as string);
      const newIndex = blockIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(reordered);
      // 선택된 블록 인덱스도 따라가도록
      if (selectedIdx === oldIndex) setSelectedIdx(newIndex);
      else if (oldIndex < selectedIdx && newIndex >= selectedIdx) setSelectedIdx(selectedIdx - 1);
      else if (oldIndex > selectedIdx && newIndex <= selectedIdx) setSelectedIdx(selectedIdx + 1);
    },
    [blocks, blockIds, selectedIdx, setBlocks],
  );

  const updateBlock = (
    idx: number,
    prop: keyof SubutaiDocuBlock,
    val: string,
  ) => {
    setBlocks(blocks.map((b, i) => (i === idx ? { ...b, [prop]: val } : b)));
  };

  const addBlock = (type: BlockType, blockTitle: string) => {
    const next = [
      ...blocks,
      { blockType: type, blockTitle: blockTitle.trim(), content: "" },
    ];
    setBlocks(next);
    setSelectedIdx(next.length - 1);
    setAddingBlockType(null);
    setAddingBlockTitle("");
  };

  const removeBlock = (idx: number) => {
    const next = blocks.filter((_, i) => i !== idx);
    setBlocks(next);
    setSelectedIdx(Math.max(0, idx - 1));
  };

  const selectedBlock = blocks[selectedIdx] ?? null;
  const selectedMeta = selectedBlock
    ? (TYPE_META[selectedBlock.blockType] ?? TYPE_META.NOTE)
    : null;

  return (
    <div id="block-editor-container" className="flex h-full min-h-0 text-sm overflow-hidden">
      {/* 좌측: 블록 목록 사이드바 */}
      <div className="shrink-0 border-r border-border flex flex-col bg-muted/20" style={{ width: `${sidebarWidth}px` }}>
        {!hideTitle && (
          <div className="px-3 py-2.5 border-b border-border">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-semibold bg-transparent outline-none placeholder:text-muted-foreground/50"
              placeholder="문서 제목"
            />
          </div>
        )}

        {/* 블록 목록 */}
        <div className="flex-1 overflow-y-auto py-1 px-1 space-y-0.5">
          {blocks.length === 0 && !addingBlockType ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              아래에서 본문을 추가하세요
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
              <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                {blocks.map((block, idx) => (
                  <SortableBlockItem
                    key={blockIds[idx]}
                    id={blockIds[idx]}
                    block={block}
                    idx={idx}
                    isSelected={selectedIdx === idx}
                    onClick={() => setSelectedIdx(idx)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {/* 블록 추가 중 - 제목 입력 */}
          {addingBlockType &&
            (() => {
              const meta = TYPE_META[addingBlockType] ?? TYPE_META.NOTE;
              return (
                <div className="border border-primary/40 rounded-lg p-2 bg-primary/5 mt-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm">{meta.icon}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={addingBlockTitle}
                    onChange={(e) => setAddingBlockTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing) return;
                      if (e.key === "Enter")
                        addBlock(addingBlockType, addingBlockTitle);
                      if (e.key === "Escape") {
                        setAddingBlockType(null);
                        setAddingBlockTitle("");
                      }
                    }}
                    placeholder="제목 입력 후 Enter"
                    className="w-full text-xs border border-border rounded px-2 py-1 bg-background outline-none focus:border-primary/60 mb-1.5"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        addBlock(addingBlockType, addingBlockTitle)
                      }
                      className="flex-1 text-xs py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      추가
                    </button>
                    <button
                      onClick={() => {
                        setAddingBlockType(null);
                        setAddingBlockTitle("");
                      }}
                      className="flex-1 text-xs py-1 bg-muted text-muted-foreground rounded hover:bg-muted/70 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              );
            })()}
        </div>

        {/* 하단: 본문 추가 버튼 */}
        <div className="border-t border-border p-2 shrink-0">
          <p className="text-[10px] text-muted-foreground mb-1.5 px-1">
            본문 추가
          </p>
          <div className="grid grid-cols-2 gap-1">
            {(
              Object.entries(TYPE_META) as [
                BlockType,
                (typeof TYPE_META)[BlockType],
              ][]
            ).map(([type, meta]) => (
              <button
                key={type}
                onClick={() => {
                  setAddingBlockType(type);
                  setAddingBlockTitle("");
                }}
                className={`flex items-center gap-1 px-1.5 py-1 text-[11px] border rounded transition-colors ${
                  addingBlockType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-accent"
                }`}
              >
                <span>{meta.icon}</span>
                <span className="truncate">{meta.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 리사이즈 핸들 */}
      <div
        className="w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors shrink-0"
        onMouseDown={() => {
          isResizing.current = true;
          document.body.style.cursor = "col-resize";
        }}
      />

      {/* 우측: 선택된 블록 편집 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedBlock === null ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <p className="text-sm">왼쪽에서 블록을 선택하거나 추가하세요</p>
          </div>
        ) : (
          <>
            {/* 블록 헤더 */}
            <div className="flex flex-col border-b border-border bg-muted/30 shrink-0">
              <div className="flex items-center justify-between px-4 py-2">
                <span
                  className={`px-2 py-0.5 text-xs rounded font-medium ${selectedMeta!.color}`}
                >
                  {selectedMeta!.icon} {selectedMeta!.label}
                </span>
                <button
                  onClick={() => removeBlock(selectedIdx)}
                  className="text-xs px-2 py-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  삭제
                </button>
              </div>
              {/* 블록 제목 입력 */}
              <div className="px-4 pb-2">
                <input
                  type="text"
                  value={selectedBlock.blockTitle ?? ""}
                  onChange={(e) =>
                    updateBlock(selectedIdx, "blockTitle", e.target.value)
                  }
                  placeholder="블록 제목 (선택)"
                  className="w-full text-sm font-medium bg-background border border-border rounded px-2.5 py-1.5 outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* 블록 편집 영역 */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              {selectedBlock.blockType === "DBTABLE" ? (
                <DbTableBlockEditor
                  key={selectedIdx}
                  content={selectedBlock.content}
                  onChange={(newContent) =>
                    updateBlock(selectedIdx, "content", newContent)
                  }
                />
              ) : selectedBlock.blockType === "GITHUB" ? (
                <GithubBlockEditor
                  key={selectedIdx}
                  content={selectedBlock.content}
                  onChange={(val) => updateBlock(selectedIdx, "content", val)}
                />
              ) : selectedBlock.blockType === "NOTE" ? (
                <LexicalEditor
                  key={selectedIdx}
                  initialState={selectedBlock.content}
                  onChange={(val) => updateBlock(selectedIdx, "content", val)}
                  placeholder="내용을 입력하세요..."
                  minHeight="300px"
                />
              ) : selectedBlock.blockType === "MMD" ? (
                <MermaidBlockEditor
                  key={selectedIdx}
                  content={selectedBlock.content}
                  onChange={(val) => updateBlock(selectedIdx, "content", val)}
                />
              ) : (
                <textarea
                  key={selectedIdx}
                  value={selectedBlock.content}
                  onChange={(e) =>
                    updateBlock(selectedIdx, "content", e.target.value)
                  }
                  className="w-full h-full px-4 py-3 text-sm font-mono border-0 resize-none focus:outline-none bg-background"
                  placeholder={
                    selectedBlock.blockType === "FIGMA"
                        ? "https://www.figma.com/file/..."
                        : selectedBlock.blockType === "FILE"
                          ? '{"url": "", "filename": "", "description": ""}'
                          : "내용을 입력하세요."
                  }
                  style={{ minHeight: "300px" }}
                />
              )}
            </div>
          </>
        )}

        {selectedBlock === null && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">왼쪽에서 본문을 선택하거나 추가하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 드래그 가능한 블록 아이템 ──────────────────────────────────────────────────

function SortableBlockItem({
  id,
  block,
  idx,
  isSelected,
  onClick,
}: {
  id: string;
  block: SubutaiDocuBlock;
  idx: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const meta = TYPE_META[block.blockType] ?? TYPE_META.NOTE;
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`w-full flex items-center gap-1 px-1 py-2 rounded text-left transition-colors cursor-pointer ${
        isSelected
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent text-foreground"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className={`shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded ${
          isSelected
            ? "text-primary-foreground/50"
            : "text-muted-foreground/30 hover:text-muted-foreground"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3 h-3" />
      </button>
      <span className="text-base shrink-0">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {block.blockTitle?.trim() ? block.blockTitle : meta.label}
        </p>
        <p className="text-[10px] opacity-60">
          {idx + 1}번 · {meta.label}
        </p>
      </div>
    </div>
  );
}

// ── Mermaid 블록 전용 에디터 ──────────────────────────────────────────────────

function MermaidBlockEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (val: string) => void;
}) {
  const [mode, setMode] = useState<"edit" | "preview">(
    content.trim() ? "preview" : "edit",
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 탭 전환 */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/20 shrink-0">
        <button
          onClick={() => setMode("edit")}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${
            mode === "edit"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          코드 편집
        </button>
        <button
          onClick={() => setMode("preview")}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${
            mode === "preview"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          미리보기
        </button>
      </div>

      {mode === "edit" ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full flex-1 px-4 py-3 text-sm font-mono border-0 resize-none focus:outline-none bg-background"
          placeholder={"sequenceDiagram\n    A->>B: Hello"}
          style={{ minHeight: "300px" }}
        />
      ) : (
        <div className="flex-1 overflow-auto p-4 bg-white">
          {content.trim() ? (
            <Mermaid chart={content} className="mermaid-diagram" />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              코드 편집 탭에서 Mermaid 코드를 입력하세요
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── GitHub 블록 전용 에디터 ────────────────────────────────────────────────────

function GithubBlockEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (val: string) => void;
}) {
  const github = parseGithubContent(content);

  const handleUpdate = (field: keyof GithubContent, value: string) => {
    onChange(JSON.stringify({ ...github, [field]: value }));
  };

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            GitHub URL *
          </label>
          <input
            type="url"
            value={github.url}
            onChange={(e) => handleUpdate("url", e.target.value)}
            placeholder="https://github.com/org/repo"
            className="w-full border border-input rounded px-2 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            종류
          </label>
          <select
            value={github.type}
            onChange={(e) => handleUpdate("type", e.target.value)}
            className="w-full border border-input rounded px-2 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="repo">📁 Repository</option>
            <option value="pr">🔀 Pull Request</option>
            <option value="issue">🐛 Issue</option>
            <option value="gist">📋 Gist</option>
            <option value="other">🔗 기타</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">제목</label>
        <input
          type="text"
          value={github.title}
          onChange={(e) => handleUpdate("title", e.target.value)}
          placeholder="레포지토리 이름 또는 제목"
          className="w-full border border-input rounded px-2 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">설명</label>
        <textarea
          value={github.description}
          onChange={(e) => handleUpdate("description", e.target.value)}
          rows={3}
          placeholder="이 레포/PR/이슈에 대한 설명을 입력하세요"
          className="w-full border border-input rounded px-2 py-1.5 text-sm bg-background text-foreground resize-y focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}

// ── DB 테이블 블록 전용 에디터 ────────────────────────────────────────────────

function DbTableBlockEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) {
  const [dbTable, setDbTable] = useState<DbTableContent>(() =>
    parseDbTableContent(content),
  );
  const [presets, setPresets] = useState<TablePreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

  useEffect(() => {
    tablePresetApi.getMyPresets().then(setPresets).catch(console.error);
  }, []);

  const handleUpdate = (updated: DbTableContent) => {
    setDbTable(updated);
    onChange(JSON.stringify(updated));
  };

  const handleApplyPreset = (presetId: number | null) => {
    setSelectedPresetId(presetId);
    if (presetId === null) {
      handleUpdate({ ...dbTable, headers: [] });
      return;
    }
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      handleUpdate({ ...dbTable, headers: preset.headers });
      toast.success(`프리셋 "${preset.name}" 적용 완료`);
    }
  };

  const handleTsvPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text/plain");
    if (text.includes("\t")) {
      e.preventDefault();
      const parsed = parseTsvToColumns(text);
      if (parsed.length > 0) {
        handleUpdate({ ...dbTable, columns: parsed });
        toast.success(`${parsed.length}개 컬럼 파싱 완료`);
      } else {
        toast.error("유효한 테이블 컬럼 데이터를 찾을 수 없습니다");
      }
    }
  };

  const handleAddColumn = () => {
    const newCol: DbColumn = {
      no: dbTable.columns.length + 1,
      name: "",
      comment: "",
      type: "VARCHAR",
      size: "",
      pk: false,
      notNull: false,
      note: "",
    };
    handleUpdate({ ...dbTable, columns: [...dbTable.columns, newCol] });
  };

  const handleDeleteColumn = (index: number) => {
    handleUpdate({
      ...dbTable,
      columns: dbTable.columns
        .filter((_, i) => i !== index)
        .map((col, i) => ({ ...col, no: i + 1 })),
    });
  };

  const handleUpdateColumn = (
    index: number,
    field: keyof DbColumn,
    value: string | number | boolean,
  ) => {
    handleUpdate({
      ...dbTable,
      columns: dbTable.columns.map((col, i) =>
        i === index ? { ...col, [field]: value } : col,
      ),
    });
  };

  return (
    <div className="p-3 space-y-3">
      {/* 프리셋 선택 */}
      <div>
        <label className="text-xs font-medium mb-1 block">
          테이블 헤더 프리셋
        </label>
        <select
          value={selectedPresetId ?? ""}
          onChange={(e) =>
            handleApplyPreset(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full px-2 py-1.5 border rounded text-xs"
        >
          <option value="">프리셋 없음</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name} {preset.isDefault ? "(기본)" : ""}
            </option>
          ))}
        </select>
        {dbTable.headers && dbTable.headers.length > 0 && (
          <p className="text-[10px] text-gray-500 mt-1">
            적용된 헤더: {dbTable.headers.join(", ")}
          </p>
        )}
      </div>

      {/* 테이블 메타데이터 */}
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-2">
          <label className="text-xs font-medium mb-1 block">
            테이블명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={dbTable.tableName}
            onChange={(e) =>
              handleUpdate({ ...dbTable, tableName: e.target.value })
            }
            placeholder="예: users, task_posts"
            className="w-full px-2 py-1.5 border rounded text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">스키마</label>
          <input
            type="text"
            value={dbTable.schema}
            onChange={(e) =>
              handleUpdate({ ...dbTable, schema: e.target.value })
            }
            placeholder="예: public"
            className="w-full px-2 py-1.5 border rounded text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">분류</label>
          <input
            type="text"
            value={dbTable.category}
            onChange={(e) =>
              handleUpdate({ ...dbTable, category: e.target.value })
            }
            placeholder="예: 사용자"
            className="w-full px-2 py-1.5 border rounded text-xs"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium mb-1 block">테이블 설명</label>
        <input
          type="text"
          value={dbTable.description}
          onChange={(e) =>
            handleUpdate({ ...dbTable, description: e.target.value })
          }
          placeholder="이 테이블이 무엇을 저장하는지 설명하세요"
          className="w-full px-2 py-1.5 border rounded text-xs"
        />
      </div>

      {/* TSV 붙여넣기 영역 */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded p-2">
        <label className="text-xs font-semibold mb-1.5 block text-amber-900">
          📋 DBeaver/Excel에서 붙여넣기 (TSV)
        </label>
        <textarea
          onPaste={handleTsvPaste}
          placeholder={`DBeaver/Excel에서 범위 선택 후 Ctrl+C → 여기에 Ctrl+V\n\n예시:\nNo\t컬럼명\t설명\t타입\t크기\tPK\tNN\t비고\n1\tid\t사용자ID\tBIGINT\t\tY\tY\tPK`}
          className="w-full px-2 py-1.5 border border-amber-300 rounded text-xs font-mono bg-white"
          rows={3}
        />
        <p className="text-[10px] text-amber-700 mt-1">
          DBeaver에서 테이블 컬럼 정보를 선택하고 복사한 후 위 영역에 붙여넣으면
          자동으로 파싱됩니다
        </p>
      </div>

      {/* 컬럼 편집 테이블 */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold">컬럼 정보</label>
          <button
            onClick={handleAddColumn}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200"
          >
            + 행 추가
          </button>
        </div>

        <div className="border rounded overflow-x-auto">
          <table className="w-full text-xs">
            {dbTable.headers && dbTable.headers.length > 0 && (
              <thead className="bg-gray-700 text-white">
                <tr>
                  {dbTable.headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-2 text-left text-xs font-normal"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center w-12"></th>
                </tr>
              </thead>
            )}
            <tbody>
              {dbTable.columns.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-4 text-gray-400 text-xs"
                  >
                    + 행 추가 버튼을 클릭하거나 TSV를 붙여넣으세요
                  </td>
                </tr>
              ) : (
                dbTable.columns.map((col, idx) => (
                  <tr
                    key={idx}
                    className={`border-t hover:bg-blue-50 ${col.pk ? "bg-amber-50" : ""}`}
                  >
                    <td className="px-2 py-1 text-center text-gray-500">
                      {col.no}
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) =>
                          handleUpdateColumn(idx, "name", e.target.value)
                        }
                        className="w-full px-1.5 py-1 border rounded text-xs"
                        placeholder="컬럼명"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={col.comment}
                        onChange={(e) =>
                          handleUpdateColumn(idx, "comment", e.target.value)
                        }
                        className="w-full px-1.5 py-1 border rounded text-xs"
                        placeholder="설명"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={col.type}
                        onChange={(e) =>
                          handleUpdateColumn(idx, "type", e.target.value)
                        }
                        className="w-full px-1.5 py-1 border rounded text-xs font-mono"
                        placeholder="VARCHAR"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={col.size}
                        onChange={(e) =>
                          handleUpdateColumn(idx, "size", e.target.value)
                        }
                        className="w-full px-1.5 py-1 border rounded text-xs text-center"
                        placeholder=""
                      />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <Checkbox
                        checked={col.pk}
                        onCheckedChange={(checked) =>
                          handleUpdateColumn(idx, "pk", checked as boolean)
                        }
                      />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <Checkbox
                        checked={col.notNull}
                        onCheckedChange={(checked) =>
                          handleUpdateColumn(idx, "notNull", checked as boolean)
                        }
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={col.note}
                        onChange={(e) =>
                          handleUpdateColumn(idx, "note", e.target.value)
                        }
                        className="w-full px-1.5 py-1 border rounded text-xs"
                        placeholder="FK 등"
                      />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => handleDeleteColumn(idx)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {dbTable.columns.length > 0 && (
          <p className="text-[10px] text-gray-500 mt-1">
            {dbTable.columns.length}개 컬럼
          </p>
        )}
      </div>
    </div>
  );
}
