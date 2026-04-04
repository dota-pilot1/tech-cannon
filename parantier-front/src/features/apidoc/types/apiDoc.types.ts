// HTTP 메서드
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// 헤더/파라미터 행
export interface KeyValueItem {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

// Body 타입
export type BodyType = "none" | "json" | "form-data" | "raw";

// API 블록 content JSON 구조
export interface ApiBlockContent {
  method: HttpMethod;
  url: string; // 전체 URL (환경변수 {{VAR}} 지원)
  headers: KeyValueItem[];
  params: KeyValueItem[]; // Query params
  body: {
    type: BodyType;
    content: string; // JSON string or raw text
  };
  description?: string;
  lastResponse?: ApiResponse | null;
}

// API 응답 결과
export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
  timestamp: string;
}

// 환경변수
export interface EnvVariable {
  key: string;
  value: string;
  description?: string;
}

export interface ApiEnvironment {
  id: string;
  name: string;
  variables: EnvVariable[];
}

// 기본 ApiBlockContent
export const defaultApiBlockContent = (): ApiBlockContent => ({
  method: "GET",
  url: "",
  headers: [{ key: "Content-Type", value: "application/json", enabled: true }],
  params: [],
  body: { type: "none", content: "" },
  description: "",
  lastResponse: null,
});

// URL에서 환경변수 치환
export const resolveEnvVars = (
  text: string,
  envVars: Record<string, string>,
): string => {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => envVars[key] ?? `{{${key}}}`);
};

// 메서드별 색상
export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
  POST: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
  PUT: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
  PATCH: "text-purple-600 bg-purple-50 dark:bg-purple-500/10",
  DELETE: "text-red-600 bg-red-50 dark:bg-red-500/10",
};

// 상태코드별 색상
export const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return "text-emerald-600";
  if (status >= 300 && status < 400) return "text-blue-600";
  if (status >= 400 && status < 500) return "text-amber-600";
  return "text-red-600";
};
