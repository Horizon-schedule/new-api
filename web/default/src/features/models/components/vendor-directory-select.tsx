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
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Vendor } from '../types'

export type VendorDirectorySelectProps = {
  vendors: Vendor[]
  activeVendorKey: string
  onVendorChange: (vendorKey: string) => void
  vendorCounts?: Record<string, number>
  onAddVendor?: () => void
  onEditVendor?: (vendor: Vendor) => void
  onDeleteVendor?: (vendor: Vendor) => void
  className?: string
  triggerClassName?: string
}

export function VendorDirectorySelect({
  vendors,
  activeVendorKey,
  onVendorChange,
  vendorCounts,
  onAddVendor,
  onEditVendor,
  onDeleteVendor,
  className,
  triggerClassName,
}: VendorDirectorySelectProps) {
  const { t } = useTranslation()
  const showManagement = Boolean(onAddVendor || onEditVendor || onDeleteVendor)

  const activeVendor =
    activeVendorKey === 'all'
      ? null
      : vendors.find((vendor) => String(vendor.id) === activeVendorKey)

  const formatCount = (key: string) => {
    const count = vendorCounts?.[key] ?? vendorCounts?.[Number(key)]
    return typeof count === 'number' ? ` (${count})` : ''
  }

  return (
    <div className={cn('flex shrink-0 items-center gap-2', className)}>
      <Select value={activeVendorKey} onValueChange={onVendorChange}>
        <SelectTrigger
          size='sm'
          className={cn('w-[min(100%,220px)] sm:w-[240px]', triggerClassName)}
        >
          <SelectValue placeholder={t('Vendor directory')}>
            <span className='flex min-w-0 items-center gap-2'>
              {activeVendorKey === 'all' ? (
                <span className='truncate'>{t('All Vendors')}</span>
              ) : (
                <>
                  {activeVendor
                    ? getLobeIcon(activeVendor.icon || 'Layers', 14)
                    : null}
                  <span className='truncate'>
                    {activeVendor?.name ?? activeVendorKey}
                  </span>
                </>
              )}
              {vendorCounts != null ? (
                <Badge variant='secondary' className='shrink-0'>
                  {activeVendorKey === 'all'
                    ? (vendorCounts.all ?? vendorCounts['all'] ?? '')
                    : (vendorCounts[activeVendorKey] ?? '')}
                </Badge>
              ) : null}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align='start' className='max-h-72'>
          <SelectItem value='all'>
            {t('All Vendors')}
            {formatCount('all')}
          </SelectItem>
          {vendors.map((vendor) => {
            const key = String(vendor.id)
            return (
              <SelectItem key={key} value={key}>
                <span className='flex items-center gap-2'>
                  {getLobeIcon(vendor.icon || 'Layers', 14)}
                  <span>{vendor.name}</span>
                  {formatCount(key)}
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {showManagement && onAddVendor ? (
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='shrink-0'
          onClick={onAddVendor}
        >
          <Plus className='size-4' />
          {t('Add Vendor')}
        </Button>
      ) : null}

      {showManagement && activeVendor && onEditVendor && onDeleteVendor ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='shrink-0 gap-1'
              />
            }
          >
            {t('Operations')}
            <ChevronDown className='size-3.5 opacity-60' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEditVendor(activeVendor)}>
              <Pencil className='size-4' />
              {t('Edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              onClick={() => onDeleteVendor(activeVendor)}
            >
              <Trash2 className='size-4' />
              {t('Delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
