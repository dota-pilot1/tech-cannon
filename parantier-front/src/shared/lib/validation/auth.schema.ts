import { z } from 'zod'

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력하세요')
    .email('유효한 이메일 형식이 아닙니다'),

  username: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 최대 50자까지 입력 가능합니다'),

  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/[a-zA-Z]/, '비밀번호에 영문자가 포함되어야 합니다')
    .regex(/[0-9]/, '비밀번호에 숫자가 포함되어야 합니다')
    .regex(/[!@#$%^&*(),.?\":{}|<>]/, '비밀번호에 특수문자가 포함되어야 합니다'),

  passwordConfirm: z
    .string()
    .min(1, '비밀번호 확인을 입력하세요'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
})

export type SignupFormData = z.infer<typeof signupSchema>

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력하세요')
    .email('유효한 이메일 형식이 아닙니다'),

  password: z
    .string()
    .min(1, '비밀번호를 입력하세요'),
})

export type LoginFormData = z.infer<typeof loginSchema>
