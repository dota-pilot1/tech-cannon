import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authorityApi } from '@/entities/authority/api/authorityApi'
import { categoryApi } from '@/entities/authority/api/categoryApi'
import type { Authority, CreateAuthorityRequest } from '@/types/authority'
import type { CreateCategoryRequest } from '@/types/category'
import { Button } from '@/shared/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

export function AuthoritiesPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingAuthority, setEditingAuthority] = useState<Authority | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateAuthorityRequest>({
    name: '',
    description: '',
    categoryId: 0,
  })
  const [categoryFormData, setCategoryFormData] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
  })

  const { data: authorities = [], isLoading } = useQuery({
    queryKey: ['authorities'],
    queryFn: () => authorityApi.getAll(),
  })

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await categoryApi.getAll()
      console.log('=== 카테고리 API 응답 데이터 ===')
      console.log('총 카테고리 개수:', data.length)
      console.log('카테고리 목록:', data)
      data.forEach((cat, index) => {
        console.log(`  [${index}] ID: ${cat.id}, Name: ${cat.name}, Description: ${cat.description}`)
      })
      console.log('================================')
      return data
    },
  })

  // 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAuthorityRequest) => authorityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorities'] })
      toast.success('권한이 생성되었습니다')
      handleCloseDialog()
    },
    onError: () => {
      toast.error('권한 생성에 실패했습니다')
    },
  })

  // 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: CreateAuthorityRequest
    }) => authorityApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorities'] })
      toast.success('권한이 수정되었습니다')
      handleCloseDialog()
    },
    onError: () => {
      toast.error('권한 수정에 실패했습니다')
    },
  })

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => authorityApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorities'] })
      toast.success('권한이 삭제되었습니다')
    },
    onError: () => {
      toast.error('권한 삭제에 실패했습니다')
    },
  })

  // 카테고리 생성 mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('카테고리가 생성되었습니다')
      handleCloseCategoryDialog()
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || '카테고리 생성에 실패했습니다'
      if (message.includes('already exists')) {
        toast.error('이미 존재하는 카테고리입니다', {
          description: '다른 이름을 사용해주세요.',
        })
      } else {
        toast.error('카테고리 생성에 실패했습니다', {
          description: message,
        })
      }
    },
  })

  const handleOpenDialog = (authority?: Authority, categoryId?: number) => {
    if (authority) {
      setEditingAuthority(authority)
      setSelectedCategoryId(null)
      setFormData({
        name: authority.name,
        description: authority.description,
        categoryId: authority.categoryId,
      })
    } else if (categoryId) {
      // 카테고리에 권한 추가
      setEditingAuthority(null)
      setSelectedCategoryId(categoryId)
      setFormData({
        name: '',
        description: '',
        categoryId: categoryId,
      })
    } else {
      // 새 권한 추가
      setEditingAuthority(null)
      setSelectedCategoryId(null)
      setFormData({
        name: '',
        description: '',
        categoryId: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingAuthority(null)
    setSelectedCategoryId(null)
    setFormData({
      name: '',
      description: '',
      categoryId: 0,
    })
  }

  const handleOpenCategoryDialog = () => {
    setCategoryFormData({
      name: '',
      description: '',
    })
    setIsCategoryDialogOpen(true)
  }

  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false)
    setCategoryFormData({
      name: '',
      description: '',
    })
  }

  const checkDuplicate = () => {
    if (!formData.name.trim()) {
      toast.error('권한 이름을 먼저 입력하세요')
      return
    }

    const isDuplicate = authorities.some(
      (auth) =>
        auth.name.toLowerCase() === formData.name.toLowerCase() &&
        auth.id !== editingAuthority?.id
    )

    if (isDuplicate) {
      toast.error('이미 존재하는 권한 이름입니다', {
        description: `"${formData.name}"는 이미 사용 중입니다.`,
      })
    } else {
      toast.success('사용 가능한 권한 이름입니다')
    }
  }

  const checkCategoryDuplicate = () => {
    if (!categoryFormData.name.trim()) {
      toast.error('카테고리 이름을 먼저 입력하세요')
      return
    }

    const isDuplicate = categories.some(
      (cat) => cat.name.toLowerCase() === categoryFormData.name.toLowerCase()
    )

    if (isDuplicate) {
      toast.error('이미 존재하는 카테고리입니다', {
        description: `"${categoryFormData.name}" 카테고리가 이미 존재합니다.`,
      })
    } else {
      toast.success('사용 가능한 카테고리 이름입니다')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAuthority) {
      updateMutation.mutate({ id: editingAuthority.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCategoryMutation.mutate(categoryFormData)
  }

  const handleDelete = (authority: Authority) => {
    if (confirm(`${authority.name} 권한을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(authority.id)
    }
  }

  if (isLoading || isCategoriesLoading) {
    return (
      <div className="p-8">
        <div className="flex h-[500px] items-center justify-center">
          <div className="text-muted-foreground">권한 목록을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  // 모든 카테고리를 먼저 생성하고, 권한을 할당
  const groupedByCategory = categories.reduce((acc, category) => {
    acc[category.name] = {
      categoryId: category.id,
      authorities: authorities.filter(auth => auth.categoryId === category.id)
    }
    return acc
  }, {} as Record<string, { categoryId: number; authorities: typeof authorities }>)

  return (
    <>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">권한 관리</h1>
            <p className="text-muted-foreground mt-2">
              시스템 권한을 조회하고 관리합니다.
            </p>
          </div>
          <Button onClick={handleOpenCategoryDialog}>
            <Plus className="w-4 h-4 mr-2" />
            카테고리 추가
          </Button>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedByCategory)
            .sort(([, a], [, b]) => {
              // createdAt 기준 내림차순 정렬 (최신 카테고리가 위로)
              const categoryA = categories.find(c => c.id === a.categoryId)
              const categoryB = categories.find(c => c.id === b.categoryId)
              if (!categoryA || !categoryB) return 0
              return new Date(categoryB.createdAt).getTime() - new Date(categoryA.createdAt).getTime()
            })
            .map(([categoryName, { categoryId, authorities: auths }]) => {
              return (
            <div key={categoryName} className="rounded-lg border bg-card">
              <div className="border-b p-4 bg-muted/50 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{categoryName}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {auths.length}개의 권한
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDialog(undefined, categoryId)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  권한 추가
                </Button>
              </div>
              <div className="p-4">
                {auths.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    이 카테고리에 등록된 권한이 없습니다.
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm">
                        <th className="pb-2 font-medium">권한 이름</th>
                        <th className="pb-2 font-medium">설명</th>
                        <th className="pb-2 font-medium text-right">ID</th>
                        <th className="pb-2 font-medium text-right">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auths.map((auth) => (
                          <tr
                            key={auth.id}
                            className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3">
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {auth.name}
                              </code>
                            </td>
                            <td className="py-3 text-sm text-muted-foreground">
                              {auth.description}
                            </td>
                            <td className="py-3 text-sm text-right text-muted-foreground">
                              #{auth.id}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenDialog(auth)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDelete(auth)}
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
              )
            })}
        </div>

        {authorities.length === 0 && (
          <div className="flex h-[400px] items-center justify-center rounded-lg border bg-card">
            <div className="text-center text-muted-foreground">
              등록된 권한이 없습니다.
            </div>
          </div>
        )}
      </div>

      {/* 권한 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAuthority ? '권한 수정' : '권한 추가'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: parseInt(value) })
                  }
                  disabled={selectedCategoryId !== null}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">권한 이름</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    placeholder="예: PROJECT:CREATE"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkDuplicate}
                  >
                    중복 체크
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  placeholder="권한에 대한 설명을 입력하세요"
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
                {editingAuthority ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 카테고리 추가 다이얼로그 */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 카테고리 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">카테고리 이름</Label>
                <div className="flex gap-2">
                  <Input
                    id="categoryName"
                    placeholder="예: PROJECT"
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, name: e.target.value })
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkCategoryDuplicate}
                  >
                    중복 체크
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryDescription">설명</Label>
                <Textarea
                  id="categoryDescription"
                  placeholder="카테고리에 대한 설명을 입력하세요"
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, description: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCategoryDialog}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={createCategoryMutation.isPending}
              >
                추가
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
