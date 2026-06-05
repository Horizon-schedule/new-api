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
import { useEffect, useMemo, useRef, useState } from 'react'
import { VChart } from '@visactor/react-vchart'
import { PieChart as PieChartIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { ROLE } from '@/lib/roles'
import { useThemeRadiusPx } from '@/lib/theme-radius'
import type { TimeGranularity } from '@/lib/time'
import { VCHART_OPTION } from '@/lib/vchart'
import { cn } from '@/lib/utils'
import { useThemeCustomization } from '@/context/theme-customization-provider'
import { useTheme } from '@/context/theme-provider'
import {
  DEFAULT_TIME_GRANULARITY,
  OVERVIEW_CHART_BODY_HEIGHT,
} from '@/features/dashboard/constants'
import { processChartData, processUserChartData } from '@/features/dashboard/lib'
import type { QuotaDataItem } from '@/features/dashboard/types'

let themeManagerPromise: Promise<
  (typeof import('@visactor/vchart'))['ThemeManager']
> | null = null

export type OverviewChartTab = '1' | '2' | '3' | '4' | '5' | '6'

const OVERVIEW_CHART_TABS: Array<{
  value: OverviewChartTab
  labelKey: string
  adminOnly?: boolean
}> = [
  { value: '1', labelKey: 'Quota Distribution' },
  { value: '2', labelKey: 'Call Trend' },
  { value: '3', labelKey: 'Call Count Distribution' },
  { value: '4', labelKey: 'Call Count Ranking' },
  { value: '5', labelKey: 'User Consumption Ranking', adminOnly: true },
  { value: '6', labelKey: 'User Consumption Trend', adminOnly: true },
]

interface OverviewChartsPanelProps {
  data: QuotaDataItem[]
  userData?: QuotaDataItem[]
  loading?: boolean
  userDataLoading?: boolean
  timeGranularity?: TimeGranularity
  defaultTab?: OverviewChartTab
}

export function OverviewChartsPanel(props: OverviewChartsPanelProps) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const { customization } = useThemeCustomization()
  const userRole = useAuthStore((state) => state.auth.user?.role)
  const isAdmin = Boolean(userRole && userRole >= ROLE.ADMIN)
  const chartRadius = useThemeRadiusPx(
    '--radius-md',
    `${customization.preset}:${customization.radius}`
  )
  const timeGranularity = props.timeGranularity ?? DEFAULT_TIME_GRANULARITY
  const [activeTab, setActiveTab] = useState<OverviewChartTab>(
    props.defaultTab ?? '1'
  )
  const [themeReady, setThemeReady] = useState(false)
  const themeManagerRef = useRef<
    (typeof import('@visactor/vchart'))['ThemeManager'] | null
  >(null)

  const visibleTabs = useMemo(
    () => OVERVIEW_CHART_TABS.filter((tab) => !tab.adminOnly || isAdmin),
    [isAdmin]
  )

  useEffect(() => {
    if (props.defaultTab) setActiveTab(props.defaultTab)
  }, [props.defaultTab])

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.value === activeTab)) {
      setActiveTab(visibleTabs[0]?.value ?? '1')
    }
  }, [activeTab, visibleTabs])

  useEffect(() => {
    const updateTheme = async () => {
      setThemeReady(false)

      if (!themeManagerPromise) {
        themeManagerPromise = import('@visactor/vchart').then(
          (module) => module.ThemeManager
        )
      }

      const ThemeManager = await themeManagerPromise
      themeManagerRef.current = ThemeManager
      ThemeManager.setCurrentTheme(resolvedTheme === 'dark' ? 'dark' : 'light')
      setThemeReady(true)
    }

    updateTheme()
  }, [resolvedTheme])

  const chartPayload = useMemo(() => {
    const source = props.loading ? [] : props.data
    const userSource =
      props.userDataLoading ?? false ? [] : (props.userData ?? [])
    const modelCharts = processChartData(
      source,
      timeGranularity,
      t,
      customization.preset,
      chartRadius
    )
    const userCharts = processUserChartData(
      userSource,
      timeGranularity,
      t,
      10,
      customization.preset
    )

    const tab1Spec = {
      ...modelCharts.spec_line,
      title: {
        visible: true,
        text: t('Model Consumption Distribution'),
        subtext: `${t('Total:')} ${modelCharts.totalQuotaDisplay}`,
      },
    }

    return {
      '1': tab1Spec,
      '2': modelCharts.spec_model_line,
      '3': modelCharts.spec_pie,
      '4': modelCharts.spec_rank_bar,
      '5': userCharts.spec_user_rank,
      '6': userCharts.spec_user_trend,
    } as Record<OverviewChartTab, Record<string, unknown>>
  }, [
    chartRadius,
    customization.preset,
    props.data,
    props.loading,
    props.userData,
    props.userDataLoading,
    t,
    timeGranularity,
  ])

  const isUserTab = activeTab === '5' || activeTab === '6'
  const chartLoading =
    isUserTab && isAdmin
      ? props.userDataLoading ?? false
      : (props.loading ?? false)

  const spec = chartPayload[activeTab]
  const specType = typeof spec?.type === 'string' ? spec.type : activeTab
  const chartKey = [
    activeTab,
    specType,
    chartLoading ? 'loading' : 'ready',
    isUserTab ? (props.userData?.length ?? 0) : props.data.length,
    resolvedTheme,
    customization.preset,
  ].join('-')

  return (
    <div className='bg-card flex h-full min-h-[28rem] w-full flex-col overflow-hidden rounded-2xl border shadow-xs'>
      <div className='flex w-full shrink-0 flex-col gap-3 border-b px-4 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex min-w-0 items-center gap-2'>
          <PieChartIcon
            className='text-muted-foreground size-4 shrink-0'
            aria-hidden='true'
          />
          <div className='truncate text-sm font-semibold'>
            {t('Model Analytics')}
          </div>
        </div>

        <div className='bg-muted/60 inline-flex h-8 max-w-full overflow-x-auto rounded-lg border p-0.5'>
          {visibleTabs.map((tab) => (
            <button
              key={tab.value}
              type='button'
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'shrink-0 rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors',
                activeTab === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className={cn('min-h-0 flex-1 p-2', OVERVIEW_CHART_BODY_HEIGHT)}>
        {themeReady && spec ? (
          <VChart
            key={chartKey}
            spec={{
              ...spec,
              theme: resolvedTheme === 'dark' ? 'dark' : 'light',
              background: 'transparent',
            }}
            option={VCHART_OPTION}
          />
        ) : null}
      </div>
    </div>
  )
}
