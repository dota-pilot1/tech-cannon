import { useState, useRef, useEffect } from 'react'

interface InlineMenuInputProps {
  depth: number
  onSubmit: (name: string) => void
  onCancel: () => void
}

export function InlineMenuInput({ depth, onSubmit, onCancel }: InlineMenuInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 컴포넌트 마운트 시 자동 포커스
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel()
      }
    }

    // 다음 틱에 이벤트 리스너 등록 (현재 클릭 이벤트와 충돌 방지)
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onCancel])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed) {
      onSubmit(trimmed)
      setValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center rounded bg-blue-50 border border-blue-300 px-3 py-2 transition-colors"
      style={{ paddingLeft: `${depth * 20 + 12}px` }}
    >
      {/* 빈 공간 (트리 정렬) */}
      <span className="mr-1 w-4" />

      {/* 아이콘 */}
      <span className="mr-2 text-base">📄</span>

      {/* 입력 필드 */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="메뉴 이름 입력 (Enter: 저장, Esc: 취소)"
      />
    </div>
  )
}
