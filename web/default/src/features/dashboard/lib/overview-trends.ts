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
import { formatChartTime, type TimeGranularity } from '@/lib/time'
import type { QuotaDataItem } from '@/features/dashboard/types'
import { calculateDashboardStats, safeDivide } from './stats'

const TIME_INTERVAL_MINUTES: Record<TimeGranularity, number> = {
  hour: 60,
  day: 1440,
  week: 10080,
}

export interface OverviewTrendSeries {
  times: number[]
  consumeQuota: number[]
  tokens: number[]
  rpm: number[]
  tpm: number[]
}

export interface OverviewStatsResult {
  consumeQuota: number
  consumeTokens: number
  times: number
  avgRPM: string
  avgTPM: string
  trends: OverviewTrendSeries
}

export function processOverviewStats(
  data: QuotaDataItem[],
  granularity: TimeGranularity,
  timeRangeMinutes: number
): OverviewStatsResult {
  const stats = calculateDashboardStats(data)
  const timeQuotaMap = new Map<string, number>()
  const timeTokensMap = new Map<string, number>()
  const timeCountMap = new Map<string, number>()

  for (const item of data) {
    const timeKey = formatChartTime(Number(item.created_at), granularity)
    timeQuotaMap.set(
      timeKey,
      (timeQuotaMap.get(timeKey) ?? 0) + (Number(item.quota) || 0)
    )
    timeTokensMap.set(
      timeKey,
      (timeTokensMap.get(timeKey) ?? 0) + (Number(item.token_used) || 0)
    )
    timeCountMap.set(
      timeKey,
      (timeCountMap.get(timeKey) ?? 0) + (Number(item.count) || 0)
    )
  }

  const timePoints = Array.from(
    new Set([
      ...timeQuotaMap.keys(),
      ...timeTokensMap.keys(),
      ...timeCountMap.keys(),
    ])
  ).sort()

  const interval = TIME_INTERVAL_MINUTES[granularity] ?? 60
  const consumeQuotaTrend = timePoints.map((time) => timeQuotaMap.get(time) ?? 0)
  const tokensTrend = timePoints.map((time) => timeTokensMap.get(time) ?? 0)
  const countTrend = timePoints.map((time) => timeCountMap.get(time) ?? 0)
  const rpmTrend = countTrend.map((count) => count / interval)
  const tpmTrend = tokensTrend.map((tokens) => tokens / interval)

  return {
    consumeQuota: stats.totalQuota,
    consumeTokens: stats.totalTokens,
    times: stats.totalCount,
    avgRPM: safeDivide(stats.totalCount, timeRangeMinutes, 3).toFixed(3),
    avgTPM: safeDivide(stats.totalTokens, timeRangeMinutes, 3).toFixed(3),
    trends: {
      times: countTrend,
      consumeQuota: consumeQuotaTrend,
      tokens: tokensTrend,
      rpm: rpmTrend,
      tpm: tpmTrend,
    },
  }
}

export function getOverviewTrendSpec(data: number[], color: string) {
  return {
    type: 'line' as const,
    data: [
      {
        id: 'trend',
        values: data.map((value, index) => ({ x: index, y: value })),
      },
    ],
    xField: 'x',
    yField: 'y',
    height: 40,
    width: 100,
    axes: [
      { orient: 'bottom' as const, visible: false },
      { orient: 'left' as const, visible: false },
    ],
    padding: 0,
    autoFit: false,
    legends: { visible: false },
    tooltip: { visible: false },
    crosshair: { visible: false },
    line: {
      style: {
        stroke: color,
        lineWidth: 2,
      },
    },
    point: { visible: false },
    background: { fill: 'transparent' },
  }
}
