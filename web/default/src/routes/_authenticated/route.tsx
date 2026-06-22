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
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { getAuthRedirectFromLocation } from '@/lib/auth-redirect'
import { getSelf } from '@/lib/api'
import {
  isSessionExpired,
  isSessionVerified,
  markSessionVerified,
  resetSessionVerified,
} from '@/lib/session'
import { AuthenticatedLayout } from '@/components/layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()

    if (isSessionExpired()) {
      resetSessionVerified()
      auth.reset()
      throw redirect({
        to: '/sign-in',
        search: { redirect: getAuthRedirectFromLocation(location) },
      })
    }

    if (!auth.user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: getAuthRedirectFromLocation(location) },
      })
    }

    if (!isSessionVerified()) {
      const res = await Promise.race([
        getSelf(),
        new Promise<null>((resolve) => {
          window.setTimeout(() => resolve(null), 8_000)
        }),
      ]).catch(() => null)
      if (res?.success && res.data) {
        auth.setUser(res.data)
        markSessionVerified()
      } else {
        resetSessionVerified()
        auth.reset()
        throw redirect({
          to: '/sign-in',
          search: { redirect: getAuthRedirectFromLocation(location) },
        })
      }
    }
  },
  component: AuthenticatedLayout,
})
