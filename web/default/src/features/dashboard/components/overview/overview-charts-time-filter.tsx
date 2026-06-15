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
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TimeGranularity } from '@/lib/time'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CompactDateTimeRangePicker } from '@/features/usage-logs/components/compact-date-time-range-picker'
import { TIME_GRANULARITY_OPTIONS } from '@/features/dashboard/constants'
import type { DashboardFilters } from '@/features/dashboard/types'

interface OverviewChartsTimeFilterProps {
  filters: DashboardFilters
  onTimeRangeChange: (range: { start?: Date; end?: Date }) => void
  onGranularityChange: (value: TimeGranularity) => void
  onReset: () => void
  className?: string
}

export function OverviewChartsTimeFilter(props: OverviewChartsTimeFilterProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex w-full shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2',
        props.className
      )}
    >
      <CompactDateTimeRangePicker
        start={props.filters.start_timestamp}
        end={props.filters.end_timestamp}
        onChange={props.onTimeRangeChange}
        className='h-8 max-w-full min-w-[11rem] flex-1 sm:max-w-[18rem] sm:flex-none'
      />
      <Select
        items={TIME_GRANULARITY_OPTIONS.map((option) => ({
          value: option.value,
          label: t(option.label),
        }))}
        value={props.filters.time_granularity ?? 'hour'}
        onValueChange={(value) =>
          props.onGranularityChange(value as TimeGranularity)
        }
      >
        <SelectTrigger className='h-8 w-[5.5rem] px-2 text-xs sm:w-24'>
          <SelectValue placeholder={t('Hour')} />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align='end'>
          <SelectGroup>
            {TIME_GRANULARITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.label)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        className='text-muted-foreground h-8 px-2'
        onClick={props.onReset}
        title={t('Reset')}
        aria-label={t('Reset')}
      >
        <RotateCcw className='size-3.5' />
      </Button>
    </div>
  )
}
