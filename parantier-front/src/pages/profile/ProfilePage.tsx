import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { authStore } from '@/entities/user/model/authStore'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card } from '@/shared/ui/card'
import { User, Mail, Shield, Building2, Calendar, Edit, Eye, EyeOff } from 'lucide-react'
import { profileApi } from '@/api/profileApi'
import { toast } from 'sonner'

export function ProfilePage() {
  const authState = useStore(authStore, (state) => state)
  const user = authState.user

  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || '')
  const [isSaving, setIsSaving] = useState(false)

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // 비밀번호 보기/숨기기
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">
          로그인이 필요합니다.
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedUser = await profileApi.updateProfile(username)

      // authStore 업데이트
      authStore.setState((prev) => ({
        ...prev,
        user: updatedUser,
        isAuthenticated: true,
      }))

      toast.success('프로필이 업데이트되었습니다.')
      setIsEditing(false)
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('프로필 업데이트에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (newPassword.length < 4) {
      toast.error('비밀번호는 최소 4자 이상이어야 합니다.')
      return
    }

    setIsChangingPassword(true)
    try {
      await profileApi.changePassword(currentPassword, newPassword)
      toast.success('비밀번호가 변경되었습니다.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">프로필</h1>
        <p className="text-muted-foreground">사용자 정보 및 설정</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽 본문 영역 (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">구현 예정</p>
            </div>
          </Card>
        </div>

        {/* 오른쪽 사이드바 (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          {/* 기본 정보 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">기본 정보</h2>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  수정
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* 사용자명 */}
              <div className="flex items-start gap-4">
                <User className="w-5 h-5 mt-3 text-muted-foreground" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    사용자명
                  </label>
                  {isEditing ? (
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-base">{user.username}</p>
                  )}
                </div>
              </div>

              {/* 이메일 */}
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 mt-3 text-muted-foreground" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    이메일
                  </label>
                  <p className="mt-1 text-base">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    이메일은 변경할 수 없습니다 (로그인 ID)
                  </p>
                </div>
              </div>

              {/* 역할 */}
              <div className="flex items-start gap-4">
                <Shield className="w-5 h-5 mt-3 text-muted-foreground" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    역할
                  </label>
                  <p className="mt-1 text-base">{user.role}</p>
                </div>
              </div>

              {/* 조직 */}
              {user.organizationId && (
                <div className="flex items-start gap-4">
                  <Building2 className="w-5 h-5 mt-3 text-muted-foreground" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      조직 ID
                    </label>
                    <p className="mt-1 text-base">{user.organizationId}</p>
                  </div>
                </div>
              )}

              {/* 가입일 */}
              {user.createdAt && (
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 mt-3 text-muted-foreground" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      가입일
                    </label>
                    <p className="mt-1 text-base">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUsername(user.username || '')
                    setIsEditing(false)
                  }}
                  disabled={isSaving}
                >
                  취소
                </Button>
              </div>
            )}
          </Card>

          {/* 비밀번호 변경 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">비밀번호 변경</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">현재 비밀번호</label>
                <div className="relative mt-1">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">새 비밀번호</label>
                <div className="relative mt-1">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">새 비밀번호 확인</label>
                <div className="relative mt-1">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={
                  isChangingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {isChangingPassword ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
