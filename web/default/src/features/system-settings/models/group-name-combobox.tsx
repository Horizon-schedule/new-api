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
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ComboboxInput,
  type ComboboxInputOption,
} from '@/components/ui/combobox-input'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toGroupComboboxOptions } from './group-ratio-utils'

type GroupNameComboboxProps = {
  groupNames: string[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  allowCustomValue?: boolean
  disabled?: boolean
}

export function GroupNameCombobox({
  groupNames,
  value,
  onValueChange,
  placeholder,
  className,
  id,
  allowCustomValue = true,
  disabled = false,
}: GroupNameComboboxProps) {
  const { t } = useTranslation()
  const options = useMemo<ComboboxInputOption[]>(
    () => toGroupComboboxOptions(groupNames),
    [groupNames]
  )

  if (disabled) {
    return (
      <Input
        id={id}
        value={value}
        disabled
        className={cn(className)}
        readOnly
      />
    )
  }

  return (
    <ComboboxInput
      id={id}
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder ?? t('Select group')}
      emptyText={t('No groups yet. Add groups in Group management first.')}
      className={cn(className)}
      allowCustomValue={allowCustomValue}
    />
  )
}
