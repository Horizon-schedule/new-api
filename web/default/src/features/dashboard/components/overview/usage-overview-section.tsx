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
import { lazy, Suspense, useMemo } from 'react'
import { useStatus } from '@/hooks/use-status'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { DEFAULT_TIME_GRANULARITY } from '@/features/dashboard/constants'
import { processOverviewStats } from '@/features/dashboard/lib/overview-trends'
import { useOverviewStats } from '@/features/dashboard/hooks/use-overview-stats'
import { AnnouncementsPanel } from './announcements-panel'
import { ApiInfoPanel } from './api-info-panel'
import { FAQPanel } from './faq-panel'
import { OverviewStatsCards } from './overview-stats-cards'
import { UptimePanel } from './uptime-panel'

const LazyOverviewChartsPanel = lazy(() =>
  import('./overview-charts-panel').then((module) => ({
    default: module.OverviewChartsPanel,
  }))
)

function ChartFallback() {
  return (
    <div className='overflow-hidden rounded-2xl border shadow-xs'>
      <div className='flex items-center justify-between border-b px-4 py-3 sm:px-5'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-8 w-72' />
      </div>
      <div className='h-96 p-2'>
        <Skeleton className='h-full w-full' />
      </div>
    </div>
  )
}

export function UsageOverviewSection() {
  const { status } = useStatus()
  const { loading, stats, granularity, quotaData } = useOverviewStats()

  const apiInfoEnabled = status?.api_info_enabled ?? true
  const announcementsEnabled = status?.announcements_enabled ?? true
  const faqEnabled = status?.faq_enabled ?? true
  const uptimeEnabled = status?.uptime_kuma_enabled ?? true

  const emptyStats = useMemo(
    () => processOverviewStats([], granularity, 1),
    [granularity]
  )

  return (
    <div className='flex flex-col gap-4'>
      <OverviewStatsCards loading={loading} stats={loading ? emptyStats : stats} />

      <CardStaggerContainer
        className={`grid grid-cols-1 gap-4 ${apiInfoEnabled ? 'xl:grid-cols-4' : ''}`}
      >
        <CardStaggerItem className={apiInfoEnabled ? 'xl:col-span-3' : ''}>
          <Suspense fallback={<ChartFallback />}>
            <LazyOverviewChartsPanel
              data={quotaData}
              loading={loading}
              timeGranularity={granularity || DEFAULT_TIME_GRANULARITY}
              defaultTab='1'
            />
          </Suspense>
        </CardStaggerItem>

        {apiInfoEnabled && (
          <CardStaggerItem>
            <ApiInfoPanel />
          </CardStaggerItem>
        )}
      </CardStaggerContainer>

      {(announcementsEnabled || faqEnabled || uptimeEnabled) && (
        <CardStaggerContainer className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {announcementsEnabled && (
            <CardStaggerItem>
              <AnnouncementsPanel />
            </CardStaggerItem>
          )}
          {faqEnabled && (
            <CardStaggerItem>
              <FAQPanel />
            </CardStaggerItem>
          )}
          {uptimeEnabled && (
            <CardStaggerItem>
              <UptimePanel />
            </CardStaggerItem>
          )}
        </CardStaggerContainer>
      )}
    </div>
  )
}
