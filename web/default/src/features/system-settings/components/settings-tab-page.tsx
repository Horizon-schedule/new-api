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
import { useStatus } from '@/hooks/use-status'
import { useSystemOptions } from '../hooks/use-system-options'
import {
  SETTINGS_DEFAULT_TAB,
  type SettingsTabId,
} from '../settings-tabs.config'
import { renderSettingsTabContent } from '../tab-content-registry'

export function SettingsTabPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useSystemOptions()
  const { status } = useStatus()
  const params = useParams({
    from: '/_authenticated/system-settings/$tab',
  })
  const tabId = (params.tab ?? SETTINGS_DEFAULT_TAB) as SettingsTabId

  if (isLoading) {
    return (
      <div className='text-muted-foreground flex min-h-[240px] items-center justify-center'>
        {t('Loading settings...')}
      </div>
    )
  }

  const content = renderSettingsTabContent(tabId, data?.data, {
    version: status?.version as string | undefined,
    startTime: status?.start_time as number | null | undefined,
  })

  return (
    <div className='faded-bottom min-h-0 overflow-y-auto scroll-smooth pb-12'>
      <div key={tabId} className='space-y-4'>
        {content}
      </div>
    </div>
  )
}
