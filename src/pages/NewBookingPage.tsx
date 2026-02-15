import { useMemo, useState, type FC, type FormEvent } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { BookingDateTimeField } from "../components/BookingDateTimeField";
import { MessagesBell } from "../components/MessagesBell";
import { addEvent } from "../utils/eventsStore";
import { loadClients } from "../utils/clientsStore";
import { useI18n } from "../i18n";
import "../styles/dashboard.css";
import "../styles/booking.css";

type Status = "new" | "confirmed" | "cancelled";

type Service = {
  id: string;
  name: string;
  durationMin: number;
  priceRub: number;
  active: boolean;
};

const SERVICES_KEY = "services:v1";

function loadServices(): Service[] {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Service[];
  } catch {
    return [];
  }
}

function ymdFromQuery(): string {
  const url = new URL(window.location.href);
  const d = url.searchParams.get("date");
  if (!d) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return "";
  return d;
}

function clientIdFromQuery(): string {
  const url = new URL(window.location.href);
  const id = url.searchParams.get("clientId");
  return (id ?? "").trim();
}

function toLocalDT(ymd: string) {
  if (!ymd) return "";
  return `${ymd}T00:00`;
}

function hhmmFromLocalDT(localDt: string) {
  const i = localDt.indexOf("T");
  if (i < 0) return "00:00";
  const t = localDt.slice(i + 1);
  if (!/^\d{2}:\d{2}/.test(t)) return "00:00";
  return t.slice(0, 5);
}

function ymdFromLocalDT(localDt: string) {
  const i = localDt.indexOf("T");
  if (i < 0) return "";
  const d = localDt.slice(0, i);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return "";
  return d;
}

