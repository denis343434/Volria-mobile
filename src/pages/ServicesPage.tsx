import { useMemo, useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { useI18n, type I18nKey } from "../i18n";
import "../styles/dashboard.css";
import "../styles/services.css";

type Service = {
  id: string;
  name: string;
  durationMin: number;
  priceRub: number;
  description: string;
  active: boolean;
};

const STORAGE_KEY = "services:v1";

function uid() {
  const c = globalThis.crypto as undefined | { randomUUID?: () => string };
  return c?.randomUUID?.() ?? `svc_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function loadServices(): Service[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Service[];
  } catch {
    return [];
  }
}

function saveServices(items: Service[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const ServicesPage: FC = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<Service[]>(() => loadServices());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [durationMin, setDurationMin] = useState("60");
  const [priceRub, setPriceRub] = useState("0");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<"name" | "durationMin" | "priceRub", I18nKey>>>({});

  const countActive = useMemo(() => items.filter((s) => s.active).length, [items]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDurationMin("60");
    setPriceRub("0");
    setDescription("");
    setActive(true);
    setErrors({});
  };

  const openCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (svc: Service) => {
    setEditingId(svc.id);
    setName(svc.name);
    setDurationMin(String(svc.durationMin));
    setPriceRub(String(svc.priceRub));
    setDescription(svc.description);
    setActive(svc.active);
    setErrors({});
    setIsOpen(true);
  };

  const validate = () => {
    const e: Partial<Record<"name" | "durationMin" | "priceRub", I18nKey>> = {};
    if (!name.trim()) e.name = "services.err.nameRequired";

    const d = Number(durationMin);
    if (!Number.isFinite(d) || d <= 0) e.durationMin = "services.err.durationInvalid";

    const p = Number(priceRub);
    if (!Number.isFinite(p) || p < 0) e.priceRub = "services.err.priceNegative";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const next: Service = {
      id: editingId ?? uid(),
      name: name.trim(),
      durationMin: Math.round(Number(durationMin)),
      priceRub: Math.round(Number(priceRub)),
      description: description.trim(),
      active,
    };

    const updated = editingId
      ? items.map((s) => (s.id === editingId ? next : s))
      : [next, ...items];

    setItems(updated);
    saveServices(updated);
    setIsOpen(false);
    resetForm();
  };

  const remove = (id: string) => {
    if (!window.confirm(t("services.confirmDelete"))) return;
    const updated = items.filter((s) => s.id !== id);
    setItems(updated);
    saveServices(updated);
  };

  const toggleActive = (id: string) => {
    const updated = items.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setItems(updated);
    saveServices(updated);
  };

  return (
    <div className="dash-shell svc-shell">
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
          <a className="dash-nav-item" href="/clients" title={t("nav.clients")}>
            <span className="dash-nav-icon">
              <i className="ri-user-3-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item is-active" href="/services" aria-current="page" title={t("nav.services")}>
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
          <div className="svc-head">
            <div>
              <h1 className="svc-title">{t("services.title")}</h1>
              <div className="svc-sub">{t("services.subtitle")}</div>
            </div>

            <div className="svc-actions">
              <button type="button" className="svc-btn svc-btn--primary" onClick={openCreate}>
                <i className="ri-add-line" aria-hidden="true" /> {t("services.add")}
              </button>
              <div className="svc-stats">
                <div className="svc-stat">
                  <div className="svc-stat-label">{t("services.total")}</div>
                  <div className="svc-stat-num">{items.length}</div>
                </div>
                <div className="svc-stat">
                  <div className="svc-stat-label">{t("services.activeCount")}</div>
                  <div className="svc-stat-num">{countActive}</div>
                </div>
              </div>
            </div>
          </div>

          {isOpen && (
            <div className="dash-card svc-form-card">
              <div className="svc-form-head">
                <div className="dash-card-title">{editingId ? t("services.form.edit") : t("services.form.new")}</div>
                <button
                  type="button"
                  className="svc-x"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  title={t("common.close")}
                >
                  <i className="ri-close-line" aria-hidden="true" />
                </button>
              </div>

              <form className="svc-form" onSubmit={submit}>
                <label className="svc-field">
                  <div className="svc-label">{t("services.field.name")}</div>
                  <input
                    className={`svc-input ${errors.name ? "is-error" : ""}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("services.field.namePlaceholder")}
                  />
                  {errors.name && <div className="svc-error">{t(errors.name)}</div>}
                </label>

                <div className="svc-row">
                  <label className="svc-field">
                    <div className="svc-label">{t("services.field.duration")}</div>
                    <input
                      className={`svc-input ${errors.durationMin ? "is-error" : ""}`}
                      value={durationMin}
                      onChange={(e) => setDurationMin(e.target.value)}
                      inputMode="numeric"
                    />
                    {errors.durationMin && <div className="svc-error">{t(errors.durationMin)}</div>}
                  </label>

                  <label className="svc-field">
                    <div className="svc-label">{t("services.field.price")}</div>
                    <input
                      className={`svc-input ${errors.priceRub ? "is-error" : ""}`}
                      value={priceRub}
                      onChange={(e) => setPriceRub(e.target.value)}
                      inputMode="numeric"
                    />
                    {errors.priceRub && <div className="svc-error">{t(errors.priceRub)}</div>}
                  </label>
                </div>

                <label className="svc-field">
                  <div className="svc-label">{t("services.field.description")}</div>
                  <textarea
                    className="svc-input svc-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("services.field.descriptionPlaceholder")}
                    rows={3}
                  />
                </label>

                <label className="svc-toggle">
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                  <span className="svc-toggle-ui" aria-hidden="true" />
                  <span className="svc-toggle-text">
                    <span className="svc-toggle-title">{t("services.toggle.activeTitle")}</span>
                    <span className="svc-toggle-hint">{t("services.toggle.activeHint")}</span>
                  </span>
                </label>

                <div className="svc-form-actions">
                  <button type="submit" className="svc-btn svc-btn--primary">
                    <i className="ri-save-3-line" aria-hidden="true" /> {t("common.save")}
                  </button>
                  <button
                    type="button"
                    className="svc-btn svc-btn--ghost"
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="svc-list">
            {!items.length ? (
              <div className="dash-note">{t("services.empty")}</div>
            ) : (
              items.map((s) => (
                <div className="dash-card svc-item" key={s.id}>
                  <div className="svc-item-head">
                    <div>
                      <div className="svc-item-title">
                        {s.name}{" "}
                        {!s.active && <span className="svc-badge svc-badge--muted">{t("services.badge.disabled")}</span>}
                        {s.active && <span className="svc-badge">{t("services.badge.active")}</span>}
                      </div>
                      <div className="svc-item-sub">
                        <span>
                          <i className="ri-time-line" aria-hidden="true" /> {s.durationMin} мин
                        </span>
                        <span>
                          <i className="ri-money-ruble-circle-line" aria-hidden="true" /> {s.priceRub} ₽
                        </span>
                      </div>
                    </div>

                    <div className="svc-item-actions">
                      <button type="button" className="svc-ico" title={t("services.action.toggle")} onClick={() => toggleActive(s.id)}>
                        <i className={s.active ? "ri-toggle-fill" : "ri-toggle-line"} aria-hidden="true" />
                      </button>
                      <button type="button" className="svc-ico" title={t("common.edit")} onClick={() => openEdit(s)}>
                        <i className="ri-pencil-line" aria-hidden="true" />
                      </button>
                      <button type="button" className="svc-ico svc-ico--danger" title={t("common.delete")} onClick={() => remove(s.id)}>
                        <i className="ri-delete-bin-6-line" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {s.description && <div className="svc-item-desc">{s.description}</div>}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
