import { useMemo, useState, type FC, type FormEvent } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { DatePickerField } from "../components/DatePickerField";
import { MessagesBell } from "../components/MessagesBell";
import { getClientById, updateClient, type ClientLoyalty } from "../utils/clientsStore";
import { useI18n } from "../i18n";
import "../styles/dashboard.css";
import "../styles/clients.css";
import "../styles/clientForm.css";

type Props = {
  clientId: string;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  loyalty: ClientLoyalty;
  birthday: string;
  lastVisit: string;
  tags: string;
  allergies: string;
  preferences: string;
  notes: string;
};

export const EditClientPage: FC<Props> = ({ clientId }) => {
  const { t } = useI18n();
  const client = useMemo(() => getClientById(clientId), [clientId]);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");

  const [form, setForm] = useState<FormState>(() => ({
    name: client?.name ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    loyalty: (client?.loyalty ?? "Не задан") as ClientLoyalty,
    birthday: client?.birthday ?? "",
    lastVisit: client?.lastVisit ?? "",
    tags: client?.tags ?? "",
    allergies: client?.allergies ?? "",
    preferences: client?.preferences ?? "",
    notes: client?.notes ?? "",
  }));

  const canSubmit = useMemo(() => form.name.trim().length >= 2 && !saving, [form.name, saving]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

  const cancel = () => {
    window.location.href = client ? `/clients/${encodeURIComponent(client.id)}` : "/clients";
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErr("");

    const name = form.name.trim();
    if (name.length < 2) {
      setErr(t("clientForm.err.nameTooShort"));
      return;
    }

    if (!client) {
      setErr(t("clientForm.err.notFound"));
      return;
    }

    setSaving(true);
    try {
      const updated = updateClient(client.id, {
        name,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        loyalty: form.loyalty,
        birthday: form.birthday || undefined,
        lastVisit: form.lastVisit || undefined,
        tags: form.tags.trim() || undefined,
        allergies: form.allergies.trim() || undefined,
        preferences: form.preferences.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      if (!updated) {
        setErr(t("clientForm.err.saveFailed"));
        setSaving(false);
        return;
      }
      window.location.href = `/clients/${encodeURIComponent(updated.id)}`;
    } catch {
      setErr(t("clientForm.err.saveFailed"));
      setSaving(false);
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
          <div className="cf-head">
            <div>
              <h1 className="cf-title">{t("clientForm.edit.title")}</h1>
              <div className="cf-sub">{t("clientForm.edit.subtitle")}</div>
            </div>
            <button type="button" className="cf-back" onClick={cancel}>
              <i className="ri-arrow-left-line" aria-hidden="true" /> {t("common.back")}
            </button>
          </div>

          <form className="dash-card cf-card" onSubmit={submit}>
            {!client && <div className="dash-note">{t("clientForm.err.notFound")}</div>}

            {err && (
              <div className="cf-error" role="alert">
                <i className="ri-error-warning-line" aria-hidden="true" /> {err}
              </div>
            )}

            <div className="cf-grid">
              <label className="cf-field">
                <div className="cf-label">{t("clientForm.name")}</div>
                <input
                  className="cf-input"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t("clientForm.namePlaceholder")}
                  autoComplete="name"
                  disabled={!client || saving}
                />
              </label>

              <label className="cf-field">
                <div className="cf-label">{t("clientForm.phone")}</div>
                <input
                  className="cf-input"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+7 ___ ___ ____"
                  autoComplete="tel"
                  inputMode="tel"
                  disabled={!client || saving}
                />
              </label>

              <label className="cf-field">
                <div className="cf-label">{t("clientForm.email")}</div>
                <input
                  className="cf-input"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  inputMode="email"
                  disabled={!client || saving}
                />
              </label>

              <label className="cf-field">
                <div className="cf-label">{t("clientForm.loyalty")}</div>
                <div className="cf-select-wrap">
                  <select className="cf-select" value={form.loyalty} onChange={(e) => update("loyalty", e.target.value as ClientLoyalty)} disabled={!client || saving}>
                    <option value="Не задан">{t("clients.loyalty.unspecified")}</option>
                    <option value="VIP">VIP</option>
                    <option value="Обычный">{t("clients.loyalty.regular")}</option>
                    <option value="Новый">{t("clients.loyalty.new")}</option>
                  </select>
                  <i className="ri-arrow-down-s-line" aria-hidden="true" />
                </div>
              </label>

              <DatePickerField
                label={t("clientForm.birthday")}
                valueYmd={form.birthday}
                onChangeYmd={(v) => update("birthday", v)}
                iconClassName="ri-calendar-line"
              />

              <DatePickerField
                label={t("clientForm.lastVisit")}
                valueYmd={form.lastVisit}
                onChangeYmd={(v) => update("lastVisit", v)}
                iconClassName="ri-calendar-check-line"
              />

              <label className="cf-field cf-field--span">
                <div className="cf-label">{t("clientForm.tags")}</div>
                <textarea className="cf-area" rows={3} value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder={t("clientForm.tagsPlaceholder")} disabled={!client || saving} />
              </label>

              <label className="cf-field cf-field--span">
                <div className="cf-label">{t("clientForm.allergies")}</div>
                <textarea className="cf-area" rows={3} value={form.allergies} onChange={(e) => update("allergies", e.target.value)} placeholder={t("clientForm.allergiesPlaceholder")} disabled={!client || saving} />
              </label>

              <label className="cf-field cf-field--span">
                <div className="cf-label">{t("clientForm.preferences")}</div>
                <textarea className="cf-area" rows={3} value={form.preferences} onChange={(e) => update("preferences", e.target.value)} placeholder={t("clientForm.preferencesPlaceholder")} disabled={!client || saving} />
              </label>

              <label className="cf-field cf-field--span">
                <div className="cf-label">{t("clientForm.notes")}</div>
                <textarea className="cf-area" rows={4} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder={t("clientForm.notesPlaceholder")} disabled={!client || saving} />
              </label>
            </div>

            <div className="cf-actions">
              <button type="button" className="cf-btn cf-btn--muted" onClick={cancel} disabled={saving}>
                {t("common.cancel")}
              </button>
              <button type="submit" className="cf-btn cf-btn--primary" disabled={!client || !canSubmit}>
                {saving ? t("clientForm.saving") : t("clientForm.save")}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};
