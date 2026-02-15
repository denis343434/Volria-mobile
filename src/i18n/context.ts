import { createContext } from "react";
import type { I18nKey, Lang } from "./dict";

export type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: I18nKey, vars?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nValue | null>(null);

