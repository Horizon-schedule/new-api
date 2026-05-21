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
import type { AuthSettings } from '../types'

const USER_VERIFICATION = ['required', 'preferred', 'discouraged'] as const
const ATTACHMENT = ['none', 'platform', 'cross-platform'] as const

export type PasskeyUserVerification = (typeof USER_VERIFICATION)[number]
export type PasskeyAttachment = (typeof ATTACHMENT)[number]

export function normalizePasskeyOrigins(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(',')
  }
  return String(value)
}

export function normalizePasskeyUserVerification(
  value: unknown
): PasskeyUserVerification {
  if (
    typeof value === 'string' &&
    USER_VERIFICATION.includes(value as PasskeyUserVerification)
  ) {
    return value as PasskeyUserVerification
  }
  return 'preferred'
}

export function normalizePasskeyAttachment(value: unknown): PasskeyAttachment {
  if (value === '' || value == null) return 'none'
  if (
    typeof value === 'string' &&
    ATTACHMENT.includes(value as PasskeyAttachment)
  ) {
    return value as PasskeyAttachment
  }
  if (value === 'platform' || value === 'cross-platform') {
    return value
  }
  return 'none'
}

export function getPasskeyFormDefaults(settings: AuthSettings) {
  const origins = normalizePasskeyOrigins(settings['passkey.origins'])
  const attachment = normalizePasskeyAttachment(
    settings['passkey.attachment_preference']
  )

  return {
    'passkey.enabled': Boolean(settings['passkey.enabled']),
    'passkey.rp_display_name': String(settings['passkey.rp_display_name'] ?? ''),
    'passkey.rp_id': String(settings['passkey.rp_id'] ?? ''),
    'passkey.origins': origins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .join('\n'),
    'passkey.allow_insecure_origin': Boolean(
      settings['passkey.allow_insecure_origin']
    ),
    'passkey.user_verification': normalizePasskeyUserVerification(
      settings['passkey.user_verification']
    ),
    'passkey.attachment_preference': attachment,
  }
}
