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
  DEFAULT_CONFIG,
  DEFAULT_PARAMETER_ENABLED,
  DEFAULT_UI_STATE,
  STORAGE_KEYS,
} from '../constants'
import type {
  Message,
  ParameterEnabled,
  PlaygroundConfig,
  PlaygroundStoredConfig,
} from '../types'
import { sanitizeMessagesOnLoad } from './message-utils'

function mergeStoredConfig(parsed: Partial<PlaygroundStoredConfig> & Record<string, unknown>): PlaygroundStoredConfig {
  const parsedMaxTokens = parseInt(String(parsed?.inputs?.max_tokens ?? ''), 10)

  // Legacy flat config (pre side-panel refactor)
  if (!parsed.inputs && 'model' in parsed) {
    const legacy = parsed as unknown as PlaygroundConfig
    return {
      inputs: { ...DEFAULT_CONFIG, ...legacy },
      parameterEnabled: DEFAULT_PARAMETER_ENABLED,
      showDebugPanel: DEFAULT_UI_STATE.showDebugPanel,
      customRequestMode: DEFAULT_UI_STATE.customRequestMode,
      customRequestBody: DEFAULT_UI_STATE.customRequestBody,
    }
  }

  return {
    inputs: {
      ...DEFAULT_CONFIG,
      ...parsed.inputs,
      max_tokens: Number.isNaN(parsedMaxTokens)
        ? (parsed.inputs?.max_tokens ?? DEFAULT_CONFIG.max_tokens)
        : parsedMaxTokens,
      imageUrls: parsed.inputs?.imageUrls?.length
        ? parsed.inputs.imageUrls
        : DEFAULT_CONFIG.imageUrls,
    },
    parameterEnabled: {
      ...DEFAULT_PARAMETER_ENABLED,
      ...parsed.parameterEnabled,
    },
    showDebugPanel:
      parsed.showDebugPanel ?? DEFAULT_UI_STATE.showDebugPanel,
    customRequestMode:
      parsed.customRequestMode ?? DEFAULT_UI_STATE.customRequestMode,
    customRequestBody:
      parsed.customRequestBody ?? DEFAULT_UI_STATE.customRequestBody,
    timestamp: parsed.timestamp,
  }
}

export function loadStoredConfig(): PlaygroundStoredConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG)
    if (saved) {
      return mergeStoredConfig(JSON.parse(saved) as PlaygroundStoredConfig)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load config:', error)
  }

  return {
    inputs: { ...DEFAULT_CONFIG },
    parameterEnabled: { ...DEFAULT_PARAMETER_ENABLED },
    ...DEFAULT_UI_STATE,
  }
}

export function saveStoredConfig(config: PlaygroundStoredConfig): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.CONFIG,
      JSON.stringify({
        ...config,
        timestamp: new Date().toISOString(),
      })
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save config:', error)
  }
}

/** @deprecated Use loadStoredConfig */
export function loadConfig(): Partial<PlaygroundConfig> {
  return loadStoredConfig().inputs
}

/** @deprecated Use saveStoredConfig */
export function saveConfig(config: Partial<PlaygroundConfig>): void {
  const current = loadStoredConfig()
  saveStoredConfig({
    ...current,
    inputs: { ...current.inputs, ...config },
  })
}

export function loadParameterEnabled(): Partial<ParameterEnabled> {
  return loadStoredConfig().parameterEnabled
}

export function saveParameterEnabled(
  parameterEnabled: Partial<ParameterEnabled>
): void {
  const current = loadStoredConfig()
  saveStoredConfig({
    ...current,
    parameterEnabled: {
      ...current.parameterEnabled,
      ...parameterEnabled,
    },
  })
}

export function loadMessages(): Message[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      const messages = Array.isArray(parsed)
        ? parsed
        : (parsed as { messages?: Message[] })?.messages
      if (!Array.isArray(messages)) {
        localStorage.removeItem(STORAGE_KEYS.MESSAGES)
        return null
      }
      const sanitized = sanitizeMessagesOnLoad(messages as Message[])
      if (sanitized !== messages) {
        saveMessages(sanitized)
      }
      return sanitized
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load messages:', error)
  }
  return null
}

export function saveMessages(messages: Message[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.MESSAGES,
      JSON.stringify({
        messages,
        timestamp: new Date().toISOString(),
      })
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save messages:', error)
  }
}

export function exportConfigFile(
  config: PlaygroundStoredConfig,
  messages: Message[]
): void {
  const payload = {
    ...config,
    messages,
    exportTimestamp: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `playground-config-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export async function importConfigFile(
  file: File
): Promise<PlaygroundStoredConfig> {
  const text = await file.text()
  const parsed = JSON.parse(text) as PlaygroundStoredConfig & {
    messages?: Message[]
  }
  return mergeStoredConfig(parsed)
}

export function getConfigTimestamp(): string | null {
  return loadStoredConfig().timestamp ?? null
}

export function clearPlaygroundData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONFIG)
    localStorage.removeItem(STORAGE_KEYS.PARAMETER_ENABLED)
    localStorage.removeItem(STORAGE_KEYS.MESSAGES)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to clear playground data:', error)
  }
}
