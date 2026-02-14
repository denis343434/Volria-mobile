import { LoginPage } from "./pages/LoginPages";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { DasboardPage } from "./pages/DasboardPage";
import { CalendarPage } from "./pages/CalendarPage";
import { NewBookingPage } from "./pages/NewBookingPage";
import { ClientsPage } from "./pages/ClientsPage";
import { AddClientPage } from "./pages/AddClientPage";
import { ServicesPage } from "./pages/ServicesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";

export default function App() {
  const path = window.location.pathname;

  if (path === "/signup") return <SignupPage />;
  if (path === "/forgot-password") return <ForgotPasswordPage />;
  if (path === "/calendar") return <CalendarPage />;
  if (path === "/calendar/new") return <NewBookingPage />;
  if (path === "/clients") return <ClientsPage />;
  if (path === "/clients/new") return <AddClientPage />;
  if (path === "/services") return <ServicesPage />;
  if (path === "/settings") return <SettingsPage />;
  if (path === "/analytics") return <AnalyticsPage />;
  if (path === "/dashboard" || path === "/dasboard") return <DasboardPage />;

  return <LoginPage />;
}
