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
import { Link, Outlet, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  SETTINGS_TABS,
  type SettingsTabId,
} from '../settings-tabs.config'
import { SettingsOptionsProvider } from './settings-options-provider'

export function SettingsShell() {
  const { t } = useTranslation()
  const params = useParams({ strict: false })
  const activeTab = (params.tab as SettingsTabId | undefined) ?? 'operation'

  return (
    <SettingsOptionsProvider>
      <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden'>
      <div className='shrink-0'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          {t('System Settings')}
        </h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          {t('Configure system-wide options for your API gateway')}
        </p>
      </div>

      <div className='flex min-h-0 flex-1 gap-6 overflow-hidden'>
        <aside className='bg-card ring-border/60 hidden w-56 shrink-0 flex-col rounded-xl p-2 shadow-sm ring-1 md:flex'>
          <nav className='flex flex-col gap-0.5 overflow-y-auto'>
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <Link
                  key={tab.id}
                  to='/system-settings/$tab'
                  params={{ tab: tab.id }}
                  preload='intent'
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className='size-4 shrink-0' />
                  <span className='leading-snug'>{t(tab.titleKey)}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
          <div className='bg-card ring-border/60 mb-4 flex shrink-0 gap-1 overflow-x-auto rounded-xl p-1 shadow-sm ring-1 md:hidden'>
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <Link
                  key={tab.id}
                  to='/system-settings/$tab'
                  params={{ tab: tab.id }}
                  preload='intent'
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  {t(tab.titleKey)}
                </Link>
              )
            })}
          </div>
          <Outlet />
        </div>
      </div>
      </div>
    </SettingsOptionsProvider>
  )
}
