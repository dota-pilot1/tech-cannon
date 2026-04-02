import { useState, useEffect } from "react";
import { LexicalEditor } from "@/shared/ui/lexical/LexicalEditor";
import type { DbBlock, DbBlockType } from "@/entities/db/db.types";
import { DB_TYPE_META } from "@/entities/db/db.types";
import type {
  DbColumn,
  DbTableContent,
} from "@/features/task/types/task.types";
import {
  parseDbTableContent,
  parseTsvToColumns,
} from "@/features/task/types/task.types";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";
import { tablePresetApi } from "@/shared/api/tablePreset.api";
import type { TablePreset } from "@/shared/types/tablePreset";

interface Props {
  title: string;
  setTitle: (title: string) => void;
  blocks: DbBlock[];
  setBlocks: (blocks: DbBlock[]) => void;
}

interface LinkContent {
  url: string;
  description: string;
}

function parseLinkContent(content: string): LinkContent {
  try {
    return JSON.parse(content);
  } catch {
    return { url: "", description: "" };
  }
}

// ── DbTableBlockEditor ────────────────────────────────────────────────────────
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
        <label className="text-xs font-medium mb-1 block text-foreground">
          테이블 헤더 프리셋
        </label>
        <select
          value={selectedPresetId ?? ""}
          onChange={(e) =>
            handleApplyPreset(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">프리셋 없음</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name} {preset.isDefault ? "(기본)" : ""}
            </option>
          ))}
        </select>
        {dbTable.headers && dbTable.headers.length > 0 && (
          <p className="text-[10px] text-muted-foreground mt-1">
            적용된 헤더: {dbTable.headers.join(", ")}
          </p>
        )}
      </div>

      {/* 테이블 메타데이터 */}
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-2">
          <label className="text-xs font-medium mb-1 block text-foreground">
            테이블명 <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={dbTable.tableName}
            onChange={(e) =>
              handleUpdate({ ...dbTable, tableName: e.target.value })
            }
            placeholder="예: users, task_posts"
            className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block text-foreground">
            스키마
          </label>
          <input
            type="text"
            value={dbTable.schema}
            onChange={(e) =>
              handleUpdate({ ...dbTable, schema: e.target.value })
            }
            placeholder="예: public"
            className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block text-foreground">
            분류
          </label>
          <input
            type="text"
            value={dbTable.category}
            onChange={(e) =>
              handleUpdate({ ...dbTable, category: e.target.value })
            }
            placeholder="예: 사용자"
            className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium mb-1 block text-foreground">
          테이블 설명
        </label>
        <input
          type="text"
          value={dbTable.description}
          onChange={(e) =>
            handleUpdate({ ...dbTable, description: e.target.value })
          }
          placeholder="이 테이블이 무엇을 저장하는지 설명하세요"
          className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* TSV 붙여넣기 영역 */}
      <div className="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-200 dark:border-amber-500/30 rounded p-2">
        <label className="text-xs font-semibold mb-1.5 block text-amber-900 dark:text-amber-400">
          📋 DBeaver/Excel에서 붙여넣기 (TSV)
        </label>
        <textarea
          onPaste={handleTsvPaste}
          placeholder={`DBeaver/Excel에서 범위 선택 후 Ctrl+C → 여기에 Ctrl+V\n\n예시:\nNo\t컬럼명\t설명\t타입\t크기\tPK\tNN\t비고\n1\tid\t사용자ID\tBIGINT\t\tY\tY\tPK`}
          className="w-full px-2 py-1.5 border border-amber-300 dark:border-amber-500/40 rounded text-xs font-mono bg-background text-foreground placeholder:text-muted-foreground focus:outline-none"
          rows={3}
        />
        <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
          DBeaver에서 테이블 컬럼 정보를 선택하고 복사한 후 위 영역에 붙여넣으면
          자동으로 파싱됩니다
        </p>
      </div>

      {/* 컬럼 편집 테이블 */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold text-foreground">컬럼 정보</label>
          <button
            onClick={handleAddColumn}
            className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded border border-primary/20"
          >
            + 행 추가
          </button>
        </div>

        <div className="border border-border rounded overflow-x-auto">
          <table className="w-full text-xs">
            {dbTable.headers && dbTable.headers.length > 0 && (
              <thead className="bg-muted text-foreground">
                <tr>
                  {dbTable.headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-2 text-left text-xs font-medium border-b border-border"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center w-12 border-b border-border"></th>
                </tr>
              </thead>
            )}
            <tbody>
              {dbTable.columns.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-6 text-center text-muted-foreground text-xs"
                  >
                    위의 TSV 붙여넣기 영역에 데이터를 붙여넣거나 "행 추가"
                    버튼을 클릭하세요
                  </td>
                </tr>
              ) : (
                dbTable.columns.map((col, idx) => (
                  <tr
                    key={idx}
                    className={`border-t border-border hover:bg-accent/50 ${col.pk ? "bg-amber-50 dark:bg-amber-500/10" : ""}`}
                  >
                    <td className="px-2 py-1 text-center text-muted-foreground">
                      {col.no}
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) =>
                          handleUpdateColumn(idx, "name", e.target.value)
                        }
                        className="w-full px-1.5 py-1 border border-border rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                        className="w-full px-1.5 py-1 border border-border rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                        className="w-full px-1.5 py-1 border border-border rounded text-xs font-mono bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                        className="w-full px-1.5 py-1 border border-border rounded text-xs text-center bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                        className="w-full px-1.5 py-1 border border-border rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="FK 등"
                      />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => handleDeleteColumn(idx)}
                        className="text-destructive hover:text-destructive/70 text-xs"
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
          <p className="text-[10px] text-muted-foreground mt-1">
            {dbTable.columns.length}개 컬럼
          </p>
        )}
      </div>
    </div>
  );
}

