import { useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { UNDO_COMMAND, REDO_COMMAND, CAN_UNDO_COMMAND, CAN_REDO_COMMAND, COMMAND_PRIORITY_CRITICAL } from 'lexical'
import { Undo2, Redo2 } from 'lucide-react'

const btnClass = (disabled: boolean) =>
  `p-1 rounded transition-colors ${
    disabled
      ? 'text-gray-300 cursor-not-allowed'
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
  }`

export function UndoRedoButtons() {
  const [editor] = useLexicalComposerContext()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    const unregisterUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload)
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )
    const unregisterRedo = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload)
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )
    return () => {
      unregisterUndo()
      unregisterRedo()
    }
  }, [editor])

  return (
    <>
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className={btnClass(!canUndo)}
        title="실행 취소 (Ctrl+Z)"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className={btnClass(!canRedo)}
        title="다시 실행 (Ctrl+Y)"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>
    </>
  )
}
