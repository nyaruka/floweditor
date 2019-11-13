import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// TODO: consider chunking out translation files
// and using something like XHR backend to lazily
// load only the required language.
// See https://www.i18next.com/how-to/add-or-load-translations

import defaults from './defaults.json';
import en from './en/resource.json';
import es from './es/resource.json';

const resources = {
  defaults: { translation: defaults },
  en: { translation: en },
  es: { translation: es }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,

    // do not load a fallback
    fallbackLng: ['en', 'defaults'],

    interpolation: {
      prefix: '[[',
      suffix: ']]'
    }
  });

export default i18n;