// ── LinkBlockEditor ───────────────────────────────────────────────────────────
function LinkBlockEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) {
  const [link, setLink] = useState<LinkContent>(() =>
    parseLinkContent(content),
  );

  const handleUpdate = (updated: LinkContent) => {
    setLink(updated);
    onChange(JSON.stringify(updated));
  };

  return (
    <div className="p-3 space-y-3">
      <div>
        <label className="text-xs font-medium mb-1 block text-foreground">
          URL <span className="text-destructive">*</span>
        </label>
        <input
          type="url"
          value={link.url}
          onChange={(e) => handleUpdate({ ...link, url: e.target.value })}
          placeholder="https://..."
          className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs font-medium mb-1 block text-foreground">
          설명
        </label>
        <textarea
          value={link.description}
          onChange={(e) =>
            handleUpdate({ ...link, description: e.target.value })
          }
          placeholder="링크에 대한 설명을 입력하세요"
          rows={3}
          className="w-full px-2 py-1.5 border border-border rounded text-xs bg-background text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}

// ── DbBlockEditor (main) ──────────────────────────────────────────────────────
export default function DbBlockEditor({
  title,
  setTitle,
  blocks,
  setBlocks,
}: Props) {
  const updateBlock = (idx: number, prop: keyof DbBlock, val: string) => {
    setBlocks(blocks.map((b, i) => (i === idx ? { ...b, [prop]: val } : b)));
  };

  const addBlock = (type: DbBlockType) => {
    setBlocks([...blocks, { blockType: type, content: "" }]);
  };

  const removeBlock = (idx: number) => {
    setBlocks(blocks.filter((_, i) => i !== idx));
  };

  const thStyle =
    "bg-muted border border-border px-3 py-2 text-left font-normal text-sm whitespace-nowrap text-foreground";
  const tdStyle = "border border-border px-3 py-1 text-sm";

  return (
    <div className="space-y-4 text-sm">
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <th className={thStyle} style={{ width: "80px" }}>
              제목 <span className="text-destructive">*</span>
            </th>
            <td className={tdStyle}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="DB 문서 제목"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-3">
        {blocks.map((block, _idx) => {
          const meta = DB_TYPE_META[block.blockType] ?? DB_TYPE_META.NOTE;
          return (
            <div
              key={_idx}
              className="border border-border rounded overflow-hidden shadow-sm relative group bg-card"
            >
              <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-bold px-1">
                    {_idx + 1}.
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                </div>
                <button
                  onClick={() => removeBlock(_idx)}
                  className="text-xs px-2 py-1 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded border border-destructive/20"
                >
                  삭제
                </button>
              </div>

              {block.blockType === "DBTABLE" ? (
                <DbTableBlockEditor
                  content={block.content}
                  onChange={(newContent) =>
                    updateBlock(_idx, "content", newContent)
                  }
                />
              ) : block.blockType === "LINK" ? (
                <LinkBlockEditor
                  content={block.content}
                  onChange={(val) => updateBlock(_idx, "content", val)}
                />
              ) : block.blockType === "NOTE" ? (
                <LexicalEditor
                  initialState={block.content}
                  onChange={(val) => updateBlock(_idx, "content", val)}
                  placeholder="내용을 입력하세요..."
                  minHeight="200px"
                />
              ) : (
                <div className="p-0">
                  <textarea
                    value={block.content}
                    onChange={(e) =>
                      updateBlock(_idx, "content", e.target.value)
                    }
                    rows={10}
                    className="w-full px-3 py-2 text-sm font-mono border-0 resize-y focus:outline-none bg-background text-foreground placeholder:text-muted-foreground"
                    placeholder={
                      block.blockType === "SQL"
                        ? "SELECT *\nFROM table_name\nWHERE condition;"
                        : block.blockType === "ERD"
                          ? "erDiagram\n    USER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains"
                          : "내용을 입력하세요."
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-dashed border-border flex-wrap">
        <span className="text-xs text-muted-foreground mr-2">블록 추가:</span>
        {(
          Object.entries(DB_TYPE_META) as [
            DbBlockType,
            (typeof DB_TYPE_META)[DbBlockType],
          ][]
        ).map(([type, meta]) => (
          <button
            key={type}
            onClick={() => addBlock(type)}
            className="px-2 py-1 text-xs bg-card border border-border rounded hover:bg-accent flex items-center gap-1 text-foreground"
          >
            {meta.icon} {meta.label}
          </button>
        ))}
      </div>
    </div>
  );
}
