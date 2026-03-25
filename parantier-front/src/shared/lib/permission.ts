/**
 * 권한 체크 유틸리티
 */

import { authStore } from '@/entities/user/model/authStore'
import type { User } from '@/shared/types/auth'

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 */
export function hasAuthority(authority: string): boolean {
  const { user } = authStore.state
  if (!user) return false

  return user.authorities?.includes(authority) || false
}

/**
 * 사용자가 특정 권한들 중 하나라도 가지고 있는지 확인 (OR 조건)
 */
export function hasAnyAuthority(...authorities: string[]): boolean {
  const { user } = authStore.state
  if (!user) return false

  return authorities.some(authority => user.authorities?.includes(authority))
}

/**
 * 사용자가 모든 권한을 가지고 있는지 확인 (AND 조건)
 */
export function hasAllAuthorities(...authorities: string[]): boolean {
  const { user } = authStore.state
  if (!user) return false

  return authorities.every(authority => user.authorities?.includes(authority))
}

/**
 * 사용자가 특정 역할을 가지고 있는지 확인
 */
export function hasRole(role: string): boolean {
  const { user } = authStore.state
  if (!user) return false

  return user.roles?.includes(role) || false
}

/**
 * 사용자가 특정 역할들 중 하나라도 가지고 있는지 확인 (OR 조건)
 */
export function hasAnyRole(...roles: string[]): boolean {
  const { user } = authStore.state
  if (!user) return false

  return roles.some(role => user.roles?.includes(role))
}

/**
 * 권한 체크를 위한 유틸리티 객체
 */
export const Permission = {
  hasAuthority,
  hasAnyAuthority,
  hasAllAuthorities,
  hasRole,
  hasAnyRole,
}
