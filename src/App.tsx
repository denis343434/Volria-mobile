import { LoginPage } from "./pages/LoginPages";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";

export default function App() {
  const path = window.location.pathname;

  if (path === "/signup") return <SignupPage />;
  if (path === "/forgot-password") return <ForgotPasswordPage />;
  return <LoginPage />;
}
