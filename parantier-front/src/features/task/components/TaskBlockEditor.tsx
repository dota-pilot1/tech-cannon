import type { TaskBlock, BlockType } from '../types/task.types'
import { TYPE_META } from '../types/task.types'

interface Props {
  title: string
  setTitle: (title: string) => void
  blocks: TaskBlock[]
  setBlocks: (blocks: TaskBlock[]) => void
}

export default function TaskBlockEditor({ title, setTitle, blocks, setBlocks }: Props) {
  const updateBlock = (idx: number, prop: keyof TaskBlock, val: string) => {
    setBlocks(blocks.map((b, i) => (i === idx ? { ...b, [prop]: val } : b)))
  }

  const addBlock = (type: BlockType) => {
    setBlocks([...blocks, { blockType: type, content: '' }])
  }

  const removeBlock = (idx: number) => {
    setBlocks(blocks.filter((_, i) => i !== idx))
  }

  const thStyle = 'bg-gray-50 border border-gray-200 px-3 py-2 text-left font-normal text-sm whitespace-nowrap'
  const tdStyle = 'border border-gray-200 px-3 py-1 text-sm'

  return (
    <div className="space-y-4 text-sm">
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <th className={thStyle} style={{ width: '80px' }}>
              제목 <span className="text-red-500">*</span>
            </th>
            <td className={tdStyle}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-2 py-1.5"
                placeholder="Task 제목"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-3">
        {blocks.map((block, _idx) => {
          const meta = TYPE_META[block.blockType] ?? TYPE_META.NOTE
          return (
            <div key={_idx} className="border rounded overflow-hidden shadow-sm relative group bg-white">
              <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold px-1">{_idx + 1}.</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                </div>
                <button
                  onClick={() => removeBlock(_idx)}
                  className="text-xs px-2 py-1 bg-red-50 text-red-500 hover:bg-red-100 rounded border border-red-200"
                >
                  삭제
                </button>
              </div>

              <div className="p-0">
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(_idx, 'content', e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 text-sm font-mono border-0 resize-y focus:outline-none"
                  placeholder={
                    block.blockType === 'MMD'
                      ? 'flowchart LR\n    A[시작] --> B[끝]'
                      : block.blockType === 'FIGMA'
                        ? 'https://www.figma.com/file/...'
                        : block.blockType === 'FILE'
                          ? '{"url": "", "filename": "", "description": ""}'
                          : block.blockType === 'DBTABLE'
                            ? '{"tableName": "", "columns": []}'
                            : '마크다운 형식으로 자유롭게 작성하세요.'
                  }
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-dashed border-gray-300">
        <span className="text-xs text-gray-500 mr-2">블록 추가:</span>
        {(Object.entries(TYPE_META) as [BlockType, (typeof TYPE_META)[BlockType]][]).map(([type, meta]) => (
          <button
            key={type}
            onClick={() => addBlock(type)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
          >
            {meta.icon} {meta.label}
          </button>
        ))}
      </div>
    </div>
  )
}
