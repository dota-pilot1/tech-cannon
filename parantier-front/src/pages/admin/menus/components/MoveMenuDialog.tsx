import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import type { Menu } from '@/types/menu'

interface MoveMenuDialogProps {
  menu: Menu
  allMenus: Menu[]
  onMove: (newParentId: number | null) => void
  onClose: () => void
}

interface MenuWithDepth {
  menu: Menu
  depth: number
}

function flattenWithDepth(menus: Menu[], excludeId: number): MenuWithDepth[] {
  const result: MenuWithDepth[] = []

  function traverse(list: Menu[], depth: number) {
    for (const m of list) {
      // 자기 자신과 자손 모두 제외
      if (m.id === excludeId) continue
      result.push({ menu: m, depth })
      if (m.children && m.children.length > 0) {
        traverse(m.children, depth + 1)
      }
    }
  }

  // allMenus는 이미 트리 구조이므로 최상위부터 순회
  // 단, allMenus가 flat 배열로 넘어올 수 있으므로 최상위(parentId === null)만 골라서 트리 순회
  const roots = menus.filter((m) => m.parentId === null)
  if (roots.length > 0) {
    traverse(roots, 0)
  } else {
    // flat 배열인 경우 depth 0으로 처리
    for (const m of menus) {
      if (m.id === excludeId) continue
      result.push({ menu: m, depth: 0 })
    }
  }

  return result
}

export function MoveMenuDialog({ menu, allMenus, onMove, onClose }: MoveMenuDialogProps) {
  const [selectedParentId, setSelectedParentId] = useState<number | null | 'unset'>(
    'unset'
  )

  const candidates = flattenWithDepth(allMenus, menu.id)

  const currentSelection = selectedParentId === 'unset' ? menu.parentId : selectedParentId

  const isSameAsCurrentParent =
    selectedParentId !== 'unset' && selectedParentId === menu.parentId

  const isMoveDisabled = selectedParentId === 'unset' || isSameAsCurrentParent

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleConfirm = () => {
    if (selectedParentId === 'unset') return
    onMove(selectedParentId)
  }

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* 모달 카드 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px]">
        <div className="bg-card rounded-xl shadow-xl border border-border flex flex-col max-h-[80vh]">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <span className="text-base font-semibold">📁 이동 위치 선택</span>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {/* 서브텍스트 */}
          <div className="px-5 py-3 flex-shrink-0">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">"{menu.name}"</span>
              {' '}을 이동할 위치를 선택하세요
            </p>
          </div>

          {/* 선택 목록 */}
          <div className="overflow-y-auto flex-1 px-3 pb-3">
            {/* 최상위 항목 */}
            <button
              className={[
                'w-full px-4 py-2.5 text-left text-sm rounded-lg flex items-center gap-2 transition-colors',
                currentSelection === null
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-foreground',
              ].join(' ')}
              onClick={() => setSelectedParentId(null)}
            >
              <span>🏠</span>
              <span className="flex-1">최상위 (부모 없음)</span>
              {menu.parentId === null && (
                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                  현재
                </span>
              )}
            </button>

            {/* 후보 목록 */}
            {candidates.map(({ menu: candidate, depth }) => {
              const isSelected = currentSelection === candidate.id
              const isCurrent = menu.parentId === candidate.id
              const isFolder = !candidate.path

              return (
                <button
                  key={candidate.id}
                  className={[
                    'w-full py-2.5 text-left text-sm rounded-lg flex items-center gap-2 transition-colors pr-4',
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-foreground',
                  ].join(' ')}
                  style={{ paddingLeft: `${16 + depth * 16}px` }}
                  onClick={() => setSelectedParentId(candidate.id)}
                >
                  <span>{isFolder ? '📁' : '📄'}</span>
                  <span className="flex-1 truncate">{candidate.name}</span>
                  {isCurrent && (
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded flex-shrink-0">
                      현재
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-border flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="button"
              disabled={isMoveDisabled}
              onClick={handleConfirm}
            >
              이동
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
