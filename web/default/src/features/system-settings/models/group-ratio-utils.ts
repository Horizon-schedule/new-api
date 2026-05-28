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
import type { ComboboxInputOption } from '@/components/ui/combobox-input'
import { safeJsonParse } from '../utils/json-parser'

/** Group names defined in GroupRatio / UserUsableGroups — same union as the pricing table. */
export function parseGroupNamesFromRatioJson(groupRatio: string): string[] {
  return parseGroupNamesFromGroupSettings(groupRatio)
}

export function parseGroupNamesFromGroupSettings(
  groupRatio: string,
  userUsableGroups = ''
): string[] {
  const ratioMap = safeJsonParse<Record<string, unknown>>(groupRatio, {
    fallback: {},
    silent: true,
  })
  const usableMap = safeJsonParse<Record<string, unknown>>(userUsableGroups, {
    fallback: {},
    silent: true,
  })
  const names = new Set([...Object.keys(ratioMap), ...Object.keys(usableMap)])

  return Array.from(names)
    .filter((name) => name.trim().length > 0)
    .sort((a, b) => a.localeCompare(b))
}

export function toGroupComboboxOptions(
  groupNames: string[]
): ComboboxInputOption[] {
  return groupNames.map((name) => ({ value: name, label: name }))
}
