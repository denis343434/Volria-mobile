import { useMemo, useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import "../styles/login.css";
import { validateLoginForm } from "../utils/validation";
import type { LoginCredentials } from "../types/user";
import { useI18n, type I18nKey } from "../i18n";
import { AuthLangSelect } from "../components/AuthLangSelect";

type SocialProvider = "vk" | "yandex" | "gmail";

export const LoginPage: FC = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"email" | "password", I18nKey>>>({});
  const [submitError, setSubmitError] = useState("");

  const providerLabel = useMemo(
    () =>
      ({
        vk: t("auth.provider.vk"),
        yandex: t("auth.provider.yandex"),
        gmail: t("auth.provider.gmail"),
      }) satisfies Record<SocialProvider, string>,
    [t],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    const validation = validateLoginForm(email, password);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const credentials: LoginCredentials = { email, password };
      console.log("Login attempt:", credentials);

      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      // Store mock auth token
      storage.setItem("authToken", "mock-token-" + Date.now());
      storage.setItem("userEmail", email);

      // Avoid stale tokens in the other storage.
      otherStorage.removeItem("authToken");
      otherStorage.removeItem("userEmail");

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch {
      setSubmitError(t("auth.login.err.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    setSubmitError("");

    // Stub: wire to real OAuth endpoints when backend is ready.
    setSubmitError(t("auth.login.social.notConnected", { provider: providerLabel[provider] }));
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

            <h2 className="welcome-title">{t("auth.login.title")}</h2>
            <p className="login-subtitle">{t("auth.login.subtitle")}</p>
          </div>

          {submitError && (
            <div className="error-banner" role="alert">
              <span className="error-icon" aria-hidden="true">
                !
              </span>
              {submitError}
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

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t("auth.login.password")}
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
                autoComplete="current-password"
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

          <div className="form-remember">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>{t("auth.login.remember")}</span>
            </label>
            <a
              href="/forgot-password"
              className="forgot-password"
            >
              {t("auth.login.forgot")}
            </a>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                {t("auth.login.loading")}
              </>
            ) : (
              t("auth.login.submit")
            )}
          </button>

          <div className="form-footer">
            <p>
              {t("auth.login.firstTime")}{" "}
              <a
                href="/signup"
                className="signup-link"
              >
                {t("auth.login.createAccount")}
              </a>
            </p>
          </div>

          <div className="divider">
            <span>{t("auth.login.divider")}</span>
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="social-button vk"
              disabled={isLoading}
              onClick={() => handleSocialLogin("vk")}
            >
              <span className="social-badge" aria-hidden="true">
                <i className="fa-brands fa-vk" aria-hidden="true" />
              </span>
              {t("auth.social.signInWith", { provider: providerLabel.vk })}
            </button>

            <button
              type="button"
              className="social-button yandex"
              disabled={isLoading}
              onClick={() => handleSocialLogin("yandex")}
            >
              <span className="social-badge" aria-hidden="true">
                <i className="fab fa-yandex"></i> 
              </span>
              {t("auth.social.signInWith", { provider: providerLabel.yandex })}
            </button>

            <button
              type="button"
              className="social-button gmail"
              disabled={isLoading}
              onClick={() => handleSocialLogin("gmail")}
            >
              <span className="social-badge" aria-hidden="true">
                <i className="fab fa-google"></i>
              </span>
              {t("auth.social.signInWith", { provider: providerLabel.gmail })}
            </button>
          </div>
        </form>
      </div>

      <div className="login-footer">
        <p className="footer-text">© 2026 CRM Mobile. {t("auth.footer.rights")}</p>
      </div>
    </div>
  );
};
