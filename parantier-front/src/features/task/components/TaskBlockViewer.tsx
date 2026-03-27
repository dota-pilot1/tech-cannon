import type { TaskPost } from '../types/task.types'
import { TYPE_META, parseFileContent, parseDbTableContent } from '../types/task.types'
import { Mermaid } from '@/shared/ui/mermaid'

interface Props {
  post: TaskPost
}

export default function TaskBlockViewer({ post }: Props) {
  const thStyle = 'bg-gray-50 border border-gray-200 px-3 py-2 text-left font-normal text-sm whitespace-nowrap'
  const tdStyle = 'border border-gray-200 px-3 py-1'

  return (
    <div className="space-y-4">
      <table className="w-full border-collapse text-sm mb-6">
        <tbody>
          <tr>
            <th className={thStyle} style={{ width: '80px' }}>
              제목
            </th>
            <td className={tdStyle} colSpan={3}>
              <span className="font-bold text-base">{post.title}</span>
            </td>
          </tr>
          <tr>
            <th className={thStyle} style={{ width: '80px' }}>
              작성자
            </th>
            <td className={tdStyle}>{post.authorName}</td>
            <th className={thStyle} style={{ width: '80px' }}>
              등록일자
            </th>
            <td className={tdStyle}>{post.createdAt.slice(0, 10)}</td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-6">
        {!post.blocks || post.blocks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">편집 모드에서 블록을 추가하여 내용을 작성해보세요.</p>
        ) : (
          post.blocks.map((block, idx) => {
            const meta = TYPE_META[block.blockType] ?? TYPE_META.NOTE
            return (
              <div key={idx} className="border rounded shadow-sm overflow-hidden mb-4">
                <div className="px-3 py-1.5 bg-gray-50 border-b flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <span>{meta.icon}</span> {meta.label}
                </div>

                {block.blockType === 'NOTE' && (
                  <div className="p-4 bg-white">
                    <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {block.content || <span className="text-gray-400">내용이 없습니다.</span>}
                    </pre>
                  </div>
                )}

                {block.blockType === 'MMD' && (
                  <div className="p-4 bg-white">
                    <Mermaid chart={block.content} className="mermaid-diagram" />
                  </div>
                )}

                {block.blockType === 'FIGMA' && (
                  <div className="bg-white">
                    {block.content.trim() ? (
                      <iframe
                        src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(block.content)}`}
                        className="w-full"
                        style={{ height: '500px', border: 'none' }}
                        allowFullScreen
                      />
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-6">URL이 연결되지 않았습니다.</p>
                    )}
                  </div>
                )}

                {block.blockType === 'FILE' && (() => {
                  const file = parseFileContent(block.content)
                  return (
                    <div className="p-4 bg-white space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                        <span className="text-2xl">📎</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.filename || '첨부파일'}</p>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline truncate block"
                          >
                            {file.url}
                          </a>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 shrink-0 shadow-sm"
                        >
                          새 창으로 열기
                        </a>
                      </div>
                      {file.description && (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap px-1">{file.description}</p>
                      )}
                    </div>
                  )
                })()}

                {block.blockType === 'DBTABLE' && (() => {
                  const tbl = parseDbTableContent(block.content)
                  return (
                    <div className="p-4 bg-white space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-bold text-sm text-gray-800">
                          {tbl.tableName || '(테이블명 없음)'}
                        </span>
                        {tbl.schema && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-mono">
                            {tbl.schema}
                          </span>
                        )}
                        {tbl.category && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">{tbl.category}</span>
                        )}
                      </div>
                      {tbl.description && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2 border-l-3 border-amber-400">
                          💬 {tbl.description}
                        </p>
                      )}

                      {tbl.columns.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            {tbl.headers && tbl.headers.length > 0 && (
                              <thead className="bg-gray-700 text-white">
                                <tr>
                                  {tbl.headers.map((header, idx) => (
                                    <th key={idx} className="border border-gray-600 px-3 py-2 text-left text-xs font-normal">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                            )}
                            <tbody>
                              {tbl.columns.map((col, ci) => (
                                <tr
                                  key={ci}
                                  className={`${col.pk ? 'bg-amber-50' : ci % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                                >
                                  <td className="border border-gray-200 px-3 py-1.5 text-center text-gray-500">{col.no}</td>
                                  <td className="border border-gray-200 px-3 py-1.5 font-mono font-medium text-gray-800">
                                    {col.name}
                                  </td>
                                  <td className="border border-gray-200 px-3 py-1.5 text-gray-700">{col.comment}</td>
                                  <td className="border border-gray-200 px-3 py-1.5 font-mono text-blue-700">{col.type}</td>
                                  <td className="border border-gray-200 px-3 py-1.5 text-center text-gray-600">{col.size}</td>
                                  <td className="border border-gray-200 px-3 py-1.5 text-center">
                                    {col.pk ? <span className="text-amber-600 font-bold">✓</span> : ''}
                                  </td>
                                  <td className="border border-gray-200 px-3 py-1.5 text-center">
                                    {col.notNull ? <span className="text-gray-600">✓</span> : ''}
                                  </td>
                                  <td className="border border-gray-200 px-3 py-1.5 text-gray-500 text-[11px]">{col.note}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="text-[10px] text-gray-400 mt-1 text-right">{tbl.columns.length}개 컬럼</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-4">컬럼 정보가 없습니다.</p>
                      )}
                    </div>
                  )
                })()}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
