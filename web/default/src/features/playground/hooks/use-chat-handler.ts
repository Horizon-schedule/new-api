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
import { useCallback } from 'react'
import { toast } from 'sonner'
import { sendChatCompletion } from '../api'
import { DEBUG_TABS, MESSAGE_STATUS, ERROR_MESSAGES } from '../constants'
import {
  buildChatCompletionPayload,
  updateAssistantMessageWithError,
  updateLastAssistantMessage,
  processStreamingContent,
  finalizeMessage,
} from '../lib'
import type {
  ChatCompletionRequest,
  Message,
  PlaygroundConfig,
  ParameterEnabled,
  PlaygroundDebugData,
  DebugTabId,
} from '../types'
import { useStreamRequest } from './use-stream-request'

interface UseChatHandlerOptions {
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  customRequestMode: boolean
  customRequestBody: string
  onMessageUpdate: (updater: (prev: Message[]) => Message[]) => void
  onDebugUpdate: (
    updater: (prev: PlaygroundDebugData) => PlaygroundDebugData
  ) => void
  setActiveDebugTab: (tab: DebugTabId) => void
}

/**
 * Hook for handling chat message sending and receiving
 */
export function useChatHandler({
  config,
  parameterEnabled,
  customRequestMode,
  customRequestBody,
  onMessageUpdate,
  onDebugUpdate,
  setActiveDebugTab,
}: UseChatHandlerOptions) {
  const { sendStreamRequest, stopStream, isStreaming } = useStreamRequest()

  const handleStreamUpdate = useCallback(
    (type: 'reasoning' | 'content', chunk: string) => {
      onMessageUpdate((prev) =>
        updateLastAssistantMessage(prev, (message) => {
          if (message.status === MESSAGE_STATUS.ERROR) return message

          if (type === 'reasoning') {
            return {
              ...message,
              reasoning: {
                content: (message.reasoning?.content || '') + chunk,
                duration: 0,
              },
              isReasoningStreaming: true,
              status: MESSAGE_STATUS.STREAMING,
            }
          }

          return {
            ...processStreamingContent(message, chunk),
            status: MESSAGE_STATUS.STREAMING,
          }
        })
      )
    },
    [onMessageUpdate]
  )

  const handleStreamComplete = useCallback(() => {
    onMessageUpdate((prev) =>
      updateLastAssistantMessage(prev, (message) =>
        message.status === MESSAGE_STATUS.COMPLETE ||
        message.status === MESSAGE_STATUS.ERROR
          ? message
          : { ...finalizeMessage(message), status: MESSAGE_STATUS.COMPLETE }
      )
    )
  }, [onMessageUpdate])

  const handleStreamError = useCallback(
    (error: string, errorCode?: string) => {
      toast.error(error)
      onMessageUpdate((prev) =>
        updateAssistantMessageWithError(prev, error, errorCode)
      )
    },
    [onMessageUpdate]
  )

  const resolvePayload = useCallback(
    (messages: Message[]): ChatCompletionRequest | null => {
      if (customRequestMode && customRequestBody.trim()) {
        try {
          return JSON.parse(customRequestBody) as ChatCompletionRequest
        } catch {
          toast.error(ERROR_MESSAGES.JSON_PARSE_ERROR)
          return null
        }
      }
      return buildChatCompletionPayload(messages, config, parameterEnabled)
    },
    [config, parameterEnabled, customRequestMode, customRequestBody]
  )

  const sendStreamingChat = useCallback(
    (messages: Message[]) => {
      const payload = resolvePayload(messages)
      if (!payload) return

      setActiveDebugTab(DEBUG_TABS.REQUEST)
      sendStreamRequest(payload, {
        onUpdate: handleStreamUpdate,
        onComplete: handleStreamComplete,
        onError: handleStreamError,
        onDebug: ({ request, sseMessages, response }) => {
          onDebugUpdate((prev) => ({
            ...prev,
            request,
            response,
            sseMessages,
            timestamp: new Date().toISOString(),
          }))
        },
      })
    },
    [
      resolvePayload,
      sendStreamRequest,
      handleStreamUpdate,
      handleStreamComplete,
      handleStreamError,
      onDebugUpdate,
      setActiveDebugTab,
    ]
  )

  const sendNonStreamingChat = useCallback(
    async (messages: Message[]) => {
      const payload = resolvePayload(messages)
      if (!payload) return

      setActiveDebugTab(DEBUG_TABS.REQUEST)
      onDebugUpdate((prev) => ({
        ...prev,
        request: JSON.stringify(payload, null, 2),
        timestamp: new Date().toISOString(),
      }))

      try {
        const response = await sendChatCompletion(payload)
        onDebugUpdate((prev) => ({
          ...prev,
          response: JSON.stringify(response, null, 2),
          sseMessages: [],
          timestamp: new Date().toISOString(),
        }))

        const choice = response.choices?.[0]
        if (!choice) return

        onMessageUpdate((prev) =>
          updateLastAssistantMessage(prev, (message) => ({
            ...finalizeMessage(
              {
                ...message,
                versions: [
                  {
                    ...message.versions[0],
                    content: choice.message?.content || '',
                  },
                ],
              },
              choice.message?.reasoning_content
            ),
            status: MESSAGE_STATUS.COMPLETE,
          }))
        )
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: { message?: string; error?: { code?: string } }
          }
          message?: string
        }
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          ERROR_MESSAGES.API_REQUEST_ERROR
        onDebugUpdate((prev) => ({
          ...prev,
          response: errorMessage,
          timestamp: new Date().toISOString(),
        }))
        handleStreamError(
          errorMessage,
          err?.response?.data?.error?.code || undefined
        )
      }
    },
    [
      resolvePayload,
      onDebugUpdate,
      onMessageUpdate,
      handleStreamError,
      setActiveDebugTab,
    ]
  )

  const sendChat = useCallback(
    (messages: Message[]) => {
      const payload = resolvePayload(messages)
      if (!payload) return

      const useStream =
        customRequestMode && customRequestBody.trim()
          ? payload.stream !== false
          : config.stream

      if (useStream) {
        sendStreamingChat(messages)
      } else {
        void sendNonStreamingChat(messages)
      }
    },
    [
      resolvePayload,
      customRequestMode,
      customRequestBody,
      config.stream,
      sendStreamingChat,
      sendNonStreamingChat,
    ]
  )

  const stopGeneration = useCallback(() => {
    stopStream()
    onMessageUpdate((prev) =>
      updateLastAssistantMessage(prev, (message) =>
        message.status === MESSAGE_STATUS.LOADING ||
        message.status === MESSAGE_STATUS.STREAMING
          ? { ...finalizeMessage(message), status: MESSAGE_STATUS.COMPLETE }
          : message
      )
    )
  }, [stopStream, onMessageUpdate])

  return {
    sendChat,
    stopGeneration,
    isGenerating: isStreaming,
  }
}
