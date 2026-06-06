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
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'
import type { UsageLog } from '../../data/schema'
import { buildBillingProcess } from '../../lib/billing-process'
import type { LogOtherData } from '../../types'

export function BillingProcessSection(props: {
  log: UsageLog
  other: LogOtherData
}) {
  const { t } = useTranslation()
  const result = useMemo(
    () => buildBillingProcess(props.log, props.other, t),
    [props.log, props.other, t]
  )

  if (!result || result.lines.length === 0) return null

  return (
    <div className='min-w-0 space-y-1.5'>
      <Label className='text-xs font-semibold'>{t('Billing Process')}</Label>
      <div className='bg-muted/30 min-w-0 space-y-1 overflow-hidden rounded-md border p-2.5 max-sm:p-2'>
        {result.lines.map((line, idx) => (
          <p
            key={idx}
            className='text-muted-foreground text-xs leading-relaxed break-words'
          >
            {line}
          </p>
        ))}
        {result.showReferenceNote && (
          <p className='text-muted-foreground/80 text-[11px] italic'>
            {t('For reference only; actual charges may vary.')}
          </p>
        )}
      </div>
    </div>
  )
}
