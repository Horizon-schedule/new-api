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
import { useCallback, useRef, useState } from 'react'
import {
  DEBUG_TABS,
  DEFAULT_CONFIG,
  DEFAULT_PARAMETER_ENABLED,
  DEFAULT_UI_STATE,
} from '../constants'
import {
  loadMessages,
  loadStoredConfig,
  saveMessages,
  saveStoredConfig,
} from '../lib'
import type {
  DebugTabId,
  Message,
  ParameterEnabled,
  PlaygroundConfig,
  PlaygroundDebugData,
  PlaygroundStoredConfig,
  ModelOption,
  GroupOption,
} from '../types'

const EMPTY_DEBUG_DATA: PlaygroundDebugData = {
  request: null,
  response: null,
  timestamp: null,
  previewRequest: null,
  previewTimestamp: null,
  sseMessages: [],
}

/**
 * Main state management hook for playground
 */
export function usePlaygroundState() {
  const initialStored = useRef(loadStoredConfig()).current

  const [config, setConfig] = useState<PlaygroundConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...initialStored.inputs,
  }))

  const [parameterEnabled, setParameterEnabled] = useState<ParameterEnabled>(
    () => ({
      ...DEFAULT_PARAMETER_ENABLED,
      ...initialStored.parameterEnabled,
    })
  )

  const [showDebugPanel, setShowDebugPanel] = useState(
    initialStored.showDebugPanel ?? DEFAULT_UI_STATE.showDebugPanel
  )
  const [customRequestMode, setCustomRequestMode] = useState(
    initialStored.customRequestMode ?? DEFAULT_UI_STATE.customRequestMode
  )
  const [customRequestBody, setCustomRequestBody] = useState(
    initialStored.customRequestBody ?? DEFAULT_UI_STATE.customRequestBody
  )
  const [showSettings, setShowSettings] = useState(false)

  const [messages, setMessages] = useState<Message[]>(() => loadMessages() || [])
  const [models, setModels] = useState<ModelOption[]>([])
  const [groups, setGroups] = useState<GroupOption[]>([])

  const [debugData, setDebugData] = useState<PlaygroundDebugData>(EMPTY_DEBUG_DATA)
  const [activeDebugTab, setActiveDebugTab] = useState<DebugTabId>(
    DEBUG_TABS.PREVIEW
  )

  const saveConfigTimeoutRef = useRef<number | null>(null)

  const persistConfig = useCallback(
    (next: Partial<PlaygroundStoredConfig>) => {
      const merged: PlaygroundStoredConfig = {
        inputs: next.inputs ?? config,
        parameterEnabled: next.parameterEnabled ?? parameterEnabled,
        showDebugPanel: next.showDebugPanel ?? showDebugPanel,
        customRequestMode: next.customRequestMode ?? customRequestMode,
        customRequestBody: next.customRequestBody ?? customRequestBody,
      }
      saveStoredConfig(merged)
    },
    [
      config,
      parameterEnabled,
      showDebugPanel,
      customRequestMode,
      customRequestBody,
    ]
  )

  const debouncedSaveConfig = useCallback(() => {
    if (saveConfigTimeoutRef.current) {
      window.clearTimeout(saveConfigTimeoutRef.current)
    }
    saveConfigTimeoutRef.current = window.setTimeout(() => {
      persistConfig({})
    }, 300)
  }, [persistConfig])

  const updateConfig = useCallback(
    <K extends keyof PlaygroundConfig>(key: K, value: PlaygroundConfig[K]) => {
      setConfig((prev) => {
        const updated = { ...prev, [key]: value }
        persistConfig({ inputs: updated })
        return updated
      })
    },
    [persistConfig]
  )

  const updateParameterEnabled = useCallback(
    (key: keyof ParameterEnabled, value: boolean) => {
      setParameterEnabled((prev) => {
        const updated = { ...prev, [key]: value }
        persistConfig({ parameterEnabled: updated })
        return updated
      })
    },
    [persistConfig]
  )

  const toggleParameterEnabled = useCallback(
    (key: keyof ParameterEnabled) => {
      setParameterEnabled((prev) => {
        const updated = { ...prev, [key]: !prev[key] }
        persistConfig({ parameterEnabled: updated })
        return updated
      })
    },
    [persistConfig]
  )

  const updateShowDebugPanel = useCallback(
    (value: boolean) => {
      setShowDebugPanel(value)
      persistConfig({ showDebugPanel: value })
    },
    [persistConfig]
  )

  const updateCustomRequestMode = useCallback(
    (value: boolean) => {
      setCustomRequestMode(value)
      persistConfig({ customRequestMode: value })
    },
    [persistConfig]
  )

  const updateCustomRequestBody = useCallback(
    (value: string) => {
      setCustomRequestBody(value)
      persistConfig({ customRequestBody: value })
    },
    [persistConfig]
  )

  const updateMessages = useCallback(
    (updater: Message[] | ((prev: Message[]) => Message[])) => {
      setMessages((prev) => {
        const newMessages =
          typeof updater === 'function' ? updater(prev) : updater
        saveMessages(newMessages)
        return newMessages
      })
    },
    []
  )

  const clearMessages = useCallback(() => {
    updateMessages([])
  }, [updateMessages])

  const handleConfigImport = useCallback(
    (imported: PlaygroundStoredConfig) => {
      setConfig(imported.inputs)
      setParameterEnabled(imported.parameterEnabled)
      setShowDebugPanel(imported.showDebugPanel)
      setCustomRequestMode(imported.customRequestMode)
      setCustomRequestBody(imported.customRequestBody)
      saveStoredConfig(imported)
    },
    []
  )

  const resetConfig = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG })
    setParameterEnabled({ ...DEFAULT_PARAMETER_ENABLED })
    setShowDebugPanel(DEFAULT_UI_STATE.showDebugPanel)
    setCustomRequestMode(DEFAULT_UI_STATE.customRequestMode)
    setCustomRequestBody(DEFAULT_UI_STATE.customRequestBody)
    saveStoredConfig({
      inputs: { ...DEFAULT_CONFIG },
      parameterEnabled: { ...DEFAULT_PARAMETER_ENABLED },
      ...DEFAULT_UI_STATE,
    })
  }, [])

  return {
    config,
    parameterEnabled,
    messages,
    models,
    groups,
    showDebugPanel,
    customRequestMode,
    customRequestBody,
    showSettings,
    debugData,
    activeDebugTab,

    setModels,
    setGroups,
    setShowSettings,
    setDebugData,
    setActiveDebugTab,

    updateConfig,
    updateParameterEnabled,
    toggleParameterEnabled,
    updateShowDebugPanel,
    updateCustomRequestMode,
    updateCustomRequestBody,
    updateMessages,
    clearMessages,
    handleConfigImport,
    resetConfig,
    debouncedSaveConfig,
  }
}
