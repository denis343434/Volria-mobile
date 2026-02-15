import { useContext } from "react";
import { I18nContext } from "./context";

export function useI18n() {
  const v = useContext(I18nContext);
  if (!v) throw new Error("useI18n must be used within <I18nProvider />");
  return v;
}

