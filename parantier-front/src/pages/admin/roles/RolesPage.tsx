import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleApi, type Role, type CreateRoleRequest } from '@/entities/role/api/roleApi'
import { authorityApi } from '@/entities/authority/api/authorityApi'
import type { Authority } from '@/types/authority'
import { Button } from '@/shared/ui/button'
import { Plus, Edit, Trash2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Checkbox } from '@/shared/ui/checkbox'

export function RolesPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAuthoritiesDialogOpen, setIsAuthoritiesDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [managingAuthorities, setManagingAuthorities] = useState<Role | null>(null)
  const [selectedAuthorityIds, setSelectedAuthorityIds] = useState<number[]>([])
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    description: '',
  })

  // 역할 목록 조회
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApi.getAll(),
  })

  // 권한 목록 조회
  const { data: authorities = [], isLoading: isAuthoritiesLoading } = useQuery({
    queryKey: ['authorities'],
    queryFn: () => authorityApi.getAll(),
  })

  // 역할 생성
  const createMutation = useMutation({
    mutationFn: (data: CreateRoleRequest) => roleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('역할이 생성되었습니다')
      handleCloseDialog()
    },
    onError: () => {
      toast.error('역할 생성에 실패했습니다')
    },
  })

  // 역할 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateRoleRequest }) =>
      roleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('역할이 수정되었습니다')
      handleCloseDialog()
    },
    onError: () => {
      toast.error('역할 수정에 실패했습니다')
    },
  })

  // 역할 삭제
  const deleteMutation = useMutation({
    mutationFn: (id: number) => roleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('역할이 삭제되었습니다')
    },
    onError: () => {
      toast.error('역할 삭제에 실패했습니다')
    },
  })

  // 역할 권한 업데이트
  const updateAuthoritiesMutation = useMutation({
    mutationFn: ({ roleId, authorityIds }: { roleId: number; authorityIds: number[] }) =>
      roleApi.updateAuthorities(roleId, { authorityIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('권한이 업데이트되었습니다')
      handleCloseAuthoritiesDialog()
    },
    onError: () => {
      toast.error('권한 업데이트에 실패했습니다')
    },
  })

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        name: role.name,
        description: role.description,
      })
    } else {
      setEditingRole(null)
      setFormData({
        name: '',
        description: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingRole(null)
    setFormData({
      name: '',
      description: '',
    })
  }

  const handleOpenAuthoritiesDialog = (role: Role) => {
    setManagingAuthorities(role)
    setSelectedAuthorityIds(role.authorityIds || [])
    setIsAuthoritiesDialogOpen(true)
  }

  const handleCloseAuthoritiesDialog = () => {
    setIsAuthoritiesDialogOpen(false)
    setManagingAuthorities(null)
    setSelectedAuthorityIds([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleAuthoritiesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (managingAuthorities) {
      updateAuthoritiesMutation.mutate({
        roleId: managingAuthorities.id,
        authorityIds: selectedAuthorityIds,
      })
    }
  }

  const handleDelete = (role: Role) => {
    if (confirm(`${role.name} 역할을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(role.id)
    }
  }

  const toggleAuthority = (authorityId: number) => {
    setSelectedAuthorityIds((prev) =>
      prev.includes(authorityId)
        ? prev.filter((id) => id !== authorityId)
        : [...prev, authorityId]
    )
  }

  // 카테고리별로 권한 그룹화
  const groupedAuthorities = authorities.reduce((acc, authority) => {
    const categoryName = authority.categoryName || '기타'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(authority)
    return acc
  }, {} as Record<string, Authority[]>)

  if (isLoading || isAuthoritiesLoading) {
    return (
      <div className="p-8">
        <div className="flex h-[500px] items-center justify-center">
          <div className="text-muted-foreground">역할 목록을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">역할 관리</h1>
            <p className="text-muted-foreground mt-2">
              사용자 역할을 조회하고 관리합니다.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            역할 추가
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          {roles.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="text-center text-muted-foreground">
                등록된 역할이 없습니다.
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm bg-muted/50">
                  <th className="p-4 font-medium">역할 이름</th>
                  <th className="p-4 font-medium">설명</th>
                  <th className="p-4 font-medium">권한 수</th>
                  <th className="p-4 font-medium text-right">작업</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr
                    key={role.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <code className="text-sm bg-muted px-2 py-1 rounded font-semibold">
                        {role.name}
                      </code>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {role.description}
                    </td>
                    <td className="p-4 text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAuthoritiesDialog(role)}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {role.authorityIds?.length || 0}개 권한
                      </Button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenDialog(role)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(role)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 역할 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? '역할 수정' : '역할 추가'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">역할 이름</Label>
                <Input
                  id="name"
                  placeholder="예: ROLE_MANAGER"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  placeholder="역할에 대한 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingRole ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 권한 관리 다이얼로그 */}
      <Dialog
        open={isAuthoritiesDialogOpen}
        onOpenChange={setIsAuthoritiesDialogOpen}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {managingAuthorities?.name} - 권한 관리
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAuthoritiesSubmit}>
            <div className="py-4">
              <div className="mb-4 text-sm text-muted-foreground">
                선택된 권한: {selectedAuthorityIds.length}개
              </div>

              <div className="space-y-6">
                {Object.entries(groupedAuthorities).map(
                  ([categoryName, auths]) => (
                    <div key={categoryName} className="space-y-2">
                      <h3 className="font-semibold text-sm border-b pb-2">
                        {categoryName}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {auths.map((authority) => (
                          <div
                            key={authority.id}
                            className="flex items-start space-x-2 p-2 rounded hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`auth-${authority.id}`}
                              checked={selectedAuthorityIds.includes(
                                authority.id
                              )}
                              onCheckedChange={() =>
                                toggleAuthority(authority.id)
                              }
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`auth-${authority.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {authority.name}
                              </label>
                              <p className="text-xs text-muted-foreground">
                                {authority.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseAuthoritiesDialog}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={updateAuthoritiesMutation.isPending}
              >
                저장
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
