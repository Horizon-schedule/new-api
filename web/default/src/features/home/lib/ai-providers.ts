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

export interface ProviderModel {
  label: string
  colorKey: string
}

export interface HeroAIProvider {
  id: string
  name: string
  /** @lobehub/icons 名称，如 OpenAI.Color */
  icon: string
  colorKey: string
  models: ProviderModel[]
}

/** 首页：Logo 墙 + 模型卡片（每厂商 3 个代表模型） */
export const HERO_AI_PROVIDERS: HeroAIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'OpenAI.Color',
    colorKey: 'gpt-4.1',
    models: [
      { label: 'GPT-4.1', colorKey: 'gpt-4.1' },
      { label: 'o3', colorKey: 'o3' },
      { label: 'o4-mini', colorKey: 'o4-mini' },
    ],
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    icon: 'Midjourney',
    colorKey: 'midjourney',
    models: [
      { label: 'MJ v7', colorKey: 'midjourney' },
      { label: 'MJ v6.1', colorKey: 'midjourney-v6' },
      { label: 'Niji 6', colorKey: 'niji' },
    ],
  },
  {
    id: 'azure',
    name: 'Azure',
    icon: 'AzureAI.Color',
    colorKey: 'gpt-4.1',
    models: [
      { label: 'GPT-4.1', colorKey: 'gpt-4.1' },
      { label: 'o3-mini', colorKey: 'o3-mini' },
      { label: 'o4-mini', colorKey: 'o4-mini' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: 'Claude.Color',
    colorKey: 'claude-3-7-sonnet',
    models: [
      { label: 'Claude 3.7', colorKey: 'claude-3-7-sonnet' },
      { label: 'Claude 3.5', colorKey: 'claude-3-5-sonnet' },
      { label: 'Claude Haiku', colorKey: 'claude-3-5-haiku' },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    icon: 'Gemini.Color',
    colorKey: 'gemini-2.5-pro',
    models: [
      { label: 'Gemini 2.5', colorKey: 'gemini-2.5-pro' },
      { label: 'Gemini 2.0', colorKey: 'gemini-2.0-flash' },
      { label: 'Gemma 3', colorKey: 'gemma-3' },
    ],
  },
  {
    id: 'meta',
    name: 'Meta',
    icon: 'Meta.Color',
    colorKey: 'llama-4',
    models: [
      { label: 'Llama 4', colorKey: 'llama-4' },
      { label: 'Llama 3.3', colorKey: 'llama-3.3' },
      { label: 'Llama 3.2', colorKey: 'llama-3.2' },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    icon: 'Mistral.Color',
    colorKey: 'mistral-large',
    models: [
      { label: 'Large 2', colorKey: 'mistral-large' },
      { label: 'Pixtral', colorKey: 'pixtral-large' },
      { label: 'Codestral', colorKey: 'codestral' },
    ],
  },
  {
    id: 'baidu',
    name: 'Baidu',
    icon: 'Wenxin.Color',
    colorKey: 'ernie-4.5',
    models: [
      { label: 'ERNIE 4.5', colorKey: 'ernie-4.5' },
      { label: 'ERNIE 4.0', colorKey: 'ernie-4.0' },
      { label: 'ERNIE Speed', colorKey: 'ernie-speed' },
    ],
  },
  {
    id: 'alibaba',
    name: 'Qwen',
    icon: 'Qwen.Color',
    colorKey: 'qwen3',
    models: [
      { label: 'Qwen3', colorKey: 'qwen3' },
      { label: 'Qwen-Max', colorKey: 'qwen-max' },
      { label: 'Qwen-Plus', colorKey: 'qwen-plus' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'DeepSeek.Color',
    colorKey: 'deepseek-chat',
    models: [
      { label: 'DeepSeek-V3', colorKey: 'deepseek-chat' },
      { label: 'DeepSeek-R1', colorKey: 'deepseek-reasoner' },
      { label: 'R1-0528', colorKey: 'deepseek-r1-0528' },
    ],
  },
  {
    id: 'moonshot',
    name: 'Moonshot',
    icon: 'Moonshot.Color',
    colorKey: 'kimi-k2',
    models: [
      { label: 'Kimi K2', colorKey: 'kimi-k2' },
      { label: 'Kimi k1.5', colorKey: 'kimi-k1.5' },
      { label: 'Moonshot v1', colorKey: 'moonshot-v1' },
    ],
  },
  {
    id: 'xai',
    name: 'xAI',
    icon: 'Grok.Color',
    colorKey: 'grok-3',
    models: [
      { label: 'Grok-3', colorKey: 'grok-3' },
      { label: 'Grok-2', colorKey: 'grok-2' },
      { label: 'Grok-2 mini', colorKey: 'grok-2-mini' },
    ],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    icon: 'Cohere.Color',
    colorKey: 'command-a',
    models: [
      { label: 'Command A', colorKey: 'command-a' },
      { label: 'Command R+', colorKey: 'command-r-plus' },
      { label: 'Command R', colorKey: 'command-r' },
    ],
  },
  {
    id: 'zhipu',
    name: 'Zhipu',
    icon: 'Zhipu.Color',
    colorKey: 'glm-4-plus',
    models: [
      { label: 'GLM-4-Plus', colorKey: 'glm-4-plus' },
      { label: 'GLM-4', colorKey: 'glm-4' },
      { label: 'GLM-4-Air', colorKey: 'glm-4-air' },
    ],
  },
  {
    id: 'spark',
    name: 'iFlytek',
    icon: 'Spark.Color',
    colorKey: 'spark',
    models: [
      { label: 'Spark Ultra', colorKey: 'spark-ultra' },
      { label: 'Spark Max', colorKey: 'spark' },
      { label: 'Spark Pro', colorKey: 'spark-pro' },
    ],
  },
  {
    id: 'minimax',
    name: 'Minimax',
    icon: 'Minimax.Color',
    colorKey: 'minimax-text-01',
    models: [
      { label: 'Text-01', colorKey: 'minimax-text-01' },
      { label: 'abab7', colorKey: 'abab7' },
      { label: 'Hailuo', colorKey: 'hailuo' },
    ],
  },
  {
    id: 'suno',
    name: 'Suno',
    icon: 'Suno',
    colorKey: 'suno',
    models: [
      { label: 'Suno v4', colorKey: 'suno' },
      { label: 'Suno v3.5', colorKey: 'suno-v3.5' },
      { label: 'Suno v3', colorKey: 'suno-v3' },
    ],
  },
  {
    id: 'doubao',
    name: 'Doubao',
    icon: 'Doubao.Color',
    colorKey: 'doubao-1.5-pro',
    models: [
      { label: 'Doubao 1.5', colorKey: 'doubao-1.5-pro' },
      { label: 'Doubao Pro', colorKey: 'doubao-pro' },
      { label: 'Doubao Lite', colorKey: 'doubao-lite' },
    ],
  },
]

export const HERO_LOGO_PROVIDERS = HERO_AI_PROVIDERS.map((p) => ({
  id: p.id,
  name: p.name,
  icon: p.icon,
}))

/** @deprecated 使用 HERO_AI_PROVIDERS */
export const HERO_FEATURED_PROVIDERS = HERO_AI_PROVIDERS

/** 核心功能卡片中的主流厂商标签 */
export const FEATURE_PROVIDER_NAMES = HERO_AI_PROVIDERS.slice(0, 12).map(
  (p) => p.name
)
