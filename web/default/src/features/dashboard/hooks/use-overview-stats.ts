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
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { ROLE } from '@/lib/roles'
import { computeTimeRange } from '@/lib/time'
import { getUserQuotaDates, getUserQuotaDataByUsers } from '@/features/dashboard/api'
import {
  DEFAULT_TIME_GRANULARITY,
  TIME_RANGE_BY_GRANULARITY,
} from '@/features/dashboard/constants'
import {
  buildDefaultDashboardFilters,
  getSavedChartPreferences,
} from '@/features/dashboard/lib'
import { processOverviewStats } from '@/features/dashboard/lib/overview-trends'

export function useOverviewStats() {
  const user = useAuthStore((state) => state.auth.user)
  const isAdmin = Boolean(user?.role && user.role >= ROLE.ADMIN)
  const chartPreferences = useMemo(() => getSavedChartPreferences(), [])
  const filters = useMemo(
    () => buildDefaultDashboardFilters(chartPreferences),
    [chartPreferences]
  )
  const granularity =
    filters.time_granularity ?? chartPreferences.defaultTimeGranularity ?? DEFAULT_TIME_GRANULARITY
  const days =
    chartPreferences.defaultTimeRangeDays ??
    TIME_RANGE_BY_GRANULARITY[granularity] ??
    1

  const timeRange = useMemo(
    () =>
      computeTimeRange(
        days,
        filters.start_timestamp,
        filters.end_timestamp
      ),
    [days, filters.end_timestamp, filters.start_timestamp]
  )

  const timeRangeMinutes = useMemo(
    () => (timeRange.end_timestamp - timeRange.start_timestamp) / 60,
    [timeRange.end_timestamp, timeRange.start_timestamp]
  )

  const query = useQuery({
    queryKey: [
      'dashboard',
      'overview',
      'usage-stats',
      timeRange.start_timestamp,
      timeRange.end_timestamp,
      granularity,
    ],
    queryFn: async () =>
      getUserQuotaDates(
        {
          start_timestamp: timeRange.start_timestamp,
          end_timestamp: timeRange.end_timestamp,
          default_time: granularity,
        },
        isAdmin
      ),
    staleTime: 60 * 1000,
  })

  const userQuery = useQuery({
    queryKey: [
      'dashboard',
      'overview',
      'user-quota',
      timeRange.start_timestamp,
      timeRange.end_timestamp,
    ],
    queryFn: () =>
      getUserQuotaDataByUsers({
        start_timestamp: timeRange.start_timestamp,
        end_timestamp: timeRange.end_timestamp,
      }),
    enabled: isAdmin,
    staleTime: 60 * 1000,
  })

  const stats = useMemo(
    () =>
      processOverviewStats(
        query.data?.data ?? [],
        granularity,
        timeRangeMinutes
      ),
    [granularity, query.data?.data, timeRangeMinutes]
  )

  return {
    loading: query.isLoading,
    userDataLoading: isAdmin ? userQuery.isLoading : false,
    stats,
    granularity,
    quotaData: query.data?.data ?? [],
    userQuotaData: isAdmin && userQuery.data?.success ? userQuery.data.data : [],
  }
}
