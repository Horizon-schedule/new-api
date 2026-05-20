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
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteVendor } from '../api'
import { modelsQueryKeys, vendorsQueryKeys } from '../lib'
import type { Vendor } from '../types'
import { useModels } from './models-provider'

type ModelsVendorTabsProps = {
  vendors: Vendor[]
  vendorCounts?: Record<string, number>
  activeVendorKey: string
  onVendorChange: (vendorKey: string) => void
}

export function ModelsVendorTabs({
  vendors,
  vendorCounts,
  activeVendorKey,
  onVendorChange,
}: ModelsVendorTabsProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { setOpen, setCurrentVendor } = useModels()
  const [deleteVendorTarget, setDeleteVendorTarget] = useState<Vendor | null>(
    null
  )

  const handleAddVendor = () => {
    setCurrentVendor(null)
    setOpen('create-vendor')
  }

  const handleEditVendor = (vendor: Vendor) => {
    setCurrentVendor(vendor)
    setOpen('update-vendor')
  }

  const handleDeleteVendor = async (vendor: Vendor) => {
    const response = await deleteVendor(vendor.id)
    if (response.success) {
      toast.success(t('Vendor deleted successfully'))
      if (activeVendorKey === String(vendor.id)) {
        onVendorChange('all')
      }
      queryClient.invalidateQueries({ queryKey: vendorsQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: modelsQueryKeys.lists() })
    } else {
      toast.error(response.message || t('Failed to delete vendor'))
    }
  }

  return (
    <div className='flex shrink-0 items-center gap-2'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='shrink-0'
        onClick={handleAddVendor}
      >
        <Plus className='size-4' />
        {t('Add Vendor')}
      </Button>

      <ScrollArea className='min-w-0 flex-1'>
        <div className='flex items-center gap-2 pb-1'>
          <VendorTabPill
            active={activeVendorKey === 'all'}
            label={t('All')}
            count={vendorCounts?.all ?? vendorCounts?.['all']}
            onClick={() => onVendorChange('all')}
          />

          {vendors.map((vendor) => {
            const key = String(vendor.id)
            return (
              <VendorTabPill
                key={key}
                active={activeVendorKey === key}
                label={vendor.name}
                icon={getLobeIcon(vendor.icon || 'Layers', 14)}
                count={vendorCounts?.[key] ?? vendorCounts?.[vendor.id]}
                onClick={() => onVendorChange(key)}
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='text-muted-foreground h-6 px-2 text-xs'
                          onClick={(event) => event.stopPropagation()}
                        />
                      }
                    >
                      {t('Operations')}
                      <MoreHorizontal className='size-3.5' />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() => handleEditVendor(vendor)}
                      >
                        <Pencil className='size-4' />
                        {t('Edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant='destructive'
                        onClick={() => setDeleteVendorTarget(vendor)}
                      >
                        <Trash2 className='size-4' />
                        {t('Delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              />
            )
          })}
        </div>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>

      <ConfirmDialog
        open={!!deleteVendorTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteVendorTarget(null)
        }}
        title={t('Delete Vendor?')}
        desc={
          deleteVendorTarget
            ? t(
                'Are you sure you want to delete vendor "{{name}}"? This cannot be undone.',
                { name: deleteVendorTarget.name }
              )
            : ''
        }
        destructive
        confirmText={t('Delete')}
        handleConfirm={() => {
          if (deleteVendorTarget) {
            void handleDeleteVendor(deleteVendorTarget)
            setDeleteVendorTarget(null)
          }
        }}
      />
    </div>
  )
}

type VendorTabPillProps = {
  active: boolean
  label: string
  count?: number
  icon?: React.ReactNode
  onClick: () => void
  actions?: React.ReactNode
}

function VendorTabPill({
  active,
  label,
  count,
  icon,
  onClick,
  actions,
}: VendorTabPillProps) {
  return (
    <div
      className={cn(
        'bg-background ring-border/60 flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-1 pl-3 text-sm shadow-sm ring-1 transition-colors',
        active && 'ring-primary/40 bg-primary/5'
      )}
    >
      <button
        type='button'
        className='flex items-center gap-2 font-medium'
        onClick={onClick}
      >
        {icon}
        <span>{label}</span>
        {typeof count === 'number' ? (
          <Badge
            variant={active ? 'default' : 'secondary'}
            className='h-5 min-w-5 rounded-full px-1.5 text-xs'
          >
            {count}
          </Badge>
        ) : null}
      </button>
      {actions}
    </div>
  )
}
