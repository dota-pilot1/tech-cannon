import { useChatRooms, useCreateRoom, useJoinRoom, useDeleteAllRooms } from '@/hooks/useChat'
import { Link, useNavigate } from '@tanstack/react-router'
import { MessageSquare, Users, Plus, Trash2 } from 'lucide-react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { authStore } from '@/entities/user/model/authStore'
import { Button } from '@/shared/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

export function ChatRoomsPage() {
  const navigate = useNavigate()
  const { data: rooms, isLoading } = useChatRooms()
  const { confirm, ConfirmDialog } = useConfirm()
  const auth = authStore.state
  const isAdmin = auth.user?.role === 'ADMIN'

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomType, setNewRoomType] = useState<'TEAM' | 'PROJECT' | 'DIRECT'>('TEAM')

  const createRoomMutation = useCreateRoom((roomId) => {
    setIsCreateDialogOpen(false)
    setNewRoomName('')
    setNewRoomType('TEAM')
    navigate({ to: '/chat/$roomId', params: { roomId: String(roomId) } })
  })

  const joinRoomMutation = useJoinRoom((roomId) => {
    // 참가 성공 후 참가자 목록 갱신됨
  })

  const deleteAllRoomsMutation = useDeleteAllRooms()

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return
    createRoomMutation.mutate({
      name: newRoomName,
      roomType: newRoomType,
      isActive: true,
    })
  }

  const handleRoomClick = async (roomId: number, e: React.MouseEvent) => {
    e.preventDefault()

    try {
      // 채팅방 참가 시도 (이미 참가한 경우 서버에서 중복 방지)
      await joinRoomMutation.mutateAsync(roomId)
      navigate({ to: '/chat/$roomId', params: { roomId: String(roomId) } })
    } catch (error: any) {
      // 이미 참가한 경우는 에러가 아니므로 그냥 이동
      if (error?.response?.status === 409 || error?.message?.includes('이미')) {
        navigate({ to: '/chat/$roomId', params: { roomId: String(roomId) } })
      } else {
        toast.error('채팅방 입장 중 오류가 발생했습니다')
      }
    }
  }

  const handleDeleteAllRooms = async () => {
    const confirmed = await confirm({
      title: '모든 채팅방 삭제',
      description: '정말로 모든 채팅방을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 참가자 정보도 함께 삭제됩니다.',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'destructive',
    })

    if (confirmed) {
      deleteAllRoomsMutation.mutate()
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">로딩 중...</div>
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">채팅방</h1>
            <p className="text-sm text-muted-foreground mt-1">
              활성 채팅방 {rooms?.length || 0}개
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && rooms && rooms.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteAllRooms}
                disabled={deleteAllRoomsMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                모두 삭제
              </Button>
            )}
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              새 채팅방
            </Button>
          </div>
        </div>
      </div>

      {/* 채팅방 카드 목록 */}
      <div className="flex-1 overflow-y-auto p-6">
        {!rooms || rooms.length === 0 ? (
          <div className="text-center text-muted-foreground mt-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>활성 채팅방이 없습니다</p>
            <p className="text-sm mt-1">새 채팅방을 만들어보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={(e) => handleRoomClick(room.id, e)}
                className="block cursor-pointer"
              >
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  {/* 채팅방 아이콘 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {room.roomType === 'TEAM' && '팀'}
                      {room.roomType === 'PROJECT' && '프로젝트'}
                      {room.roomType === 'DIRECT' && '1:1'}
                    </span>
                  </div>

                  {/* 채팅방 이름 */}
                  <h3 className="font-semibold text-lg mb-2 truncate">{room.name}</h3>

                  {/* 참가자 수 및 생성자 */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{room.memberCount}명</span>
                    </div>
                    <span className="text-xs">생성: {room.createdByName}</span>
                  </div>

                  {/* 생성 시간 */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(room.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 채팅방 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 채팅방 만들기</DialogTitle>
            <DialogDescription>채팅방 정보를 입력해주세요</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">채팅방 이름</Label>
              <Input
                id="room-name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="예: 개발팀 채팅방"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateRoom()
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-type">채팅방 유형</Label>
              <Select value={newRoomType} onValueChange={(value: any) => setNewRoomType(value)}>
                <SelectTrigger id="room-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEAM">팀</SelectItem>
                  <SelectItem value="PROJECT">프로젝트</SelectItem>
                  <SelectItem value="DIRECT">1:1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim() || createRoomMutation.isPending}
            >
              {createRoomMutation.isPending ? '생성 중...' : '생성'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </div>
  )
}
