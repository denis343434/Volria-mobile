import { useMemo, useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { DatePickerField } from "../components/DatePickerField";
import { MessagesBell } from "../components/MessagesBell";
import { useI18n } from "../i18n";
import "../styles/dashboard.css";
import "../styles/analytics.css";
import "../styles/clientForm.css";

type Grouping = "day" | "week" | "month";

type MetricCard = {
  id: "revenue" | "avgCheck" | "bookingsSales" | "retention";
  title: string;
  value: string;
  hintLeft: string;
  hintRight: string;
  icon: string;
};

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysISO(iso: string, deltaDays: number) {
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const AnalyticsPage: FC = () => {
  const { lang, t } = useI18n();
  const locale = lang === "ru" ? "ru-RU" : "en-US";

  const [dateFrom, setDateFrom] = useState<string>(() => addDaysISO(todayISO(), -29));
  const [dateTo, setDateTo] = useState<string>(() => todayISO());
  const [grouping, setGrouping] = useState<Grouping>("day");
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());

  const cards = useMemo<MetricCard[]>(
    () => [
      {
        id: "revenue",
        title: t("analytics.metric.revenue"),
        value: "0 ₽",
        hintLeft: t("analytics.hint.noChanges"),
        hintRight: t("analytics.hint.vsPrev"),
        icon: "ri-money-ruble-circle-line",
      },
      {
        id: "avgCheck",
        title: t("analytics.metric.avgCheck"),
        value: "0 ₽",
        hintLeft: t("analytics.hint.noChanges"),
        hintRight: t("analytics.hint.vsPrev"),
        icon: "ri-shopping-bag-3-line",
      },
      {
        id: "bookingsSales",
        title: t("analytics.metric.bookingsSales"),
        value: "0",
        hintLeft: t("analytics.hint.noChanges"),
        hintRight: t("analytics.hint.vsPrev"),
        icon: "ri-calendar-check-line",
      },
      {
        id: "retention",
        title: t("analytics.metric.retention"),
        value: "0%",
        hintLeft: t("analytics.hint.newClients", { count: 1 }),
        hintRight: "",
        icon: "ri-user-heart-line",
      },
    ],
    [t],
  );

  const apply = () => {
    // For now it's a pure UI. Real data fetch later.
    setLastUpdated(new Date());
  };

  const reset = () => {
    setDateFrom(addDaysISO(todayISO(), -29));
    setDateTo(todayISO());
    setGrouping("day");
    setLastUpdated(new Date());
  };

  const exportExcel = () => {
    downloadCsv("analytics.csv", [
      ["date_from", dateFrom],
      ["date_to", dateTo],
      ["grouping", grouping],
      ["revenue_rub", "0"],
      ["avg_check_rub", "0"],
    ]);
  };

  return (
    <div className="dash-shell an-shell">
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
              <button className="an-btn an-btn--ghost" type="button" onClick={() => setLastUpdated(new Date())}>
                <i className="ri-refresh-line" aria-hidden="true" /> {t("common.refresh")}
              </button>
              <button className="an-btn an-btn--primary" type="button" onClick={exportExcel}>
                <i className="ri-file-excel-2-line" aria-hidden="true" /> {t("common.exportExcel")}
              </button>
              <MessagesBell />
            </div>
            <AvatarBubble />
          </div>
        </header>

        <section className="dash-content">
          <div className="an-head">
            <div>
              <h1 className="an-title">{t("analytics.title")}</h1>
              <div className="an-sub">{t("analytics.subtitle")}</div>
              <div className="an-upd">{t("analytics.updated", { ts: lastUpdated.toLocaleString(locale) })}</div>
            </div>
          </div>

          <div className="dash-card an-filters">
            <div className="an-filters-grid">
              <DatePickerField label={t("analytics.dateFrom")} valueYmd={dateFrom} onChangeYmd={setDateFrom} />
              <DatePickerField label={t("analytics.dateTo")} valueYmd={dateTo} onChangeYmd={setDateTo} />

              <label className="an-field">
                <div className="an-label">{t("analytics.grouping")}</div>
                <div className="an-input-wrap">
                  <select className="an-input" value={grouping} onChange={(e) => setGrouping(e.target.value as Grouping)}>
                    <option value="day">{t("analytics.grouping.day")}</option>
                    <option value="week">{t("analytics.grouping.week")}</option>
                    <option value="month">{t("analytics.grouping.month")}</option>
                  </select>
                  <i className="ri-arrow-down-s-line" aria-hidden="true" />
                </div>
              </label>

              <div className="an-filter-actions">
                <button className="an-btn an-btn--primary" type="button" onClick={apply}>{t("common.apply")}</button>
                <button className="an-btn an-btn--muted" type="button" onClick={reset}>{t("common.reset")}</button>
              </div>
            </div>
          </div>

          <div className="an-cards">
            {cards.map((c) => (
              <div className="dash-card an-card" key={c.title}>
                <div className="an-card-top">
                  <div className="an-card-title">{c.title}</div>
                  <div className="an-card-ico" aria-hidden="true">
                    <i className={c.icon} />
                  </div>
                </div>
                <div className="an-card-value">{c.value}</div>
                <div className="an-card-hints">
                  <span>{c.hintLeft}</span>
                  {c.hintRight && <span>{c.hintRight}</span>}
                </div>
                {c.id === "revenue" && (
                  <div className="an-card-subgrid">
                    <div className="an-mini">{t("analytics.revenue.services")} <span>0 ₽</span></div>
                    <div className="an-mini">{t("analytics.revenue.goods")} <span>0 ₽</span></div>
                  </div>
                )}
                {c.id === "avgCheck" && (
                  <div className="an-card-subgrid">
                    <div className="an-mini">{t("analytics.avgCheck.prevPeriod")} <span>0 ₽</span></div>
                  </div>
                )}
                {c.id === "bookingsSales" && (
                  <div className="an-card-note">{t("analytics.note.bookingsSales")}</div>
                )}
                {c.id === "retention" && (
                  <div className="an-card-note">{t("analytics.note.retention", { visited: 0, regular: 0 })}</div>
                )}
              </div>
            ))}
          </div>

          <div className="an-panels">
            <div className="dash-card an-panel">
              <div className="an-panel-head">
                <div>
                  <div className="dash-card-title">{t("analytics.panel.revenueDynamics")}</div>
                  <div className="dash-card-subtitle">{t("analytics.panel.periodCompare", { cur: "0 ₽", prev: "0 ₽" })}</div>
                </div>
                <button className="an-mini-btn" type="button" onClick={() => window.alert(t("analytics.alert.reportNotReady"))}
                >{t("analytics.panel.details")}</button>
              </div>

              <div className="an-chart">
                <svg viewBox="0 0 640 220" role="img" aria-label={t("analytics.chart.stub")}>
                  <defs>
                    <linearGradient id="anLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="rgba(255,0,255,0.65)" />
                      <stop offset="1" stopColor="rgba(120,75,255,0.65)" />
                    </linearGradient>
                  </defs>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line
                      key={i}
                      x1={40}
                      y1={20 + i * 20}
                      x2={620}
                      y2={20 + i * 20}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  ))}
                  {Array.from({ length: 13 }).map((_, i) => (
                    <line
                      key={i}
                      x1={40 + i * 45}
                      y1={20}
                      x2={40 + i * 45}
                      y2={200}
                      stroke="rgba(255,255,255,0.04)"
                      strokeWidth="1"
                    />
                  ))}
                  <polyline
                    points="40,140 85,140 130,140 175,140 220,140 265,140 310,140 355,140 400,140 445,140 490,140 535,140 580,140 620,140"
                    fill="none"
                    stroke="url(#anLine)"
                    strokeWidth="2.4"
                  />
                  <circle cx="40" cy="140" r="3" fill="rgba(255,0,255,0.9)" />
                  <circle cx="620" cy="140" r="3" fill="rgba(120,75,255,0.9)" />
                </svg>

                <div className="an-legend">
                  <span><span className="an-swatch an-swatch--cur" /> {t("analytics.legend.current")}</span>
                  <span><span className="an-swatch an-swatch--prev" /> {t("analytics.legend.prev")}</span>
                </div>
              </div>

              <div className="an-notes">
                <div className="an-note"><i className="ri-information-line" aria-hidden="true" /> {t("analytics.note.revenueTotal", { total: "0 ₽", services: "0 ₽" })}</div>
                <div className="an-note"><i className="ri-information-line" aria-hidden="true" /> {t("analytics.note.avgCheckDyn", { pct: "0%" })}</div>
              </div>
            </div>

            <div className="dash-card an-panel">
              <div className="an-panel-head">
                <div className="dash-card-title">{t("analytics.panel.revenueByServices")}</div>
                <button className="an-mini-btn" type="button" onClick={() => window.alert(t("analytics.alert.reportNotReady"))}
                >{t("analytics.panel.details")}</button>
              </div>
              <div className="an-empty">{t("analytics.emptyPeriod")}</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

