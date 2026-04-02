import { useState, useRef, useEffect } from "react";
import { Search, Plus, BookOpen } from "lucide-react";
import {
  useStudyCategoryTree,
  useCreateStudyCategory,
} from "@/features/study/hooks/useStudy";
import { StudyCategorySection } from "@/features/study/components/StudyCategorySection";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";

interface StudyHomePageProps {
  onSelectCategory: (categoryId: number) => void;
}

// ── 인라인 입력 ───────────────────────────────────────────────────────────────

function InlineInput({
  placeholder,
  onConfirm,
  onCancel,
}: {
  placeholder: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      const v = value.trim();
      if (v) onConfirm(v);
      else onCancel();
    }
    if (e.key === "Escape") onCancel();
  };

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        const v = value.trim();
        if (v) onConfirm(v);
        else onCancel();
      }}
      placeholder={placeholder}
      className="border border-blue-400 rounded px-2 py-1 text-sm bg-background text-foreground
                 focus:outline-none focus:ring-1 focus:ring-blue-400 w-48"
    />
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────────────

export function StudyHomePage({ onSelectCategory }: StudyHomePageProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const user = useStore(authStore, (s) => s.user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";

  const { data: categories = [], isLoading } = useStudyCategoryTree();
  const createCategory = useCreateStudyCategory();

  const rootCategories = categories.filter((c) => c.parentId === null);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setSearchQuery(inputValue);
    if (e.key === "Escape") {
      setInputValue("");
      setSearchQuery("");
    }
  };

  const handleAddCategory = (name: string) => {
    createCategory.mutate(
      {
        name,
        parentId: null,
        orderNum: null,
        authorId: null,
      },
      {
        onSuccess: () => setIsAddingCategory(false),
      },
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* 헤더 + 검색 영역 */}
      <div className="flex items-center gap-4 px-6 py-0 border-b bg-background sticky top-0 z-10">
        {/* 타이틀 */}
        <div className="flex items-center gap-2 shrink-0 py-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            팀 스터디
          </span>
        </div>

        {/* 검색바 */}
        <div className="flex items-center flex-1 max-w-md border rounded-lg px-3 py-1.5 gap-2 bg-muted/30 focus-within:border-primary/50 transition-colors my-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="카테고리 또는 주제 검색..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
          {(inputValue || searchQuery) && (
            <button
              onClick={() => {
                setInputValue("");
                setSearchQuery("");
              }}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* 카테고리 추가 버튼 — 어드민만 */}
        {isAdmin &&
          (isAddingCategory ? (
            <InlineInput
              placeholder="카테고리명 입력 후 Enter"
              onConfirm={handleAddCategory}
              onCancel={() => setIsAddingCategory(false)}
            />
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm border border-border
                         rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50
                         transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              카테고리 추가
            </button>
          ))}
      </div>

      {/* 1차 카테고리별 섹션 */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10">
        {isLoading ? (
          <div className="space-y-10">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-24 h-5 bg-muted/50 rounded animate-pulse" />
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="flex gap-3">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="w-44 h-24 rounded-xl bg-muted/40 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : rootCategories.length === 0 ? (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <p className="text-sm">카테고리가 없습니다.</p>
            {isAdmin && (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm border border-border
                           rounded-lg hover:text-primary hover:border-primary/50 transition-colors"
              >
                <Plus className="w-4 h-4" />첫 카테고리 만들기
              </button>
            )}
          </div>
        ) : (
          rootCategories.map((rootCat) => (
            <StudyCategorySection
              key={rootCat.id}
              category={rootCat}
              searchQuery={searchQuery}
              onSelectCategory={onSelectCategory}
            />
          ))
        )}
      </div>
    </div>
  );
}
