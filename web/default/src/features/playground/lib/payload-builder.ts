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
import { MESSAGE_ROLES } from '../constants'
import type {
  ChatCompletionRequest,
  Message,
  PlaygroundConfig,
  ParameterEnabled,
} from '../types'
import {
  buildMessageContent,
  formatMessageForAPI,
  getCurrentVersion,
  isValidMessage,
} from './message-utils'

function applyParameters(
  payload: ChatCompletionRequest,
  config: PlaygroundConfig,
  parameterEnabled: ParameterEnabled
) {
  const parameterKeys: Array<keyof ParameterEnabled> = [
    'temperature',
    'top_p',
    'max_tokens',
    'frequency_penalty',
    'presence_penalty',
    'seed',
  ]

  parameterKeys.forEach((key) => {
    if (!parameterEnabled[key]) return
    const value = config[key as keyof PlaygroundConfig]
    if (value !== undefined && value !== null) {
      ;(payload as unknown as Record<string, unknown>)[key] = value
    }
  })
}

function processMessagesForPayload(
  messages: Message[],
  config: PlaygroundConfig
) {
  const validMessages = messages.filter(isValidMessage)
  const processed = validMessages.map(formatMessageForAPI)

  if (config.imageEnabled && config.imageUrls.some((url) => url.trim())) {
    for (let index = processed.length - 1; index >= 0; index -= 1) {
      if (processed[index].role !== MESSAGE_ROLES.USER) continue
      const text = getCurrentVersion(validMessages[index]).content
      processed[index] = {
        role: MESSAGE_ROLES.USER,
        content: buildMessageContent(text, config.imageUrls),
      }
      break
    }
  }

  return processed
}

/**
 * Build API request payload from messages and config
 */
export function buildChatCompletionPayload(
  messages: Message[],
  config: PlaygroundConfig,
  parameterEnabled: ParameterEnabled
): ChatCompletionRequest {
  const payload: ChatCompletionRequest = {
    model: config.model,
    group: config.group,
    messages: processMessagesForPayload(messages, config),
    stream: config.stream,
  }

  applyParameters(payload, config, parameterEnabled)
  return payload
}

export function buildPreviewPayload(args: {
  messages: Message[]
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  customRequestMode: boolean
  customRequestBody: string
}): ChatCompletionRequest | null {
  const {
    messages,
    config,
    parameterEnabled,
    customRequestMode,
    customRequestBody,
  } = args

  if (customRequestMode && customRequestBody.trim()) {
    try {
      return JSON.parse(customRequestBody) as ChatCompletionRequest
    } catch {
      return null
    }
  }

  try {
    return buildChatCompletionPayload(messages, config, parameterEnabled)
  } catch {
    return null
  }
}
