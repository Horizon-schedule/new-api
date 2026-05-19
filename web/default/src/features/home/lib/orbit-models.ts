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
*/

/** 首页轨道展示：主流模型与厂商（label 为展示名，colorKey 用于配色哈希） */
export interface OrbitModelEntry {
  label: string
  colorKey: string
}

export const ORBIT_MODEL_ENTRIES: OrbitModelEntry[] = [
  { label: 'GPT-4o', colorKey: 'gpt-4o' },
  { label: 'o3', colorKey: 'o3' },
  { label: 'Claude 3.5', colorKey: 'claude-3-5-sonnet' },
  { label: 'Gemini 2.0', colorKey: 'gemini-2.0-flash' },
  { label: 'DeepSeek-V3', colorKey: 'deepseek-chat' },
  { label: 'Llama 3.3', colorKey: 'llama-3.3' },
  { label: 'Mistral', colorKey: 'mistral-large' },
  { label: 'Qwen-Max', colorKey: 'qwen-max' },
  { label: 'GLM-4', colorKey: 'glm-4' },
  { label: '文心一言', colorKey: 'ernie-4.0' },
  { label: '讯飞星火', colorKey: 'spark' },
  { label: 'Grok', colorKey: 'grok-2' },
  { label: 'DALL-E 3', colorKey: 'dall-e-3' },
  { label: 'Sora', colorKey: 'sora' },
  { label: 'Kimi', colorKey: 'moonshot-v1' },
  { label: 'Doubao', colorKey: 'doubao-pro' },
  { label: 'Cohere', colorKey: 'command-r' },
  { label: 'Perplexity', colorKey: 'sonar' },
]

/** 核心功能卡片中的主流厂商标签 */
export const FEATURE_PROVIDER_NAMES = [
  'OpenAI',
  'Anthropic',
  'Google',
  'Meta',
  'DeepSeek',
  'Qwen',
  'Mistral',
  'xAI',
  'Zhipu',
  'Baidu',
  'Moonshot',
  'Cohere',
] as const
