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
import { lazy, Suspense, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { getAuthSectionContent } from './auth/section-registry.tsx'
import { getBillingSectionContent } from './billing/section-registry.tsx'
import { getContentSectionContent } from './content/section-registry.tsx'
import { ServerAddressSection } from './general/server-address-section'
import { getModelsSectionContent } from './models/section-registry.tsx'
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
import { normalizeSecuritySettings } from './utils/normalize-security-settings'

const LazyRatioSettingsCard = lazy(() =>
  import('./models/ratio-settings-card').then((m) => ({
    default: m.RatioSettingsCard,
  }))
)

function TabLoadingFallback() {
  const { t } = useTranslation()
  return (
    <div className='text-muted-foreground flex min-h-[240px] items-center justify-center text-sm'>
      {t('Loading settings...')}
    </div>
  )
}

function withSuspense(content: ReactNode) {
  return <Suspense fallback={<TabLoadingFallback />}>{content}</Suspense>
}

const getModelDefaults = (
  settings: ReturnType<typeof getOptionValue<typeof defaultBillingSettings>>
) => ({
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

const getGroupDefaults = (
  settings: ReturnType<typeof getOptionValue<typeof defaultBillingSettings>>
) => ({
  TopupGroupRatio: settings.TopupGroupRatio,
  GroupRatio: settings.GroupRatio,
  UserUsableGroups: settings.UserUsableGroups,
  GroupGroupRatio: settings.GroupGroupRatio,
  AutoGroups: settings.AutoGroups,
  DefaultUseAutoGroup: settings.DefaultUseAutoGroup,
  GroupSpecialUsableGroup:
    settings['group_ratio_setting.group_special_usable_group'],
})

type StatusMeta = {
  version?: string | null
  startTime?: number | null
}

/** 运营设置 — 顺序对齐 web/classic OperationSetting */
function renderOperationTab(options: SystemOption[] | undefined) {
  const billing = getOptionValue(options, defaultBillingSettings)
  const operations = getOptionValue(options, defaultOperationsSettings)
  const site = getOptionValue(options, defaultSiteSettings)
  const security = normalizeSecuritySettings(
    getOptionValue(options, defaultSecuritySettings)
  )

  return (
    <>
      {getOperationsSectionContent('behavior', operations, undefined, undefined)}
      {getBillingSectionContent('currency', billing)}
      {getSiteSectionContent('header-navigation', site)}
      {getSiteSectionContent('sidebar-modules', site)}
      {getSecuritySectionContent('sensitive-words', security)}
      {getOperationsSectionContent('logs', operations, undefined, undefined)}
      {getOperationsSectionContent('monitoring', operations, undefined, undefined)}
      {getBillingSectionContent('quota', billing)}
      {getBillingSectionContent('checkin', billing)}
    </>
  )
}

function renderDashboardTab(options: SystemOption[] | undefined) {
  const content = getOptionValue(options, defaultContentSettings)
  return (
    <>
      {getContentSectionContent('dashboard', content)}
      {getContentSectionContent('announcements', content)}
      {getContentSectionContent('api-info', content)}
      {getContentSectionContent('faq', content)}
      {getContentSectionContent('uptime-kuma', content)}
    </>
  )
}

function renderChatsTab(options: SystemOption[] | undefined) {
  const content = getOptionValue(options, defaultContentSettings)
  return getContentSectionContent('chat', content)
}

function renderDrawingTab(options: SystemOption[] | undefined) {
  const content = getOptionValue(options, defaultContentSettings)
  return getContentSectionContent('drawing', content)
}

function renderPaymentTab(options: SystemOption[] | undefined) {
  const billing = getOptionValue(options, defaultBillingSettings)
  return withSuspense(getBillingSectionContent('payment', billing))
}

function renderRatioTab(options: SystemOption[] | undefined) {
  const billing = getOptionValue(options, defaultBillingSettings)
  return withSuspense(
    <LazyRatioSettingsCard
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
}

function renderRateLimitTab(options: SystemOption[] | undefined) {
  const security = normalizeSecuritySettings(
    getOptionValue(options, defaultSecuritySettings)
  )
  return getSecuritySectionContent('rate-limit', security)
}

function renderModelsTab(options: SystemOption[] | undefined) {
  const models = getOptionValue(options, defaultModelSettings)
  return withSuspense(
    <>
      {getModelsSectionContent('global', models)}
      {getModelsSectionContent('channel-affinity', models)}
      {getModelsSectionContent('gemini', models)}
      {getModelsSectionContent('claude', models)}
      {getModelsSectionContent('grok', models)}
    </>
  )
}

function renderModelDeploymentTab(options: SystemOption[] | undefined) {
  const models = getOptionValue(options, defaultModelSettings)
  return getModelsSectionContent('model-deployment', models)
}

function renderPerformanceTab(options: SystemOption[] | undefined) {
  const operations = getOptionValue(options, defaultOperationsSettings)
  return getOperationsSectionContent(
    'performance',
    operations,
    undefined,
    undefined
  )
}

/** 系统设置 Tab — 顺序对齐 web/classic SystemSetting */
function renderSystemTab(options: SystemOption[] | undefined) {
  const site = getOptionValue(options, defaultSiteSettings)
  const auth = getOptionValue(options, defaultAuthSettings)
  const operations = getOptionValue(options, defaultOperationsSettings)
  const security = normalizeSecuritySettings(
    getOptionValue(options, defaultSecuritySettings)
  )

  return withSuspense(
    <>
      <ServerAddressSection defaultValue={site.ServerAddress} />
      {getOperationsSectionContent('worker', operations, undefined, undefined)}
      {getSecuritySectionContent('ssrf', security)}
      {getAuthSectionContent('basic-auth', auth)}
      {getAuthSectionContent('passkey', auth)}
      {getAuthSectionContent('bot-protection', auth)}
      {getOperationsSectionContent('email', operations, undefined, undefined)}
      {getAuthSectionContent('oauth', auth)}
      {getAuthSectionContent('custom-oauth', auth)}
    </>
  )
}

function renderOtherTab(
  options: SystemOption[] | undefined,
  status?: StatusMeta
) {
  const site = getOptionValue(options, defaultSiteSettings)
  const operations = getOptionValue(options, defaultOperationsSettings)

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
}

export function renderSettingsTabContent(
  tabId: SettingsTabId,
  options: SystemOption[] | undefined,
  status?: StatusMeta
): ReactNode {
  switch (tabId) {
    case 'operation':
      return renderOperationTab(options)
    case 'dashboard':
      return withSuspense(renderDashboardTab(options))
    case 'chats':
      return renderChatsTab(options)
    case 'drawing':
      return renderDrawingTab(options)
    case 'payment':
      return renderPaymentTab(options)
    case 'ratio':
      return renderRatioTab(options)
    case 'ratelimit':
      return renderRateLimitTab(options)
    case 'models':
      return renderModelsTab(options)
    case 'model-deployment':
      return renderModelDeploymentTab(options)
    case 'performance':
      return renderPerformanceTab(options)
    case 'system':
      return renderSystemTab(options)
    case 'other':
      return renderOtherTab(options, status)
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

export function resolveLegacySettingsPath(
  pathname: string
): SettingsTabId | null {
  const match = pathname.match(/^\/system-settings\/([^/]+)\/([^/]+)/)
  if (!match) return null
  const key = `${match[1]}/${match[2]}`
  return LEGACY_SECTION_TO_TAB[key] ?? null
}
