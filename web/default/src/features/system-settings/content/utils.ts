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
export function formatJsonForEditor(value: string, fallback = '[]') {
  const target = value && value.trim() ? value : fallback
  try {
    const parsed = JSON.parse(target)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return target
  }
}

export function normalizeJsonString(value: string, fallback = '[]') {
  const target = value && value.trim() ? value : fallback
  try {
    const parsed = JSON.parse(target)
    return JSON.stringify(parsed)
  } catch {
    return target.trim()
  }
}

type UpdateOptionClient = {
  mutateAsync: (request: {
    key: string
    value: string | number | boolean
  }) => Promise<{ success: boolean; message?: string }>
}

export class ConsoleSettingPersistError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConsoleSettingPersistError'
  }
}

export async function persistConsoleJsonList<T>(
  updateOption: UpdateOptionClient,
  optionKey: string,
  list: T[]
) {
  const result = await updateOption.mutateAsync({
    key: optionKey,
    value: JSON.stringify(list),
  })

  if (!result.success) {
    throw new ConsoleSettingPersistError(
      result.message || 'Failed to save setting'
    )
  }
}

type AnnouncementRecord = {
  id?: number
  content: string
  publishDate: string
  type: 'default' | 'ongoing' | 'success' | 'warning' | 'error'
  extra?: string
}

function toRFC3339Date(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new ConsoleSettingPersistError('Invalid publish date')
  }
  return parsed.toISOString()
}

export function normalizeAnnouncementList(
  list: AnnouncementRecord[]
): AnnouncementRecord[] {
  return list.map((item, index) => {
    const normalized: AnnouncementRecord = {
      id: item.id ?? index + 1,
      content: item.content.trim(),
      publishDate: toRFC3339Date(item.publishDate),
      type: item.type,
    }
    const extra = item.extra?.trim()
    if (extra) {
      normalized.extra = extra
    }
    return normalized
  })
}

export function isEmptyJsonList(value: string | undefined): boolean {
  if (!value?.trim()) return true
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) && parsed.length === 0
  } catch {
    return true
  }
}

export function parseAnnouncementList(data: string): AnnouncementRecord[] {
  try {
    const parsed = JSON.parse(data || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.map((item, idx) => ({
      ...item,
      id: item.id || idx + 1,
    }))
  } catch {
    return []
  }
}

export function shouldSyncConsoleListFromServer<T>(
  serverList: T[],
  localList: T[],
  isSaving: boolean
): boolean {
  if (isSaving) return false
  if (JSON.stringify(serverList) === JSON.stringify(localList)) return false
  // Avoid wiping unsaved local entries with stale empty server responses.
  if (serverList.length === 0 && localList.length > 0) return false
  return true
}
