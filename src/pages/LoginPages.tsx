import { useMemo, useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import "../styles/login.css";
import { validateLoginForm } from "../utils/validation";
import type { LoginCredentials } from "../types/user";

type SocialProvider = "vk" | "yandex" | "gmail";

export const LoginPage: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const providerLabel = useMemo(
    () =>
      ({
        vk: "ВКонтакте",
        yandex: "Яндекс",
        gmail: "Gmail",
      }) satisfies Record<SocialProvider, string>,
    [],
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
      setSubmitError("Не удалось войти. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    setSubmitError("");

    // Stub: wire to real OAuth endpoints when backend is ready.
    setSubmitError(`Вход через ${providerLabel[provider]} пока не подключен.`);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-header">
            <div className="brand-row">
              <img className="brand-icon" src={iconUrl} alt="Veloria" />
              <div className="brand-name">Veloria</div>
            </div>

            <h2 className="welcome-title">Добро пожаловать в Veloria!</h2>
            <p className="login-subtitle">Войдите в свой аккаунт и начните приключение</p>
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
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              disabled={isLoading}
              autoComplete="email"
              inputMode="email"
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль
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
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                <i className={showPassword ? "ri-eye-line" : "ri-eye-off-line"} aria-hidden="true" />
              </button>
            </div>
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <div className="form-remember">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Запомнить меня</span>
            </label>
            <a
              href="/forgot-password"
              className="forgot-password"
            >
              Забыли пароль?
            </a>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Входим...
              </>
            ) : (
              "Войти"
            )}
          </button>

          <div className="form-footer">
            <p>
              Впервые на нашей платформе?{" "}
              <a
                href="/signup"
                className="signup-link"
              >
                Создать аккаунт
              </a>
            </p>
          </div>

          <div className="divider">
            <span>или</span>
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="social-button vk"
              disabled={isLoading}
              onClick={() => handleSocialLogin("vk")}
            >
              <span className="social-badge" aria-hidden="true">
                vk
              </span>
              Войти Через ВКонтакте
            </button>

            <button
              type="button"
              className="social-button yandex"
              disabled={isLoading}
              onClick={() => handleSocialLogin("yandex")}
            >
              <span className="social-badge" aria-hidden="true">
                ✉
              </span>
              Войти Через Яндекс
            </button>

            <button
              type="button"
              className="social-button gmail"
              disabled={isLoading}
              onClick={() => handleSocialLogin("gmail")}
            >
              <span className="social-badge" aria-hidden="true">
                G
              </span>
              Войти Через Gmail
            </button>
          </div>
        </form>
      </div>

      <div className="login-footer">
        <p className="footer-text">© 2026 CRM Mobile. All rights reserved.</p>
      </div>
    </div>
  );
};

