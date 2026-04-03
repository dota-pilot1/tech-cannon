import { useState, useEffect } from "react";
import type { Menu, MenuType } from "@/types/menu";
import { Button } from "@/shared/ui/button";

interface MenuEditFormProps {
  menu: Menu | null;
  parentMenu?: Menu | null;
  allMenus?: Menu[];
  onSave: (menuData: Partial<Menu>) => void;
  onDelete: (id: number) => void;
  onCancel: () => void;
}

// 메뉴 트리를 평탄화 (자기 자신 및 자손 제외)
function flattenMenus(menus: Menu[], excludeId?: number): Menu[] {
  const result: Menu[] = [];
  const traverse = (items: Menu[]) => {
    for (const item of items) {
      if (excludeId && item.id === excludeId) continue;
      result.push(item);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  };
  traverse(menus);
  return result;
}

export function MenuEditForm({
  menu,
  parentMenu,
  allMenus = [],
  onSave,
  onDelete,
  onCancel,
}: MenuEditFormProps) {
  const [formData, setFormData] = useState<Partial<Menu>>(
    menu || {
      name: "",
      path: "",
      menuType: "HEADER" as MenuType,
      requiredRole: null,
      orderNum: 0,
      isActive: true,
      parentId: parentMenu?.id ?? null,
    },
  );

  useEffect(() => {
    setFormData(
      menu || {
        name: "",
        path: "",
        menuType: "HEADER" as MenuType,
        requiredRole: null,
        orderNum: 0,
        isActive: true,
        parentId: parentMenu?.id ?? null,
      },
    );
  }, [menu, parentMenu]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    field: keyof Menu,
    value: string | number | boolean | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 부모로 선택 가능한 메뉴 목록 (자기 자신 및 자손 제외, path 없는 그룹 메뉴 우선)
  const parentCandidates = flattenMenus(allMenus, menu?.id ?? undefined);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {menu?.id ? "메뉴 편집" : "새 메뉴 추가"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          메뉴 정보를 입력하고 저장하세요.
        </p>
      </div>

      {/* 메뉴명 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          메뉴명 <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="메뉴 이름을 입력하세요"
        />
      </div>

      {/* 부모 메뉴 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          부모 메뉴
        </label>
        <select
          value={formData.parentId ?? ""}
          onChange={(e) =>
            handleChange(
              "parentId",
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
          className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">없음 (최상위 메뉴)</option>
          {parentCandidates.map((m) => (
            <option key={m.id} value={m.id}>
              {m.parentId ? `  └ ${m.name}` : m.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          부모 메뉴를 변경하면 드롭다운 위치가 바뀝니다.
        </p>
      </div>

      {/* 타입 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          타입 <span className="text-destructive">*</span>
        </label>
        <select
          required
          value={formData.menuType || "HEADER"}
          onChange={(e) => handleChange("menuType", e.target.value as MenuType)}
          className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="HEADER">HEADER (최상위 메뉴)</option>
          <option value="SUB">SUB (하위 메뉴)</option>
        </select>
      </div>

      {/* 경로 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          경로
        </label>
        <input
          type="text"
          value={formData.path || ""}
          onChange={(e) => handleChange("path", e.target.value || null)}
          className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="/admin/users"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          URL 경로. 비워두면 링크 없는 그룹 메뉴가 됩니다.
        </p>
      </div>

      {/* 권한 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          권한
        </label>
        <select
          value={formData.requiredRole || ""}
          onChange={(e) => handleChange("requiredRole", e.target.value || null)}
          className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">공개 (권한 없음)</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      {/* 순서 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          순서
        </label>
        <input
          type="number"
          value={formData.orderNum ?? 0}
          onChange={(e) => handleChange("orderNum", parseInt(e.target.value))}
          className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          min="0"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          숫자가 작을수록 먼저 표시됩니다.
        </p>
      </div>

      {/* 활성 상태 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive ?? false}
          onChange={(e) => handleChange("isActive", e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        <label htmlFor="isActive" className="text-sm text-foreground">
          활성 상태
        </label>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex gap-2 pt-4 border-t border-border">
        <Button type="submit" className="flex-1">
          {menu?.id ? "저장" : "추가"}
        </Button>
        {menu?.id && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(menu.id)}
          >
            삭제
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
      </div>
    </form>
  );
}
