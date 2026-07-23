import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'

import tr from './locales/tr.json'
import en from './locales/en.json'

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: (callback: (lng: string) => void) => {
    AsyncStorage.getItem('i18nextLng').then((stored) => {
      if (stored) {
        callback(stored)
      } else {
        callback('tr')
      }
    })
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    AsyncStorage.setItem('i18nextLng', lng)
  },
}

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
    },
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
