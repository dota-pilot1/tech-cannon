import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { authActions } from '@/entities/user/model/authStore'
import { authApi } from '@/entities/user/api/authApi'
import { useQueryClient } from '@tanstack/react-query'
import { getRolesFromToken, getAuthoritiesFromToken } from '@/shared/lib/jwt'

export function LoginForm() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('terecal@daum.net')
  const [password, setPassword] = useState('password123!')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authApi.login({ email, password })

      // JWT에서 roles, authorities 배열 추출
      const roles = getRolesFromToken(response.accessToken)
      const authorities = getAuthoritiesFromToken(response.accessToken)

      authActions.login(response.accessToken, response.refreshToken, {
        email: response.email,
        username: response.username,
        role: response.role,
        roles,
        authorities,
      })

      // 로그인 성공 시 메뉴 쿼리 무효화 (권한에 따라 다른 메뉴를 보여주기 위함)
      queryClient.invalidateQueries({ queryKey: ['menus'] })

      setEmail('')
      setPassword('')
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="email" className="sr-only">
          이메일
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-48"
        />
      </div>

      <div className="relative flex items-center gap-2">
        <Label htmlFor="password" className="sr-only">
          비밀번호
        </Label>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-48 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? '로그인 중...' : '로그인'}
      </Button>

      {error && <span className="text-sm text-destructive">{error}</span>}
    </form>
  )
}
