import { type FC, useMemo } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { useI18n } from "../i18n";
import "../styles/dashboard.css";

type Metric = {
  label: string;
  value: string;
  hint: string;
};

// Функция для форматирования даты с учетом языка
const formatDayWithWeekday = (date: Date, lang: string, includeYear: boolean = false) => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    ...(includeYear && { year: 'numeric' })
  };
  
  const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
  const dateStr = date.toLocaleDateString(locale, options);
  
  // Добавляем сокращенный день недели
  const weekdayOptions: Intl.DateTimeFormatOptions = { weekday: 'short' };
  const weekday = date.toLocaleDateString(locale, weekdayOptions);
  
  return `${dateStr}, ${weekday}`;
};

const formatDay = (date: Date, lang: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short'
  };
  const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
  return date.toLocaleDateString(locale, options);
};

export const DasboardPage: FC = () => {
  const { t, lang } = useI18n();
  
  // Генерируем даты для демо-данных
  const today = new Date();
  const dates = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      result.push(d);
    }
    return result;
  }, []);

  const metrics: Metric[] = [
    { label: t("dashboard.metrics.revenue"), value: "0 ₽", hint: t("dashboard.metrics.revenueHint") },
    { label: t("dashboard.metrics.clientsToday"), value: "0", hint: t("dashboard.metrics.clientsTodayHint") },
    { label: t("dashboard.metrics.avgCheck"), value: "0 ₽", hint: t("dashboard.metrics.avgCheckHint") },
    { label: t("dashboard.metrics.repeat"), value: "0.0%", hint: t("dashboard.metrics.repeatHint") },
  ];

  const marginByDay = useMemo(() => 
    dates.map(date => ({
      date,
      day: formatDayWithWeekday(date, lang),
      minutes: 0,
      rub: 0
    })), [dates, lang]
  );

  const revenueByDay = useMemo(() => 
    dates.map(date => ({
      date,
      day: formatDay(date, lang),
      rub: 0
    })), [dates, lang]
  );

  const bestDay = marginByDay.length > 0 ? marginByDay[0] : null;

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar" aria-label={t("a11y.navigation")}>
        <div className="dash-brand" title="Veloria">
          <img src={iconUrl} className="dash-brand-icon" alt="Veloria" />
        </div>

        <nav className="dash-nav">
          <a className="dash-nav-item is-active" href="/dashboard" aria-current="page">
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

        <div className="dash-sidebar-bottom">
          <a
            className="dash-nav-item"
            href="/"
            title={t("profile.logout")}
            onClick={() => {
              localStorage.removeItem("authToken");
              sessionStorage.removeItem("authToken");
            }}
          >
            <span className="dash-nav-icon">
              <i className="ri-logout-box-r-line" aria-hidden="true" />
            </span>
          </a>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar" aria-label={t("a11y.topbar")}>
          <div className="dash-topbar-left">
            <span className="dash-mini">
              <i className="ri-global-line" aria-hidden="true" />
            </span>
            <span className="dash-mini">
              <i className="ri-computer-line" aria-hidden="true" />
            </span>
          </div>

          <div className="dash-topbar-right">
            <div className="dash-topbar-actions">
              <MessagesBell />
            </div>
            <AvatarBubble />
          </div>
        </header>

        <section className="dash-content">
          <div className="dash-pagehead">
            <div>
              <div className="dash-kicker">{t("dashboard.kicker").toUpperCase()}</div>
              <h1 className="dash-title">{t("dashboard.title")}</h1>
            </div>
            <div className="dash-updated">{t("dashboard.updated", { seconds: 0 })}</div>
          </div>

          <div className="dash-grid">
            <div className="dash-col">
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <div className="dash-card-title">{t("dashboard.schedule.title")}</div>
                    <div className="dash-card-subtitle">{t("dashboard.schedule.subtitle")}</div>
                  </div>
                  <button className="dash-primary" type="button">{t("dashboard.schedule.quickBooking")}</button>
                </div>

                <div className="dash-card-body">
                  <div className="dash-empty">
                    {t("dashboard.schedule.empty")}
                  </div>
                </div>
              </div>

              <div className="dash-card">
                <div className="dash-card-head">
                  <div className="dash-card-title">{t("dashboard.numbers.title")}</div>
                  <div className="dash-pill">{t("dashboard.numbers.forecast", { amount: "0 ₽" })}</div>
                </div>

                <div className="dash-metrics">
                  {metrics.map((m) => (
                    <div className="dash-metric" key={m.label}>
                      <div className="dash-metric-label">{m.label}</div>
                      <div className="dash-metric-value">{m.value}</div>
                      <div className="dash-metric-hint">{m.hint}</div>
                      <div className="dash-meter" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dash-col">
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <div className="dash-card-title">{t("dashboard.ai.title")}</div>
                    <div className="dash-card-subtitle">{t("dashboard.ai.subtitle")}</div>
                  </div>
                  <div className="dash-head-actions">
                    <span className="dash-tag">{t("dashboard.ai.priority").toUpperCase()}</span>
                    <button className="dash-gear" type="button" title={t("dashboard.ai.configure")}>
                      <i className="ri-settings-3-line" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="dash-assistant">
                    <div className="dash-assistant-item">
                      <div className="dash-assistant-top">
                      <div className="dash-assistant-title">{t("dashboard.ai.item1.title")}</div>
                      <div className="dash-assistant-badge">{t("dashboard.ai.item1.badge").toUpperCase()}</div>
                      </div>
                      <div className="dash-assistant-text">
                      {t("dashboard.ai.item1.text")}
                      </div>
                      <div className="dash-assistant-actions">
                      <button className="dash-outline" type="button">{t("dashboard.ai.item1.action1")}</button>
                      <button className="dash-muted" type="button" disabled>{t("dashboard.ai.item1.action2")}</button>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-section">
            <div className="dash-section-head">
              <div>
                <div className="dash-kicker">{t("dashboard.growth.kicker").toUpperCase()}</div>
                <div className="dash-section-title">{t("dashboard.growth.title")}</div>
              </div>
              <button
                className="dash-ghost"
                type="button"
                onClick={() => { window.location.href = "/analytics"; }}
              >
                {t("dashboard.growth.openAnalytics")}
              </button>
            </div>

            <div className="dash-grid">
              <div className="dash-col">
                <div className="dash-card">
                  <div className="dash-card-head">
                    <div>
                      <div className="dash-card-title">{t("dashboard.margin.title")}</div>
                      <div className="dash-card-subtitle">
                        {t("dashboard.margin.subtitle")}
                      </div>
                    </div>
                    {bestDay && (
                      <div className="dash-chip dash-chip--good">
                        {t("dashboard.margin.bestDay", { day: bestDay.day, amount: `${bestDay.rub} ₽` })}
                      </div>
                    )}
                  </div>

                  <div className="dash-list">
                    {marginByDay.map((row) => (
                      <div className="dash-row" key={row.date.toISOString()}>
                        <div className="dash-row-top">
                          <div className="dash-row-title">{row.day}</div>
                          <div className="dash-row-right">{row.minutes} {t("common.minutes")}</div>
                        </div>
                        <div className="dash-bar" aria-hidden="true">
                          <div className="dash-bar-fill" style={{ width: "0%" }} />
                        </div>
                        <div className="dash-row-bottom">
                          <div className="dash-row-muted" />
                          <div className="dash-row-money">{row.rub} ₽</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dash-col">
                <div className="dash-card">
                  <div className="dash-card-head">
                    <div>
                      <div className="dash-card-title">{t("dashboard.topServices.title")}</div>
                      <div className="dash-card-subtitle">{t("dashboard.topServices.subtitle")}</div>
                    </div>
                  </div>
                  <div className="dash-card-body">
                    <div className="dash-note">
                      {t("dashboard.topServices.note")}
                    </div>
                  </div>
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <div className="dash-card-title">{t("dashboard.bestClients.title")}</div>
                  </div>
                  <div className="dash-card-body">
                    <div className="dash-client">
                      <div className="dash-client-rank">1</div>
                      <div className="dash-client-meta">
                        <div className="dash-client-line">LTV: 0 ₽</div>
                        <div className="dash-client-line dash-client-line--muted">{t("dashboard.bestClients.lastVisit")}</div>
                      </div>
                    </div>
                    <div className="dash-card-subtitle" style={{ marginTop: 10 }}>
                      {t("dashboard.bestClients.note")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <div className="dash-card-title">{t("dashboard.revenuePeriod.title")}</div>
                <div className="dash-card-subtitle">{t("dashboard.revenuePeriod.subtitle")}</div>
              </div>
              <div className="dash-pill">{t("dashboard.revenuePeriod.noCompare")}</div>
            </div>

            <div className="dash-rev-list">
              {revenueByDay.map((r) => (
                <div className="dash-rev-item" key={r.date.toISOString()}>
                  <div className="dash-rev-top">
                    <div className="dash-rev-date">{r.day}</div>
                    <div className="dash-rev-money">{r.rub} ₽</div>
                  </div>
                  <div className="dash-rev-sub">{t("dashboard.revenuePeriod.noCompare")}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};