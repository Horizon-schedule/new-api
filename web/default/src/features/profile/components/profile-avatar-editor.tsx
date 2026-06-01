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
import { useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getUserAvatarFallback,
  getUserAvatarStyle,
  processAvatarFile,
  resolveUserAvatar,
} from '@/lib/avatar'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { updateUserAvatar } from '../api'
import { getDisplayName, getUserInitials, parseUserSettings } from '../lib'
import type { UserProfile } from '../types'

type ProfileAvatarEditorProps = {
  profile: UserProfile
  onUpdated?: () => void
  className?: string
}

export function ProfileAvatarEditor({
  profile,
  onUpdated,
  className,
}: ProfileAvatarEditorProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const setUser = useAuthStore((state) => state.auth.setUser)
  const currentUser = useAuthStore((state) => state.auth.user)

  const displayName = getDisplayName(profile)
  const avatarUrl =
    resolveUserAvatar(profile) ?? resolveUserAvatar(currentUser ?? undefined)
  const initials = getUserInitials(profile)
  const fallbackLetter = getUserAvatarFallback(displayName)
  const fallbackStyle = getUserAvatarStyle(displayName)

  const syncAuthAvatar = (avatar: string) => {
    if (!currentUser) return
    const settings = parseUserSettings(
      typeof currentUser.setting === 'string' ? currentUser.setting : undefined
    )
    const nextSetting = {
      ...settings,
      avatar: avatar || undefined,
    }
    setUser({
      ...currentUser,
      avatar: avatar || undefined,
      setting: JSON.stringify(nextSetting),
    })
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setUploading(true)
      const dataUrl = await processAvatarFile(file)
      const response = await updateUserAvatar(dataUrl)
      if (!response.success) {
        toast.error(response.message || t('Failed to update avatar'))
        return
      }
      syncAuthAvatar(dataUrl)
      toast.success(t('Avatar updated successfully'))
      onUpdated?.()
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'too large'
          ? t('Image must be smaller than 2MB')
          : error instanceof Error && error.message === 'unsupported type'
            ? t('Only JPEG, PNG, WebP and GIF are supported')
            : t('Failed to update avatar')
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true)
      const response = await updateUserAvatar('')
      if (!response.success) {
        toast.error(response.message || t('Failed to update avatar'))
        return
      }
      syncAuthAvatar('')
      toast.success(t('Avatar removed'))
      onUpdated?.()
    } catch {
      toast.error(t('Failed to update avatar'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('group/avatar relative shrink-0', className)}>
      <Avatar className='ring-background h-12 w-12 rounded-xl text-sm ring-2 sm:h-16 sm:w-16 sm:rounded-2xl sm:text-lg sm:ring-4'>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} className='object-cover' />
        ) : null}
        <AvatarFallback
          className='rounded-xl text-sm sm:rounded-2xl sm:text-lg'
          style={fallbackStyle}
        >
          {initials || fallbackLetter}
        </AvatarFallback>
      </Avatar>

      <button
        type='button'
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className='bg-background/90 text-foreground hover:bg-background absolute inset-0 flex items-center justify-center rounded-xl opacity-0 transition-opacity group-hover/avatar:opacity-100 sm:rounded-2xl'
        aria-label={t('Upload avatar')}
      >
        {uploading ? (
          <Loader2 className='size-5 animate-spin' />
        ) : (
          <Camera className='size-5' />
        )}
      </button>

      {avatarUrl ? (
        <Button
          type='button'
          variant='secondary'
          size='icon'
          className='absolute -right-1 -bottom-1 size-7 rounded-full opacity-0 shadow-sm transition-opacity group-hover/avatar:opacity-100'
          disabled={uploading}
          onClick={handleRemoveAvatar}
          aria-label={t('Remove avatar')}
        >
          <Trash2 className='size-3.5' />
        </Button>
      ) : null}

      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp,image/gif'
        className='hidden'
        onChange={handleFileChange}
      />
    </div>
  )
}
