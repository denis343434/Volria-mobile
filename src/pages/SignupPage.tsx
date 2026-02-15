import { useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import "../styles/login.css";
import { validateSignupForm } from "../utils/validation";
import { useI18n, type I18nKey } from "../i18n";
import { AuthLangSelect } from "../components/AuthLangSelect";

export const SignupPage: FC = () => {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<"name" | "email" | "password" | "confirmPassword", I18nKey>>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [submitOk, setSubmitOk] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitOk("");
    setErrors({});

    const validation = validateSignupForm(name, email, password, confirmPassword);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock registration result
      localStorage.setItem("authToken", "mock-token-" + Date.now());
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);

      setSubmitOk(t("auth.signup.ok.redirect"));
      window.location.href = "/dashboard";
    } catch {
      setSubmitError(t("auth.signup.err.generic"));
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

            <h2 className="welcome-title">{t("auth.signup.title")}</h2>
            <p className="login-subtitle">{t("auth.signup.subtitle")}</p>
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
            <label htmlFor="name" className="form-label">
              {t("auth.signup.name")}
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? "input-error" : ""}`}
              placeholder={t("auth.signup.namePlaceholder")}
              value={name}
              onChange={(e) => {
      setName(e.target.value);
      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
    }}
              disabled={isLoading}
              autoComplete="name"
            />
            {errors.name && <p className="error-message">{t(errors.name)}</p>}
          </div>

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

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t("auth.signup.password")}
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              }}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                aria-label={showPassword ? t("auth.password.hide") : t("auth.password.show")}
              >
                <i className={showPassword ? "ri-eye-line" : "ri-eye-off-line"} aria-hidden="true" />
              </button>
            </div>
            {errors.password && <p className="error-message">{t(errors.password)}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              {t("auth.signup.confirmPassword")}
            </label>
            <div className="password-wrapper">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className={`form-input ${errors.confirmPassword ? "input-error" : ""}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm((v) => !v)}
                disabled={isLoading}
                aria-label={showConfirm ? t("auth.password.hide") : t("auth.password.show")}
              >
                <i className={showConfirm ? "ri-eye-line" : "ri-eye-off-line"} aria-hidden="true" />
              </button>
            </div>
            {errors.confirmPassword && <p className="error-message">{t(errors.confirmPassword)}</p>}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                {t("auth.signup.loading")}
              </>
            ) : (
              t("auth.signup.submit")
            )}
          </button>

          <div className="form-footer">
            <p>
              {t("auth.signup.haveAccount")} <a href="/" className="signup-link">{t("auth.signup.signIn")}</a>
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

