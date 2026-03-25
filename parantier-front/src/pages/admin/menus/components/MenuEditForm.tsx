import { useState, useEffect } from 'react'
import type { Menu, MenuType } from '@/types/menu'
import { Button } from '@/shared/ui/button'

interface MenuEditFormProps {
  menu: Menu | null
  parentMenu?: Menu | null
  onSave: (menuData: Partial<Menu>) => void
  onDelete: (id: number) => void
  onCancel: () => void
}

export function MenuEditForm({ menu, parentMenu, onSave, onDelete, onCancel }: MenuEditFormProps) {
  const [formData, setFormData] = useState<Partial<Menu>>(
    menu || {
      name: '',
      path: '',
      menuType: 'SIDE' as MenuType,
      requiredRole: null,
      orderNum: 0,
      isActive: true,
      parentId: parentMenu?.id || null,
    }
  )

  // menu나 parentMenu가 변경되면 formData 초기화
  useEffect(() => {
    setFormData(
      menu || {
        name: '',
        path: '',
        menuType: 'SIDE' as MenuType,
        requiredRole: null,
        orderNum: 0,
        isActive: true,
        parentId: parentMenu?.id || null,
      }
    )
  }, [menu, parentMenu])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (
    field: keyof Menu,
    value: string | number | boolean | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {menu?.id ? '메뉴 편집' : '새 메뉴 추가'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          메뉴 정보를 입력하고 저장하세요.
        </p>
        {parentMenu && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <span className="font-medium">부모 메뉴:</span> {parentMenu.name}
            </p>
          </div>
        )}
      </div>

      {/* 메뉴명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메뉴명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="메뉴 이름을 입력하세요"
        />
      </div>

      {/* 타입 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          타입 <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.menuType || 'SIDE'}
          onChange={(e) => handleChange('menuType', e.target.value as MenuType)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="HEADER">HEADER</option>
          <option value="SIDE">SIDE</option>
          <option value="SUB">SUB</option>
        </select>
      </div>

      {/* 경로 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          경로
        </label>
        <input
          type="text"
          value={formData.path || ''}
          onChange={(e) => handleChange('path', e.target.value || null)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="/admin/users"
        />
        <p className="mt-1 text-xs text-gray-500">
          URL 경로를 입력하세요. 비워두면 링크가 없는 메뉴가 됩니다.
        </p>
      </div>

      {/* 권한 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          권한
        </label>
        <select
          value={formData.requiredRole || ''}
          onChange={(e) =>
            handleChange('requiredRole', e.target.value || null)
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">공개 (권한 없음)</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      {/* 순서 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          순서
        </label>
        <input
          type="number"
          value={formData.orderNum || 0}
          onChange={(e) => handleChange('orderNum', parseInt(e.target.value))}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          min="0"
        />
        <p className="mt-1 text-xs text-gray-500">
          숫자가 작을수록 먼저 표시됩니다.
        </p>
      </div>

      {/* 활성 상태 */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive || false}
          onChange={(e) => handleChange('isActive', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
          활성 상태
        </label>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex gap-2 pt-4 border-t">
        <Button type="submit" className="flex-1">
          {menu?.id ? '저장' : '추가'}
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
  )
}
