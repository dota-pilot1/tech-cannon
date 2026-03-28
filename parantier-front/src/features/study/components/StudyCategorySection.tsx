import { useState, useRef, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import {
  useCreateStudyCategory,
  useUpdateStudyCategory,
  useDeleteStudyCategory,
} from "../hooks/useStudy";
import { useConfirm } from "@/shared/hooks/useConfirm";
import type { StudyCategory } from "../types/study.types";

// ── 컨텍스트 메뉴 ─────────────────────────────────────────────────────────────

interface CtxMenu {
  x: number;
  y: number;
  target: StudyCategory;
}

function ContextMenu({
  menu,
  onRename,
  onDelete,
  onClose,
}: {
  menu: CtxMenu;
  onRename: (cat: StudyCategory) => void;
  onDelete: (cat: StudyCategory) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: menu.y, left: menu.x, zIndex: 9999 }}
      className="min-w-[150px] bg-popover border border-border rounded-md shadow-lg py-1 text-sm"
    >
      <button
        onClick={() => {
          onRename(menu.target);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted/60 text-foreground transition-colors"
      >
        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
        이름 변경
      </button>
      <div className="my-1 border-t border-border" />
      <button
        onClick={() => {
          onDelete(menu.target);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-destructive/10 text-destructive transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        삭제
      </button>
    </div>
  );
}

// ── 인라인 입력 ───────────────────────────────────────────────────────────────

function InlineInput({
  initialValue = "",
  placeholder,
  onConfirm,
  onCancel,
  className,
}: {
  initialValue?: string;
  placeholder: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  className?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    if (initialValue) ref.current?.select();
  }, [initialValue]);

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
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "border border-blue-400 rounded px-2 py-0.5 text-sm bg-background text-foreground",
        "focus:outline-none focus:ring-1 focus:ring-blue-400",
        className,
      )}
    />
  );
}

// ── 2차 카테고리 카드 ─────────────────────────────────────────────────────────

function SubCategoryCard({
  sub,
  isAdmin,
  isRenaming,
  onClick,
  onContextMenu,
  onRenameConfirm,
  onRenameCancel,
  onDelete,
}: {
  sub: StudyCategory;
  isAdmin: boolean;
  isRenaming: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent, cat: StudyCategory) => void;
  onRenameConfirm: (id: number, name: string) => void;
  onRenameCancel: () => void;
  onDelete: (cat: StudyCategory) => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={isRenaming ? undefined : onClick}
        onContextMenu={
          isAdmin
            ? (e) => {
                e.preventDefault();
                onContextMenu(e, sub);
              }
            : undefined
        }
        className={cn(
          "w-44 h-24 rounded-xl border bg-card text-left p-3",
          "flex flex-col justify-between",
          "hover:shadow-md hover:border-primary/40 hover:bg-primary/5 transition-all duration-150",
          isRenaming && "ring-2 ring-blue-400",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{sub.icon || "📁"}</span>
          {isRenaming ? (
            <InlineInput
              initialValue={sub.name}
              placeholder="주제명 입력"
              onConfirm={(name) => onRenameConfirm(sub.id, name)}
              onCancel={onRenameCancel}
              className="flex-1 min-w-0 text-xs py-0.5"
            />
          ) : (
            <p className="text-sm font-medium text-card-foreground leading-snug line-clamp-2">
              {sub.name}
            </p>
          )}
        </div>
        {!isRenaming && sub.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {sub.description}
          </p>
        )}
      </button>

      {/* hover 시 더보기 버튼 (어드민만) */}
      {isAdmin && !isRenaming && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, sub);
          }}
          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100
                     p-0.5 rounded hover:bg-muted/70 text-muted-foreground
                     hover:text-foreground transition-all"
          title="더보기"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      )}

      {/* hover 시 삭제 버튼 (어드민만, 빠른 접근) */}
      {isAdmin && !isRenaming && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(sub);
          }}
          className="absolute top-1.5 right-7 opacity-0 group-hover:opacity-100
                     p-0.5 rounded hover:bg-destructive/10 text-muted-foreground
                     hover:text-destructive transition-all"
          title="삭제"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ── 메인 섹션 ─────────────────────────────────────────────────────────────────

interface StudyCategorySectionProps {
  category: StudyCategory;
  searchQuery: string;
  onSelectCategory: (categoryId: number) => void;
}

