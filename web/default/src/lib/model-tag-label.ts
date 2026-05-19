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
import type { TFunction } from 'i18next'

/** English tag slug -> i18n key (English source string) */
const TAG_I18N_KEYS: Record<string, string> = {
  files: 'Model tag files',
  file: 'Model tag file',
  open: 'Model tag open',
  reasoning: 'Model tag reasoning',
  tools: 'Model tag tools',
  vision: 'Model tag vision',
  weights: 'Model tag weights',
  multimodal: 'Model tag multimodal',
  thinking: 'Model tag thinking',
  streaming: 'Model tag streaming',
  embedding: 'Model tag embedding',
  embeddings: 'Model tag embeddings',
  search: 'Model tag search',
  code: 'Model tag code',
  json: 'Model tag json',
  structured: 'Model tag structured',
  function: 'Model tag function',
  'function-calling': 'Model tag function calling',
  audio: 'Model tag audio',
  video: 'Model tag video',
  text: 'Model tag text',
  image: 'Model tag image',
  document: 'Model tag document',
  pdf: 'Model tag pdf',
}

/**
 * Display label for model capability / context tags.
 * Word tags are translated; numeric context sizes (e.g. 128k) keep digits and use localized unit suffix.
 */
export function formatModelTagLabel(tag: string, t: TFunction): string {
  const trimmed = tag.trim()
  if (!trimmed) return tag

  const lower = trimmed.toLowerCase()
  const i18nKey = TAG_I18N_KEYS[lower]
  if (i18nKey) return t(i18nKey)

  const ctxMatch = trimmed.match(/^([\d.]+)\s*([kmb])$/i)
  if (ctxMatch) {
    const num = ctxMatch[1]
    const unit = ctxMatch[2].toLowerCase()
    if (unit === 'k') return t('Model tag context K', { value: num })
    if (unit === 'm') return t('Model tag context M', { value: num })
    if (unit === 'b') return t('Model tag context B', { value: num })
  }

  return trimmed
}
