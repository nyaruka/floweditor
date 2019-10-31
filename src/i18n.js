import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptTranslations from './i18n/pt/resource.json';

const resources = {
  pt: {
    translation: ptTranslations
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt',
  keySeparator: false,
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
