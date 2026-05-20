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
import { redirect } from '@tanstack/react-router'
import {
  LEGACY_SECTION_TO_TAB,
  resolveLegacySettingsPath,
} from './tab-content-registry'
import { SETTINGS_DEFAULT_TAB } from './settings-tabs.config'

export function redirectLegacySettingsSection(
  category: string,
  section: string
) {
  const tab =
    LEGACY_SECTION_TO_TAB[`${category}/${section}`] ?? SETTINGS_DEFAULT_TAB
  throw redirect({
    to: '/system-settings/$tab',
    params: { tab },
  })
}

export function redirectLegacySettingsPathname(pathname: string) {
  const tab = resolveLegacySettingsPath(pathname) ?? SETTINGS_DEFAULT_TAB
  throw redirect({
    to: '/system-settings/$tab',
    params: { tab },
  })
}
