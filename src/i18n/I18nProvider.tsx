import React, { useEffect, useMemo, useState } from "react";
import { DICT, LANG_STORAGE_KEY, type Lang } from "./dict";
import { I18nContext, type I18nValue } from "./context";

function detectInitialLang(): Lang {
  const saved = (localStorage.getItem(LANG_STORAGE_KEY) || "").trim().toLowerCase();
  if (saved === "ru" || saved === "en") return saved;
  const nav = (navigator.language || "").toLowerCase();
  if (nav.startsWith("ru")) return "ru";
  return "en";
}

function interpolate(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m));
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, _setLang] = useState<Lang>(() => detectInitialLang());

  const setLang = (next: Lang) => {
    _setLang(next);
    localStorage.setItem(LANG_STORAGE_KEY, next);
    window.dispatchEvent(new Event("veloria-lang-change"));
  };

  useEffect(() => {
    // Keep <html lang=".."> in sync for a11y and native behaviors.
    document.documentElement.lang = lang;
    // Used for optional CSS tweaks per language if needed.
    document.documentElement.dataset.lang = lang;
  }, [lang]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== LANG_STORAGE_KEY) return;
      const v = (e.newValue || "").trim().toLowerCase();
      if (v === "ru" || v === "en") _setLang(v);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<I18nValue>(() => {
    return {
      lang,
      setLang,
      t: (key, vars) => {
        const base = DICT[lang][key] ?? DICT.en[key] ?? key;
        return interpolate(base, vars);
      },
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
