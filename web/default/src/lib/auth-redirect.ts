/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import type { NavigateOptions } from '@tanstack/react-router'

export const DEFAULT_AUTH_REDIRECT = '/dashboard'

const BLOCKED_REDIRECT_PREFIXES = [
  '/sign-in',
  '/sign-up',
  '/otp',
  '/oauth',
  '/setup',
  '/404',
  '/403',
  '/500',
] as const

function isBlockedRedirectPath(pathname: string): boolean {
  return BLOCKED_REDIRECT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

/**
 * Normalize post-login redirect targets to an in-app path.
 * Handles full URLs saved in ?redirect= after session expiry / 401 recovery.
 */
export function normalizeAuthRedirectPath(
  target?: string | null,
  fallback: string = DEFAULT_AUTH_REDIRECT
): string {
  if (!target || typeof target !== 'string') return fallback

  const trimmed = target.trim()
  if (!trimmed) return fallback

  let path = trimmed

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed)
      if (
        typeof window !== 'undefined' &&
        url.origin !== window.location.origin
      ) {
        return fallback
      }
      path = `${url.pathname}${url.search}${url.hash}`
    } else if (trimmed.startsWith('//')) {
      return fallback
    }
  } catch {
    return fallback
  }

  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  const pathname = path.split(/[?#]/)[0] ?? path
  if (isBlockedRedirectPath(pathname)) {
    return fallback
  }

  return path
}

type RouterLocationLike = {
  pathname: string
  search?: unknown
  searchStr?: string
  hash?: string
  href?: string
}

/** Build a safe ?redirect= value from a TanStack Router location. */
export function getAuthRedirectFromLocation(
  location: RouterLocationLike,
  fallback: string = DEFAULT_AUTH_REDIRECT
): string {
  const search =
    location.searchStr ??
    (typeof location.search === 'string' ? location.search : '')
  const hash = location.hash ?? ''
  const raw = `${location.pathname}${search}${hash}`
  return normalizeAuthRedirectPath(raw, fallback)
}

/** Build a safe ?redirect= value from the current browser location. */
export function getAuthRedirectFromWindow(
  fallback: string = DEFAULT_AUTH_REDIRECT
): string {
  if (typeof window === 'undefined') return fallback
  return normalizeAuthRedirectPath(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
    fallback
  )
}

type NavigateFn = (options: NavigateOptions) => void

/** Navigate after login; fall back to hard replace if SPA routing misses. */
export function navigateToAuthRedirect(
  navigate: NavigateFn,
  target?: string | null,
  fallback: string = DEFAULT_AUTH_REDIRECT
): void {
  const normalized = normalizeAuthRedirectPath(target, fallback)
  navigate({ to: normalized as never, replace: true })

  if (typeof window === 'undefined') return

  window.setTimeout(() => {
    const current =
      window.location.pathname + window.location.search + window.location.hash
    if (current === normalized || current === `${normalized}/`) return
    window.location.replace(normalized)
  }, 100)
}
