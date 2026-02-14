import { useMemo, useState, type FC, type FormEvent } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { addEvent } from "../utils/eventsStore";
import "../styles/dashboard.css";
import "../styles/booking.css";

type Status = "Новая" | "Подтверждена" | "Отменена";

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

function fmtRub(n: number) {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

export const NewBookingPage: FC = () => {
  const masters = ["Вы", "Данил"];
  const [master, setMaster] = useState<string>(() => masters[0]);
  const [phone, setPhone] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [status, setStatus] = useState<Status>("Новая");

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

    addEvent({ date, time, title: master || "Запись" });
    window.alert("Запись создана (фронт).");
    back();
  };

  return (
    <div className="dash-shell bk-shell">
      <aside className="dash-sidebar" aria-label="Навигация">
        <div className="dash-brand" title="Veloria">
          <img src={iconUrl} className="dash-brand-icon" alt="Veloria" />
        </div>

        <nav className="dash-nav">
          <a className="dash-nav-item" href="/dashboard" title="Главная">
            <span className="dash-nav-icon">
              <i className="ri-home-5-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item is-active" href="/calendar" aria-current="page" title="Календарь">
            <span className="dash-nav-icon">
              <i className="ri-calendar-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item" href="/clients" title="Клиенты">
            <span className="dash-nav-icon">
              <i className="ri-user-3-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item" href="/services" title="Услуги">
            <span className="dash-nav-icon">
              <i className="ri-service-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item" href="/settings" title="Настройки">
            <span className="dash-nav-icon">
              <i className="ri-settings-3-line" aria-hidden="true" />
            </span>
          </a>
        </nav>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar" aria-label="Панель">
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
              <h1 className="bk-title">Создание записи</h1>
              <div className="bk-sub">Укажите клиента, время и необходимые услуги.</div>
            </div>
            <button type="button" className="bk-back" onClick={back}>
              <i className="ri-arrow-left-line" aria-hidden="true" /> Вернуться к списку
            </button>
          </div>

          <form className="dash-card bk-card" onSubmit={submit}>
            <div className="bk-grid">
              <label className="bk-field">
                <div className="bk-label">Мастер</div>
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
                <div className="bk-label">Телефон клиента</div>
                <input
                  className="bk-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Телефон"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="bk-field">
                <div className="bk-label">Имя клиента</div>
                <input
                  className="bk-input"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Имя клиента"
                  autoComplete="name"
                />
              </label>

              <label className="bk-field">
                <div className="bk-label">Email клиента</div>
                <input
                  className="bk-input"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Email клиента"
                  inputMode="email"
                  autoComplete="email"
                />
              </label>

              <label className="bk-field">
                <div className="bk-label">Запланированная дата и время</div>
                <div className="bk-date-wrap">
                  <input className="bk-input" type="datetime-local" value={planned} onChange={(e) => setPlanned(e.target.value)} />
                  <i className="ri-calendar-line" aria-hidden="true" />
                </div>
              </label>

              <label className="bk-field">
                <div className="bk-label">Статус</div>
                <div className="bk-select-wrap">
                  <select className="bk-select" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                    <option value="Новая">Новая</option>
                    <option value="Подтверждена">Подтверждена</option>
                    <option value="Отменена">Отменена</option>
                  </select>
                  <i className="ri-arrow-down-s-line" aria-hidden="true" />
                </div>
              </label>
            </div>

            <div className="bk-panels">
              <div className="bk-panel">
                <div className="bk-panel-head">
                  <div>
                    <div className="bk-panel-title">Выбранные услуги</div>
                    <div className="bk-panel-sub">Отметьте, что войдет в заказ</div>
                  </div>
                </div>

                {!services.length ? (
                  <div className="dash-note">Нет активных услуг. Добавьте услуги в разделе "Услуги".</div>
                ) : (
                  <div className="bk-services">
                    {services.map((s) => (
                      <label className="bk-svc" key={s.id}>
                        <input type="checkbox" checked={!!picked[s.id]} onChange={(e) => toggleService(s.id, e.target.checked)} />
                        <span className="bk-svc-ui" aria-hidden="true" />
                        <span className="bk-svc-main">
                          <span className="bk-svc-name">{s.name}</span>
                          <span className="bk-svc-sub">Длительность: {s.durationMin} мин</span>
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
                    <div className="bk-panel-title">Рекомендации ИИ</div>
                    <div className="bk-panel-sub">Подсказки по услугам (заглушка)</div>
                  </div>
                  <span className="bk-ai-badge">ИИ</span>
                </div>

                {!aiRecs.length ? (
                  <div className="dash-note">Пока нет услуг для рекомендаций.</div>
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
                          Добавить в заказ
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bk-bottom">
              <label className="bk-field">
                <div className="bk-label">Итоговая сумма (₽)</div>
                <input
                  className="bk-input"
                  value={totalOverride}
                  onChange={(e) => setTotalOverride(e.target.value)}
                  placeholder={String(computedTotal)}
                  inputMode="numeric"
                />
              </label>

              <label className="bk-field bk-field--span">
                <div className="bk-label">Заметка для мастера</div>
                <textarea className="bk-area" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Комментарий" />
              </label>

              <div className="bk-summary">
                <div className="bk-sum-row">
                  <span>Предварительная сумма</span>
                  <span>{fmtRub(totalRub)}</span>
                </div>
                <div className="bk-sum-row">
                  <span>Прогноз времени</span>
                  <span>{sumMin} мин</span>
                </div>
              </div>
            </div>

            <div className="bk-actions">
              <button type="button" className="bk-btn bk-btn--muted" onClick={back}>
                Отмена
              </button>
              <button type="submit" className="bk-btn bk-btn--primary">
                Создать запись
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

