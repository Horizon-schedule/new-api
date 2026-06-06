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
import { Copy, Check, Globe, ShieldCheck, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { formatTimestampToDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { getTokenConsumeAudit } from '../../api'
import type { UsageLog } from '../../data/schema'
import { parseLogOther } from '../../lib/format'

function DetailRow(props: {
  label: React.ReactNode
  value: React.ReactNode
  mono?: boolean
  hint?: React.ReactNode
}) {
  return (
    <div className='grid min-w-0 grid-cols-[5.25rem_minmax(0,1fr)] gap-2 text-sm sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3'>
      <span className='text-muted-foreground min-w-0 text-xs'>
        {props.label}
      </span>
      <div className='min-w-0 space-y-0.5'>
        <span
          className={cn(
            'block max-w-full min-w-0 text-xs break-all sm:break-words',
            props.mono && 'font-mono'
          )}
        >
          {props.value}
        </span>
        {props.hint ? (
          <span className='text-muted-foreground block text-[11px] leading-snug'>
            {props.hint}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function CopyableValue(props: {
  value: string
  copiedText: string | null
  onCopy: (text: string) => void
}) {
  const copied = props.copiedText === props.value

  return (
    <span className='inline-flex max-w-full min-w-0 items-center gap-1'>
      <span className='min-w-0 break-all'>{props.value}</span>
      <button
        type='button'
        className='text-muted-foreground hover:text-foreground shrink-0'
        onClick={() => props.onCopy(props.value)}
        aria-label='Copy'
      >
        {copied ? (
          <Check className='size-3 text-emerald-600' />
        ) : (
          <Copy className='size-3' />
        )}
      </button>
    </span>
  )
}

export function RequestTracingSection(props: {
  log: UsageLog
  isAdmin: boolean
  open: boolean
}) {
  const { t } = useTranslation()
  const { copiedText, copyToClipboard } = useCopyToClipboard({ notify: false })
  const other = parseLogOther(props.log.other)

  const canAudit =
    props.log.type === 2 &&
    props.open &&
    (props.log.token_id > 0 || props.log.token_name !== '')

  const { data: auditRes, isLoading: auditLoading } = useQuery({
    queryKey: [
      'token-consume-audit',
      props.isAdmin,
      props.log.user_id,
      props.log.token_id,
      props.log.token_name,
    ],
    queryFn: () =>
      getTokenConsumeAudit(
        {
          user_id: props.isAdmin ? props.log.user_id : undefined,
          token_id: props.log.token_id || undefined,
          token_name: props.log.token_id ? undefined : props.log.token_name,
        },
        props.isAdmin
      ),
    enabled: canAudit,
    staleTime: 60_000,
  })

  const audit = auditRes?.success ? auditRes.data : undefined
  const requestEndAt = props.log.created_at
  const requestStartAt =
    requestEndAt > 0 && props.log.use_time > 0
      ? requestEndAt - props.log.use_time
      : 0

  return (
    <div className='min-w-0 space-y-1.5'>
      <Label className='flex items-center gap-1.5 text-xs font-semibold'>
        <Clock className='size-3.5 text-sky-600' aria-hidden='true' />
        {t('Request Tracing')}
      </Label>
      <div className='bg-muted/40 space-y-1.5 rounded-md border px-2.5 py-2'>
        <DetailRow
          label={t('Request Ended At')}
          value={formatTimestampToDate(requestEndAt)}
          mono
          hint={t(
            'The time column in the log list is the request end time (when billing was recorded)'
          )}
        />
        {requestStartAt > 0 ? (
          <DetailRow
            label={t('Request Started At')}
            value={formatTimestampToDate(requestStartAt)}
            mono
            hint={t('Estimated from end time minus response time')}
          />
        ) : null}

        <DetailRow
          label={t('Originator')}
          value={
            other?.originator ? (
              <CopyableValue
                value={other.originator}
                copiedText={copiedText}
                onCopy={copyToClipboard}
              />
            ) : (
              <span className='text-muted-foreground italic'>
                {t('Not recorded')}
              </span>
            )
          }
          hint={t('Client identity is taken from request headers at billing time')}
        />
        <DetailRow
          label={t('User-Agent')}
          value={
            other?.user_agent ? (
              <CopyableValue
                value={other.user_agent}
                copiedText={copiedText}
                onCopy={copyToClipboard}
              />
            ) : (
              <span className='text-muted-foreground italic'>
                {t('Not recorded')}
              </span>
            )
          }
        />

        <DetailRow
          label={t('Client IP')}
          value={
            props.log.ip ? (
              <span className='inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400'>
                <Globe className='size-3 shrink-0' aria-hidden='true' />
                <CopyableValue
                  value={props.log.ip}
                  copiedText={copiedText}
                  onCopy={copyToClipboard}
                />
              </span>
            ) : (
              <span className='text-muted-foreground italic'>
                {t('No IP recorded')}
              </span>
            )
          }
          hint={
            !props.log.ip
              ? t(
                  'Enable "Record IP" in user settings to capture client IP for future requests'
                )
              : undefined
          }
        />

        {canAudit ? (
          <>
            <DetailRow
              label={t('Token First Consume')}
              value={
                auditLoading
                  ? t('Loading...')
                  : formatTimestampToDate(audit?.first_consume_at ?? 0)
              }
              mono
            />
            <DetailRow
              label={t('Token Last Consume')}
              value={
                auditLoading
                  ? t('Loading...')
                  : formatTimestampToDate(audit?.last_consume_at ?? 0)
              }
              mono
            />
            {audit?.token_accessed_time ? (
              <DetailRow
                label={t('Token Last Accessed')}
                value={formatTimestampToDate(audit.token_accessed_time)}
                mono
              />
            ) : null}
            {audit && audit.consume_count > 0 ? (
              <DetailRow
                label={t('Consume Log Count')}
                value={String(audit.consume_count)}
                mono
              />
            ) : null}
            {audit && audit.distinct_ips.length > 0 ? (
              <DetailRow
                label={t('Distinct Client IPs')}
                value={
                  <span className='space-y-0.5'>
                    {audit.distinct_ips.map(ip => (
                      <span
                        key={ip}
                        className='block font-mono text-amber-700 dark:text-amber-400'
                      >
                        {ip}
                      </span>
                    ))}
                  </span>
                }
              />
            ) : null}
          </>
        ) : null}
      </div>

      <Alert className='border-amber-200/80 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20'>
        <ShieldCheck className='text-amber-600' />
        <AlertTitle className='text-xs font-semibold'>
          {t('Security Troubleshooting')}
        </AlertTitle>
        <AlertDescription className='text-muted-foreground space-y-1 text-[11px] leading-relaxed'>
          <p>
            {t(
              'API keys are only charged when external clients send real requests; admin model tests and playground do not use user keys'
            )}
          </p>
          <ul className='list-disc space-y-0.5 pl-4'>
            <li>
              {t(
                'Check if the API key was configured in OpenRouter, Cursor, browser extensions, or CI scripts'
              )}
            </li>
            <li>{t('Revoke or rotate the token if the source is unknown')}</li>
            <li>
              {t('Compare distinct IPs with known office or home networks')}
            </li>
            <li>
              {t('Filter logs by token name to see all activity for this key')}
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
