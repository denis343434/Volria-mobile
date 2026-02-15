import { useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import "../styles/login.css";
import { validateForgotPasswordForm } from "../utils/validation";
import { useI18n, type I18nKey } from "../i18n";
import { AuthLangSelect } from "../components/AuthLangSelect";

export const ForgotPasswordPage: FC = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"email", I18nKey>>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitOk, setSubmitOk] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitOk("");
    setErrors({});

    const validation = validateForgotPasswordForm(email);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSubmitOk(t("auth.forgot.ok.sent"));
    } catch {
      setSubmitError(t("auth.forgot.err.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-header">
            <AuthLangSelect disabled={isLoading} />

            <div className="brand-row">
              <img className="brand-icon" src={iconUrl} alt="Veloria" />
              <div className="brand-name">Veloria</div>
            </div>

            <h2 className="welcome-title">{t("auth.forgot.title")}</h2>
            <p className="login-subtitle">
              {t("auth.forgot.subtitle")}
            </p>
          </div>

          {submitError && (
            <div className="error-banner" role="alert">
              <span className="error-icon" aria-hidden="true">
                !
              </span>
              {submitError}
            </div>
          )}

          {submitOk && (
            <div className="notice-banner" role="status">
              <span className="notice-icon" aria-hidden="true">
                ✓
              </span>
              {submitOk}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="denis@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              disabled={isLoading}
              autoComplete="email"
              inputMode="email"
            />
            {errors.email && <p className="error-message">{t(errors.email)}</p>}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                {t("auth.forgot.loading")}
              </>
            ) : (
              t("auth.forgot.submit")
            )}
          </button>

          <div className="form-footer">
            <p>
              {t("auth.forgot.remembered")} <a href="/" className="signup-link">{t("auth.signup.signIn")}</a>
            </p>
          </div>
        </form>
      </div>

      <div className="login-footer">
        <p className="footer-text">© 2026 CRM Mobile. {t("auth.footer.rights")}</p>
      </div>
    </div>
  );
};
