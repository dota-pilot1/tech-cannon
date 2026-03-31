import { useStore } from "@tanstack/react-store";
import { Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  NAV_THEMES,
  navThemeActions,
  navThemeStore,
} from "@/entities/ui/model/navThemeStore";
import { cn } from "@/shared/lib/utils";

export function NavThemePicker() {
  const { themeId } = useStore(navThemeStore, (s) => s);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[var(--nav-item-hover-bg)] text-[var(--nav-text)] hover:text-[var(--nav-text-hover)] outline-none"
          title="헤더 테마 변경"
        >
          <Palette className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-2">
        <p className="text-xs text-muted-foreground px-1 pb-2 font-medium">
          헤더 테마
        </p>
        <div className="flex flex-col gap-1">
          {NAV_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => navThemeActions.setTheme(theme.id)}
              className={cn(
                "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md transition-colors text-left text-sm text-popover-foreground",
                themeId === theme.id
                  ? "bg-accent ring-1 ring-border"
                  : "hover:bg-accent/60",
              )}
            >
              {/* 색상 미리보기 원 */}
              <span
                className="w-5 h-5 rounded-full shrink-0 border border-border"
                style={{ backgroundColor: theme.previewBg }}
              />
              <span>{theme.label}</span>
              {themeId === theme.id && (
                <span className="ml-auto text-muted-foreground text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
