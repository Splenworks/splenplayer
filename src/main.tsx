import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import React from "react"
import ReactDOM from "react-dom/client"
import { initReactI18next } from "react-i18next"
import App from "./App.tsx"
import cnTranslation from "./assets/translations/cn.json"
import enTranslation from "./assets/translations/en.json"
import esTranslation from "./assets/translations/es.json"
import jaTranslation from "./assets/translations/ja.json"
import koTranslation from "./assets/translations/ko.json"
import "./index.css"
import { FullScreenProvider } from "./providers/FullScreenProvider.tsx"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ko: {
        translation: koTranslation,
      },
      ja: {
        translation: jaTranslation,
      },
      es: {
        translation: esTranslation,
      },
      cn: {
        translation: cnTranslation,
      },
    },
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false,
    },
  })

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FullScreenProvider>
      <App />
    </FullScreenProvider>
  </React.StrictMode>,
)
