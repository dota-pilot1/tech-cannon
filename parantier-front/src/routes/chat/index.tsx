import { useChatRooms, useCreateRoom, useJoinRoom, useDeleteAllRooms } from '@/hooks/useChat'
import { useNavigate } from '@tanstack/react-router'
import { MessageSquare, Users, Plus, Trash2, Layers } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

const roomTypeMeta = {
  TEAM: {
    label: '팀',
    helper: '팀 별 빠른 협업 채널',
    badge: 'border-sky-200 bg-sky-50 text-sky-700',
    iconWrapper: 'bg-sky-100 text-sky-600',
    icon: Users,
  },
  PROJECT: {
    label: '프로젝트',
    helper: '프로젝트 이슈 정리 공간',
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
    iconWrapper: 'bg-violet-100 text-violet-600',
    icon: Layers,
  },
  DIRECT: {
    label: '1:1',
    helper: '집중적인 1:1 대화',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    iconWrapper: 'bg-emerald-100 text-emerald-600',
    icon: MessageSquare,
  },
} as const

type ChatRoomType = keyof typeof roomTypeMeta

const chatDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const resolveRoomType = (roomType: string | null | undefined): ChatRoomType => {
  if (roomType === 'PROJECT' || roomType === 'DIRECT') {
    return roomType
  }
  return 'TEAM'
}

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

  const joinRoomMutation = useJoinRoom(() => {
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-[minmax(0,1fr)]">
            {rooms.map((room) => {
              const typeKey = resolveRoomType(room.roomType)
              const typeMeta = roomTypeMeta[typeKey]
              const TypeIcon = typeMeta.icon

              return (
                <button
                  key={room.id}
                  type="button"
                  aria-label={`${room.name} 채팅방 입장`}
                  onClick={(e) => handleRoomClick(room.id, e)}
                  className="group block text-left"
                >
                  <Card className="h-full border-border/60 bg-card/80 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2">
                    <CardHeader className="space-y-4 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeMeta.iconWrapper}`}
                          >
                            <TypeIcon className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-lg leading-tight">{room.name}</CardTitle>
                            <CardDescription className="mt-1 text-xs">
                              {typeMeta.helper}
                            </CardDescription>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${typeMeta.badge}`}
                        >
                          {typeMeta.label}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{room.memberCount}명 참여중</span>
                        </div>
                        <span className="text-xs">ID #{room.id}</span>
                      </div>
                      <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>생성자</span>
                          <span className="font-medium text-foreground">
                            {room.createdByName || '알 수 없음'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span>개설일</span>
                          <span className="font-medium text-foreground">
                            {chatDateFormatter.format(new Date(room.createdAt))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              )
            })}
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
