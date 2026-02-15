import { useEffect, useMemo, useRef, useState, type FC, type FormEvent } from "react";
import { createPortal } from "react-dom";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { addClient, loadClients, removeClient, type ClientRecord } from "../utils/clientsStore";
import { useI18n } from "../i18n";
import "../styles/dashboard.css";
import "../styles/clients.css";
import "../styles/quickCreate.css";

type Loyalty = "all" | "vip" | "regular" | "new";

// Константы для значений лояльности на разных языках
const LOYALTY_VALUES = {
  ru: {
    UNSET: "Не задан",
    VIP: "VIP",
    REGULAR: "Обычный",
    NEW: "Новый",
  },
  en: {
    UNSET: "Unspecified",
    VIP: "VIP",
    REGULAR: "Regular",
    NEW: "New",
  }
} as const;

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

function telHref(phone: string) {
  // Keep leading +, strip everything else except digits.
  const p = phone.trim();
  const plus = p.startsWith("+") ? "+" : "";
  const digits = p.replace(/[^\d]/g, "");
  return `${plus}${digits}`;
}

type QuickForm = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export const ClientsPage: FC = () => {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [loyalty, setLoyalty] = useState<Loyalty>("all");
  const [clients, setClients] = useState<ClientRecord[]>(() => loadClients());

  const [quickOpen, setQuickOpen] = useState(false);
  const [quickErr, setQuickErr] = useState("");
  const [quickSaving, setQuickSaving] = useState(false);
  const [quick, setQuick] = useState<QuickForm>(() => ({ name: "", phone: "", email: "", notes: "" }));
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q);

      const matchesLoyalty =
        loyalty === "all" ||
        (loyalty === "vip" && c.loyalty === LOYALTY_VALUES.ru.VIP) ||
        (loyalty === "regular" && c.loyalty === LOYALTY_VALUES.ru.REGULAR) ||
        (loyalty === "new" && c.loyalty === LOYALTY_VALUES.ru.NEW);

      return matchesQuery && matchesLoyalty;
    });
  }, [clients, loyalty, query]);

  const del = (id: string) => {
    if (!window.confirm(t("clients.confirmDelete"))) return;
    removeClient(id);
    setClients(loadClients());
  };

  const openQuick = () => {
    setQuickErr("");
    setQuickSaving(false);
    setQuick({ name: "", phone: "", email: "", notes: "" });
    setQuickOpen(true);
  };

  const closeQuick = () => {
    if (quickSaving) return;
    setQuickOpen(false);
  };

  useEffect(() => {
    if (!quickOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (quickSaving) return;
      setQuickOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [quickOpen, quickSaving]);

  const submitQuick = (e: FormEvent) => {
    e.preventDefault();
    setQuickErr("");

    const name = quick.name.trim();
    if (name.length < 2) {
      setQuickErr(t("clients.quick.err.nameTooShort"));
      return;
    }

    setQuickSaving(true);
    try {
      addClient({
        name,
        phone: quick.phone.trim() || undefined,
        email: quick.email.trim() || undefined,
        notes: quick.notes.trim() || undefined,
        loyalty: LOYALTY_VALUES[lang].UNSET,
      });
      setClients(loadClients());
      setQuickOpen(false);
    } catch {
      setQuickErr(t("clients.quick.err.createFailed"));
      setQuickSaving(false);
    }
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
          <div className="clients-head">
            <div>
              <h1 className="clients-title">{t("clients.title")}</h1>
              <div className="clients-sub">{t("clients.subtitle")}</div>
            </div>

            <div className="clients-actions">
              <button type="button" className="clients-btn clients-btn--outline" onClick={openQuick}>
                <i className="ri-flashlight-line" aria-hidden="true" /> {t("clients.quickCreate")}
              </button>
              <button
                type="button"
                className="clients-btn clients-btn--primary"
                onClick={() => {
                  window.location.href = "/clients/new";
                }}
              >
                <i className="ri-user-add-line" aria-hidden="true" /> {t("clients.addClient")}
              </button>
            </div>
          </div>

          <div className="dash-card clients-card">
            <div className="clients-toolbar">
              <div className="clients-left">
                <div className="clients-block-title">
                  {t("clients.myClients")} <span className="clients-count">{filtered.length}</span>
                </div>
              </div>

              <div className="clients-filters">
                <label className="clients-field">
                  <div className="clients-field-label">{t("common.search")}</div>
                  <div className="clients-input-wrap">
                    <i className="ri-search-line" aria-hidden="true" />
                    <input
                      className="clients-input"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t("clients.search.placeholder")}
                    />
                  </div>
                </label>

                <label className="clients-field">
                  <div className="clients-field-label">{t("clients.loyalty")}</div>
                  <div className="clients-select-wrap">
                    <select className="clients-select" value={loyalty} onChange={(e) => setLoyalty(e.target.value as Loyalty)}>
                      <option value="all">{t("clients.loyalty.all")}</option>
                      <option value="vip">{t("clients.loyalty.vip")}</option>
                      <option value="regular">{t("clients.loyalty.regular")}</option>
                      <option value="new">{t("clients.loyalty.new")}</option>
                    </select>
                    <i className="ri-arrow-down-s-line" aria-hidden="true" />
                  </div>
                </label>

                <div className="clients-pills" aria-label={t("clients.pills.label")}>
                  <button type="button" className="clients-pill is-active" onClick={() => setLoyalty("all")}>
                    {t("clients.pills.names")}
                  </button>
                  <button
                    type="button"
                    className="clients-pill"
                    onClick={() => {
                      setQuery("");
                      setLoyalty("all");
                    }}
                  >
                    {t("clients.pills.reset")}
                  </button>
                </div>
              </div>
            </div>

            <div className="clients-list">
              {filtered.map((c) => (
                <div className="clients-item" key={c.id}>
                  <div className="clients-item-main">
                    <div className="clients-name">
                      <span className="clients-id">{c.id === "1" ? "1" : "•"}</span> {c.name}
                    </div>

                    <div className="clients-meta">
                      {c.phone && (
                        <div className="clients-meta-row">
                          <i className="ri-phone-line" aria-hidden="true" /> {c.phone}
                        </div>
                      )}
                      {c.email && (
                        <div className="clients-meta-row">
                          <i className="ri-mail-line" aria-hidden="true" /> {c.email}
                        </div>
                      )}
                    </div>

                    <div className="clients-small-grid">
                      <div className="clients-small">
                        <div className="clients-small-label">{t("clients.lastVisit")}</div>
                        <div className="clients-small-value">{fmtDate(c.lastVisit)}</div>
                      </div>
                      <div className="clients-small">
                        <div className="clients-small-label">{t("clients.loyalty")}</div>
                        <div className="clients-badge">
                          {c.loyalty === LOYALTY_VALUES.ru.UNSET ? t("clients.loyalty.unspecified") : 
                           c.loyalty === LOYALTY_VALUES.ru.VIP ? t("clients.loyalty.vip") :
                           c.loyalty === LOYALTY_VALUES.ru.REGULAR ? t("clients.loyalty.regular") :
                           c.loyalty === LOYALTY_VALUES.ru.NEW ? t("clients.loyalty.new") :
                           c.loyalty ?? t("common.notSpecified")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="clients-item-actions" aria-label={t("common.actions")}>
                    <button
                      type="button"
                      className="clients-ico"
                      title={t("clients.action.open")}
                      onClick={() => {
                        window.location.href = `/clients/${encodeURIComponent(c.id)}`;
                      }}
                    >
                      <i className="ri-eye-line" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="clients-ico"
                      title={t("clients.action.booking")}
                      onClick={() => {
                        window.location.href = `/calendar/new?clientId=${encodeURIComponent(c.id)}`;
                      }}
                    >
                      <i className="ri-notification-2-line" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="clients-ico"
                      title={c.phone ? t("clients.action.call") : t("clients.action.noPhone")}
                      disabled={!c.phone}
                      onClick={() => {
                        if (!c.phone) return;
                        window.location.href = `tel:${telHref(c.phone)}`;
                      }}
                    >
                      <i className="ri-phone-fill" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="clients-ico"
                      title={t("common.edit")}
                      onClick={() => {
                        window.location.href = `/clients/${encodeURIComponent(c.id)}/edit`;
                      }}
                    >
                      <i className="ri-pencil-line" aria-hidden="true" />
                    </button>
                    <button type="button" className="clients-ico is-danger" title={t("common.delete")} onClick={() => del(c.id)}>
                      <i className="ri-delete-bin-6-line" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}

              {!filtered.length && <div className="dash-note">{t("clients.emptyFiltered")}</div>}
            </div>

            <div className="clients-footer">
              <div className="clients-footer-text">
                {t("clients.shownOf", { shown: filtered.length, total: clients.length })}
              </div>
              <div className="clients-pager">
                <button type="button" className="clients-page-btn" disabled title={t("clients.pager.prev")}>
                  <i className="ri-arrow-left-s-line" aria-hidden="true" />
                </button>
                <div className="clients-page-num">1</div>
                <button type="button" className="clients-page-btn" disabled title={t("clients.pager.next")}>
                  <i className="ri-arrow-right-s-line" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {quickOpen &&
        createPortal(
          <div
            ref={overlayRef}
            className="qc-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={t("clients.quick.aria")}
            onMouseDown={(e) => {
              if (e.target === overlayRef.current) closeQuick();
            }}
          >
            <div className="qc-modal">
              <div className="qc-top">
                <div>
                  <div className="qc-title">{t("clients.quick.title")}</div>
                  <div className="qc-sub">{t("clients.quick.subtitle")}</div>
                </div>
                <button type="button" className="qc-x" onClick={closeQuick} aria-label={t("common.close")}>
                  <i className="ri-close-line" aria-hidden="true" />
                </button>
              </div>

              {quickErr && (
                <div className="qc-error" role="alert">
                  <i className="ri-error-warning-line" aria-hidden="true" /> {quickErr}
                </div>
              )}

              <form onSubmit={submitQuick}>
                <div className="qc-grid">
                  <label className="qc-field">
                    <div className="qc-label">{t("clients.quick.name")}</div>
                    <input
                      className="qc-input"
                      value={quick.name}
                      onChange={(e) => setQuick((p) => ({ ...p, name: e.target.value }))}
                      placeholder={t("clients.quick.namePlaceholder")}
                      autoFocus
                      autoComplete="name"
                    />
                  </label>

                  <label className="qc-field">
                    <div className="qc-label">{t("clients.quick.phone")}</div>
                    <input
                      className="qc-input"
                      value={quick.phone}
                      onChange={(e) => setQuick((p) => ({ ...p, phone: e.target.value }))}
                      placeholder={t("clients.quick.phonePlaceholder")}
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </label>

                  <label className="qc-field qc-field--span">
                    <div className="qc-label">{t("clients.quick.email")}</div>
                    <input
                      className="qc-input"
                      value={quick.email}
                      onChange={(e) => setQuick((p) => ({ ...p, email: e.target.value }))}
                      placeholder={t("clients.quick.emailPlaceholder")}
                      autoComplete="email"
                      inputMode="email"
                    />
                  </label>

                  <label className="qc-field qc-field--span">
                    <div className="qc-label">{t("clients.quick.notes")}</div>
                    <textarea
                      className="qc-area"
                      rows={4}
                      value={quick.notes}
                      onChange={(e) => setQuick((p) => ({ ...p, notes: e.target.value }))}
                      placeholder={t("clients.quick.notesPlaceholder")}
                    />
                  </label>
                </div>

                <div className="qc-actions">
                  <button type="button" className="qc-btn qc-btn--muted" onClick={closeQuick} disabled={quickSaving}>
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="qc-btn qc-btn--primary"
                    disabled={quickSaving || quick.name.trim().length < 2}
                  >
                    {quickSaving ? t("clients.quick.creating") : t("clients.quick.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};