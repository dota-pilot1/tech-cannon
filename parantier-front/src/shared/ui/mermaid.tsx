import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
  className?: string
}

// Mermaid 초기화
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'sans-serif',
})

export function Mermaid({ chart, className = '' }: MermaidProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isRendering, setIsRendering] = useState(true)

  useEffect(() => {
    if (!elementRef.current || !chart.trim()) {
      setIsRendering(false)
      return
    }

    setIsRendering(true)
    const renderChart = async () => {
      try {
        // 매번 새로운 ID 생성 (Mermaid ID 재사용 문제 방지)
        const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        console.log('[Mermaid] 렌더링 시작:', chart.substring(0, 50))
        const { svg } = await mermaid.render(uniqueId, chart)
        console.log('[Mermaid] 렌더링 성공')
        if (elementRef.current) {
          elementRef.current.innerHTML = svg
        }
        setIsRendering(false)
      } catch (error) {
        console.error('[Mermaid] 렌더링 에러:', error)
        console.error('[Mermaid] 차트 내용:', chart)
        if (elementRef.current) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          const errorStr = JSON.stringify(error, null, 2)
          elementRef.current.innerHTML = `
            <div class="p-4 bg-red-50 border-2 border-red-300 rounded text-sm text-red-800">
              <p class="font-bold mb-2 text-base">❌ Mermaid 다이어그램 렌더링 실패</p>
              <p class="font-semibold mb-1">에러 메시지:</p>
              <pre class="text-xs whitespace-pre-wrap mb-3 p-2 bg-white rounded border">${errorMessage}</pre>
              <details class="mt-2">
                <summary class="cursor-pointer font-semibold">상세 정보</summary>
                <pre class="text-xs whitespace-pre-wrap mt-2 p-2 bg-white rounded border">${errorStr}</pre>
              </details>
              <p class="mt-3 text-xs text-gray-600">
                💡 Mermaid 문법을 확인하세요: <a href="https://mermaid.js.org/syntax/sequenceDiagram.html" target="_blank" class="underline">문서 보기</a>
              </p>
            </div>
          `
        }
        setIsRendering(false)
      }
    }

    renderChart()
  }, [chart])

  if (!chart.trim()) {
    return (
      <div className="p-4 text-sm text-gray-400 text-center">
        Mermaid 다이어그램 코드가 없습니다.
      </div>
    )
  }

  return (
    <div className="relative">
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-10">
          <div className="text-sm text-gray-500">렌더링 중...</div>
        </div>
      )}
      <div ref={elementRef} className={className} />
    </div>
  )
}
