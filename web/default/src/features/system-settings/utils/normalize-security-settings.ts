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
import type { SecuritySettings } from '../types'

export const coerceBool = (value: unknown): boolean =>
  value === true || value === 'true' || value === 1 || value === '1'

export const coerceStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean)
      }
    } catch {
      // fall through to line/comma split
    }
    return trimmed
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export const coercePortList = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => Number.parseInt(String(item).trim(), 10))
      .filter((port) => Number.isFinite(port))
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => Number.parseInt(String(item).trim(), 10))
          .filter((port) => Number.isFinite(port))
      }
    } catch {
      // fall through
    }
    return trimmed
      .split(',')
      .map((item) => Number.parseInt(item.trim(), 10))
      .filter((port) => Number.isFinite(port))
  }
  return []
}

/** Coerce legacy/malformed option values before SSRF and rate-limit sections render. */
export function normalizeSecuritySettings(
  settings: SecuritySettings
): SecuritySettings {
  return {
    ...settings,
    'fetch_setting.domain_filter_mode': coerceBool(
      settings['fetch_setting.domain_filter_mode']
    ),
    'fetch_setting.ip_filter_mode': coerceBool(
      settings['fetch_setting.ip_filter_mode']
    ),
    'fetch_setting.domain_list': coerceStringList(
      settings['fetch_setting.domain_list']
    ),
    'fetch_setting.ip_list': coerceStringList(settings['fetch_setting.ip_list']),
    'fetch_setting.allowed_ports': coercePortList(
      settings['fetch_setting.allowed_ports']
    ),
  }
}
