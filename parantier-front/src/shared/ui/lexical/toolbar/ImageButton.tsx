import { useRef } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_IMAGE_COMMAND } from '../plugins/ImagePlugin'
import { ImageIcon } from 'lucide-react'

interface ImageButtonProps {
  onUpload: (file: File) => Promise<string>
}

export function ImageButton({ onUpload }: ImageButtonProps) {
  const [editor] = useLexicalComposerContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하만 업로드 가능합니다')
      return
    }

    try {
      const url = await onUpload(file)
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: url,
        altText: file.name,
      })
    } catch (err) {
      console.error('Image upload failed:', err)
    }

    // input 초기화
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        title="이미지 삽입"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  )
}
