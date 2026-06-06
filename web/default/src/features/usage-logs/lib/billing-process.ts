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
  formatBillingCurrencyFromUSD,
  getCurrencyDisplay,
} from '@/lib/currency'
import { formatLogQuota } from '@/lib/format'
import type { UsageLog } from '../data/schema'
import type { LogOtherData } from '../types'
import { getTieredBillingSummary } from './format'
import { isPerCallBilling } from './utils'

type TranslateFn = (key: string, options?: Record<string, unknown>) => string

export interface BillingProcessResult {
  lines: string[]
  showReferenceNote: boolean
}

function isValidGroupRatio(ratio: number | undefined): ratio is number {
  return ratio != null && Number.isFinite(ratio) && ratio !== -1
}

function getEffectiveGroupRatio(other: LogOtherData): {
  ratio: number
  ratioLabelKey: 'User Exclusive Ratio' | 'Group Ratio'
} {
  if (isValidGroupRatio(other.user_group_ratio)) {
    return {
      ratio: other.user_group_ratio,
      ratioLabelKey: 'User Exclusive Ratio',
    }
  }
  return {
    ratio: other.group_ratio ?? 1,
    ratioLabelKey: 'Group Ratio',
  }
}

function shouldUseRatioBillingProcess(modelPrice: number | undefined): boolean {
  const { config } = getCurrencyDisplay()
  return (modelPrice ?? -1) === -1 && config.quotaDisplayType === 'TOKENS'
}

function formatRatioValue(value: number, digits = 6): number {
  if (!Number.isFinite(value)) return 0
  return Number(value.toFixed(digits))
}

function fmtBillingPrice(usd: number): string {
  return formatBillingCurrencyFromUSD(usd, {
    digitsLarge: 4,
    digitsSmall: 6,
    abbreviate: false,
  })
}

function fmtAmountFromUsd(usd: number): string {
  const { config } = getCurrencyDisplay()
  return formatLogQuota(usd * config.quotaPerUnit)
}

function getBillingSymbolAndRate(): { symbol: string; exchangeRate: number } {
  const { meta } = getCurrencyDisplay()
  if (meta.kind === 'tokens') {
    return { symbol: '', exchangeRate: 1 }
  }
  return { symbol: meta.symbol, exchangeRate: meta.exchangeRate }
}

function fmtUnitPrice(usd: number, useRatioMode: boolean): string {
  if (useRatioMode) return String(formatRatioValue(usd))
  const { exchangeRate } = getBillingSymbolAndRate()
  return (usd * exchangeRate).toFixed(6)
}

function fmtDisplayPrice(usd: number, useRatioMode: boolean): string {
  return useRatioMode ? fmtAmountFromUsd(usd) : fmtBillingPrice(usd)
}

function buildPerCallProcess(
  other: LogOtherData,
  t: TranslateFn,
  useRatioMode: boolean
): BillingProcessResult {
  const modelPrice = other.model_price ?? 0
  const { ratio, ratioLabelKey } = getEffectiveGroupRatio(other)
  const ratioLabel = t(ratioLabelKey)
  const totalUsd = modelPrice * ratio

  if (useRatioMode) {
    return {
      lines: [
        t('Per-call price {{amount}}', {
          amount: fmtAmountFromUsd(modelPrice),
        }),
        t('Per-call {{amount}} × {{ratioLabel}} {{ratio}} = {{total}}', {
          amount: fmtAmountFromUsd(modelPrice),
          ratioLabel,
          ratio,
          total: fmtAmountFromUsd(totalUsd),
        }),
      ],
      showReferenceNote: true,
    }
  }

  const price = fmtBillingPrice(modelPrice)
  const total = fmtBillingPrice(totalUsd)
  const { symbol } = getBillingSymbolAndRate()

  return {
    lines: [
      t('Per-call price: {{symbol}}{{price}}', { symbol, price }),
      t('Per-call: {{symbol}}{{price}} × {{ratioLabel}} {{ratio}} = {{symbol}}{{total}}', {
        symbol,
        price,
        ratioLabel,
        ratio,
        total,
      }),
    ],
    showReferenceNote: true,
  }
}

