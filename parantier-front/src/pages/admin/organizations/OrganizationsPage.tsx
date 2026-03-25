import type { Organization } from '@/types/organization'
import { useState, useEffect } from 'react'
import { useOrganizations } from '@/features/admin/hooks/useOrganizations'
import { useUsers } from '@/features/admin/hooks/useUsers'
import { Button } from '@/shared/ui/button'
import { Building2, Users as UsersIcon, Folder, User, UserPlus, Edit, Trash2, UserMinus, Move, Search, Shield, ChevronRight, ChevronLeft } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/shared/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Checkbox } from '@/shared/ui/checkbox'
import { adminApi } from '@/entities/user/api/adminApi'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useConfirm } from '@/shared/hooks/useConfirm'

// 조직 타입별 아이콘
const orgTypeIcons: Record<string, typeof Building2> = {
  COMPANY: Building2,
  DEPARTMENT: Folder,
  TEAM: UsersIcon,
}

// 권한 할당 다이얼로그 컴포넌트
function AuthorityAssignmentDialog({
  open,
  onOpenChange,
  userId,
  username,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: number
  username: string
}) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [allAuthorities, setAllAuthorities] = useState<Array<{ id: number; name: string; description: string; categoryId: number | null }>>([])
  const [selectedAuthorities, setSelectedAuthorities] = useState<Set<number>>(new Set())
  const [selectedLeftItems, setSelectedLeftItems] = useState<Set<number>>(new Set())
  const [selectedRightItems, setSelectedRightItems] = useState<Set<number>>(new Set())
  const [expandedLeftCategories, setExpandedLeftCategories] = useState<Set<string>>(new Set())
  const [expandedRightCategories, setExpandedRightCategories] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [authorities, currentAuthorities] = await Promise.all([
        adminApi.getAllAuthorities(),
        adminApi.getUserAuthorities(userId),
      ])
      setAllAuthorities(authorities)
      // 사용자가 현재 가지고 있는 권한을 선택된 상태로 초기화
      setSelectedAuthorities(new Set(currentAuthorities.map(a => a.authorityId)))
    } catch (error) {
      console.error('Failed to load authorities:', error)
      toast.error('권한 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 다이얼로그가 열릴 때마다 데이터 로드
  useEffect(() => {
    if (open && userId) {
      loadData()
      setSelectedLeftItems(new Set())
      setSelectedRightItems(new Set())
    }
  }, [open, userId])

  // 왼쪽(할당된 권한) 체크박스 토글
  const handleToggleLeft = (authorityId: number) => {
    const newSet = new Set(selectedLeftItems)
    if (newSet.has(authorityId)) {
      newSet.delete(authorityId)
    } else {
      newSet.add(authorityId)
    }
    setSelectedLeftItems(newSet)
  }

  // 오른쪽(사용 가능한 권한) 체크박스 토글
  const handleToggleRight = (authorityId: number) => {
    const newSet = new Set(selectedRightItems)
    if (newSet.has(authorityId)) {
      newSet.delete(authorityId)
    } else {
      newSet.add(authorityId)
    }
    setSelectedRightItems(newSet)
  }

  // 왼쪽에서 오른쪽으로 이동 (권한 제거)
  const moveToRight = () => {
    const newAuthorities = new Set(selectedAuthorities)
    selectedLeftItems.forEach(id => newAuthorities.delete(id))
    setSelectedAuthorities(newAuthorities)
    setSelectedLeftItems(new Set())
  }

  // 오른쪽에서 왼쪽으로 이동 (권한 추가)
  const moveToLeft = () => {
    const newAuthorities = new Set(selectedAuthorities)
    selectedRightItems.forEach(id => newAuthorities.add(id))
    setSelectedAuthorities(newAuthorities)
    setSelectedRightItems(new Set())
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await adminApi.updateUserAuthorities(userId, Array.from(selectedAuthorities))
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success(`${username}님의 권한이 업데이트되었습니다.`)
    } catch (error) {
      console.error('Failed to update authorities:', error)
      toast.error('권한 업데이트에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  // 왼쪽 패널: 사용자가 선택한 권한
  const selectedAuthorityList = allAuthorities.filter(a => selectedAuthorities.has(a.id))

  // 오른쪽 패널: 선택되지 않은 권한
  const availableAuthorityList = allAuthorities.filter(a => !selectedAuthorities.has(a.id))

  // 카테고리별로 권한 그룹화
  const groupByCategory = (authorities: typeof allAuthorities) => {
    const grouped = authorities.reduce((acc, auth) => {
      const category = auth.categoryId || 0
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(auth)
      return acc
    }, {} as Record<number, typeof allAuthorities>)
    return grouped
  }

  const selectedGrouped = groupByCategory(selectedAuthorityList)
  const availableGrouped = groupByCategory(availableAuthorityList)

  // 카테고리명 추출 (권한 이름에서 첫 번째 단어 사용)
  const getCategoryName = (authorities: typeof allAuthorities) => {
    if (authorities.length === 0) return '기타'
    const firstName = authorities[0].name
    const match = firstName.match(/^([A-Z]+)/)
    return match ? match[1] : '기타'
  }

  // 카테고리 토글
  const toggleLeftCategory = (categoryId: string) => {
    const newSet = new Set(expandedLeftCategories)
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId)
    } else {
      newSet.add(categoryId)
    }
    setExpandedLeftCategories(newSet)
  }

  const toggleRightCategory = (categoryId: string) => {
    const newSet = new Set(expandedRightCategories)
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId)
    } else {
      newSet.add(categoryId)
    }
    setExpandedRightCategories(newSet)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-[98vw] max-h-[98vh] h-[98vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">권한 할당 - {username}</DialogTitle>
          <DialogDescription>
            권한을 클릭하여 할당하거나 제거할 수 있습니다. 카테고리별로 분류되어 있습니다.
          </DialogDescription>
        </DialogHeader>

{isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">권한 목록 로딩 중...</p>
          </div>
        ) : (
          <div className="flex gap-4 flex-1 overflow-hidden">
            {/* 왼쪽: 할당된 권한 */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 bg-primary/10 rounded-lg mb-3">
                <h3 className="font-semibold">할당된 권한</h3>
                <span className="text-sm font-medium text-primary">
                  {Object.keys(selectedGrouped).length}개 카테고리 / {selectedAuthorities.size}개 권한
                </span>
              </div>
              <div className="border rounded-lg flex-1 overflow-y-auto">
                {selectedAuthorityList.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    할당된 권한이 없습니다.
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {Object.entries(selectedGrouped).map(([categoryId, authorities]) => {
                      const isExpanded = expandedLeftCategories.has(categoryId)
                      const categoryName = getCategoryName(authorities)
                      return (
                        <div key={categoryId} className="space-y-1">
                          <button
                            onClick={() => toggleLeftCategory(categoryId)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent transition-colors"
                          >
                            <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1 text-left">
                              {categoryName}
                            </h4>
                            <span className="text-xs text-muted-foreground">{authorities.length}개</span>
                          </button>
                          {isExpanded && (
                            <div className="space-y-1 ml-4">
                              {authorities.map((authority) => (
                                <div
                                  key={authority.id}
                                  className="flex items-start gap-2 p-2.5 rounded-md transition-colors hover:bg-accent border border-transparent hover:border-border"
                                >
                                  <Checkbox
                                    checked={selectedLeftItems.has(authority.id)}
                                    onCheckedChange={() => handleToggleLeft(authority.id)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm leading-tight">{authority.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-tight">{authority.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 가운데: 이동 버튼 */}
            <div className="flex flex-col gap-3 justify-center items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={moveToLeft}
                disabled={selectedRightItems.size === 0}
                title="선택한 권한 할당"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={moveToRight}
                disabled={selectedLeftItems.size === 0}
                title="선택한 권한 제거"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* 오른쪽: 사용 가능한 권한 */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg mb-3">
                <h3 className="font-semibold">사용 가능한 권한</h3>
                <span className="text-sm text-muted-foreground">
                  {Object.keys(availableGrouped).length}개 카테고리 / {availableAuthorityList.length}개 권한
                </span>
              </div>
              <div className="border rounded-lg flex-1 overflow-y-auto">
                {availableAuthorityList.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    모든 권한이 할당되었습니다.
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {Object.entries(availableGrouped).map(([categoryId, authorities]) => {
                      const isExpanded = expandedRightCategories.has(categoryId)
                      const categoryName = getCategoryName(authorities)
                      return (
                        <div key={categoryId} className="space-y-1">
                          <button
                            onClick={() => toggleRightCategory(categoryId)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent transition-colors"
                          >
                            <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1 text-left">
                              {categoryName}
                            </h4>
                            <span className="text-xs text-muted-foreground">{authorities.length}개</span>
                          </button>
                          {isExpanded && (
                            <div className="space-y-1 ml-4">
                              {authorities.map((authority) => (
                                <div
                                  key={authority.id}
                                  className="flex items-start gap-2 p-2.5 rounded-md transition-colors hover:bg-accent border border-transparent hover:border-border"
                                >
                                  <Checkbox
                                    checked={selectedRightItems.has(authority.id)}
                                    onCheckedChange={() => handleToggleRight(authority.id)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm leading-tight">{authority.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-tight">{authority.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            <Shield className="mr-2 h-4 w-4" />
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 재귀적으로 트리 노드 렌더링 (조직 + 사용자)
function OrganizationTreeNode({
  org,
  level = 0,
  selectedOrgId,
  selectedUserId,
  onSelect,
  onSelectUser,
  users,
  organizations,
}: {
  org: Organization
  level?: number
  selectedOrgId: number | null
  selectedUserId: number | null
  onSelect: (org: Organization) => void
  onSelectUser: (userId: number) => void
  users: Array<{ id: number; username: string; email: string; organizationId: number | null; role: string; isActive: boolean }>
  organizations: Organization[]
}) {
  const queryClient = useQueryClient()
  const { confirm, ConfirmDialog } = useConfirm()
  const [isExpanded, setIsExpanded] = useState(level < 2) // 기본적으로 2단계까지 펼침
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [isAuthorityDialogOpen, setIsAuthorityDialogOpen] = useState(false)
  const [selectedUserForAuthority, setSelectedUserForAuthority] = useState<{ id: number; username: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasChildren = org.children && org.children.length > 0
  const orgUsers = users.filter(user => user.organizationId === org.id)
  const hasContent = hasChildren || orgUsers.length > 0
  const isSelected = selectedOrgId === org.id
  const Icon = orgTypeIcons[org.orgType] || Building2

  // 이미 소속된 사용자는 제외하고, 미소속 사용자만 표시
  const availableUsers = users.filter(user => !user.organizationId || user.organizationId !== org.id)

  // 검색 필터링 (미소속 사용자 대상)
  const filteredUsers = !searchQuery.trim()
    ? availableUsers
    : availableUsers.filter(user => {
        const query = searchQuery.toLowerCase()
        return user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      })

  const handleToggleUser = (userId: number) => {
    const newSet = new Set(selectedUserIds)
    if (newSet.has(userId)) {
      newSet.delete(userId)
    } else {
      newSet.add(userId)
    }
    setSelectedUserIds(newSet)
  }

  const handleAddMembers = async () => {
    try {
      setIsSubmitting(true)
      await adminApi.updateUsersOrganization(Array.from(selectedUserIds), org.id)

      // 사용자 목록 다시 가져오기
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })

      toast.success(`${selectedUserIds.size}명의 사용자를 ${org.name}에 추가했습니다.`)
      setIsAddMemberDialogOpen(false)
      setSelectedUserIds(new Set())
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to add members:', error)
      toast.error('팀원 추가에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="ml-4">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer transition-colors ${
              isSelected
                ? 'bg-primary text-primary-foreground font-medium'
                : 'hover:bg-accent'
            }`}
            onClick={() => {
              onSelect(org)
              if (hasContent) {
                setIsExpanded(!isExpanded)
              }
            }}
          >
            {hasContent && (
              <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
            )}
            {!hasContent && <span className="w-3" />}

            <Icon className="w-4 h-4" />

            <div className="flex-1">
              <div className="text-sm">{org.name}</div>
            </div>

            {orgUsers.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {orgUsers.length}명
              </span>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => setIsAddMemberDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>팀원 추가</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => alert('조직 수정 기능 준비 중')}>
            <Edit className="mr-2 h-4 w-4" />
            <span>조직 수정</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => alert('조직 삭제 기능 준비 중')}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>조직 삭제</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* 팀원 추가 다이얼로그 */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>팀원 추가 - {org.name}</DialogTitle>
            <DialogDescription>
              조직에 추가할 사용자를 선택하세요. 미소속 사용자만 표시됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 검색 입력 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름 또는 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* 사용자 목록 */}
            <div className="border rounded-lg max-h-[50vh] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-4 transition-colors hover:bg-accent"
                    >
                      <Checkbox
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={() => handleToggleUser(user.id)}
                      />
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <p className="text-sm font-medium">
                          {user.role === 'ROLE_ADMIN' ? '관리자' : '일반 사용자'}
                        </p>
                        <p className="text-xs text-green-600">미소속</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 선택된 사용자 수 */}
            {selectedUserIds.size > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedUserIds.size}명 선택됨
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={selectedUserIds.size === 0 || isSubmitting}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isSubmitting ? '추가 중...' : `추가 (${selectedUserIds.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 권한 할당 다이얼로그 */}
      <AuthorityAssignmentDialog
        open={isAuthorityDialogOpen}
        onOpenChange={setIsAuthorityDialogOpen}
        userId={selectedUserForAuthority?.id || 0}
        username={selectedUserForAuthority?.username || ''}
      />

      {isExpanded && hasContent && (
        <div className="ml-2 border-l border-border">
          {/* 하위 조직 먼저 렌더링 */}
          {org.children?.map((child) => (
            <OrganizationTreeNode
              key={child.id}
              org={child}
              level={level + 1}
              selectedOrgId={selectedOrgId}
              selectedUserId={selectedUserId}
              onSelect={onSelect}
              onSelectUser={onSelectUser}
              users={users}
              organizations={organizations}
            />
          ))}

          {/* 소속 사용자 렌더링 */}
          {orgUsers.map((user) => {
            const handleRemoveMember = async () => {
              const confirmed = await confirm({
                title: '팀원 제거',
                description: `${user.username}님을 ${org.name}에서 제거하시겠습니까?`,
                confirmText: '제거',
                cancelText: '취소',
                variant: 'destructive',
              })

              if (!confirmed) return

              try {
                await adminApi.removeUserFromOrganization(user.id)
                await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
                toast.success(`${user.username}님을 조직에서 제거했습니다.`)
              } catch (error) {
                console.error('Failed to remove member:', error)
                toast.error('팀원 제거에 실패했습니다.')
              }
            }

            const isUserSelected = selectedUserId === user.id

            return (
              <ContextMenu key={`user-${user.id}`}>
                <ContextMenuTrigger asChild>
                  <div
                    className={`ml-4 flex items-center gap-2 py-1.5 px-3 text-sm rounded cursor-pointer transition-colors ${
                      isUserSelected
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent'
                    }`}
                    onClick={() => {
                      console.log('User clicked:', user.username, 'User ID:', user.id)
                      onSelectUser(user.id)
                    }}
                  >
                    <span className="w-3" />
                    <User className="w-3.5 h-3.5" />
                    <span>{user.username}</span>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem onClick={() => alert('사용자 정보 수정 준비 중')}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>정보 수정</span>
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => {
                    setSelectedUserForAuthority({ id: user.id, username: user.username })
                    setIsAuthorityDialogOpen(true)
                  }}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>권한 할당</span>
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => alert('조직 이동 준비 중')}>
                    <Move className="mr-2 h-4 w-4" />
                    <span>조직 이동</span>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={handleRemoveMember}
                    className="text-destructive focus:text-destructive"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    <span>팀원 제거</span>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )
          })}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  )
}

export function OrganizationsPage() {
  const { data: organizations = [], isLoading, isError, error, refetch } = useOrganizations()
  const { data: users = [] } = useUsers()
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  // 선택된 조직의 사용자 필터링
  const orgUsers = selectedOrg
    ? users.filter((user) => user.organizationId === selectedOrg.id)
    : []

  // 선택된 사용자
  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">로딩 중...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-destructive">
          {error instanceof Error ? error.message : '조직 목록을 불러오지 못했습니다.'}
        </p>
        <Button onClick={() => refetch()}>다시 시도</Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 조직 트리 */}
      <div className="w-80 border-r bg-card overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">조직 구조</h2>
          <p className="text-sm text-muted-foreground mt-1">
            조직을 선택하여 상세 정보를 확인하세요
          </p>
        </div>
        <div className="p-2">
          {organizations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              등록된 조직이 없습니다.
            </div>
          ) : (
            <div className="space-y-1">
              {organizations.map((org) => (
                <OrganizationTreeNode
                  key={org.id}
                  org={org}
                  selectedOrgId={selectedOrg?.id || null}
                  selectedUserId={selectedUserId}
                  onSelect={(org) => {
                    setSelectedOrg(org)
                    setSelectedUserId(null)
                  }}
                  onSelectUser={(userId) => {
                    setSelectedUserId(userId)
                    setSelectedOrg(null)
                  }}
                  users={users}
                  organizations={organizations}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 상세 정보 */}
      <div className="flex-1 overflow-y-auto">
        {selectedUser ? (
          <div className="p-6">
            {/* 사용자 정보 */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{selectedUser.username}</h1>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-muted-foreground">사용자 ID</p>
                  <p className="font-medium">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">권한</p>
                  <p className="font-medium">
                    {selectedUser.role === 'ROLE_ADMIN' ? '관리자' : '일반 사용자'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">소속 조직</p>
                  <p className="font-medium">
                    {selectedUser.organizationId
                      ? organizations.find((o) => o.id === selectedUser.organizationId)?.name || '알 수 없음'
                      : '미소속'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">상태</p>
                  <p className="font-medium">{selectedUser.isActive ? '활성' : '비활성'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : selectedOrg ? (
          <div className="p-6">
            {/* 조직 정보 */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = orgTypeIcons[selectedOrg.orgType] || Building2
                  return <Icon className="w-8 h-8 text-primary" />
                })()}
                <div>
                  <h1 className="text-2xl font-bold">{selectedOrg.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrg.code} • {selectedOrg.orgType}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-muted-foreground">조직 코드</p>
                  <p className="font-medium">{selectedOrg.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">조직 유형</p>
                  <p className="font-medium">
                    {selectedOrg.orgType === 'COMPANY'
                      ? '회사'
                      : selectedOrg.orgType === 'DEPARTMENT'
                      ? '부서'
                      : '팀'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">레벨</p>
                  <p className="font-medium">{selectedOrg.level}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">소속 인원</p>
                  <p className="font-medium">{orgUsers.length}명</p>
                </div>
              </div>
            </div>

            {/* 소속 사용자 목록 */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                소속 사용자 ({orgUsers.length})
              </h2>

              {orgUsers.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">
                    이 조직에 소속된 사용자가 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orgUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {user.role === 'ROLE_ADMIN' ? '관리자' : '일반 사용자'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.isActive ? '활성' : '비활성'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                왼쪽에서 조직을 선택하세요
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                조직의 상세 정보와 소속 사용자를 확인할 수 있습니다
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
