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
import { createContext, useContext, type ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { useSystemOptions } from '../hooks/use-system-options'
import type { SystemOption } from '../types'

type SystemOptionsQuery = UseQueryResult<
  { success: boolean; data: SystemOption[] },
  Error
>

const SettingsOptionsContext = createContext<SystemOptionsQuery | null>(null)

export function SettingsOptionsProvider(props: { children: ReactNode }) {
  const query = useSystemOptions()

  return (
    <SettingsOptionsContext.Provider value={query}>
      {props.children}
    </SettingsOptionsContext.Provider>
  )
}

export function useSettingsOptionsQuery() {
  const context = useContext(SettingsOptionsContext)
  if (!context) {
    return useSystemOptions()
  }
  return context
}