export const NewBookingPage: FC = () => {
  const { lang, t } = useI18n();
  const locale = lang === "ru" ? "ru-RU" : "en-US";

  const fmtRub = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

  const masters = [t("booking.master.you"), "Данил"];
  const [master, setMaster] = useState<string>(() => masters[0]);
  const presetClient = useMemo(() => {
    const id = clientIdFromQuery();
    if (!id) return null;
    return loadClients().find((c) => c.id === id) ?? null;
  }, []);

  const [phone, setPhone] = useState(() => presetClient?.phone ?? "");
  const [clientName, setClientName] = useState(() => presetClient?.name ?? "");
  const [clientEmail, setClientEmail] = useState(() => presetClient?.email ?? "");
  const [status, setStatus] = useState<Status>("new");

  const presetDate = ymdFromQuery();
  const [planned, setPlanned] = useState<string>(() => {
    const base = presetDate || new Date().toISOString().slice(0, 10);
    return toLocalDT(base);
  });

  const [note, setNote] = useState("");
  const [totalOverride, setTotalOverride] = useState<string>("");

  const services = useMemo(() => loadServices().filter((s) => s.active), []);
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  const pickedList = useMemo(() => services.filter((s) => picked[s.id]), [picked, services]);
  const sumRub = useMemo(() => pickedList.reduce((acc, s) => acc + (s.priceRub || 0), 0), [pickedList]);
  const sumMin = useMemo(() => pickedList.reduce((acc, s) => acc + (s.durationMin || 0), 0), [pickedList]);

  const computedTotal = sumRub;
  const totalRub = useMemo(() => {
    const v = totalOverride.trim();
    if (!v) return computedTotal;
    const n = Number(v.replaceAll(" ", "").replaceAll(",", "."));
    if (!Number.isFinite(n)) return computedTotal;
    return Math.max(0, Math.round(n));
  }, [computedTotal, totalOverride]);

  const aiRecs = useMemo(() => services.slice(0, 2), [services]);

  const toggleService = (id: string, v?: boolean) => {
    setPicked((p) => ({ ...p, [id]: v ?? !p[id] }));
  };

  const back = () => {
    window.location.href = "/calendar";
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const date = ymdFromLocalDT(planned) || presetDate || new Date().toISOString().slice(0, 10);
    const time = hhmmFromLocalDT(planned);

    const cleanClientName = clientName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = clientEmail.trim();
    const cleanNote = note.trim();
    const serviceNames = pickedList.map((s) => s.name).filter(Boolean);

    addEvent({
      date,
      time,
      // Keep a legacy-friendly display title while adding structured fields.
      title: cleanClientName || master || t("booking.defaultTitle"),
      clientName: cleanClientName || undefined,
      phone: cleanPhone || undefined,
      email: cleanEmail || undefined,
      master: master || undefined,
      status,
      note: cleanNote || undefined,
      services: serviceNames.length ? serviceNames : undefined,
    });
    window.alert(t("booking.alert.created"));
    back();
  };

  return (
    <div className="dash-shell bk-shell">
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
          <a className="dash-nav-item is-active" href="/calendar" aria-current="page" title={t("nav.calendar")}>
            <span className="dash-nav-icon">
              <i className="ri-calendar-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item" href="/clients" title={t("nav.clients")}>
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
          <div className="bk-head">
            <div>
              <h1 className="bk-title">{t("booking.title")}</h1>
              <div className="bk-sub">{t("booking.subtitle")}</div>
            </div>
            <button type="button" className="bk-back" onClick={back}>
              <i className="ri-arrow-left-line" aria-hidden="true" /> {t("booking.back")}
            </button>
          </div>

          <form className="dash-card bk-card" onSubmit={submit}>
            <div className="bk-grid">
              <label className="bk-field">
                <div className="bk-label">{t("booking.master")}</div>
                <div className="bk-select-wrap">
                  <select className="bk-select" value={master} onChange={(e) => setMaster(e.target.value)}>
                    {masters.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <i className="ri-arrow-down-s-line" aria-hidden="true" />
                </div>
              </label>

              <label className="bk-field">
                <div className="bk-label">{t("booking.clientPhone")}</div>
                <input
                  className="bk-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("booking.clientPhone")}
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="bk-field">
                <div className="bk-label">{t("booking.clientName")}</div>
                <input
                  className="bk-input"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={t("booking.clientName")}
                  autoComplete="name"
                />
              </label>

              <label className="bk-field">
                <div className="bk-label">{t("booking.clientEmail")}</div>
                <input
                  className="bk-input"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder={t("booking.clientEmail")}
                  inputMode="email"
                  autoComplete="email"
                />
              </label>

              <BookingDateTimeField label={t("booking.planned")} valueLocal={planned} onChangeLocal={setPlanned} />

              <label className="bk-field">
                <div className="bk-label">{t("booking.status")}</div>
                <div className="bk-select-wrap">
                  <select className="bk-select" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                    <option value="new">{t("booking.status.new")}</option>
                    <option value="confirmed">{t("booking.status.confirmed")}</option>
                    <option value="cancelled">{t("booking.status.cancelled")}</option>
                  </select>
                  <i className="ri-arrow-down-s-line" aria-hidden="true" />
                </div>
              </label>
            </div>

            <div className="bk-panels">
              <div className="bk-panel">
                <div className="bk-panel-head">
                  <div>
                    <div className="bk-panel-title">{t("booking.services.title")}</div>
                    <div className="bk-panel-sub">{t("booking.services.subtitle")}</div>
                  </div>
                </div>

                {!services.length ? (
                  <div className="dash-note">{t("booking.services.none")}</div>
                ) : (
                  <div className="bk-services">
                    {services.map((s) => (
                      <label className="bk-svc" key={s.id}>
                        <input type="checkbox" checked={!!picked[s.id]} onChange={(e) => toggleService(s.id, e.target.checked)} />
                          <span className="bk-svc-ui" aria-hidden="true" />
                          <span className="bk-svc-main">
                            <span className="bk-svc-name">{s.name}</span>
                            <span className="bk-svc-sub">{t("booking.services.duration", { min: s.durationMin })}</span>
                          </span>
                          <span className="bk-svc-price">{fmtRub(s.priceRub)}</span>
                        </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="bk-panel bk-panel--ai">
                <div className="bk-panel-head">
                  <div>
                    <div className="bk-panel-title">{t("booking.ai.title")}</div>
                    <div className="bk-panel-sub">{t("booking.ai.subtitle")}</div>
                  </div>
                  <span className="bk-ai-badge">ИИ</span>
                </div>

                {!aiRecs.length ? (
                  <div className="dash-note">{t("booking.ai.none")}</div>
                ) : (
                  <div className="bk-ai-list">
                    {aiRecs.map((s) => (
                      <div className="bk-ai" key={s.id}>
                        <div className="bk-ai-top">
                          <div className="bk-ai-name">{s.name}</div>
                          <div className="bk-ai-meta">
                            {fmtRub(s.priceRub)} · {s.durationMin} мин
                          </div>
                        </div>
                        <div className="bk-ai-text">Клиент еще не пробовал {s.name}. Это разнообразит впечатления и сервис.</div>
                        <button type="button" className="bk-ai-btn" onClick={() => toggleService(s.id, true)}>
                          {t("booking.ai.add")}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bk-bottom">
              <label className="bk-field">
                <div className="bk-label">{t("booking.total")}</div>
                <input
                  className="bk-input"
                  value={totalOverride}
                  onChange={(e) => setTotalOverride(e.target.value)}
                  placeholder={String(computedTotal)}
                  inputMode="numeric"
                />
              </label>

              <label className="bk-field bk-field--span">
                <div className="bk-label">{t("booking.note")}</div>
                <textarea className="bk-area" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("booking.notePlaceholder")} />
              </label>

              <div className="bk-summary">
                <div className="bk-sum-row">
                  <span>{t("booking.summary.preTotal")}</span>
                  <span>{fmtRub(totalRub)}</span>
                </div>
                <div className="bk-sum-row">
                  <span>{t("booking.summary.timeForecast")}</span>
                  <span>{sumMin} мин</span>
                </div>
              </div>
            </div>

            <div className="bk-actions">
              <button type="button" className="bk-btn bk-btn--muted" onClick={back}>
                {t("common.cancel")}
              </button>
              <button type="submit" className="bk-btn bk-btn--primary">
                {t("booking.create")}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};
