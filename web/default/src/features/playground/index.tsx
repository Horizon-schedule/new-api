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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, EyeOff, MessageSquare, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { getUserModels, getUserGroups } from './api'
import { PlaygroundChat } from './components/playground-chat'
import { PlaygroundDebugPanel } from './components/playground-debug-panel'
import { PlaygroundInput } from './components/playground-input'
import { PlaygroundSettingsPanel } from './components/playground-settings-panel'
import { ERROR_MESSAGES } from './constants'
import { usePlaygroundState, useChatHandler } from './hooks'
import {
  buildMessageContent,
  buildPreviewPayload,
  createUserMessage,
  createLoadingAssistantMessage,
} from './lib'
import type { ChatCompletionRequest, Message as MessageType } from './types'

export function Playground() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  const {
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
    toggleParameterEnabled,
    updateShowDebugPanel,
    updateCustomRequestMode,
    updateCustomRequestBody,
    updateMessages,
    handleConfigImport,
    resetConfig,
    debouncedSaveConfig,
  } = usePlaygroundState()

  const { sendChat, stopGeneration, isGenerating } = useChatHandler({
    config,
    parameterEnabled,
    customRequestMode,
    customRequestBody,
    onMessageUpdate: updateMessages,
    onDebugUpdate: setDebugData,
    setActiveDebugTab,
  })

  const [editingMessageKey, setEditingMessageKey] = useState<string | null>(
    null
  )

  const { data: modelsData, isLoading: isLoadingModels } = useQuery({
    queryKey: ['playground-models'],
    queryFn: getUserModels,
  })

  const { data: groupsData } = useQuery({
    queryKey: ['playground-groups'],
    queryFn: getUserGroups,
  })

  useEffect(() => {
    if (!modelsData) return
    setModels(modelsData)
    const isCurrentModelValid = modelsData.some((m) => m.value === config.model)
    if (modelsData.length > 0 && !isCurrentModelValid) {
      updateConfig('model', modelsData[0].value)
    }
  }, [modelsData, config.model, setModels, updateConfig])

  useEffect(() => {
    if (!groupsData) return
    setGroups(groupsData)
    const hasCurrentGroup = groupsData.some((g) => g.value === config.group)
    if (!hasCurrentGroup && groupsData.length > 0) {
      const fallback =
        groupsData.find((g) => g.value === 'default')?.value ??
        groupsData[0].value
      updateConfig('group', fallback)
    }
  }, [groupsData, setGroups, config.group, updateConfig])

  const previewPayload = useMemo<ChatCompletionRequest | null>(
    () =>
      buildPreviewPayload({
        messages,
        config,
        parameterEnabled,
        customRequestMode,
        customRequestBody,
      }),
    [messages, config, parameterEnabled, customRequestMode, customRequestBody]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebugData((prev) => ({
        ...prev,
        previewRequest: previewPayload
          ? JSON.stringify(previewPayload, null, 2)
          : null,
        previewTimestamp: previewPayload ? new Date().toISOString() : null,
      }))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [previewPayload, setDebugData])

  useEffect(() => {
    debouncedSaveConfig()
  }, [
    config,
    parameterEnabled,
    showDebugPanel,
    customRequestMode,
    customRequestBody,
    debouncedSaveConfig,
  ])

  const handleSendMessage = (text: string) => {
    if (customRequestMode && customRequestBody.trim()) {
      try {
        JSON.parse(customRequestBody)
      } catch {
        toast.error(ERROR_MESSAGES.JSON_PARSE_ERROR)
        return
      }
    }

    const content =
      config.imageEnabled && config.imageUrls.some((url) => url.trim())
        ? buildMessageContent(text, config.imageUrls)
        : text

    const userMessage = createUserMessage(
      typeof content === 'string' ? content : text
    )
    if (typeof content !== 'string') {
      userMessage.versions[0].content = text
    }

    const assistantMessage = createLoadingAssistantMessage()
    const newMessages = [...messages, userMessage, assistantMessage]
    updateMessages(newMessages)
    sendChat(newMessages)

    if (config.imageEnabled) {
      window.setTimeout(() => updateConfig('imageEnabled', false), 100)
    }
  }

  const handleCopyMessage = (message: MessageType) => {
    // eslint-disable-next-line no-console
    console.log('Message copied:', message.key)
  }

  const handleRegenerateMessage = (message: MessageType) => {
    const messageIndex = messages.findIndex((m) => m.key === message.key)
    if (messageIndex === -1) return
    const messagesUpToHere = messages.slice(0, messageIndex)
    const loadingMessage = createLoadingAssistantMessage()
    const newMessages = [...messagesUpToHere, loadingMessage]
    updateMessages(newMessages)
    sendChat(newMessages)
  }

  const handleEditMessage = useCallback((message: MessageType) => {
    setEditingMessageKey(message.key)
  }, [])

  const handleEditOpenChange = useCallback((open: boolean) => {
    if (!open) setEditingMessageKey(null)
  }, [])

  const applyEdit = useCallback(
    (newContent: string, submit: boolean) => {
      if (!editingMessageKey) return
      const index = messages.findIndex((m) => m.key === editingMessageKey)
      if (index === -1) return

      const updated = messages.map((m) =>
        m.key === editingMessageKey
          ? { ...m, versions: [{ ...m.versions[0], content: newContent }] }
          : m
      )

      setEditingMessageKey(null)

      if (!submit || updated[index].from !== 'user') {
        updateMessages(updated)
        return
      }

      const toSubmit = [
        ...updated.slice(0, index + 1),
        createLoadingAssistantMessage(),
      ]
      updateMessages(toSubmit)
      sendChat(toSubmit)
    },
    [editingMessageKey, messages, updateMessages, sendChat]
  )

  const handleDeleteMessage = (message: MessageType) => {
    updateMessages(messages.filter((m) => m.key !== message.key))
  }

  const chatColumn = (
    <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
      <div className='from-primary/90 to-primary/70 hidden shrink-0 bg-gradient-to-r px-4 py-3 md:block'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='bg-background/20 flex size-10 items-center justify-center rounded-full backdrop-blur'>
              <MessageSquare className='size-5 text-white' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-white'>
                {t('AI chat')}
              </h2>
              <p className='text-xs text-white/80'>
                {config.model || t('Select a model to start chatting')}
              </p>
            </div>
          </div>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            className='bg-background/15 text-white hover:bg-background/25'
            onClick={() => updateShowDebugPanel(!showDebugPanel)}
          >
            {showDebugPanel ? (
              <EyeOff data-icon='inline-start' />
            ) : (
              <Eye data-icon='inline-start' />
            )}
            {showDebugPanel ? t('Hide debug') : t('Show debug')}
          </Button>
        </div>
      </div>

      <div className='flex flex-1 flex-col overflow-hidden'>
        <PlaygroundChat
          messages={messages}
          onCopyMessage={handleCopyMessage}
          onRegenerateMessage={handleRegenerateMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          isGenerating={isGenerating}
          editingKey={editingMessageKey}
          onCancelEdit={handleEditOpenChange}
          onSaveEdit={(newContent) => applyEdit(newContent, false)}
          onSaveEditAndSubmit={(newContent) => applyEdit(newContent, true)}
        />
      </div>

      <div className='mx-auto w-full max-w-4xl shrink-0'>
        <PlaygroundInput
          disabled={isGenerating}
          groups={groups}
          groupValue={config.group}
          isGenerating={isGenerating}
          isModelLoading={isLoadingModels}
          modelValue={config.model}
          models={models}
          onGroupChange={(value) => updateConfig('group', value)}
          onModelChange={(value) => updateConfig('model', value)}
          onStop={stopGeneration}
          onSubmit={handleSendMessage}
        />
      </div>
    </div>
  )

  return (
    <div className='relative flex size-full overflow-hidden'>
      {!isMobile ? (
        <aside className='hidden w-80 shrink-0 md:block'>
          <PlaygroundSettingsPanel
            config={config}
            parameterEnabled={parameterEnabled}
            models={models}
            groups={groups}
            messages={messages}
            customRequestMode={customRequestMode}
            customRequestBody={customRequestBody}
            previewPayload={previewPayload}
            showDebugPanel={showDebugPanel}
            onConfigChange={updateConfig}
            onParameterToggle={toggleParameterEnabled}
            onCustomRequestModeChange={updateCustomRequestMode}
            onCustomRequestBodyChange={updateCustomRequestBody}
            onConfigImport={handleConfigImport}
            onConfigReset={resetConfig}
          />
        </aside>
      ) : null}

      {chatColumn}

      {!isMobile && showDebugPanel ? (
        <aside className='hidden w-96 shrink-0 xl:block'>
          <PlaygroundDebugPanel
            debugData={debugData}
            activeTab={activeDebugTab}
            customRequestMode={customRequestMode}
            onActiveTabChange={setActiveDebugTab}
          />
        </aside>
      ) : null}

      {isMobile ? (
        <>
          <div className='pointer-events-none fixed right-4 bottom-24 z-40 flex flex-col gap-2'>
            <Button
              type='button'
              size='icon'
              className='pointer-events-auto size-11 rounded-full shadow-lg'
              onClick={() => setShowSettings(true)}
            >
              <Settings className='size-5' />
            </Button>
            <Button
              type='button'
              size='icon'
              variant='secondary'
              className='pointer-events-auto size-11 rounded-full shadow-lg'
              onClick={() => updateShowDebugPanel(!showDebugPanel)}
            >
              {showDebugPanel ? (
                <EyeOff className='size-5' />
              ) : (
                <Eye className='size-5' />
              )}
            </Button>
          </div>

          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetContent side='left' className='w-full max-w-sm p-0'>
              <PlaygroundSettingsPanel
                config={config}
                parameterEnabled={parameterEnabled}
                models={models}
                groups={groups}
                messages={messages}
                customRequestMode={customRequestMode}
                customRequestBody={customRequestBody}
                previewPayload={previewPayload}
                showDebugPanel={showDebugPanel}
                onConfigChange={updateConfig}
                onParameterToggle={toggleParameterEnabled}
                onCustomRequestModeChange={updateCustomRequestMode}
                onCustomRequestBodyChange={updateCustomRequestBody}
                onConfigImport={handleConfigImport}
                onConfigReset={resetConfig}
                onClose={() => setShowSettings(false)}
                className='border-0'
              />
            </SheetContent>
          </Sheet>

          <Sheet open={showDebugPanel} onOpenChange={updateShowDebugPanel}>
            <SheetContent side='right' className='w-full max-w-md p-0'>
              <PlaygroundDebugPanel
                debugData={debugData}
                activeTab={activeDebugTab}
                customRequestMode={customRequestMode}
                onActiveTabChange={setActiveDebugTab}
                onClose={() => updateShowDebugPanel(false)}
                className='border-0'
              />
            </SheetContent>
          </Sheet>
        </>
      ) : null}
    </div>
  )
}
