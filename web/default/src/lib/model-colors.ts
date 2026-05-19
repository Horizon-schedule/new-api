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
/**
 * Model color palette aligned with web/classic (open-source) dashboard charts.
 */
export const MODEL_CHART_BASE_COLORS = [
  '#1664FF',
  '#1AC6FF',
  '#FF8A00',
  '#3CC780',
  '#7442D4',
  '#FFC400',
  '#304D77',
  '#B48DEB',
  '#009488',
  '#FF7DDA',
] as const

export const MODEL_CHART_EXTENDED_COLORS = [
  '#1664FF',
  '#B2CFFF',
  '#1AC6FF',
  '#94EFFF',
  '#FF8A00',
  '#FFCE7A',
  '#3CC780',
  '#B9EDCD',
  '#7442D4',
  '#DDC5FA',
  '#FFC400',
  '#FAE878',
  '#304D77',
  '#8B959E',
  '#B48DEB',
  '#EFE3FF',
  '#009488',
  '#59BAA8',
  '#FF7DDA',
  '#FFCFEE',
] as const

/** Open-source classic modelColorMap */
export const modelColorMap: Record<string, string> = {
  'dall-e': 'rgb(147,112,219)',
  'dall-e-3': 'rgb(153,50,204)',
  'gpt-3.5-turbo': 'rgb(184,227,167)',
  'gpt-3.5-turbo-0613': 'rgb(60,179,113)',
  'gpt-3.5-turbo-1106': 'rgb(32,178,170)',
  'gpt-3.5-turbo-16k': 'rgb(149,252,206)',
  'gpt-3.5-turbo-16k-0613': 'rgb(119,255,214)',
  'gpt-3.5-turbo-instruct': 'rgb(175,238,238)',
  'gpt-4': 'rgb(135,206,235)',
  'gpt-4-0613': 'rgb(100,149,237)',
  'gpt-4-1106-preview': 'rgb(30,144,255)',
  'gpt-4-0125-preview': 'rgb(2,177,236)',
  'gpt-4-turbo-preview': 'rgb(2,177,255)',
  'gpt-4-32k': 'rgb(104,111,238)',
  'gpt-4-32k-0613': 'rgb(61,71,139)',
  'gpt-4-all': 'rgb(65,105,225)',
  'gpt-4-gizmo-*': 'rgb(0,0,255)',
  'gpt-4-vision-preview': 'rgb(25,25,112)',
  'text-ada-001': 'rgb(255,192,203)',
  'text-babbage-001': 'rgb(255,160,122)',
  'text-curie-001': 'rgb(219,112,147)',
  'text-davinci-003': 'rgb(219,112,147)',
  'text-davinci-edit-001': 'rgb(255,105,180)',
  'text-embedding-ada-002': 'rgb(255,182,193)',
  'text-embedding-v1': 'rgb(255,174,185)',
  'text-moderation-latest': 'rgb(255,130,171)',
  'text-moderation-stable': 'rgb(255,160,122)',
  'tts-1': 'rgb(255,140,0)',
  'tts-1-1106': 'rgb(255,165,0)',
  'tts-1-hd': 'rgb(255,215,0)',
  'tts-1-hd-1106': 'rgb(255,223,0)',
  'whisper-1': 'rgb(245,245,220)',
  'claude-3-opus-20240229': 'rgb(255,132,31)',
  'claude-3-sonnet-20240229': 'rgb(253,135,93)',
  'claude-3-haiku-20240307': 'rgb(255,175,146)',
}

export function modelToColor(modelName: string): string {
  if (modelColorMap[modelName]) {
    return modelColorMap[modelName]
  }

  let hash = 0
  for (let i = 0; i < modelName.length; i++) {
    hash = (hash << 5) - hash + modelName.charCodeAt(i)
    hash &= hash
  }
  hash = Math.abs(hash)

  const palette =
    modelName.length > 10 ? MODEL_CHART_EXTENDED_COLORS : MODEL_CHART_BASE_COLORS
  return palette[hash % palette.length]
}

/** User ranking chart palette — aligned with web/classic useDashboardCharts */
export const USER_CHART_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#6366f1',
  '#14b8a6',
] as const

export function normalizeModelColorKey(displayName: string): string {
  return displayName.trim().toLowerCase().replace(/\s+/g, '-')
}

export function buildModelColorMap(modelNames: string[]): Record<string, string> {
  const colors: Record<string, string> = {}
  for (const name of modelNames) {
    colors[name] = modelToColor(name)
  }
  return colors
}
