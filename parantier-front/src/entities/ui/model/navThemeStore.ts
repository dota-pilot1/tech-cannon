import { Store } from "@tanstack/react-store";

export type NavThemeId = "zinc" | "slate" | "navy" | "forest" | "rose";

export interface NavTheme {
  id: NavThemeId;
  label: string;
  previewBg: string;
  previewText: string;
}

export const NAV_THEMES: NavTheme[] = [
  {
    id: "zinc",
    label: "다크 징크",
    previewBg: "#18181b",
    previewText: "#ffffff",
  },
  {
    id: "slate",
    label: "슬레이트",
    previewBg: "#1e293b",
    previewText: "#f1f5f9",
  },
  {
    id: "navy",
    label: "네이비",
    previewBg: "#0f172a",
    previewText: "#93c5fd",
  },
  {
    id: "forest",
    label: "포레스트",
    previewBg: "#14532d",
    previewText: "#bbf7d0",
  },
  {
    id: "rose",
    label: "로즈",
    previewBg: "#4c0519",
    previewText: "#fecdd3",
  },
];

/** 테마별 드롭다운 Portal용 CSS 변수값 */
const NAV_POPOVER_VARS: Record<
  NavThemeId,
  {
    bg: string;
    fg: string;
    border: string;
    accent: string;
    accentFg: string;
    separator: string;
    mutedFg: string;
  }
> = {
  zinc: {
    bg: "#18181b",
    fg: "#e4e4e7",
    border: "#3f3f46",
    accent: "rgba(255,255,255,0.08)",
    accentFg: "#ffffff",
    separator: "#3f3f46",
    mutedFg: "#a1a1aa",
  },
  slate: {
    bg: "#1e293b",
    fg: "#cbd5e1",
    border: "#334155",
    accent: "rgba(148,163,184,0.1)",
    accentFg: "#f1f5f9",
    separator: "#334155",
    mutedFg: "#94a3b8",
  },
  navy: {
    bg: "#0f172a",
    fg: "#93c5fd",
    border: "#1e3a5f",
    accent: "rgba(59,130,246,0.1)",
    accentFg: "#bfdbfe",
    separator: "#1e3a5f",
    mutedFg: "#60a5fa",
  },
  forest: {
    bg: "#14532d",
    fg: "#bbf7d0",
    border: "#166534",
    accent: "rgba(74,222,128,0.1)",
    accentFg: "#dcfce7",
    separator: "#166534",
    mutedFg: "#86efac",
  },
  rose: {
    bg: "#4c0519",
    fg: "#fecdd3",
    border: "#881337",
    accent: "rgba(251,113,133,0.1)",
    accentFg: "#ffe4e6",
    separator: "#881337",
    mutedFg: "#fda4af",
  },
};

const STORAGE_KEY = "navTheme";

const saved = localStorage.getItem(STORAGE_KEY) as NavThemeId | null;
const validIds = NAV_THEMES.map((t) => t.id);
const initial: NavThemeId = saved && validIds.includes(saved) ? saved : "zinc";

/**
 * body에 --nav-popover-* CSS 변수를 인라인 스타일로 적용.
 * 전역 shadcn 변수(--muted, --border 등)는 건드리지 않아서
 * 페이지 본문 컴포넌트에 영향을 주지 않음.
 * Radix Portal([data-nav-dropdown])은 이 변수를 참조해서 테마 색상 적용.
 */
function applyPopoverVarsToBody(id: NavThemeId) {
  const vars = NAV_POPOVER_VARS[id];
  const style = document.body.style;
  style.setProperty("--nav-popover-bg", vars.bg);
  style.setProperty("--nav-popover-fg", vars.fg);
  style.setProperty("--nav-popover-border", vars.border);
  style.setProperty("--nav-popover-accent", vars.accent);
  style.setProperty("--nav-popover-accent-fg", vars.accentFg);
  style.setProperty("--nav-popover-separator", vars.separator);
  style.setProperty("--nav-popover-muted-fg", vars.mutedFg);
}

// 앱 최초 로드 시 즉시 적용
applyPopoverVarsToBody(initial);

export const navThemeStore = new Store<{ themeId: NavThemeId }>({
  themeId: initial,
});

export const navThemeActions = {
  setTheme: (id: NavThemeId) => {
    localStorage.setItem(STORAGE_KEY, id);
    applyPopoverVarsToBody(id);
    navThemeStore.setState(() => ({ themeId: id }));
  },
};
