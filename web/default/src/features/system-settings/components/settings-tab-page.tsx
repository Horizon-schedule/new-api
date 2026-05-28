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
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'
import {
  SETTINGS_DEFAULT_TAB,
  type SettingsTabId,
} from '../settings-tabs.config'
import { renderSettingsTabContent } from '../tab-content-registry'
import { useSettingsOptionsQuery } from './settings-options-provider'

export function SettingsTabPage() {
  const { t } = useTranslation()
  const { data, isPending, isError, refetch } = useSettingsOptionsQuery()
  const { status } = useStatus()
  const params = useParams({ strict: false })
  const tabId = (params.tab ?? SETTINGS_DEFAULT_TAB) as SettingsTabId

  const content = renderSettingsTabContent(tabId, data?.data, {
    version: status?.version as string | undefined,
    startTime: status?.start_time as number | null | undefined,
  })

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      {isPending && !data ? (
        <div className='text-muted-foreground mb-3 shrink-0 text-xs'>
          {t('Loading settings...')}
        </div>
      ) : null}
      {isError ? (
        <Alert variant='destructive' className='mb-3 shrink-0'>
          <AlertDescription className='flex flex-wrap items-center justify-between gap-2'>
            <span>{t('Failed to load settings. Showing defaults.')}</span>
            <Button type='button' size='sm' variant='outline' onClick={() => refetch()}>
              {t('Retry')}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <div className='relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain scroll-smooth pb-12'>
        <div key={tabId} className='space-y-4'>
          {content}
        </div>
      </div>
    </div>
  )
}
