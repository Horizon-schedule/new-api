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
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SettingsTabPage } from '@/features/system-settings/components/settings-tab-page'
import {
  SETTINGS_DEFAULT_TAB,
  SETTINGS_TAB_IDS,
} from '@/features/system-settings/settings-tabs.config'

export const Route = createFileRoute('/_authenticated/system-settings/$tab')({
  beforeLoad: ({ params }) => {
    const validTabs = SETTINGS_TAB_IDS as unknown as string[]
    if (!validTabs.includes(params.tab)) {
      throw redirect({
        to: '/system-settings/$tab',
        params: { tab: SETTINGS_DEFAULT_TAB },
      })
    }
  },
  component: SettingsTabPage,
})