export function StudyCategorySection({
  category,
  searchQuery,
  onSelectCategory,
}: StudyCategorySectionProps) {
  const user = useStore(authStore, (s) => s.user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";

  const { confirm, ConfirmDialog } = useConfirm();

  // 컨텍스트 메뉴
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);

  // 인라인 편집 상태
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [addingSubTo, setAddingSubTo] = useState<number | null>(null); // 1차 카테고리 ID
  const [isRenamingRoot, setIsRenamingRoot] = useState(false);
  const [isAddingRoot, setIsAddingRoot] = useState(false);

  // mutations
  const createCategory = useCreateStudyCategory();
  const updateCategory = useUpdateStudyCategory();
  const deleteCategory = useDeleteStudyCategory();

  const openCtxMenu = (e: React.MouseEvent, cat: StudyCategory) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 160);
    const y = Math.min(e.clientY, window.innerHeight - 90);
    setCtxMenu({ x, y, target: cat });
  };

  // 이름 변경
  const handleRenameConfirm = (id: number, name: string) => {
    updateCategory.mutate(
      { id, req: { name } },
      {
        onSuccess: () => {
          setRenamingId(null);
          setIsRenamingRoot(false);
        },
      },
    );
  };

  // 삭제
  const handleDelete = async (cat: StudyCategory) => {
    const isRoot = cat.id === category.id;
    const ok = await confirm({
      title: isRoot ? "카테고리 삭제" : "주제 삭제",
      description: isRoot
        ? `"${cat.name}" 카테고리를 삭제하시겠습니까?\n하위 주제와 모든 문서가 함께 삭제되며 복구할 수 없습니다.`
        : `"${cat.name}" 주제를 삭제하시겠습니까?\n해당 주제의 모든 문서가 함께 삭제되며 복구할 수 없습니다.`,
      confirmText: "삭제",
      variant: "destructive",
    });
    if (!ok) return;
    deleteCategory.mutate(cat.id);
  };

  // 2차 카테고리 추가
  const handleAddSub = (name: string) => {
    if (!addingSubTo) return;
    createCategory.mutate(
      { name, parentId: addingSubTo, orderNum: null },
      { onSuccess: () => setAddingSubTo(null) },
    );
  };

  // 1차 카테고리 추가
  const handleAddRoot = (name: string) => {
    createCategory.mutate(
      { name, parentId: null, orderNum: null },
      { onSuccess: () => setIsAddingRoot(false) },
    );
  };

  const subCategories = (category.children ?? []).filter((c) => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <section>
      <ConfirmDialog />

      {ctxMenu && (
        <ContextMenu
          menu={ctxMenu}
          onRename={(cat) => {
            if (cat.id === category.id) setIsRenamingRoot(true);
            else setRenamingId(cat.id);
          }}
          onDelete={handleDelete}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* 1차 카테고리 헤더 */}
      <div className="group flex items-center gap-3 mb-4">
        {isRenamingRoot ? (
          <InlineInput
            initialValue={category.name}
            placeholder="카테고리명"
            onConfirm={(name) => handleRenameConfirm(category.id, name)}
            onCancel={() => setIsRenamingRoot(false)}
            className="w-40 text-sm font-semibold"
          />
        ) : (
          <h2 className="text-base font-semibold text-foreground whitespace-nowrap">
            {category.icon} {category.name}
          </h2>
        )}

        <div className="flex-1 h-px bg-border" />

        {/* 어드민: 인라인 액션 버튼들 (hover 시 노출) */}
        {isAdmin && !isRenamingRoot && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {/* 주제 추가 */}
            <button
              onClick={() => setAddingSubTo(category.id)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-muted-foreground
                         hover:text-primary hover:bg-primary/10 rounded transition-colors"
              title="주제 추가"
            >
              <Plus className="w-3.5 h-3.5" />
              주제 추가
            </button>
            {/* 이름 변경 */}
            <button
              onClick={() => setIsRenamingRoot(true)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60
                         rounded transition-colors"
              title="이름 변경"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            {/* 삭제 */}
            <button
              onClick={() => handleDelete(category)}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10
                         rounded transition-colors"
              title="카테고리 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2차 카테고리 카드 목록 */}
      <div className="flex flex-wrap gap-3">
        {subCategories.map((sub) => (
          <SubCategoryCard
            key={sub.id}
            sub={sub}
            isAdmin={isAdmin}
            isRenaming={renamingId === sub.id}
            onClick={() => onSelectCategory(sub.id)}
            onContextMenu={openCtxMenu}
            onRenameConfirm={handleRenameConfirm}
            onRenameCancel={() => setRenamingId(null)}
            onDelete={handleDelete}
          />
        ))}

        {/* 인라인 주제 추가 입력 카드 */}
        {addingSubTo === category.id && (
          <div className="w-44 h-24 rounded-xl border-2 border-blue-400 bg-card p-3 flex items-center">
            <InlineInput
              placeholder="주제명 입력 후 Enter"
              onConfirm={handleAddSub}
              onCancel={() => setAddingSubTo(null)}
              className="w-full text-xs"
            />
          </div>
        )}

        {/* 주제가 없을 때 */}
        {subCategories.length === 0 && addingSubTo !== category.id && (
          <p className="text-sm text-muted-foreground py-2">
            {isAdmin ? (
              <button
                onClick={() => setAddingSubTo(category.id)}
                className="hover:text-primary underline underline-offset-2 transition-colors"
              >
                + 첫 주제 추가하기
              </button>
            ) : (
              "아직 하위 카테고리가 없습니다."
            )}
          </p>
        )}
      </div>

      {/* 사용하지 않음 — isAddingRoot/handleAddRoot 소비 방지 */}
      {isAddingRoot && (
        <InlineInput
          placeholder="카테고리명"
          onConfirm={handleAddRoot}
          onCancel={() => setIsAddingRoot(false)}
          className="hidden"
        />
      )}
    </section>
  );
}
