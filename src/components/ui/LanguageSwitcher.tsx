"use client";

import { useTranslation } from "@/i18n/LanguageContext";

function USFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="14" rx="1" fill="#B22234" />
      <rect y="1.077" width="20" height="1.077" fill="white" />
      <rect y="3.231" width="20" height="1.077" fill="white" />
      <rect y="5.385" width="20" height="1.077" fill="white" />
      <rect y="7.538" width="20" height="1.077" fill="white" />
      <rect y="9.692" width="20" height="1.077" fill="white" />
      <rect y="11.846" width="20" height="1.077" fill="white" />
      <rect width="8" height="7.538" fill="#3C3B6E" />
    </svg>
  );
}

function SpainFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="14" rx="1" fill="#C60B1E" />
      <rect y="3.5" width="20" height="7" fill="#FFC400" />
    </svg>
  );
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setLocale("en")}
        className={`rounded transition-opacity ${
          locale === "en" ? "opacity-100" : "opacity-40 hover:opacity-70"
        }`}
        aria-label="English"
        title="English"
      >
        <USFlag />
      </button>
      <button
        onClick={() => setLocale("es")}
        className={`rounded transition-opacity ${
          locale === "es" ? "opacity-100" : "opacity-40 hover:opacity-70"
        }`}
        aria-label="Español"
        title="Español"
      >
        <SpainFlag />
      </button>
    </div>
  );
}
