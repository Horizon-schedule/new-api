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
import type { SettingsTabId } from './settings-tabs.config'
import type { SystemOption } from './types'

type StatusMeta = {
  version?: string | null
  startTime?: number | null
}

type TabPanelProps = {
  options: SystemOption[] | undefined
  status?: StatusMeta
}

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

const LazyOperationTab = lazy(async () => {
  const [
    { getOperationsSectionContent },
    { getBillingSectionContent },
    { getSiteSectionContent },
    { getSecuritySectionContent },
    { getOptionValue },
    { defaultBillingSettings, defaultOperationsSettings, defaultSiteSettings, defaultSecuritySettings },
    { normalizeSecuritySettings },
  ] = await Promise.all([
    import('./operations/section-registry.tsx'),
    import('./billing/section-registry.tsx'),
    import('./site/section-registry.tsx'),
    import('./security/section-registry.tsx'),
    import('./hooks/use-system-options'),
    import('./settings-defaults'),
    import('./utils/normalize-security-settings'),
  ])

  function OperationTab({ options }: TabPanelProps) {
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
  return { default: OperationTab }
})

const LazyDashboardTab = lazy(async () => {
  const [{ getContentSectionContent }, { getOptionValue }, { defaultContentSettings }] =
    await Promise.all([
      import('./content/section-registry.tsx'),
      import('./hooks/use-system-options'),
      import('./settings-defaults'),
    ])
  function DashboardTab({ options }: TabPanelProps) {
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
  return { default: DashboardTab }
})

const LazyChatsTab = lazy(async () => {
  const [{ getContentSectionContent }, { getOptionValue }, { defaultContentSettings }] =
    await Promise.all([
      import('./content/section-registry.tsx'),
      import('./hooks/use-system-options'),
      import('./settings-defaults'),
    ])
  function ChatsTab({ options }: TabPanelProps) {
    const content = getOptionValue(options, defaultContentSettings)
    return getContentSectionContent('chat', content)
  }
  return { default: ChatsTab }
})

const LazyDrawingTab = lazy(async () => {
  const [{ getContentSectionContent }, { getOptionValue }, { defaultContentSettings }] =
    await Promise.all([
      import('./content/section-registry.tsx'),
      import('./hooks/use-system-options'),
      import('./settings-defaults'),
    ])
  function DrawingTab({ options }: TabPanelProps) {
    const content = getOptionValue(options, defaultContentSettings)
    return getContentSectionContent('drawing', content)
  }
  return { default: DrawingTab }
})

const LazyPaymentTab = lazy(async () => {
  const [{ getBillingSectionContent }, { getOptionValue }, { defaultBillingSettings }] =
    await Promise.all([
      import('./billing/section-registry.tsx'),
      import('./hooks/use-system-options'),
      import('./settings-defaults'),
    ])
  function PaymentTab({ options }: TabPanelProps) {
    const billing = getOptionValue(options, defaultBillingSettings)
    return getBillingSectionContent('payment', billing)
  }
  return { default: PaymentTab }
})

const LazyRatioTab = lazy(async () => {
  const [{ RatioSettingsCard }, { getOptionValue }, { defaultBillingSettings }] =
    await Promise.all([
      import('./models/ratio-settings-card'),
      import('./hooks/use-system-options'),
      import('./settings-defaults'),
    ])
  function RatioTab({ options }: TabPanelProps) {
    const billing = getOptionValue(options, defaultBillingSettings)
    return (
      <RatioSettingsCard
        titleKey='Group and model pricing settings'
        descriptionKey='Configure model pricing ratios and tool prices'
        modelDefaults={{
          ModelPrice: billing.ModelPrice,
          ModelRatio: billing.ModelRatio,
          CacheRatio: billing.CacheRatio,
          CreateCacheRatio: billing.CreateCacheRatio,
          CompletionRatio: billing.CompletionRatio,
          ImageRatio: billing.ImageRatio,
          AudioRatio: billing.AudioRatio,
          AudioCompletionRatio: billing.AudioCompletionRatio,
          ExposeRatioEnabled: billing.ExposeRatioEnabled,
          BillingMode: billing['billing_setting.billing_mode'],
          BillingExpr: billing['billing_setting.billing_expr'],
        }}
        groupDefaults={{
          TopupGroupRatio: billing.TopupGroupRatio,
          GroupRatio: billing.GroupRatio,
          UserUsableGroups: billing.UserUsableGroups,
          GroupGroupRatio: billing.GroupGroupRatio,
          AutoGroups: billing.AutoGroups,
          DefaultUseAutoGroup: billing.DefaultUseAutoGroup,
          GroupSpecialUsableGroup:
            billing['group_ratio_setting.group_special_usable_group'],
        }}
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
  return { default: RatioTab }
})

const LazyRateLimitTab = lazy(async () => {
  const [
    { getSecuritySectionContent },
    { getOptionValue },
    { defaultSecuritySettings },
    { normalizeSecuritySettings },
  ] = await Promise.all([
    import('./security/section-registry.tsx'),
    import('./hooks/use-system-options'),
    import('./settings-defaults'),
    import('./utils/normalize-security-settings'),
  ])
  function RateLimitTab({ options }: TabPanelProps) {
    const security = normalizeSecuritySettings(
      getOptionValue(options, defaultSecuritySettings)
    )
    return getSecuritySectionContent('rate-limit', security)
  }
  return { default: RateLimitTab }
})

const LazyModelsTab = lazy(async () => {
  const [{ getModelsSectionContent }, { getOptionValue }, { defaultModelSettings }] =
    await Promise.all([
      import('./models/section-registry.tsx'),
      import('./hooks/use-system-options'),
      import('./settings-defaults'),
    ])
  function ModelsTab({ options }: TabPanelProps) {
    const models = getOptionValue(options, defaultModelSettings)
    return (
      <>
        {getModelsSectionContent('global', models)}
        {getModelsSectionContent('channel-affinity', models)}
        {getModelsSectionContent('gemini', models)}
        {getModelsSectionContent('claude', models)}
        {getModelsSectionContent('grok', models)}
      </>
    )
  }
  return { default: ModelsTab }
})

const LazyModelDeploymentTab = lazy(async () => {
  const [{ getModelsSectionContent }, { getOptionValue }, { defaultModelSettings }] =
    await Promise.all([
      import('./models/section-registry.tsx'),
      import('./hooks/use-system-options'),
      import('./settings-defaults'),
    ])
  function ModelDeploymentTab({ options }: TabPanelProps) {
    const models = getOptionValue(options, defaultModelSettings)
    return getModelsSectionContent('model-deployment', models)
  }
  return { default: ModelDeploymentTab }
})

const LazyPerformanceTab = lazy(async () => {
  const [{ getOperationsSectionContent }, { getOptionValue }, { defaultOperationsSettings }] =
    await Promise.all([
      import('./operations/section-registry.tsx'),
      import('./hooks/use-system-options'),
      import('./settings-defaults'),
    ])
  function PerformanceTab({ options }: TabPanelProps) {
    const operations = getOptionValue(options, defaultOperationsSettings)
    return getOperationsSectionContent(
      'performance',
      operations,
      undefined,
      undefined
    )
  }
  return { default: PerformanceTab }
})

const LazySystemTab = lazy(async () => {
  const [
    { ServerAddressSection },
    { getOperationsSectionContent },
    { getSecuritySectionContent },
    { getAuthSectionContent },
    { getOptionValue },
    {
      defaultSiteSettings,
      defaultAuthSettings,
      defaultOperationsSettings,
      defaultSecuritySettings,
    },
    { normalizeSecuritySettings },
  ] = await Promise.all([
    import('./general/server-address-section'),
    import('./operations/section-registry.tsx'),
    import('./security/section-registry.tsx'),
    import('./auth/section-registry.tsx'),
    import('./hooks/use-system-options'),
    import('./settings-defaults'),
    import('./utils/normalize-security-settings'),
  ])

  function SystemTab({ options }: TabPanelProps) {
    const site = getOptionValue(options, defaultSiteSettings)
    const auth = getOptionValue(options, defaultAuthSettings)
    const operations = getOptionValue(options, defaultOperationsSettings)
    const security = normalizeSecuritySettings(
      getOptionValue(options, defaultSecuritySettings)
    )
    return (
      <>
        <ServerAddressSection defaultValue={site.ServerAddress} />
        {getOperationsSectionContent('worker', operations, undefined, undefined)}
        {getSecuritySectionContent('ssrf', security)}
        {getAuthSectionContent('basic-auth', auth)}
        {getAuthSectionContent('passkey', auth)}
        {getOperationsSectionContent('email', operations, undefined, undefined)}
        {getAuthSectionContent('oauth', auth)}
        {getAuthSectionContent('custom-oauth', auth)}
        {getAuthSectionContent('bot-protection', auth)}
      </>
    )
  }
  return { default: SystemTab }
})

const LazyOtherTab = lazy(async () => {
  const [
    { getSiteSectionContent },
    { getOperationsSectionContent },
    { getOptionValue },
    { defaultSiteSettings, defaultOperationsSettings },
  ] = await Promise.all([
    import('./site/section-registry.tsx'),
    import('./operations/section-registry.tsx'),
    import('./hooks/use-system-options'),
    import('./settings-defaults'),
  ])

  function OtherTab({ options, status }: TabPanelProps) {
    const site = getOptionValue(options, defaultSiteSettings)
    const operations = getOptionValue(options, defaultOperationsSettings)
    return (
      <>
        {getOperationsSectionContent(
          'update-checker',
          operations,
          status?.version,
          status?.startTime
        )}
        {getSiteSectionContent('notice', site)}
        {getSiteSectionContent('system-info', site)}
      </>
    )
  }
  return { default: OtherTab }
})

const TAB_PANELS: Record<
  SettingsTabId,
  React.LazyExoticComponent<(props: TabPanelProps) => ReactNode>
> = {
  operation: LazyOperationTab,
  dashboard: LazyDashboardTab,
  chats: LazyChatsTab,
  drawing: LazyDrawingTab,
  payment: LazyPaymentTab,
  ratio: LazyRatioTab,
  ratelimit: LazyRateLimitTab,
  models: LazyModelsTab,
  'model-deployment': LazyModelDeploymentTab,
  performance: LazyPerformanceTab,
  system: LazySystemTab,
  other: LazyOtherTab,
}

export function renderSettingsTabContent(
  tabId: SettingsTabId,
  options: SystemOption[] | undefined,
  status?: StatusMeta
): ReactNode {
  const Panel = TAB_PANELS[tabId]
  if (!Panel) return null
  return withSuspense(<Panel options={options} status={status} />)
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
