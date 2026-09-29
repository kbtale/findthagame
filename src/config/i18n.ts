import i18n from 'i18next';
// Import the React binding to allow components to use the hook useTranslation().
import { initReactI18next } from 'react-i18next';
// Import the backend plugin to load translation files from the server (public/locales).
import HttpBackend from 'i18next-http-backend';

// Detect browser language and validate against supported languages
const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ru', 'ar'];
const storageKey = 'ftg-language';

// Use persisted preference first, then fall back to browser detection
const getInitialLanguage = (): string => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && supportedLanguages.includes(stored)) return stored;
  } catch {
    // localStorage unavailable (e.g. privacy mode)
  }
  const browserLang = navigator.language.split('-')[0];
  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
};

const applyDocumentLanguage = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
};

i18n
  // Register the HttpBackend plugin (loads JSON files via fetch).
  .use(HttpBackend)
  // Register the React plugin (connects i18n to React's component tree).
  .use(initReactI18next)
  .init({
    lng: getInitialLanguage(),
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

// Persist the chosen language and keep <html lang>/dir in sync
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(storageKey, lng);
  } catch {
    // localStorage unavailable
  }
  applyDocumentLanguage(lng);
});

applyDocumentLanguage(i18n.language);

export default i18n;