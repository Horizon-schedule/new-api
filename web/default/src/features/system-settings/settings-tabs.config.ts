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
  Activity,
  Calculator,
  Cog,
  CreditCard,
  Gauge,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Server,
  Settings,
  Shapes,
  type LucideIcon,
} from 'lucide-react'

/** Top-level settings tabs aligned with web/classic Setting page */
export const SETTINGS_TABS = [
  {
    id: 'operation',
    titleKey: 'Operation settings',
    icon: Settings,
  },
  {
    id: 'dashboard',
    titleKey: 'Dashboard settings',
    icon: LayoutDashboard,
  },
  {
    id: 'chats',
    titleKey: 'Chat settings',
    icon: MessageSquare,
  },
  {
    id: 'drawing',
    titleKey: 'Drawing settings',
    icon: Palette,
  },
  {
    id: 'payment',
    titleKey: 'Payment settings',
    icon: CreditCard,
  },
  {
    id: 'ratio',
    titleKey: 'Group and model pricing settings',
    icon: Calculator,
  },
  {
    id: 'ratelimit',
    titleKey: 'Rate limit settings',
    icon: Gauge,
  },
  {
    id: 'model-settings',
    titleKey: 'Model settings',
    icon: Shapes,
  },
  {
    id: 'model-deployment',
    titleKey: 'Model deployment settings',
    icon: Server,
  },
  {
    id: 'performance',
    titleKey: 'Performance settings',
    icon: Activity,
  },
  {
    id: 'system',
    titleKey: 'System settings',
    icon: Cog,
  },
  {
    id: 'other',
    titleKey: 'Other settings',
    icon: MoreHorizontal,
  },
] as const satisfies ReadonlyArray<{
  id: string
  titleKey: string
  icon: LucideIcon
}>

export type SettingsTabId = (typeof SETTINGS_TABS)[number]['id']

export const SETTINGS_TAB_IDS = SETTINGS_TABS.map((tab) => tab.id) as [
  SettingsTabId,
  ...SettingsTabId[],
]

export const SETTINGS_DEFAULT_TAB: SettingsTabId = 'operation'
