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
import type { ReactNode } from 'react'
import { parseCurrencyDisplayType } from '@/lib/currency'
import { getAuthSectionContent } from './auth/section-registry.tsx'
import { getBillingSectionContent } from './billing/section-registry.tsx'
import { getContentSectionContent } from './content/section-registry.tsx'
import { getModelsSectionContent } from './models/section-registry.tsx'
import { RatioSettingsCard } from './models/ratio-settings-card'
import { getOperationsSectionContent } from './operations/section-registry.tsx'
import { getSecuritySectionContent } from './security/section-registry.tsx'
import { getSiteSectionContent } from './site/section-registry.tsx'
import type { SettingsTabId } from './settings-tabs.config'
import {
  defaultAuthSettings,
  defaultBillingSettings,
  defaultContentSettings,
  defaultModelSettings,
  defaultOperationsSettings,
  defaultSecuritySettings,
  defaultSiteSettings,
} from './settings-defaults'
import type { SystemOption } from './types'
import { getOptionValue } from './hooks/use-system-options'

type StatusMeta = {
  version?: string | null
  startTime?: number | null
}

const getModelDefaults = (settings: ReturnType<typeof getOptionValue<typeof defaultBillingSettings>>) => ({
  ModelPrice: settings.ModelPrice,
  ModelRatio: settings.ModelRatio,
  CacheRatio: settings.CacheRatio,
  CreateCacheRatio: settings.CreateCacheRatio,
  CompletionRatio: settings.CompletionRatio,
  ImageRatio: settings.ImageRatio,
  AudioRatio: settings.AudioRatio,
  AudioCompletionRatio: settings.AudioCompletionRatio,
  ExposeRatioEnabled: settings.ExposeRatioEnabled,
  BillingMode: settings['billing_setting.billing_mode'],
  BillingExpr: settings['billing_setting.billing_expr'],
})

const getGroupDefaults = (settings: ReturnType<typeof getOptionValue<typeof defaultBillingSettings>>) => ({
  TopupGroupRatio: settings.TopupGroupRatio,
  GroupRatio: settings.GroupRatio,
  UserUsableGroups: settings.UserUsableGroups,
  GroupGroupRatio: settings.GroupGroupRatio,
  AutoGroups: settings.AutoGroups,
  DefaultUseAutoGroup: settings.DefaultUseAutoGroup,
  GroupSpecialUsableGroup:
    settings['group_ratio_setting.group_special_usable_group'],
})

