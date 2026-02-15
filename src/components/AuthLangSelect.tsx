import { useId, type FC } from "react";
import { useI18n, type Lang } from "../i18n";

export const AuthLangSelect: FC<{ disabled?: boolean }> = ({ disabled }) => {
  const { lang, setLang, t } = useI18n();
  const id = useId();

  const onChange = (v: string) => {
    const next: Lang = v === "ru" ? "ru" : "en";
    setLang(next);
  };

  return (
    <div className="auth-lang">
      <div className="auth-lang-wrap">
        <select
          id={`auth-lang-${id}`}
          className="auth-lang-select"
          value={lang}
          onChange={(e) => onChange(e.target.value)}
          aria-label={t("auth.language")}
          disabled={disabled}
        >
          <option value="ru">{t("lang.ru")}</option>
          <option value="en">{t("lang.en")}</option>
        </select>
        <i className="ri-arrow-down-s-line" aria-hidden="true" />
      </div>
    </div>
  );
};

