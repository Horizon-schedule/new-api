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
import { create } from 'zustand'
import {
  clearSessionExpiry,
  getSessionExpiresAt,
  isSessionExpired,
  markSessionActive,
} from '@/lib/session'

export type UserPermissions = {
  sidebar_settings?: boolean
  sidebar_modules?: Record<string, unknown>
}

export interface AuthUser {
  id: number
  username: string
  display_name?: string
  email?: string
  role: number
  status?: number
  group?: string
  quota?: number
  used_quota?: number
  request_count?: number
  aff_code?: string
  aff_count?: number
  aff_quota?: number
  aff_history_quota?: number
  inviter_id?: number
  github_id?: string
  oidc_id?: string
  wechat_id?: string
  telegram_id?: string
  linux_do_id?: string
  avatar?: string
  setting?: Record<string, unknown> | string
  stripe_customer?: string
  sidebar_modules?: string
  permissions?: UserPermissions
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    establishSession: (user: AuthUser) => void
    reset: () => void
  }
}

function readStoredUser(): AuthUser | null {
  try {
    if (typeof window === 'undefined') return null

    const saved = window.localStorage.getItem('user')
    if (!saved) return null

    if (!getSessionExpiresAt()) {
      markSessionActive()
    }

    if (isSessionExpired()) {
      window.localStorage.removeItem('user')
      clearSessionExpiry()
      return null
    }

    return JSON.parse(saved) as AuthUser
  } catch {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('user')
      clearSessionExpiry()
    }
    return null
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: readStoredUser(),
    setUser: (user) =>
      set((state) => {
        if (typeof window !== 'undefined') {
          if (user) {
            window.localStorage.setItem('user', JSON.stringify(user))
          } else {
            clearSessionExpiry()
            window.localStorage.removeItem('user')
          }
        }
        return { ...state, auth: { ...state.auth, user } }
      }),
    establishSession: (user) =>
      set((state) => {
        if (typeof window !== 'undefined') {
          markSessionActive()
          window.localStorage.setItem('user', JSON.stringify(user))
        }
        return { ...state, auth: { ...state.auth, user } }
      }),
    reset: () =>
      set((state) => {
        if (typeof window !== 'undefined') {
          clearSessionExpiry()
          window.localStorage.removeItem('user')
        }
        return {
          ...state,
          auth: { ...state.auth, user: null },
        }
      }),
  },
}))
