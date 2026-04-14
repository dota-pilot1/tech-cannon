import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from 'lexical'
import { $createYouTubeNode, extractYouTubeVideoID } from '../nodes/YouTubeNode'

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_YOUTUBE_COMMAND',
)

export function YouTubePlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<string>(
      INSERT_YOUTUBE_COMMAND,
      (url) => {
        const videoID = extractYouTubeVideoID(url)
        if (videoID) {
          const youtubeNode = $createYouTubeNode(videoID)
          $insertNodes([youtubeNode])
          return true
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}

// 클립보드 붙여넣기에서 YouTube URL 감지
export function YouTubePastePlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain')
      if (!text) return

      const videoID = extractYouTubeVideoID(text.trim())
      if (videoID) {
        e.preventDefault()
        editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, text.trim())
      }
    }

    rootElement.addEventListener('paste', handlePaste)
    return () => rootElement.removeEventListener('paste', handlePaste)
  }, [editor])

  return null
}
