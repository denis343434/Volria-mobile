import { useMemo, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { getClientById, removeClient } from "../utils/clientsStore";
import { useI18n } from "../i18n";
import "../styles/dashboard.css";
import "../styles/clients.css";
import "../styles/clientForm.css";

type Props = {
  clientId: string;
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

function telHref(phone: string) {
  const p = phone.trim();
  const plus = p.startsWith("+") ? "+" : "";
  const digits = p.replace(/[^\d]/g, "");
  return `${plus}${digits}`;
}

export const ClientDetailsPage: FC<Props> = ({ clientId }) => {
  const { t } = useI18n();
  const client = useMemo(() => getClientById(clientId), [clientId]);

  const del = () => {
    if (!client) return;
    if (!window.confirm(t("clients.confirmDelete"))) return;
    removeClient(client.id);
    window.location.href = "/clients";
  };

  return (
    <div className="dash-shell clients-shell">
      <aside className="dash-sidebar" aria-label={t("a11y.navigation")}>
        <div className="dash-brand" title="Veloria">
          <img src={iconUrl} className="dash-brand-icon" alt="Veloria" />
        </div>

        <nav className="dash-nav">
          <a className="dash-nav-item" href="/dashboard" title={t("nav.home")}>
            <span className="dash-nav-icon">
              <i className="ri-home-5-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item" href="/calendar" title={t("nav.calendar")}>
            <span className="dash-nav-icon">
              <i className="ri-calendar-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item is-active" href="/clients" aria-current="page" title={t("nav.clients")}>
            <span className="dash-nav-icon">
              <i className="ri-user-3-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item" href="/services" title={t("nav.services")}>
            <span className="dash-nav-icon">
              <i className="ri-service-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item" href="/settings" title={t("nav.settings")}>
            <span className="dash-nav-icon">
              <i className="ri-settings-3-line" aria-hidden="true" />
            </span>
          </a>
        </nav>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar" aria-label={t("a11y.topbar")}>
          <div className="dash-topbar-left" />
          <div className="dash-topbar-right">
            <div className="dash-topbar-actions">
              <MessagesBell />
            </div>
            <AvatarBubble />
          </div>
        </header>

        <section className="dash-content">
          <div className="cf-head">
            <div>
              <h1 className="cf-title">{client?.name ?? t("clientDetails.defaultTitle")}</h1>
              <div className="cf-sub">{t("clientDetails.subtitle")}</div>
            </div>
            <button
              type="button"
              className="cf-back"
              onClick={() => {
                window.location.href = "/clients";
              }}
            >
              <i className="ri-arrow-left-line" aria-hidden="true" /> {t("clientForm.backToList")}
            </button>
          </div>

          {!client ? (
            <div className="dash-card cf-card">
              <div className="dash-note">{t("clientDetails.notFound")}</div>
            </div>
          ) : (
            <div className="clients-list" style={{ padding: 0 }}>
              <div className="clients-item">
                <div className="clients-item-main">
                  <div className="clients-name">
                    <span className="clients-id">{client.id === "1" ? "1" : "•"}</span> {client.name}
                  </div>

                  <div className="clients-meta">
                    {client.phone && (
                      <div className="clients-meta-row">
                        <i className="ri-phone-line" aria-hidden="true" /> {client.phone}
                      </div>
                    )}
                    {client.email && (
                      <div className="clients-meta-row">
                        <i className="ri-mail-line" aria-hidden="true" /> {client.email}
                      </div>
                    )}
                  </div>

                  <div className="clients-small-grid">
                    <div className="clients-small">
                      <div className="clients-small-label">{t("clients.lastVisit")}</div>
                      <div className="clients-small-value">{fmtDate(client.lastVisit)}</div>
                    </div>
                    <div className="clients-small">
                      <div className="clients-small-label">{t("clients.loyalty")}</div>
                      <div className="clients-badge">{client.loyalty ?? "Не задан"}</div>
                    </div>
                  </div>

                  {client.notes && (
                    <div style={{ marginTop: 12 }}>
                      <div className="clients-small-label">{t("clientForm.notes")}</div>
                      <div className="clients-small-value" style={{ marginTop: 6, lineHeight: 1.35 }}>
                        {client.notes}
                      </div>
                    </div>
                  )}
                </div>

                <div className="clients-item-actions" aria-label="Действия">
                  <button type="button" className="clients-ico" title={t("clients.action.booking")} onClick={() => (window.location.href = `/calendar/new?clientId=${encodeURIComponent(client.id)}`)}>
                    <i className="ri-notification-2-line" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="clients-ico"
                    title={client.phone ? t("clients.action.call") : t("clients.action.noPhone")}
                    disabled={!client.phone}
                    onClick={() => {
                      if (!client.phone) return;
                      window.location.href = `tel:${telHref(client.phone)}`;
                    }}
                  >
                    <i className="ri-phone-fill" aria-hidden="true" />
                  </button>
                  <button type="button" className="clients-ico" title={t("clients.action.edit")} onClick={() => (window.location.href = `/clients/${encodeURIComponent(client.id)}/edit`)}>
                    <i className="ri-pencil-line" aria-hidden="true" />
                  </button>
                  <button type="button" className="clients-ico is-danger" title={t("clients.action.delete")} onClick={del}>
                    <i className="ri-delete-bin-6-line" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
