import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { authApi } from '@/entities/user/api/authApi'
import { signupSchema, type SignupFormData } from '@/shared/lib/validation/auth.schema'

export function SignupDialog() {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'available' | 'duplicate'>('idle')

  const form = useForm({
    defaultValues: {
      email: '',
      username: '',
      password: '',
      passwordConfirm: '',
    },
    onSubmit: async ({ value }) => {
      // 제출 시 검증
      const result = signupSchema.safeParse(value)
      if (!result.success) {
        // 에러가 있으면 각 필드에 설정
        result.error.errors.forEach((err) => {
          const fieldName = err.path[0] as keyof SignupFormData
          form.setFieldMeta(fieldName, (prev) => ({
            ...prev,
            errorMap: { onSubmit: err.message },
          }))
        })
        return
      }
      try {
        // passwordConfirm은 API에 보내지 않음
        const { passwordConfirm, ...signupData } = value
        await authApi.signup(signupData)
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          form.reset()
          setSuccess(false)
          setEmailCheckStatus('idle')
        }, 2000)
      } catch (err: any) {
        form.setErrorMap({
          onSubmit: err.response?.data?.message || '회원가입에 실패했습니다.',
        })
      }
    },
  })

  const handleEmailCheck = async () => {
    const email = form.getFieldValue('email')
    if (!email) {
      return
    }

    setEmailCheckStatus('checking')
    try {
      const isDuplicate = await authApi.checkEmailDuplicate(email)
      setEmailCheckStatus(isDuplicate ? 'duplicate' : 'available')
    } catch (err) {
      setEmailCheckStatus('idle')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">회원가입</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>회원가입</DialogTitle>
          <DialogDescription>
            새로운 계정을 만들어 Palantier를 시작하세요.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <p className="text-lg font-semibold text-green-600">
              회원가입이 완료되었습니다!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              로그인하여 서비스를 이용하세요.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4 pt-4"
          >
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={field.state.value}
                        onChange={(e) => {
                          field.handleChange(e.target.value)
                          setEmailCheckStatus('idle')
                        }}
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEmailCheck}
                      disabled={emailCheckStatus === 'checking' || !field.state.value}
                      className="w-24"
                    >
                      {emailCheckStatus === 'checking' ? '확인 중...' : '중복 확인'}
                    </Button>
                  </div>
                  {field.state.meta.errors.length > 0 && field.state.meta.errorMap?.onSubmit ? (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      이메일 형식으로 입력해주세요
                    </p>
                  )}
                  {emailCheckStatus === 'available' && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      사용 가능한 이메일입니다
                    </p>
                  )}
                  {emailCheckStatus === 'duplicate' && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <X className="h-4 w-4" />
                      이미 사용 중인 이메일입니다
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="username">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="signup-username">사용자 이름</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="홍길동"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && field.state.meta.errorMap?.onSubmit ? (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      2자 이상 50자 이하로 입력해주세요
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && field.state.meta.errorMap?.onSubmit ? (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      8자 이상, 영문자, 숫자, 특수문자 포함
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="passwordConfirm">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="signup-password-confirm">비밀번호 확인</Label>
                  <div className="relative">
                    <Input
                      id="signup-password-confirm"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호 확인"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && field.state.meta.errorMap?.onSubmit ? (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      비밀번호를 다시 입력해주세요
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => state.errorMap.onSubmit}
            >
              {(error) =>
                error && (
                  <p className="text-sm text-destructive">{error}</p>
                )
              }
            </form.Subscribe>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || emailCheckStatus !== 'available'}
                  className="w-full"
                >
                  {isSubmitting ? '가입 중...' : '회원가입'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
