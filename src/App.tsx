import { LoginPage } from "./pages/LoginPages";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { DasboardPage } from "./pages/DasboardPage";
import { CalendarPage } from "./pages/CalendarPage";
import { NewBookingPage } from "./pages/NewBookingPage";
import { ClientsPage } from "./pages/ClientsPage";
import { AddClientPage } from "./pages/AddClientPage";
import { ClientDetailsPage } from "./pages/ClientDetailsPage";
import { EditClientPage } from "./pages/EditClientPage";
import { ServicesPage } from "./pages/ServicesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";

export default function App() {
  const path = window.location.pathname;

  if (path === "/signup") return <SignupPage />;
  if (path === "/forgot-password") return <ForgotPasswordPage />;
  if (path === "/calendar") return <CalendarPage />;
  if (path === "/calendar/new") return <NewBookingPage />;
  if (path === "/clients") return <ClientsPage />;
  if (path === "/clients/new") return <AddClientPage />;

  const mClientEdit = path.match(/^\/clients\/([^/]+)\/edit$/);
  if (mClientEdit) return <EditClientPage clientId={decodeURIComponent(mClientEdit[1])} />;

  const mClientView = path.match(/^\/clients\/([^/]+)$/);
  if (mClientView) return <ClientDetailsPage clientId={decodeURIComponent(mClientView[1])} />;

  if (path === "/services") return <ServicesPage />;
  if (path === "/settings") return <SettingsPage />;
  if (path === "/subscription") return <SubscriptionPage />;
  if (path === "/analytics") return <AnalyticsPage />;
  if (path === "/dashboard" || path === "/dasboard") return <DasboardPage />;

  return <LoginPage />;
}
