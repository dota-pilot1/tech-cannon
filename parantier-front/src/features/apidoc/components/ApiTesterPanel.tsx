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
  getStatusColor,
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

  // tokenInput 동기화 (외부에서 token이 바뀌면)
  useEffect(() => {
    setTokenInput(token);
  }, [token]);

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
    <div className="flex flex-col h-full overflow-hidden bg-background text-foreground text-sm">
      {/* ──────────────────────────────────────────
          1. JWT 토큰 바
      ────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Key size={13} className="text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-muted-foreground shrink-0">
            공통 토큰
          </span>
          <div className="relative flex-1">
            <input
              type={showToken ? "text" : "password"}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className={`${inputCls} w-full pr-8 font-mono text-xs`}
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
            className="shrink-0 px-3 py-1 text-xs font-medium rounded border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            적용
          </button>
          {token && (
            <span className="text-xs text-emerald-600 shrink-0">✓ 저장됨</span>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────
          2. URL 바
      ────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {/* Method 드롭다운 */}
          <select
            value={apiContent.method}
            disabled={!isAdmin}
            onChange={(e) => patch({ method: e.target.value as HttpMethod })}
            className={`
              shrink-0 border border-input rounded px-2 py-1.5 text-xs font-bold
              bg-background focus:outline-none focus:ring-1 focus:ring-ring
              disabled:cursor-default cursor-pointer
              ${methodTextColor(apiContent.method)}
            `}
          >
            {(["GET", "POST", "PUT", "PATCH", "DELETE"] as HttpMethod[]).map(
              (m) => (
                <option key={m} value={m} className={methodTextColor(m)}>
                  {m}
                </option>
              ),
            )}
          </select>

          {/* URL 입력 */}
          <input
            type="text"
            value={apiContent.url}
            disabled={!isAdmin}
            placeholder="{{BASE_URL}}/api/endpoint"
            onChange={(e) => patch({ url: e.target.value })}
            className={`${inputCls} flex-1 font-mono text-xs`}
          />

          {/* Send 버튼 */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !apiContent.url.trim()}
            className="
              shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold
              bg-blue-600 hover:bg-blue-700 text-white transition-colors
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
          <p className="mt-1 text-xs text-muted-foreground font-mono truncate pl-1">
            → {resolvedUrl}
          </p>
        )}
      </div>

      {/* ──────────────────────────────────────────
          3. 요청 탭 영역 (응답 유무에 따라 높이 조정)
      ────────────────────────────────────────── */}
      <div
        className={`flex flex-col overflow-hidden border-b border-border ${
          response ? "h-[60%]" : "flex-1"
        }`}
      >
        {/* 탭 헤더 */}
        <div className="shrink-0 flex items-center gap-1 px-4 border-b border-border bg-muted/20">
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
                <span className="ml-1 px-1 py-0 text-[10px] rounded-full bg-primary/10 text-primary font-semibold">
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
              <div className="flex items-center gap-4">
                {(["none", "json", "raw"] as BodyType[]).map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-1.5 text-xs cursor-pointer ${
                      !isAdmin ? "opacity-50 cursor-default" : ""
                    }`}
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
                      className="accent-primary"
                    />
                    <span className="font-medium">{type}</span>
                  </label>
                ))}
              </div>

              {/* Body textarea */}
              {apiContent.body.type !== "none" && (
                <div className="flex flex-col gap-1">
                  {apiContent.body.type === "json" && (
                    <p className="text-xs text-muted-foreground">
                      Content-Type:{" "}
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        application/json
                      </span>{" "}
                      이 자동으로 적용됩니다.
                    </p>
                  )}
                  <textarea
                    value={apiContent.body.content}
                    disabled={!isAdmin}
                    onChange={(e) =>
                      patch({
                        body: { ...apiContent.body, content: e.target.value },
                      })
                    }
                    placeholder={
                      apiContent.body.type === "json"
                        ? '{\n  "key": "value"\n}'
                        : "Raw body content..."
                    }
                    rows={8}
                    spellCheck={false}
                    className={`${inputCls} w-full font-mono text-xs resize-y min-h-[6rem]`}
                  />
                </div>
              )}

              {apiContent.body.type === "none" && (
                <p className="text-xs text-muted-foreground">
                  이 요청은 Body를 포함하지 않습니다.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────
          4. 응답 패널 (응답 있을 때만)
      ────────────────────────────────────────── */}
      {response && (
        <div className="h-[40%] flex flex-col overflow-hidden">
          {/* 응답 상단 바 */}
          <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/20">
            {/* Status */}
            <span
              className={`text-xs font-bold ${
                response.status === 0
                  ? "text-red-600"
                  : getStatusColor(response.status)
              }`}
            >
              {response.status === 0
                ? "Network Error"
                : `${response.status} ${response.statusText}`}
            </span>

            {/* Duration */}
            {response.durationMs > 0 && (
              <span className="text-xs text-muted-foreground">
                {response.durationMs}ms
              </span>
            )}

            {/* Timestamp */}
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(response.timestamp).toLocaleTimeString()}
            </span>

            {/* 응답 탭 */}
            <div className="flex items-center gap-1">
              {(["body", "headers"] as ResponseTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveResTab(tab)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    activeResTab === tab
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tab === "body" ? "Body" : "Headers"}
                </button>
              ))}
            </div>
          </div>

          {/* 응답 내용 */}
          <div className="flex-1 overflow-auto p-4">
            {activeResTab === "body" && (
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

            {activeResTab === "headers" && (
              <div className="flex flex-col gap-1">
                {Object.entries(response.headers).length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    응답 헤더가 없습니다.
                  </p>
                ) : (
                  Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs font-mono">
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
      )}
    </div>
  );
}
