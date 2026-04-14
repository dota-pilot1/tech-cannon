import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from 'lexical'
import { $createImageNode, type ImagePayload } from '../nodes/ImageNode'

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> = createCommand(
  'INSERT_IMAGE_COMMAND',
)

export function ImagePlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<ImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload)
        $insertNodes([imageNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}

// Drag & Drop + Clipboard 붙여넣기 플러그인
export function DragDropImagePlugin({
  onUpload,
}: {
  onUpload: (file: File) => Promise<string>
}): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer?.files
      if (!files || files.length === 0) return

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        try {
          const url = await onUpload(file)
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: url,
            altText: file.name,
          })
        } catch (err) {
          console.error('Image upload failed:', err)
        }
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (!item.type.startsWith('image/')) continue
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue
        try {
          const url = await onUpload(file)
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: url,
            altText: 'pasted-image',
          })
        } catch (err) {
          console.error('Image paste upload failed:', err)
        }
      }
    }

    rootElement.addEventListener('drop', handleDrop)
    rootElement.addEventListener('dragover', handleDragOver)
    rootElement.addEventListener('paste', handlePaste)

    return () => {
      rootElement.removeEventListener('drop', handleDrop)
      rootElement.removeEventListener('dragover', handleDragOver)
      rootElement.removeEventListener('paste', handlePaste)
    }
  }, [editor, onUpload])

  return null
}
