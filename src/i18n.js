import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    supportedLngs: ["en", "ar"],
    fallbackLng: "en",
    load: "languageOnly",            // "en-US" → "en", "ar-SA" → "ar"
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "localyze_lang",
      caches: ["localStorage"],
    },
  });

// Apply dir attribute on language change
const applyDir = (lng) => {
  const base = lng?.split("-")[0] ?? "en";
  const dir = base === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", base);
};

applyDir(i18n.language);
i18n.on("languageChanged", applyDir);

export default i18n;