function buildStandardTokenProcess(
  log: UsageLog,
  other: LogOtherData,
  t: TranslateFn,
  useRatioMode: boolean
): BillingProcessResult {
  const inputTokens = log.prompt_tokens || 0
  const completionTokens = log.completion_tokens || 0
  const modelRatio = other.model_ratio ?? 0
  const completionRatio = other.completion_ratio ?? 0
  const cacheTokens = other.cache_tokens || 0
  const cacheRatio = other.cache_ratio ?? 1
  const imageOutputTokens = other.image_output || 0
  const audioInputTokens = other.audio_input_token_count || 0
  const webSearchCallCount = other.web_search_call_count || 0
  const fileSearchCallCount = other.file_search_call_count || 0
  const webSearchPrice = other.web_search_price || 0
  const fileSearchPrice = other.file_search_price || 0
  const imageGenerationCallPrice = other.image_generation_call_price || 0
  const audioInputPrice = other.audio_input_price || 0
  const { ratio, ratioLabelKey } = getEffectiveGroupRatio(other)
  const ratioLabel = t(ratioLabelKey)

  const inputRatioPrice = modelRatio * 2.0
  const completionRatioPrice = modelRatio * 2.0 * completionRatio
  const cacheRatioPrice = modelRatio * 2.0 * cacheRatio
  const imageRatioPrice = modelRatio * 2.0 * (other.image_ratio ?? 1)

  let effectiveInputTokens =
    inputTokens - cacheTokens + cacheTokens * cacheRatio
  if (other.image && imageOutputTokens > 0) {
    effectiveInputTokens =
      inputTokens - imageOutputTokens + imageOutputTokens * (other.image_ratio ?? 1)
  }
  if (audioInputTokens > 0) {
    effectiveInputTokens -= audioInputTokens
  }

  const totalUsd =
    (effectiveInputTokens / 1_000_000) * inputRatioPrice * ratio +
    (audioInputTokens / 1_000_000) * audioInputPrice * ratio +
    (completionTokens / 1_000_000) * completionRatioPrice * ratio +
    (webSearchCallCount / 1000) * webSearchPrice * ratio +
    (fileSearchCallCount / 1000) * fileSearchPrice * ratio +
    imageGenerationCallPrice * ratio

  const lines: string[] = []
  const { symbol } = getBillingSymbolAndRate()

  if (!useRatioMode) {
    lines.push(
      t('Input price: {{symbol}}{{price}} / 1M tokens', {
        symbol,
        price: fmtUnitPrice(inputRatioPrice, false),
      })
    )
    lines.push(
      t('Output price: {{symbol}}{{price}} / 1M tokens', {
        symbol,
        price: fmtUnitPrice(completionRatioPrice, false),
      })
    )
    if (cacheTokens > 0) {
      lines.push(
        t('Cache read price: {{symbol}}{{price}} / 1M tokens', {
          symbol,
          price: fmtUnitPrice(cacheRatioPrice, false),
        })
      )
    }
    if (other.image && imageOutputTokens > 0) {
      lines.push(
        t('Image input price: {{symbol}}{{price}} / 1M tokens', {
          symbol,
          price: fmtUnitPrice(imageRatioPrice, false),
        })
      )
    }
  } else {
    lines.push(
      t('Model ratio {{modelRatio}}, completion ratio {{completionRatio}}, {{ratioLabel}} {{ratio}}', {
        modelRatio: formatRatioValue(modelRatio),
        completionRatio: formatRatioValue(completionRatio),
        ratioLabel,
        ratio,
      })
    )
  }

  let inputPart = ''
  if (other.image && imageOutputTokens > 0) {
    inputPart = t(
      'Input {{nonImageInput}} tokens + image input {{imageInput}} tokens / 1M × {{symbol}}{{price}}',
      {
        nonImageInput: inputTokens - imageOutputTokens,
        imageInput: imageOutputTokens,
        symbol,
        price: fmtUnitPrice(inputRatioPrice, useRatioMode),
      }
    )
  } else if (cacheTokens > 0) {
    inputPart = t(
      'Input {{nonCacheInput}} tokens / 1M × {{symbol}}{{price}} + cache {{cacheInput}} tokens / 1M × {{symbol}}{{cachePrice}}',
      {
        nonCacheInput: inputTokens - cacheTokens,
        cacheInput: cacheTokens,
        symbol,
        price: fmtUnitPrice(inputRatioPrice, useRatioMode),
        cachePrice: fmtUnitPrice(cacheRatioPrice, useRatioMode),
      }
    )
  } else if (other.audio_input_seperate_price && audioInputTokens > 0) {
    inputPart = t(
      'Input {{nonAudioInput}} tokens / 1M × {{symbol}}{{price}} + audio input {{audioInput}} tokens / 1M × {{symbol}}{{audioPrice}}',
      {
        nonAudioInput: inputTokens - audioInputTokens,
        audioInput: audioInputTokens,
        symbol,
        price: fmtUnitPrice(inputRatioPrice, useRatioMode),
        audioPrice: fmtUnitPrice(audioInputPrice, useRatioMode),
      }
    )
  } else {
    inputPart = t('Input {{input}} tokens / 1M × {{symbol}}{{price}}', {
      input: inputTokens,
      symbol,
      price: fmtUnitPrice(inputRatioPrice, useRatioMode),
    })
  }

  const outputPart = t(
    'Output {{completion}} tokens / 1M × {{symbol}}{{compPrice}}',
    {
      completion: completionTokens,
      symbol,
      compPrice: fmtUnitPrice(completionRatioPrice, useRatioMode),
    }
  )

  const extras = [
    other.web_search && webSearchCallCount > 0
      ? t(' + Web search {{count}} calls / 1K × {{symbol}}{{price}} × {{ratioLabel}} {{ratio}}', {
          count: webSearchCallCount,
          symbol,
          price: fmtUnitPrice(webSearchPrice, useRatioMode),
          ratioLabel,
          ratio,
        })
      : '',
    other.file_search && fileSearchCallCount > 0
      ? t(' + File search {{count}} calls / 1K × {{symbol}}{{price}} × {{ratioLabel}} {{ratio}}', {
          count: fileSearchCallCount,
          symbol,
          price: fmtUnitPrice(fileSearchPrice, useRatioMode),
          ratioLabel,
          ratio,
        })
      : '',
    other.image_generation_call && imageGenerationCallPrice > 0
      ? t(' + Image generation {{symbol}}{{price}} / call × {{ratioLabel}} {{ratio}}', {
          symbol,
          price: fmtUnitPrice(imageGenerationCallPrice, useRatioMode),
          ratioLabel,
          ratio,
        })
      : '',
  ].join('')

  lines.push(
    t('({{inputPart}} + {{outputPart}}{{extras}}) × {{ratioLabel}} {{ratio}} = {{total}}', {
      inputPart,
      outputPart,
      extras,
      ratioLabel,
      ratio,
      total: fmtDisplayPrice(totalUsd, useRatioMode),
    })
  )

  return { lines, showReferenceNote: true }
}

