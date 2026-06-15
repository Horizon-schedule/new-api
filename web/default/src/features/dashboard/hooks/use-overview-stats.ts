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
import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { ROLE } from '@/lib/roles'
import { computeTimeRange, type TimeGranularity } from '@/lib/time'
import { getUserQuotaDates, getUserQuotaDataByUsers } from '@/features/dashboard/api'
import {
  DEFAULT_TIME_GRANULARITY,
  TIME_RANGE_BY_GRANULARITY,
} from '@/features/dashboard/constants'
import {
  buildDefaultOverviewFilters,
  getSavedChartPreferences,
  loadOverviewAnalyticsFilters,
  saveGranularity,
  saveOverviewAnalyticsFilters,
} from '@/features/dashboard/lib'
import { processOverviewStats } from '@/features/dashboard/lib/overview-trends'
import type { DashboardFilters } from '@/features/dashboard/types'

export function useOverviewStats() {
  const user = useAuthStore((state) => state.auth.user)
  const isAdmin = Boolean(user?.role && user.role >= ROLE.ADMIN)
  const chartPreferences = useMemo(() => getSavedChartPreferences(), [])
  const [filters, setFilters] = useState<DashboardFilters>(() =>
    loadOverviewAnalyticsFilters(chartPreferences)
  )

  const granularity =
    filters.time_granularity ??
    chartPreferences.defaultTimeGranularity ??
    DEFAULT_TIME_GRANULARITY

  const days =
    chartPreferences.defaultTimeRangeDays ??
    TIME_RANGE_BY_GRANULARITY[granularity] ??
    7

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

  const persistFilters = useCallback((next: DashboardFilters) => {
    setFilters(next)
    saveOverviewAnalyticsFilters(next)
  }, [])

  const updateTimeRange = useCallback(
    (range: { start?: Date; end?: Date }) => {
      setFilters((prev) => {
        const next = {
          ...prev,
          start_timestamp: range.start,
          end_timestamp: range.end,
        }
        saveOverviewAnalyticsFilters(next)
        return next
      })
    },
    []
  )

  const updateGranularity = useCallback((value: TimeGranularity) => {
    saveGranularity(value)
    setFilters((prev) => {
      const next = {
        ...prev,
        time_granularity: value,
      }
      saveOverviewAnalyticsFilters(next)
      return next
    })
  }, [])

  const resetFilters = useCallback(() => {
    const next = buildDefaultOverviewFilters(chartPreferences)
    persistFilters(next)
  }, [chartPreferences, persistFilters])

  const query = useQuery({
    queryKey: [
      'dashboard',
      'overview',
      'usage-stats',
      timeRange.start_timestamp,
      timeRange.end_timestamp,
      granularity,
      isAdmin,
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
    filters,
    updateTimeRange,
    updateGranularity,
    resetFilters,
  }
}
