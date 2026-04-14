import { useState } from 'react'
import { useCreateTopic } from '../hooks/useTopic'
import { LexicalEditor } from '@/shared/ui/lexical/LexicalEditor'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

interface TopicCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TopicCreateDialog({ open, onOpenChange }: TopicCreateDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const createTopic = useCreateTopic(() => {
    onOpenChange(false)
    setTitle('')
    setContent('')
  })

  const handleSubmit = () => {
    if (!title.trim()) return
    createTopic.mutate({ title: title.trim(), content })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>새 토픽</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="text-sm font-medium mb-1 block">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">내용</label>
            <div className="border rounded-lg overflow-hidden">
              <LexicalEditor
                initialState=""
                onChange={setContent}
                placeholder="내용을 입력하세요..."
                minHeight="250px"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm border rounded hover:bg-muted"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || createTopic.isPending}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            등록
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
