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
import type { PrefillGroup } from '../types'

function parseEndpointItems(items: PrefillGroup['items']): Record<string, unknown> {
  if (typeof items === 'string') {
    try {
      return JSON.parse(items || '{}') as Record<string, unknown>
    } catch {
      return {}
    }
  }
  if (items && typeof items === 'object') {
    return items as Record<string, unknown>
  }
  return {}
}

export function mergeEndpointPrefill(
  current: string,
  groupItems: PrefillGroup['items']
): string {
  try {
    const base =
      current && current.trim() ? (JSON.parse(current) as Record<string, unknown>) : {}
    const merged = { ...base, ...parseEndpointItems(groupItems) }
    return JSON.stringify(merged, null, 2)
  } catch {
    return JSON.stringify(parseEndpointItems(groupItems), null, 2)
  }
}

export function mergeTagPrefill(
  currentTags: string[],
  groupItems: PrefillGroup['items']
): string[] {
  const additions = Array.isArray(groupItems)
    ? groupItems.map((item) => String(item).trim()).filter(Boolean)
    : String(groupItems || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
  return [...new Set([...currentTags, ...additions])]
}