function buildClaudeTokenProcess(
  log: UsageLog,
  other: LogOtherData,
  t: TranslateFn,
  useRatioMode: boolean
): BillingProcessResult {
  const inputTokens = log.prompt_tokens || 0
  const completionTokens = log.completion_tokens || 0
  const modelRatio = other.model_ratio ?? 0
  const completionRatio = other.completion_ratio ?? 0
  const cacheTokens = other.cache_tokens || 0
  const cacheRatio = other.cache_ratio ?? 1
  const cacheCreationTokens = other.cache_creation_tokens || 0
  const cacheCreationRatio = other.cache_creation_ratio ?? 1
  const cacheCreationTokens5m = other.cache_creation_tokens_5m || 0
  const cacheCreationRatio5m = other.cache_creation_ratio_5m ?? 1
  const cacheCreationTokens1h = other.cache_creation_tokens_1h || 0
  const cacheCreationRatio1h = other.cache_creation_ratio_1h ?? 1
  const hasSplitCacheCreation =
    cacheCreationTokens5m > 0 || cacheCreationTokens1h > 0
  const legacyCacheCreationTokens = hasSplitCacheCreation ? 0 : cacheCreationTokens
  const { ratio, ratioLabelKey } = getEffectiveGroupRatio(other)
  const ratioLabel = t(ratioLabelKey)

  const inputRatioPrice = modelRatio * 2.0
  const completionRatioPrice = modelRatio * 2.0 * completionRatio

  const effectiveInputTokens =
    inputTokens +
    cacheTokens * cacheRatio +
    legacyCacheCreationTokens * cacheCreationRatio +
    cacheCreationTokens5m * cacheCreationRatio5m +
    cacheCreationTokens1h * cacheCreationRatio1h

  const totalUsd =
    (effectiveInputTokens / 1_000_000) * inputRatioPrice * ratio +
    (completionTokens / 1_000_000) * completionRatioPrice * ratio

  const { symbol } = getBillingSymbolAndRate()
  const fmtUnit = (usd: number) => fmtUnitPrice(usd, useRatioMode)

  const lines: string[] = []

  if (!useRatioMode) {
    lines.push(
      t('Input price: {{symbol}}{{price}} / 1M tokens', {
        symbol,
        price: fmtUnit(inputRatioPrice),
      })
    )
    lines.push(
      t('Output price: {{symbol}}{{price}} / 1M tokens', {
        symbol,
        price: fmtUnit(completionRatioPrice),
      })
    )
    if (cacheTokens > 0) {
      lines.push(
        t('Cache read price: {{symbol}}{{price}} / 1M tokens', {
          symbol,
          price: fmtUnit(inputRatioPrice * cacheRatio),
        })
      )
    }
    if (hasSplitCacheCreation && cacheCreationTokens5m > 0) {
      lines.push(
        t('Cache creation (5m) price: {{symbol}}{{price}} / 1M tokens', {
          symbol,
          price: fmtUnit(inputRatioPrice * cacheCreationRatio5m),
        })
      )
    }
    if (hasSplitCacheCreation && cacheCreationTokens1h > 0) {
      lines.push(
        t('Cache creation (1h) price: {{symbol}}{{price}} / 1M tokens', {
          symbol,
          price: fmtUnit(inputRatioPrice * cacheCreationRatio1h),
        })
      )
    }
    if (!hasSplitCacheCreation && cacheCreationTokens > 0) {
      lines.push(
        t('Cache creation price: {{symbol}}{{price}} / 1M tokens', {
          symbol,
          price: fmtUnit(inputRatioPrice * cacheCreationRatio),
        })
      )
    }
  }

  const segments = [
    t('Prompt {{input}} tokens / 1M × {{symbol}}{{price}}', {
      input: inputTokens,
      symbol,
      price: fmtUnit(inputRatioPrice),
    }),
  ]

  if (cacheTokens > 0) {
    segments.push(
      t('Cache {{tokens}} tokens / 1M × {{symbol}}{{price}}', {
        tokens: cacheTokens,
        symbol,
        price: fmtUnit(inputRatioPrice * cacheRatio),
      })
    )
  }
  if (!hasSplitCacheCreation && cacheCreationTokens > 0) {
    segments.push(
      t('Cache creation {{tokens}} tokens / 1M × {{symbol}}{{price}}', {
        tokens: cacheCreationTokens,
        symbol,
        price: fmtUnit(inputRatioPrice * cacheCreationRatio),
      })
    )
  }
  if (hasSplitCacheCreation && cacheCreationTokens5m > 0) {
    segments.push(
      t('Cache creation (5m) {{tokens}} tokens / 1M × {{symbol}}{{price}}', {
        tokens: cacheCreationTokens5m,
        symbol,
        price: fmtUnit(inputRatioPrice * cacheCreationRatio5m),
      })
    )
  }
  if (hasSplitCacheCreation && cacheCreationTokens1h > 0) {
    segments.push(
      t('Cache creation (1h) {{tokens}} tokens / 1M × {{symbol}}{{price}}', {
        tokens: cacheCreationTokens1h,
        symbol,
        price: fmtUnit(inputRatioPrice * cacheCreationRatio1h),
      })
    )
  }
  segments.push(
    t('Completion {{completion}} tokens / 1M × {{symbol}}{{price}}', {
      completion: completionTokens,
      symbol,
      price: fmtUnit(completionRatioPrice),
    })
  )

  lines.push(
    t('({{segments}}) × {{ratioLabel}} {{ratio}} = {{total}}', {
      segments: segments.join(' + '),
      ratioLabel,
      ratio,
      total: fmtDisplayPrice(totalUsd, useRatioMode),
    })
  )

  return { lines, showReferenceNote: true }
}

