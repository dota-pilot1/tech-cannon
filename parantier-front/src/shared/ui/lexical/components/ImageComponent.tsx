import { useCallback, useEffect, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  type NodeKey,
} from 'lexical'
import { $isImageNode, type ImageAlignment } from '../nodes/ImageNode'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

interface ImageComponentProps {
  src: string
  altText: string
  width: number
  height: number
  alignment: ImageAlignment
  nodeKey: NodeKey
}

export function ImageComponent({
  src,
  altText,
  width,
  height,
  alignment,
  nodeKey,
}: ImageComponentProps) {
  const [editor] = useLexicalComposerContext()
  const imageRef = useRef<HTMLImageElement>(null)
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const [isResizing, setIsResizing] = useState(false)
  const [currentWidth, setCurrentWidth] = useState(width)
  const [currentHeight, setCurrentHeight] = useState(height)

  useEffect(() => {
    setCurrentWidth(width)
    setCurrentHeight(height)
  }, [width, height])

  // 선택/삭제 커맨드 핸들링
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          if (imageRef.current && imageRef.current.contains(event.target as Node)) {
            if (!event.shiftKey) clearSelection()
            setSelected(true)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        () => {
          if (isSelected) {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey)
              if ($isImageNode(node)) node.remove()
            })
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        () => {
          if (isSelected) {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey)
              if ($isImageNode(node)) node.remove()
            })
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, isSelected, nodeKey, setSelected, clearSelection])

  // 리사이즈 핸들러
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)

      const startX = e.clientX
      const startY = e.clientY
      const startWidth = currentWidth || imageRef.current?.naturalWidth || 300
      const startHeight = currentHeight || imageRef.current?.naturalHeight || 200
      const aspectRatio = startWidth / startHeight

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX
        let newWidth = Math.max(50, startWidth + deltaX)
        let newHeight = moveEvent.shiftKey
          ? Math.max(50, startHeight + (moveEvent.clientY - startY))
          : newWidth / aspectRatio

        setCurrentWidth(Math.round(newWidth))
        setCurrentHeight(Math.round(newHeight))
      }

      const onMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)

        editor.update(() => {
          const node = $getNodeByKey(nodeKey)
          if ($isImageNode(node)) {
            node.setWidthAndHeight(
              Math.round(currentWidth || startWidth),
              Math.round(currentHeight || startHeight),
            )
          }
        })
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [editor, nodeKey, currentWidth, currentHeight],
  )

  // 정렬 변경
  const handleAlignment = useCallback(
    (newAlignment: ImageAlignment) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isImageNode(node)) {
          node.setAlignment(newAlignment)
        }
      })
    },
    [editor, nodeKey],
  )

  return (
    <div
      className="relative inline-block"
      style={{
        textAlign: alignment,
        width: '100%',
        margin: '8px 0',
      }}
    >
      <div
        className="relative inline-block"
        style={{
          float: alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : undefined,
          marginRight: alignment === 'left' ? '12px' : undefined,
          marginLeft: alignment === 'right' ? '12px' : undefined,
        }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={altText}
          width={currentWidth || undefined}
          height={currentHeight || undefined}
          className={`max-w-full ${isSelected ? 'ring-2 ring-primary' : ''} ${isResizing ? 'select-none' : ''}`}
          style={{ display: 'block' }}
          draggable={false}
        />

        {/* 리사이즈 핸들 */}
        {isSelected && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize rounded-tl"
            onMouseDown={handleResizeStart}
          />
        )}

        {/* 정렬 플로팅 툴바 */}
        {isSelected && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-background border rounded-md shadow-md px-1 py-0.5 z-10">
            <button
              onClick={() => handleAlignment('left')}
              className={`p-1 rounded hover:bg-muted ${alignment === 'left' ? 'bg-muted' : ''}`}
              title="왼쪽 정렬"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleAlignment('center')}
              className={`p-1 rounded hover:bg-muted ${alignment === 'center' ? 'bg-muted' : ''}`}
              title="가운데 정렬"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleAlignment('right')}
              className={`p-1 rounded hover:bg-muted ${alignment === 'right' ? 'bg-muted' : ''}`}
              title="오른쪽 정렬"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
