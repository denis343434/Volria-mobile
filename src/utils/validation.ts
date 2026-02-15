import type { I18nKey } from "../i18n";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateLoginForm = (
  email: string,
  password: string,
): { valid: boolean; errors: Record<string, I18nKey> } => {
  const errors: Record<string, I18nKey> = {};

  if (!email) {
    errors.email = "validation.emailRequired";
  } else if (!validateEmail(email)) {
    errors.email = "validation.emailInvalid";
  }

  if (!password) {
    errors.password = "validation.passwordRequired";
  } else if (!validatePassword(password)) {
    errors.password = "validation.passwordMin";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSignupForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): { valid: boolean; errors: Record<string, I18nKey> } => {
  const errors: Record<string, I18nKey> = {};

  if (!name.trim()) {
    errors.name = "validation.nameRequired";
  }

  if (!email) {
    errors.email = "validation.emailRequired";
  } else if (!validateEmail(email)) {
    errors.email = "validation.emailInvalid";
  }

  if (!password) {
    errors.password = "validation.passwordRequired";
  } else if (!validatePassword(password)) {
    errors.password = "validation.passwordMin";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "validation.confirmPasswordRequired";
  } else if (password && confirmPassword !== password) {
    errors.confirmPassword = "validation.passwordsNoMatch";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateForgotPasswordForm = (
  email: string,
): { valid: boolean; errors: Record<string, I18nKey> } => {
  const errors: Record<string, I18nKey> = {};

  if (!email) {
    errors.email = "validation.emailRequired";
  } else if (!validateEmail(email)) {
    errors.email = "validation.emailInvalid";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