function buildTieredProcess(
  log: UsageLog,
  other: LogOtherData,
  t: TranslateFn
): BillingProcessResult | null {
  const summary = getTieredBillingSummary(other)
  if (!summary) return null

  const { ratio, ratioLabelKey } = getEffectiveGroupRatio(other)
  const ratioLabel = t(ratioLabelKey)
  const { meta } = getCurrencyDisplay()
  const symbol = meta.kind === 'tokens' ? '' : meta.symbol
  const exchangeRate =
    meta.kind === 'currency' || meta.kind === 'custom' ? meta.exchangeRate : 1

  const tokenByField: Record<string, number> = {
    inputPrice: Math.max((log.prompt_tokens || 0) - (other.cache_tokens || 0), 0),
    outputPrice: log.completion_tokens || 0,
    cacheReadPrice: other.cache_tokens || 0,
    cacheWritePrice: other.cache_creation_tokens || 0,
    cacheWrite5mPrice: other.cache_creation_tokens_5m || 0,
    cacheWrite1hPrice: other.cache_creation_tokens_1h || 0,
  }

  const lines: string[] = [
    t('Matched tier: {{tier}}', {
      tier: other.matched_tier || summary.tier.label,
    }),
  ]

  for (const entry of summary.priceEntries) {
    lines.push(
      t('{{priceLabel}}: {{symbol}}{{price}} / 1M tokens', {
        priceLabel: t(entry.shortLabel),
        symbol,
        price: (entry.price * exchangeRate).toFixed(6),
      })
    )
  }

  const parts: string[] = []
  let subtotalUsd = 0
  for (const entry of summary.priceEntries) {
    const tokens = tokenByField[entry.field] ?? 0
    if (tokens <= 0) continue
    const partUsd = (tokens / 1_000_000) * entry.price
    subtotalUsd += partUsd
    parts.push(
      t('{{priceLabel}} {{tokens}} tokens / 1M × {{symbol}}{{price}}', {
        priceLabel: t(entry.shortLabel),
        tokens,
        symbol,
        price: (entry.price * exchangeRate).toFixed(6),
      })
    )
  }

  const totalUsd = subtotalUsd * ratio
  if (parts.length > 0) {
    lines.push(
      t('({{parts}}) × {{ratioLabel}} {{ratio}} = {{total}}', {
        parts: parts.join(' + '),
        ratioLabel,
        ratio,
        total: fmtBillingPrice(totalUsd),
      })
    )
  }

  return { lines, showReferenceNote: true }
}

