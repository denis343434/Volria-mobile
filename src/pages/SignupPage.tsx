import { useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import "../styles/login.css";
import { validateSignupForm } from "../utils/validation";

export const SignupPage: FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

      setSubmitOk("Аккаунт создан. Перенаправляем...");
      window.location.href = "/dashboard";
    } catch {
      setSubmitError("Не удалось создать аккаунт. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
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

            <h2 className="welcome-title">Создать аккаунт</h2>
            <p className="login-subtitle">Заполните данные, чтобы начать приключение</p>
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
              Имя
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? "input-error" : ""}`}
              placeholder="Денис"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              disabled={isLoading}
              autoComplete="name"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
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
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Повторите пароль
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
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                }}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm((v) => !v)}
                disabled={isLoading}
                aria-label={showConfirm ? "Скрыть пароль" : "Показать пароль"}
              >
                <i className={showConfirm ? "ri-eye-line" : "ri-eye-off-line"} aria-hidden="true" />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Создаем...
              </>
            ) : (
              "Создать аккаунт"
            )}
          </button>

          <div className="form-footer">
            <p>
              Уже есть аккаунт? <a href="/" className="signup-link">Войти</a>
            </p>
          </div>
        </form>
      </div>

      <div className="login-footer">
        <p className="footer-text">© 2026 CRM Mobile. All rights reserved.</p>
      </div>
    </div>
  );
};

