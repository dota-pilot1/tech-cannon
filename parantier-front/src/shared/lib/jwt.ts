/**
 * JWT 토큰 디코딩 유틸리티
 */

interface JwtPayload {
  sub: string // email
  role: string
  roles: string[]       // 접근 가능한 역할 배열
  authorities: string[] // 실제 권한 배열
  type: string
  iat: number
  exp: number
}

/**
 * JWT 토큰을 디코딩하여 페이로드 반환
 */
export function decodeJwt(token: string): JwtPayload {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    throw new Error('Invalid JWT token')
  }
}

/**
 * JWT 토큰에서 roles 배열 추출
 */
export function getRolesFromToken(token: string): string[] {
  const payload = decodeJwt(token)
  return payload.roles || []
}

/**
 * JWT 토큰에서 role 추출
 */
export function getRoleFromToken(token: string): string {
  const payload = decodeJwt(token)
  return payload.role
}

/**
 * JWT 토큰에서 email 추출
 */
export function getEmailFromToken(token: string): string {
  const payload = decodeJwt(token)
  return payload.sub
}

/**
 * JWT 토큰에서 authorities 배열 추출
 */
export function getAuthoritiesFromToken(token: string): string[] {
  const payload = decodeJwt(token)
  return payload.authorities || []
}
