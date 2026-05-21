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
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

type LocaleModule = { translation: Record<string, string> }

const localeLoaders = {
  en: () => import('./locales/en.json'),
  zh: () => import('./locales/zh.json'),
  fr: () => import('./locales/fr.json'),
  ru: () => import('./locales/ru.json'),
  ja: () => import('./locales/ja.json'),
  vi: () => import('./locales/vi.json'),
} as const

type LocaleCode = keyof typeof localeLoaders

function normalizeLng(lng: string | undefined): LocaleCode {
  const code = (lng || 'en').split('-')[0]?.toLowerCase()
  return code in localeLoaders ? (code as LocaleCode) : 'en'
}

export async function loadLocale(lng: string) {
  const code = normalizeLng(lng)
  if (i18n.hasResourceBundle(code, 'translation')) return code
  const mod = await localeLoaders[code]()
  const bundle =
    (mod as { default?: LocaleModule }).default ?? (mod as LocaleModule)
  i18n.addResourceBundle(code, 'translation', bundle.translation, true, true)
  return code
}

const initPromise = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {},
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh', 'fr', 'ru', 'ja', 'vi'],
    load: 'languageOnly',
    nsSeparator: false,
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })
  .then(async () => {
    const primary = normalizeLng(i18n.resolvedLanguage || i18n.language)
    await loadLocale(primary)
    if (primary !== 'en') await loadLocale('en')
  })

i18n.on('languageChanged', (lng) => {
  void loadLocale(lng)
})

/** 首屏仅加载当前语言包，避免 6 份 JSON 打进主 bundle */
export async function initI18n() {
  await initPromise
}

export default i18n