function buildTaskProcess(
  other: LogOtherData,
  content: string,
  t: TranslateFn
): BillingProcessResult {
  if (other.task_id != null && content) {
    return { lines: [content], showReferenceNote: false }
  }
  return {
    lines: [t('Task pre-charge (final amount will be recalculated after completion)')],
    showReferenceNote: false,
  }
}

export function buildBillingProcess(
  log: UsageLog,
  other: LogOtherData,
  t: TranslateFn
): BillingProcessResult | null {
  const modelPrice = other.model_price
  const useRatioMode = shouldUseRatioBillingProcess(modelPrice)

  if (other.is_task && modelPrice === -1) {
    return buildTaskProcess(other, log.content ?? '', t)
  }

  if (other.billing_mode === 'tiered_expr' && other.expr_b64) {
    return buildTieredProcess(log, other, t)
  }

  if (isPerCallBilling(modelPrice)) {
    return buildPerCallProcess(other, t, useRatioMode)
  }

  if (other.claude) {
    return buildClaudeTokenProcess(log, other, t, useRatioMode)
  }

  if (other.ws || other.audio) {
    return buildStandardTokenProcess(log, other, t, useRatioMode)
  }

  if (other.model_ratio == null) {
    return null
  }

  return buildStandardTokenProcess(log, other, t, useRatioMode)
}
