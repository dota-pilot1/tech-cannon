import { useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import type { Menu } from '@/types/menu'

interface DeleteConfirmDialogProps {
  menu: Menu
  childCount: number
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({
  menu,
  childCount,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  // ESC 키로 취소
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onCancel}
      />

      {/* 다이얼로그 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-6">
          {/* 헤더 */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                메뉴 삭제 확인
              </h3>
              <p className="text-sm text-gray-500">
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </div>

          {/* 내용 */}
          <div className="mb-6 space-y-3">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">
                삭제할 메뉴: <span className="text-gray-900">{menu.name}</span>
              </p>
              {childCount > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ 하위 메뉴 {childCount}개도 함께 삭제됩니다.
                </p>
              )}
            </div>
            <p className="text-sm text-gray-600">
              정말 이 메뉴를 삭제하시겠습니까?
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
            >
              삭제
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
