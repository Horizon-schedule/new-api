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
import type { QueryClient } from '@tanstack/react-query'

const CONSOLE_LIST_STATUS_KEYS: Record<string, string> = {
  'console_setting.announcements': 'announcements',
  'console_setting.faq': 'faq',
  'console_setting.api_info': 'api_info',
}

const CONSOLE_ENABLED_STATUS_KEYS: Record<string, string> = {
  'console_setting.announcements_enabled': 'announcements_enabled',
  'console_setting.faq_enabled': 'faq_enabled',
  'console_setting.api_info_enabled': 'api_info_enabled',
  'console_setting.uptime_kuma_enabled': 'uptime_kuma_enabled',
}

function parseJsonList(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function patchStatusLocalStorage(patch: Record<string, unknown>) {
  try {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('status')
    if (!saved) return
    const current = JSON.parse(saved) as Record<string, unknown>
    window.localStorage.setItem(
      'status',
      JSON.stringify({ ...current, ...patch })
    )
  } catch {
    /* empty */
  }
}

export function patchStatusCacheForConsoleSetting(
  queryClient: QueryClient,
  key: string,
  value: string | number | boolean
) {
  const listStatusKey = CONSOLE_LIST_STATUS_KEYS[key]
  const enabledStatusKey = CONSOLE_ENABLED_STATUS_KEYS[key]
  if (!listStatusKey && !enabledStatusKey) return

  const patch: Record<string, unknown> = {}
  if (listStatusKey && typeof value === 'string') {
    patch[listStatusKey] = parseJsonList(value)
  }
  if (enabledStatusKey) {
    patch[enabledStatusKey] =
      typeof value === 'boolean' ? value : value === 'true' || value === '1'
  }
  if (Object.keys(patch).length === 0) return

  queryClient.setQueryData(['status'], (old: Record<string, unknown> | null) => {
    if (!old) return old
    return { ...old, ...patch }
  })
  patchStatusLocalStorage(patch)
}
