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
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteVendor, getVendors } from '../api'
import { modelsQueryKeys, vendorsQueryKeys } from '../lib'
import type { Vendor } from '../types'
import { useModels } from './models-provider'
import { VendorDirectorySelect } from './vendor-directory-select'

const route = getRouteApi('/_authenticated/models/$section')

type ModelsVendorDirectoryProps = {
  vendorCounts?: Record<string, number>
}

export function ModelsVendorDirectory({
  vendorCounts,
}: ModelsVendorDirectoryProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = route.useNavigate()
  const search = route.useSearch()
  const { selectedVendor, setSelectedVendor, setCurrentVendor, setOpen } =
    useModels()
  const [deleteVendorTarget, setDeleteVendorTarget] = useState<Vendor | null>(
    null
  )

  const { data: vendorsData } = useQuery({
    queryKey: vendorsQueryKeys.list(),
    queryFn: () => getVendors({ page_size: 1000 }),
  })

  const vendors = useMemo(
    () => vendorsData?.data?.items ?? [],
    [vendorsData?.data?.items]
  )

  const vendorFilter = search.vendor ?? []
  const activeVendorKey =
    vendorFilter.length > 0 && !vendorFilter.includes('all')
      ? vendorFilter[0]
      : selectedVendor && selectedVendor !== 'all'
        ? selectedVendor
        : 'all'

  const handleVendorChange = (vendorKey: string) => {
    setSelectedVendor(vendorKey === 'all' ? null : vendorKey)
    void navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        vendor: vendorKey === 'all' ? [] : [vendorKey],
      }),
    })
  }

  const handleDeleteVendor = async (vendor: Vendor) => {
    const response = await deleteVendor(vendor.id)
    if (response.success) {
      toast.success(t('Vendor deleted successfully'))
      if (activeVendorKey === String(vendor.id)) {
        handleVendorChange('all')
      }
      queryClient.invalidateQueries({ queryKey: vendorsQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: modelsQueryKeys.lists() })
    } else {
      toast.error(response.message || t('Failed to delete vendor'))
    }
  }

  return (
    <>
      <VendorDirectorySelect
        vendors={vendors}
        vendorCounts={vendorCounts}
        activeVendorKey={activeVendorKey}
        onVendorChange={handleVendorChange}
        onAddVendor={() => {
          setCurrentVendor(null)
          setOpen('create-vendor')
        }}
        onEditVendor={(vendor) => {
          setCurrentVendor(vendor)
          setOpen('update-vendor')
        }}
        onDeleteVendor={(vendor) => setDeleteVendorTarget(vendor)}
      />

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
    </>
  )
}