export function renderSettingsTabContent(
  tabId: SettingsTabId,
  options: SystemOption[] | undefined,
  status?: StatusMeta
): ReactNode {
  const site = getOptionValue(options, defaultSiteSettings)
  const billing = getOptionValue(options, defaultBillingSettings)
  const operations = getOptionValue(options, defaultOperationsSettings)
  const auth = getOptionValue(options, defaultAuthSettings)
  const security = getOptionValue(options, defaultSecuritySettings)
  const content = getOptionValue(options, defaultContentSettings)
  const models = getOptionValue(options, defaultModelSettings)

  switch (tabId) {
    case 'operation':
      return (
        <>
          {getBillingSectionContent('quota', billing)}
          {getBillingSectionContent('currency', billing)}
          {getOperationsSectionContent('behavior', operations)}
          {getSiteSectionContent('header-navigation', site)}
          {getSiteSectionContent('sidebar-modules', site)}
          {getSecuritySectionContent('sensitive-words', security)}
          {getOperationsSectionContent('logs', operations)}
          {getOperationsSectionContent('monitoring', operations)}
          {getBillingSectionContent('checkin', billing)}
        </>
      )

    case 'dashboard':
      return (
        <>
          {getContentSectionContent('dashboard', content)}
          {getContentSectionContent('announcements', content)}
          {getContentSectionContent('api-info', content)}
          {getContentSectionContent('faq', content)}
          {getContentSectionContent('uptime-kuma', content)}
        </>
      )

    case 'chats':
      return getContentSectionContent('chat', content)

    case 'drawing':
      return getContentSectionContent('drawing', content)

    case 'payment':
      return getBillingSectionContent('payment', billing)

    case 'ratio':
      return (
        <RatioSettingsCard
          titleKey='Group and model pricing settings'
          descriptionKey='Configure model pricing ratios and tool prices'
          modelDefaults={getModelDefaults(billing)}
          groupDefaults={getGroupDefaults(billing)}
          toolPricesDefault={billing['tool_price_setting.prices']}
          visibleTabs={[
            'models',
            'groups',
            'unset-models',
            'tool-prices',
            'upstream-sync',
          ]}
        />
      )

    case 'ratelimit':
      return getSecuritySectionContent('rate-limit', security)

    case 'models':
      return (
        <>
          {getModelsSectionContent('global', models)}
          {getModelsSectionContent('channel-affinity', models)}
          {getModelsSectionContent('gemini', models)}
          {getModelsSectionContent('claude', models)}
          {getModelsSectionContent('grok', models)}
        </>
      )

    case 'model-deployment':
      return getModelsSectionContent('model-deployment', models)

    case 'performance':
      return getOperationsSectionContent('performance', operations)

    case 'system':
      return (
        <>
          {getAuthSectionContent('basic-auth', auth)}
          {getAuthSectionContent('oauth', auth)}
          {getAuthSectionContent('passkey', auth)}
          {getAuthSectionContent('bot-protection', auth)}
          {getAuthSectionContent('custom-oauth', auth)}
          {getOperationsSectionContent('email', operations)}
          {getOperationsSectionContent('worker', operations)}
          {getSecuritySectionContent('ssrf', security)}
        </>
      )

    case 'other':
      return (
        <>
          {getSiteSectionContent('system-info', site)}
          {getSiteSectionContent('notice', site)}
          {getOperationsSectionContent(
            'update-checker',
            operations,
            status?.version,
            status?.startTime
          )}
        </>
      )

    default:
      return null
  }
}

/** Map legacy section paths to classic-style tabs */
export const LEGACY_SECTION_TO_TAB: Record<string, SettingsTabId> = {
  'site/system-info': 'other',
  'site/notice': 'other',
  'site/header-navigation': 'operation',
  'site/sidebar-modules': 'operation',
  'auth/basic-auth': 'system',
  'auth/oauth': 'system',
  'auth/passkey': 'system',
  'auth/bot-protection': 'system',
  'auth/custom-oauth': 'system',
  'billing/quota': 'operation',
  'billing/currency': 'operation',
  'billing/model-pricing': 'ratio',
  'billing/group-pricing': 'ratio',
  'billing/payment': 'payment',
  'billing/checkin': 'operation',
  'models/global': 'models',
  'models/gemini': 'models',
  'models/claude': 'models',
  'models/grok': 'models',
  'models/channel-affinity': 'models',
  'models/model-deployment': 'model-deployment',
  'security/rate-limit': 'ratelimit',
  'security/sensitive-words': 'operation',
  'security/ssrf': 'system',
  'content/dashboard': 'dashboard',
  'content/announcements': 'dashboard',
  'content/api-info': 'dashboard',
  'content/faq': 'dashboard',
  'content/uptime-kuma': 'dashboard',
  'content/chat': 'chats',
  'content/drawing': 'drawing',
  'operations/behavior': 'operation',
  'operations/monitoring': 'operation',
  'operations/email': 'system',
  'operations/worker': 'system',
  'operations/logs': 'operation',
  'operations/performance': 'performance',
  'operations/update-checker': 'other',
}

export function resolveLegacySettingsPath(pathname: string): SettingsTabId | null {
  const match = pathname.match(/^\/system-settings\/([^/]+)\/([^/]+)/)
  if (!match) return null
  const key = `${match[1]}/${match[2]}`
  return LEGACY_SECTION_TO_TAB[key] ?? null
}
