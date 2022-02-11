import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// TODO: consider chunking out translation files
// and using something like XHR backend to lazily
// load only the required language.
// See https://www.i18next.com/how-to/add-or-load-translations

import defaults from './defaults.json';
import cs from './cs/resource.json';
import es from './es/resource.json';
import fr from './fr/resource.json';
import mn from './mn/resource.json';
import ptBR from './pt-br/resource.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ['querystring', 'htmlTag']
    },
    resources: {
      defaults: { translation: defaults },
      cs: { translation: cs },
      es: { translation: es },
      fr: { translation: fr },
      mn: { translation: mn },
      'pt-br': { translation: ptBR }
    },
    fallbackLng: ['defaults'],
    interpolation: {
      prefix: '[[',
      suffix: ']]'
    },
    lowerCaseLng: true
  });

export default i18n;
