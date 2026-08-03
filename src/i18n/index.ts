import i18n from 'i18next'
import ICU from 'i18next-icu'
import { initReactI18next } from 'react-i18next'

import enUS from '../locales/en-US.json'
import zhCN from '../locales/zh-CN.json'

export const supportedLocales = ['zh-CN', 'en-US'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

export type LocaleMetadata = {
  languageName: string
  shortLabel: string
  sourceLanguage: boolean
}

export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
  'zh-CN': {
    languageName: '简体中文',
    shortLabel: '中文',
    sourceLanguage: false,
  },
  'en-US': {
    languageName: 'English',
    shortLabel: 'EN',
    sourceLanguage: true,
  },
}

const localeStorageKey = 'x4_map_locale'

export function normalizeLocale(value: string | null): SupportedLocale | null {
  if (!value) return null
  const normalized = value.toLowerCase()
  if (normalized === 'zh-cn' || normalized === 'zh_cn' || normalized === 'zh') return 'zh-CN'
  if (normalized === 'en-us' || normalized === 'en_us' || normalized === 'en') return 'en-US'
  return null
}

export function resolveInitialLocale(): SupportedLocale {
  const queryLocale = normalizeLocale(new URLSearchParams(window.location.search).get('lang'))
  if (queryLocale) return queryLocale
  try {
    const storedLocale = normalizeLocale(window.localStorage.getItem(localeStorageKey))
    if (storedLocale) return storedLocale
  } catch {
    // localStorage may be disabled; deterministic Chinese fallback remains available.
  }
  return 'zh-CN'
}

void i18n
  .use(ICU)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS },
    },
    lng: resolveInitialLocale(),
    fallbackLng: 'en-US',
    supportedLngs: [...supportedLocales],
    interpolation: { escapeValue: false },
    returnNull: false,
    initAsync: false,
  })

export function switchLocale(locale: SupportedLocale) {
  try {
    window.localStorage.setItem(localeStorageKey, locale)
  } catch {
    // The URL query remains the persistence fallback when storage is unavailable.
  }
  return i18n.changeLanguage(locale)
}

export default i18n
