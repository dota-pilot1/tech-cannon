import { useState, KeyboardEvent } from 'react'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed) return

    onSend(trimmed)
    setMessage('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter로 전송
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 p-4 border-t bg-background">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요 (Ctrl+Enter로 전송)"
        disabled={disabled}
        className="min-h-[60px] max-h-[120px] resize-none"
      />
      <Button onClick={handleSend} disabled={disabled || !message.trim()} size="icon" className="h-[60px] w-[60px]">
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}
