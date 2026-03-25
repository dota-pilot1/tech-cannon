import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface DebugPanelProps {
  data: any
  title?: string
}

export function DebugPanel({ data, title = '트리 구조 확인 (Debug)' }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg transition-all duration-300">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-700">{title}</span>
          <span className="text-xs text-gray-500">
            {isOpen ? '클릭하여 닫기' : '클릭하여 열기'}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {/* Debug Content */}
      {isOpen && (
        <div className="px-6 py-4 bg-white" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto border">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
