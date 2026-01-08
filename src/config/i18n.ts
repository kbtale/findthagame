import i18n from 'i18next';
// Import the React binding to allow components to use the hook useTranslation().
import { initReactI18next } from 'react-i18next';
// Import the backend plugin to load translation files from the server (public/locales).
import HttpBackend from 'i18next-http-backend';

// Detect browser language and validate against supported languages
const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ru', 'ar'];
const browserLang = navigator.language.split('-')[0];
const detectedLang = supportedLanguages.includes(browserLang) ? browserLang : 'en';

i18n
  // Register the HttpBackend plugin (loads JSON files via fetch).
  .use(HttpBackend)
  // Register the React plugin (connects i18n to React's component tree).
  .use(initReactI18next)
  .init({
    lng: detectedLang,
    fallbackLng: 'en',
    
    debug: false,

    interpolation: {
      // escapeValue: React already escapes values to prevent XSS, so this is disabled here.
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;