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
import {
  Activity,
  Coins,
  Gauge,
  Hash,
  Layers,
  Send,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { VChart } from '@visactor/react-vchart'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { formatNumber, formatQuota } from '@/lib/format'
import { VCHART_OPTION } from '@/lib/vchart'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { OVERVIEW_STAT_GROUP_STYLES } from '@/features/dashboard/constants/overview-stats-styles'
import { getOverviewTrendSpec } from '@/features/dashboard/lib/overview-trends'
import type { OverviewStatsResult } from '@/features/dashboard/lib/overview-trends'

interface StatItem {
  title: string
  value: string | number
  icon: LucideIcon
  iconClass: string
  trendData?: number[]
  trendColor?: string
  showRecharge?: boolean
}

interface StatGroup {
  title: string
  titleIcon: LucideIcon
  cardClass: string
  items: StatItem[]
}

interface OverviewStatsCardsProps {
  loading: boolean
  stats: OverviewStatsResult
}

function StatRow(props: { item: StatItem; loading: boolean }) {
  const { t } = useTranslation()
  const Icon = props.item.icon
  const hasTrend =
    !props.loading &&
    props.item.trendData !== undefined &&
    props.item.trendData.length > 0

  return (
    <div className='flex items-center justify-between gap-3'>
      <div className='flex min-w-0 items-center gap-3'>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            props.item.iconClass
          )}
        >
          <Icon className='size-4' aria-hidden='true' />
        </span>
        <div className='min-w-0'>
          <div className='text-muted-foreground truncate text-xs'>
            {props.item.title}
          </div>
          {props.loading ? (
            <Skeleton className='mt-1.5 h-6 w-20' />
          ) : (
            <div className='mt-0.5 truncate text-lg font-semibold tabular-nums'>
              {props.item.value}
            </div>
          )}
        </div>
      </div>

      {props.item.showRecharge ? (
        <Button
          size='sm'
          variant='outline'
          className='h-8 shrink-0 rounded-full px-3'
          render={<Link to='/wallet' />}
        >
          {t('Recharge')}
        </Button>
      ) : hasTrend && props.item.trendColor ? (
        <div className='h-10 w-24 shrink-0'>
          <VChart
            spec={getOverviewTrendSpec(
              props.item.trendData ?? [],
              props.item.trendColor
            )}
            option={VCHART_OPTION}
          />
        </div>
      ) : null}
    </div>
  )
}

export function OverviewStatsCards(props: OverviewStatsCardsProps) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const { loading, stats } = props
  const styles = OVERVIEW_STAT_GROUP_STYLES

  const groups: StatGroup[] = [
    {
      title: t('Account Data'),
      titleIcon: Wallet,
      cardClass: styles[0].cardClass,
      items: [
        {
          title: t('Current Balance'),
          value: formatQuota(Number(user?.quota ?? 0)),
          icon: Coins,
          iconClass: styles[0].itemIconClasses[0],
          trendData: [],
          showRecharge: true,
        },
        {
          title: t('Used Quota'),
          value: formatQuota(Number(user?.used_quota ?? 0)),
          icon: TrendingUp,
          iconClass: styles[0].itemIconClasses[1],
          trendData: [],
        },
      ],
    },
    {
      title: t('Usage Statistics'),
      titleIcon: Activity,
      cardClass: styles[1].cardClass,
      items: [
        {
          title: t('Request Count'),
          value: formatNumber(Number(user?.request_count ?? 0)),
          icon: Send,
          iconClass: styles[1].itemIconClasses[0],
          trendData: [],
        },
        {
          title: t('Statistical count'),
          value: formatNumber(stats.times),
          icon: Hash,
          iconClass: styles[1].itemIconClasses[1],
          trendData: stats.trends.times,
          trendColor: styles[1].trendColors[1],
        },
      ],
    },
    {
      title: t('Resource Consumption'),
      titleIcon: Zap,
      cardClass: styles[2].cardClass,
      items: [
        {
          title: t('Total Quota'),
          value: formatQuota(stats.consumeQuota),
          icon: Coins,
          iconClass: styles[2].itemIconClasses[0],
          trendData: stats.trends.consumeQuota,
          trendColor: styles[2].trendColors[0],
        },
        {
          title: t('Total Tokens'),
          value: formatNumber(stats.consumeTokens),
          icon: Layers,
          iconClass: styles[2].itemIconClasses[1],
          trendData: stats.trends.tokens,
          trendColor: styles[2].trendColors[1],
        },
      ],
    },
    {
      title: t('Performance Metrics'),
      titleIcon: Gauge,
      cardClass: styles[3].cardClass,
      items: [
        {
          title: t('Average RPM'),
          value: stats.avgRPM,
          icon: Gauge,
          iconClass: styles[3].itemIconClasses[0],
          trendData: stats.trends.rpm,
          trendColor: styles[3].trendColors[0],
        },
        {
          title: t('Average TPM'),
          value: stats.avgTPM,
          icon: Zap,
          iconClass: styles[3].itemIconClasses[1],
          trendData: stats.trends.tpm,
          trendColor: styles[3].trendColors[1],
        },
      ],
    },
  ]

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {groups.map((group) => {
        const TitleIcon = group.titleIcon

        return (
          <Card
            key={group.title}
            className={cn('gap-0 border py-0 shadow-xs', group.cardClass)}
          >
            <CardHeader className='border-b border-black/5 px-4 py-3 dark:border-white/10'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                <TitleIcon className='size-4' aria-hidden='true' />
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 px-4 py-4'>
              {group.items.map((item) => (
                <StatRow key={item.title} item={item} loading={loading} />
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
