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
import type { CSSProperties } from 'react'

export type UserAvatarStyle = Pick<CSSProperties, 'backgroundColor' | 'color'>

const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024
const AVATAR_OUTPUT_SIZE = 256

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getUserAvatarStyle(name: string): UserAvatarStyle {
  const hash = hashString(name)
  const hue = hash % 360
  const saturation = 54 + (hash % 8)
  const lightness = 52 + ((hash >> 4) % 8)

  return {
    backgroundColor: `hsl(${hue} ${saturation}% ${lightness}% / 0.82)`,
    color: 'white',
  }
}

export function getUserAvatarFallback(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

type AvatarSource = {
  avatar?: string
  setting?: string | Record<string, unknown>
}

export function resolveUserAvatar(source?: AvatarSource | null): string | undefined {
  if (!source) return undefined
  if (source.avatar?.trim()) return source.avatar.trim()

  if (typeof source.setting === 'string' && source.setting.trim()) {
    try {
      const parsed = JSON.parse(source.setting) as { avatar?: unknown }
      if (typeof parsed.avatar === 'string' && parsed.avatar.trim()) {
        return parsed.avatar.trim()
      }
    } catch {
      /* ignore invalid setting json */
    }
  } else if (
    source.setting &&
    typeof source.setting === 'object' &&
    typeof source.setting.avatar === 'string' &&
    source.setting.avatar.trim()
  ) {
    return source.setting.avatar.trim()
  }

  return undefined
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('invalid image'))
    }
    image.src = objectUrl
  })
}

/** Resize and compress a local image file into a JPEG data URL for avatar storage. */
export async function processAvatarFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('unsupported type')
  }
  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new Error('too large')
  }

  const image = await loadImageFromFile(file)
  const canvas = document.createElement('canvas')
  const size = AVATAR_OUTPUT_SIZE
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('canvas unavailable')
  }

  const scale = Math.max(size / image.width, size / image.height)
  const width = image.width * scale
  const height = image.height * scale
  const offsetX = (size - width) / 2
  const offsetY = (size - height) / 2

  context.drawImage(image, offsetX, offsetY, width, height)

  const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
  if (dataUrl.length > 480_000) {
    throw new Error('compressed too large')
  }
  return dataUrl
}
