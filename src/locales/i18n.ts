import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { localStorageGetItem } from 'src/utils/storage-available';

import { defaultLang } from './config-lang';
import translationEn from './langs/en.json';
import translationNl from './langs/nl.json';
import translationTr from './langs/tr.json';
// import translationCn from './langs/cn.json';
// import translationAr from './langs/ar.json';

// ----------------------------------------------------------------------

const lng = localStorageGetItem('i18nextLng', defaultLang.value);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translations: translationEn },
      nl: { translations: translationNl },
      tr: { translations: translationTr },
      // cn: { translations: translationCn },
      // ar: { translations: translationAr },
    },
    lng,
    fallbackLng: 'nl',
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
