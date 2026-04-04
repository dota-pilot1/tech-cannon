import { useState, useEffect, useCallback } from "react";
import { useStore } from "@tanstack/react-store";
import { apiEnvActions } from "@/features/apidoc/model/apiEnvStore";
import {
  apiTokenStore,
  apiTokenActions,
} from "@/features/apidoc/model/apiTokenStore";
import type { ApiDocBlock } from "@/features/apidoc/api/apiDocApi";
import type {
  ApiBlockContent,
  ApiResponse,
  KeyValueItem,
  HttpMethod,
  BodyType,
} from "@/features/apidoc/types/apiDoc.types";
import {
  defaultApiBlockContent,
  resolveEnvVars,
  METHOD_COLORS,
} from "@/features/apidoc/types/apiDoc.types";
import { Eye, EyeOff, Trash2, Send, Loader2, Key } from "lucide-react";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface ApiTesterPanelProps {
  sectionId: number;
  blocks: ApiDocBlock[];
  isAdmin: boolean;
  onSave: (content: ApiBlockContent) => void;
  onRegisterSave?: (fn: () => void) => void;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function parseBlockContent(blocks: ApiDocBlock[]): ApiBlockContent {
  const block = blocks.find((b) => b.blockType === "API");
  if (!block) return defaultApiBlockContent();
  try {
    return JSON.parse(block.content) as ApiBlockContent;
  } catch {
    return defaultApiBlockContent();
  }
}

function prettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

function isJsonString(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function countEnabled(items: KeyValueItem[]): number {
  return items.filter((i) => i.enabled && i.key).length;
}

// ─────────────────────────────────────────────
// KeyValue Table (Params / Headers 공용)
// ─────────────────────────────────────────────
interface KeyValueTableProps {
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  disabled: boolean;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

function KeyValueTable({
  items,
  onChange,
  disabled,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: KeyValueTableProps) {
  // 항상 마지막에 빈 행을 보장
  const rows: KeyValueItem[] = [
    ...items,
    { key: "", value: "", enabled: true },
  ];

  const updateRow = (index: number, patch: Partial<KeyValueItem>) => {
    const isPhantom = index === items.length;
    if (isPhantom) {
      // 빈 행에 입력 → 실제 행으로 추가
      const newItem: KeyValueItem = {
        key: "",
        value: "",
        enabled: true,
        ...patch,
      };
      onChange([...items, newItem]);
    } else {
      const updated = items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      );
      onChange(updated);
    }
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full text-sm">
      {/* Header */}
      <div className="grid grid-cols-[24px_1fr_1fr_28px] gap-1 pb-1 border-b border-border text-xs text-muted-foreground font-medium">
        <span />
        <span>{keyPlaceholder}</span>
        <span>{valuePlaceholder}</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/50">
        {rows.map((row, index) => {
          const isPhantom = index === items.length;
          return (
            <div
              key={index}
              className="grid grid-cols-[24px_1fr_1fr_28px] gap-1 items-center py-1"
            >
              {/* Enabled checkbox */}
              <input
                type="checkbox"
                checked={row.enabled}
                disabled={disabled || isPhantom}
                onChange={(e) =>
                  updateRow(index, { enabled: e.target.checked })
                }
                className="w-4 h-4 accent-primary cursor-pointer disabled:cursor-default"
              />

              {/* Key */}
              <input
                type="text"
                value={row.key}
                placeholder={
                  isPhantom ? `새 ${keyPlaceholder}` : keyPlaceholder
                }
                disabled={disabled}
                onChange={(e) => updateRow(index, { key: e.target.value })}
                className="border border-input rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-default w-full"
              />

              {/* Value */}
              <input
                type="text"
                value={row.value}
                placeholder={
                  isPhantom ? `새 ${valuePlaceholder}` : valuePlaceholder
                }
                disabled={disabled}
                onChange={(e) => updateRow(index, { value: e.target.value })}
                className="border border-input rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-default w-full"
              />

              {/* Delete */}
              {!isPhantom && !disabled ? (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              ) : (
                <span />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function ApiTesterPanel({
  sectionId,
  blocks,
  isAdmin,
  onSave,
  onRegisterSave,
}: ApiTesterPanelProps) {
  // suppress lint
  void sectionId;

  // ── 전역 상태 ──
  const { token } = useStore(apiTokenStore, (s) => s);

  // ── 로컬 상태 ──
  const [apiContent, setApiContent] = useState<ApiBlockContent>(() =>
    parseBlockContent(blocks),
  );
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // JWT 토큰 바
  const [tokenInput, setTokenInput] = useState(token);
  const [showToken, setShowToken] = useState(false);

  // 요청 탭
  type RequestTab = "params" | "headers" | "body";
  const [activeTab, setActiveTab] = useState<RequestTab>("params");

  // 응답 탭
  type ResponseTab = "body" | "headers";
  const [activeResTab, setActiveResTab] = useState<ResponseTab>("body");

  // tokenInput은 마운트 시 초기값만 설정 (useState 초기값으로 처리)
  // 입력 중 token 스토어값이 덮어쓰는 버그 방지 - useEffect 동기화 제거

  // 부모 저장 콜백 등록
  const handleSaveCallback = useCallback(() => {
    onSave(apiContent);
  }, [apiContent, onSave]);

  useEffect(() => {
    if (onRegisterSave) {
      onRegisterSave(handleSaveCallback);
    }
  }, [handleSaveCallback, onRegisterSave]);

  // ── 헬퍼: apiContent 필드 업데이트 ──
  const patch = (partial: Partial<ApiBlockContent>) => {
    setApiContent((prev) => ({ ...prev, ...partial }));
  };

  // ── Resolved URL 계산 ──
  const envVarsMap = apiEnvActions.getActiveVarsMap();
  const resolvedUrl = resolveEnvVars(apiContent.url, envVarsMap);
  const hasEnvVar = apiContent.url.includes("{{");

  // ── Send 실행 ──
  const handleSend = async () => {
    if (!apiContent.url.trim()) return;

    setIsLoading(true);
    setResponse(null);

    const envVars = apiEnvActions.getActiveVarsMap();
    const resolved = resolveEnvVars(apiContent.url, envVars);

    let urlObj: URL;
    try {
      urlObj = new URL(resolved);
    } catch {
      setResponse({
        status: 0,
        statusText: "Invalid URL",
        headers: {},
        body: `유효하지 않은 URL입니다: "${resolved}"`,
        durationMs: 0,
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
      return;
    }

    // Query params
    apiContent.params
      .filter((p) => p.enabled && p.key)
      .forEach((p) => {
        urlObj.searchParams.append(p.key, resolveEnvVars(p.value, envVars));
      });

    // Headers
    const headers: Record<string, string> = {};
    apiContent.headers
      .filter((h) => h.enabled && h.key)
      .forEach((h) => {
        headers[h.key] = resolveEnvVars(h.value, envVars);
      });

    // JWT 자동 주입 (사용자가 Authorization을 직접 설정하지 않은 경우)
    const currentToken = apiTokenStore.state.token;
    if (
      currentToken &&
      !headers["Authorization"] &&
      !headers["authorization"]
    ) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    // Body
    let body: string | undefined;
    if (apiContent.method !== "GET" && apiContent.body.type !== "none") {
      body = apiContent.body.content || undefined;
    }

    const start = Date.now();
    try {
      const res = await fetch(urlObj.toString(), {
        method: apiContent.method,
        headers,
        body,
      });
      const durationMs = Date.now() - start;
      const responseText = await res.text();
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        responseHeaders[k] = v;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseText,
        durationMs,
        timestamp: new Date().toISOString(),
      });
      setActiveResTab("body");
    } catch (e) {
      setResponse({
        status: 0,
        statusText: "Network Error",
        headers: {},
        body: e instanceof Error ? e.message : "요청 실패",
        durationMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
      setActiveResTab("body");
    } finally {
      setIsLoading(false);
    }
  };

  // ── 탭 카운트 ──
  const paramsCount = countEnabled(apiContent.params);
  const headersCount = countEnabled(apiContent.headers);

  // ── 공통 input 스타일 ──
  const inputCls =
    "border border-input rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-default";

  // ── 공통 탭 버튼 스타일 ──
  const tabBtnCls = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
      active
        ? "text-foreground border-b-2 border-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  // ── Method 색상 텍스트만 추출 ──
  const methodTextColor = (method: HttpMethod) => {
    const cls = METHOD_COLORS[method];
    return cls.split(" ")[0]; // "text-emerald-600" 등
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/30 text-foreground text-sm">
      <div className="flex-1 overflow-y-auto">
        <div className={`flex flex-col gap-3 p-4 ${response ? "" : "h-full"}`}>
          {/* ──────────────────────────────────────────
              1. JWT 토큰 카드
          ────────────────────────────────────────── */}
          <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="flex items-center gap-1.5 shrink-0">
                <Key size={13} className="text-amber-500" />
                <span className="text-xs font-semibold text-foreground">
                  공통 토큰
                </span>
              </div>
              <div className="w-px h-4 bg-border shrink-0" />
              <div className="relative flex-1">
                <input
                  type={showToken ? "text" : "password"}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="border border-input rounded px-2 py-1 text-xs bg-muted/50 text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full pr-8 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => apiTokenActions.setToken(tokenInput)}
                className="shrink-0 px-3 py-1 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
                tabIndex={0}
              >
                적용
              </button>
              {token && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  저장됨
                </span>
              )}
            </div>
          </div>

          {/* ──────────────────────────────────────────
              2. URL 카드
          ────────────────────────────────────────── */}
          <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2.5">
              {/* Method 드롭다운 */}
              <select
                value={apiContent.method}
                disabled={!isAdmin}
                onChange={(e) =>
                  patch({ method: e.target.value as HttpMethod })
                }
                className={`
                  shrink-0 border border-input rounded-lg px-2.5 py-1.5 text-xs font-bold
                  bg-muted/60 focus:outline-none focus:ring-1 focus:ring-ring
                  disabled:cursor-default cursor-pointer
                  ${methodTextColor(apiContent.method)}
                `}
              >
                {(
                  ["GET", "POST", "PUT", "PATCH", "DELETE"] as HttpMethod[]
                ).map((m) => (
                  <option key={m} value={m} className={methodTextColor(m)}>
                    {m}
                  </option>
                ))}
              </select>

              {/* URL 입력 */}
              <input
                type="text"
                value={apiContent.url}
                disabled={!isAdmin}
                placeholder="{{BASE_URL}}/api/endpoint"
                onChange={(e) => patch({ url: e.target.value })}
                className={`${inputCls} flex-1 font-mono text-xs bg-muted/40`}
              />

              {/* Send 버튼 */}
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || !apiContent.url.trim()}
                className="
                  shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold
                  bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>전송 중</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>

            {/* Resolved URL 미리보기 */}
            {hasEnvVar && (
              <div className="px-4 pb-2.5">
                <p className="text-[11px] text-muted-foreground font-mono truncate bg-muted/50 rounded px-2 py-1">
                  <span className="text-primary/60 mr-1">→</span>
                  {resolvedUrl}
                </p>
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────
              3. 요청 탭 카드
          ────────────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden min-h-[200px]">
            {/* 탭 헤더 */}
            <div className="shrink-0 flex items-center gap-0.5 px-3 pt-1 border-b border-border bg-muted/20">
              {(
                [
                  {
                    id: "params" as RequestTab,
                    label: "Params",
                    count: paramsCount,
                  },
                  {
                    id: "headers" as RequestTab,
                    label: "Headers",
                    count: headersCount,
                  },
                  { id: "body" as RequestTab, label: "Body", count: 0 },
                ] as { id: RequestTab; label: string; count: number }[]
              ).map(({ id, label, count }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={tabBtnCls(activeTab === id)}
                >
                  {label}
                  {count > 0 && (
                    <span className="ml-1 px-1.5 py-0 text-[10px] rounded-full bg-primary/15 text-primary font-bold">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 탭 내용 */}
            <div className="flex-1 overflow-auto p-4">
              {/* ── Params 탭 ── */}
              {activeTab === "params" && (
                <KeyValueTable
                  items={apiContent.params}
                  onChange={(params) => patch({ params })}
                  disabled={!isAdmin}
                  keyPlaceholder="Parameter"
                  valuePlaceholder="Value"
                />
              )}

              {/* ── Headers 탭 ── */}
              {activeTab === "headers" && (
                <KeyValueTable
                  items={apiContent.headers}
                  onChange={(headers) => patch({ headers })}
                  disabled={!isAdmin}
                  keyPlaceholder="Header"
                  valuePlaceholder="Value"
                />
              )}

              {/* ── Body 탭 ── */}
              {activeTab === "body" && (
                <div className="flex flex-col gap-3">
                  {/* Body 타입 라디오 */}
                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
                    {(["none", "json", "raw"] as BodyType[]).map((type) => (
                      <label
                        key={type}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-md cursor-pointer transition-colors ${
                          apiContent.body.type === type
                            ? "bg-background text-foreground shadow-sm font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        } ${!isAdmin ? "opacity-50 cursor-default" : ""}`}
                      >
                        <input
                          type="radio"
                          name="bodyType"
                          value={type}
                          checked={apiContent.body.type === type}
                          disabled={!isAdmin}
                          onChange={() =>
                            patch({ body: { ...apiContent.body, type } })
                          }
                          className="hidden"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>

                  {/* Body textarea */}
                  {apiContent.body.type !== "none" && (
                    <div className="flex flex-col gap-2">
                      {apiContent.body.type === "json" && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg px-3 py-1.5">
                          <span>Content-Type:</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-medium">
                            application/json
                          </span>
                          <span className="text-muted-foreground">
                            이 자동으로 적용됩니다.
                          </span>
                        </div>
                      )}
                      <textarea
                        value={apiContent.body.content}
                        disabled={!isAdmin}
                        onChange={(e) =>
                          patch({
                            body: {
                              ...apiContent.body,
                              content: e.target.value,
                            },
                          })
                        }
                        placeholder={
                          apiContent.body.type === "json"
                            ? '{\n  "key": "value"\n}'
                            : "Raw body content..."
                        }
                        rows={8}
                        spellCheck={false}
                        className={`${inputCls} w-full font-mono text-xs resize-y min-h-[6rem] bg-muted/30`}
                      />
                    </div>
                  )}

                  {apiContent.body.type === "none" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-3">
                      <span>이 요청은 Body를 포함하지 않습니다.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ──────────────────────────────────────────
              4. 응답 카드 (항상 표시)
          ────────────────────────────────────────── */}
          <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden min-h-[220px]">
            {/* 응답 상단 바 */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/20">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                Response
              </span>

              {/* 응답 있을 때만: Status + Duration + Timestamp + 탭 */}
              {response && (
                <>
                  {/* Status 배지 */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                      response.status === 0
                        ? "text-red-600 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                        : response.status < 300
                          ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                          : response.status < 400
                            ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
                            : response.status < 500
                              ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
                              : "text-red-600 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        response.status === 0
                          ? "bg-red-500"
                          : response.status < 300
                            ? "bg-emerald-500"
                            : response.status < 400
                              ? "bg-blue-500"
                              : response.status < 500
                                ? "bg-amber-500"
                                : "bg-red-500"
                      }`}
                    />
                    {response.status === 0
                      ? "Network Error"
                      : `${response.status} ${response.statusText}`}
                  </span>

                  {/* Duration 배지 */}
                  {response.durationMs > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-mono">
                      {response.durationMs}ms
                    </span>
                  )}

                  {/* Timestamp */}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(response.timestamp).toLocaleTimeString()}
                  </span>

                  {/* 응답 탭 */}
                  <div className="flex items-center gap-0.5 bg-muted/60 rounded-lg p-0.5">
                    {(["body", "headers"] as ResponseTab[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveResTab(tab)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${
                          activeResTab === tab
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab === "body" ? "Body" : "Headers"}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* 응답 없을 때 우측 안내 */}
              {!response && (
                <span className="ml-auto text-xs text-muted-foreground/60">
                  Send 버튼을 눌러 요청하세요
                </span>
              )}
            </div>

            {/* 응답 내용 */}
            <div className="flex-1 overflow-auto p-4">
              {/* 빈 상태 */}
              {!response && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/50 select-none">
                  <Send size={28} className="opacity-30" />
                  <p className="text-xs">아직 요청이 없습니다.</p>
                </div>
              )}

              {/* 로딩 상태 */}
              {isLoading && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 size={24} className="animate-spin opacity-50" />
                  <p className="text-xs">요청 중...</p>
                </div>
              )}

              {/* 응답 body */}
              {response && activeResTab === "body" && (
                <pre
                  className={`text-xs font-mono whitespace-pre-wrap break-all leading-relaxed ${
                    response.status === 0 ? "text-red-600" : "text-foreground"
                  }`}
                >
                  {isJsonString(response.body)
                    ? prettyJson(response.body)
                    : response.body}
                </pre>
              )}

              {/* 응답 headers */}
              {response && activeResTab === "headers" && (
                <div className="flex flex-col gap-1.5">
                  {Object.entries(response.headers).length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      응답 헤더가 없습니다.
                    </p>
                  ) : (
                    Object.entries(response.headers).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex gap-2 text-xs font-mono bg-muted/30 rounded px-3 py-1.5"
                      >
                        <span className="text-muted-foreground shrink-0 min-w-[160px]">
                          {k}:
                        </span>
                        <span className="text-foreground break-all">{v}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
