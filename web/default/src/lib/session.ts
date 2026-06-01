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

/** Default login session lifetime — must match backend SessionMaxAge (12 hours). */
export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000

const SESSION_EXPIRES_AT_KEY = 'user_session_expires_at'

export function markSessionActive(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    SESSION_EXPIRES_AT_KEY,
    String(Date.now() + SESSION_DURATION_MS)
  )
}

export function clearSessionExpiry(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_EXPIRES_AT_KEY)
}

export function getSessionExpiresAt(): number | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(SESSION_EXPIRES_AT_KEY)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export function isSessionExpired(): boolean {
  const expiresAt = getSessionExpiresAt()
  if (!expiresAt) return false
  return Date.now() >= expiresAt
}

let sessionVerified = false

export function markSessionVerified(): void {
  sessionVerified = true
}

export function resetSessionVerified(): void {
  sessionVerified = false
}

export function isSessionVerified(): boolean {
  return sessionVerified
}
