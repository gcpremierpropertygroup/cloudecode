"use client";

import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LanguageContext";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-6xl font-bold text-gold mb-4">404</h1>
        <h2 className="font-serif text-2xl text-white mb-4">{t("notFound.title")}</h2>
        <p className="text-white/50 mb-8 max-w-md mx-auto">
          {t("notFound.message")}
        </p>
        <Button as="a" href="/">
          {t("notFound.backToHome")}
        </Button>
      </div>
    </div>
  );
}
