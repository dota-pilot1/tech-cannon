import type { DbPost } from "@/entities/db/db.types";
import { DB_TYPE_META } from "@/entities/db/db.types";
import { parseDbTableContent } from "@/features/task/types/task.types";
import { Mermaid } from "@/shared/ui/mermaid";
import { LexicalViewer } from "@/shared/ui/lexical/LexicalViewer";

interface Props {
  post: DbPost;
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

export default function DbBlockViewer({ post }: Props) {
  const thStyle =
    "bg-muted border border-border px-3 py-2 text-left font-normal text-sm whitespace-nowrap text-foreground";
  const tdStyle = "border border-border px-3 py-1 text-foreground";

  return (
    <div className="space-y-4">
      {/* 문서 메타 정보 */}
      <table className="w-full border-collapse text-sm mb-6">
        <tbody>
          <tr>
            <th className={thStyle} style={{ width: "80px" }}>
              제목
            </th>
            <td className={tdStyle} colSpan={3}>
              <span className="font-bold text-base text-foreground">
                {post.title}
              </span>
            </td>
          </tr>
          <tr>
            <th className={thStyle} style={{ width: "80px" }}>
              작성자
            </th>
            <td className={tdStyle}>{post.authorName}</td>
            <th className={thStyle} style={{ width: "80px" }}>
              등록일자
            </th>
            <td className={tdStyle}>{post.createdAt.slice(0, 10)}</td>
          </tr>
        </tbody>
      </table>

      {/* 블록 목록 */}
      <div className="space-y-6">
        {!post.blocks || post.blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            편집 모드에서 블록을 추가하여 내용을 작성해보세요.
          </p>
        ) : (
          post.blocks.map((block, idx) => {
            const meta = DB_TYPE_META[block.blockType] ?? DB_TYPE_META.NOTE;

            return (
              <div
                key={idx}
                className="border border-border rounded shadow-sm overflow-hidden mb-4"
              >
                {/* 블록 헤더 */}
                <div className="px-3 py-1.5 bg-muted/50 border-b border-border flex items-center gap-2 text-sm text-foreground font-medium">
                  <span>{meta.icon}</span> {meta.label}
                </div>

                {/* NOTE: Lexical 뷰어 */}
                {block.blockType === "NOTE" && (
                  <div className="p-4 bg-card">
                    {block.content ? (
                      <LexicalViewer content={block.content} />
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        내용이 없습니다.
                      </span>
                    )}
                  </div>
                )}

                {/* DBTABLE: 테이블 컬럼 정의 표 */}
                {block.blockType === "DBTABLE" &&
                  (() => {
                    const tbl = parseDbTableContent(block.content);
                    return (
                      <div className="p-4 bg-card space-y-3">
                        {/* 테이블 메타 정보 */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-bold text-sm text-foreground">
                            {tbl.tableName || "(테이블명 없음)"}
                          </span>
                          {tbl.schema && (
                            <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded font-mono">
                              {tbl.schema}
                            </span>
                          )}
                          {tbl.category && (
                            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded">
                              {tbl.category}
                            </span>
                          )}
                        </div>
                        {tbl.description && (
                          <p className="text-sm text-foreground bg-muted/50 rounded px-3 py-2 border-l-2 border-amber-400">
                            💬 {tbl.description}
                          </p>
                        )}

                        {tbl.columns.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                              {tbl.headers && tbl.headers.length > 0 && (
                                <thead className="bg-muted text-foreground">
                                  <tr>
                                    {tbl.headers.map((header, hIdx) => (
                                      <th
                                        key={hIdx}
                                        className="border border-border px-3 py-2 text-left text-xs font-medium"
                                      >
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                              )}
                              <tbody>
                                {tbl.columns.map((col, ci) => (
                                  <tr
                                    key={ci}
                                    className={`hover:bg-accent/50 transition-colors ${
                                      col.pk
                                        ? "bg-amber-50 dark:bg-amber-500/10"
                                        : ci % 2 === 0
                                          ? "bg-card"
                                          : "bg-muted/30"
                                    }`}
                                  >
                                    <td className="border border-border px-3 py-1.5 text-center text-muted-foreground">
                                      {col.no}
                                    </td>
                                    <td className="border border-border px-3 py-1.5 font-mono font-medium text-foreground">
                                      {col.name}
                                    </td>
                                    <td className="border border-border px-3 py-1.5 text-foreground">
                                      {col.comment}
                                    </td>
                                    <td className="border border-border px-3 py-1.5 font-mono text-primary">
                                      {col.type}
                                    </td>
                                    <td className="border border-border px-3 py-1.5 text-center text-muted-foreground">
                                      {col.size}
                                    </td>
                                    <td className="border border-border px-3 py-1.5 text-center">
                                      {col.pk ? (
                                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                                          ✓
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </td>
                                    <td className="border border-border px-3 py-1.5 text-center">
                                      {col.notNull ? (
                                        <span className="text-muted-foreground">
                                          ✓
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </td>
                                    <td className="border border-border px-3 py-1.5 text-muted-foreground text-[11px]">
                                      {col.note}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <p className="text-[10px] text-muted-foreground mt-1 text-right">
                              {tbl.columns.length}개 컬럼
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            컬럼 정보가 없습니다.
                          </p>
                        )}
                      </div>
                    );
                  })()}

                {/* SQL: pre 코드 블록 */}
                {block.blockType === "SQL" && (
                  <div className="p-4 bg-card">
                    {block.content.trim() ? (
                      <pre className="bg-muted rounded p-4 overflow-x-auto text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed border border-border">
                        {block.content}
                      </pre>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        SQL이 없습니다.
                      </span>
                    )}
                  </div>
                )}

                {/* ERD: Mermaid 렌더링 */}
                {block.blockType === "ERD" && (
                  <div className="p-4 bg-card">
                    {block.content.trim() ? (
                      <Mermaid
                        chart={block.content}
                        className="mermaid-diagram"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        ERD 다이어그램이 없습니다.
                      </span>
                    )}
                  </div>
                )}

                {/* LINK: 클릭 가능한 링크 */}
                {block.blockType === "LINK" &&
                  (() => {
                    const link = parseLinkContent(block.content);
                    return (
                      <div className="p-4 bg-card">
                        <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
                          <div className="text-3xl">🔗</div>
                          <div className="flex-1 min-w-0">
                            {link.url ? (
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline truncate block mb-1"
                              >
                                {link.url}
                              </a>
                            ) : (
                              <p className="text-sm text-muted-foreground mb-1">
                                URL이 없습니다.
                              </p>
                            )}
                            {link.description && (
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {link.description}
                              </p>
                            )}
                          </div>
                          {link.url && (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs bg-foreground text-background rounded hover:opacity-80 shrink-0"
                            >
                              열기
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
