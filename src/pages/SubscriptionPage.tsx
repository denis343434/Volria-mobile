import { useMemo, useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { useI18n } from "../i18n";
import "../styles/dashboard.css";
import "../styles/subscription.css";

type PlanId = "lite" | "pro" | "elite";

function readPlan(): PlanId {
  const raw = (localStorage.getItem("userPlan") || "").trim().toLowerCase();
  if (raw === "pro" || raw === "elite" || raw === "lite") return raw;
  return "lite";
}

function setPlan(next: PlanId) {
  localStorage.setItem("userPlan", next);
  window.dispatchEvent(new Event("veloria-plan-change"));
}

export const SubscriptionPage: FC = () => {
  const { t } = useI18n();
  const [plan, setPlanState] = useState<PlanId>(() => readPlan());

  const plans = useMemo(
    () => [
      {
        id: "lite" as const,
        title: "Lite",
        tag: t("subscription.plan.popular"),
        price: t("subscription.plan.free"),
        per: "",
        perks: [
          t("subscription.perk.onlineBooking"),
          t("subscription.perk.clientBase"),
          t("subscription.perk.reminders")
        ],
        cta: t("subscription.plan.switchTo", { plan: "Lite" }),
      },
      {
        id: "pro" as const,
        title: "Pro",
        tag: t("subscription.plan.popular"),
        price: "₽999",
        per: t("subscription.plan.perMonth"),
        perks: [
          t("subscription.perk.allLite"),
          t("subscription.perk.landings"),
          t("subscription.perk.automations"),
          t("subscription.perk.advancedStats")
        ],
        cta: t("subscription.plan.switchTo", { plan: "Pro" }),
      },
      {
        id: "elite" as const,
        title: "Elite",
        tag: t("subscription.plan.best"),
        price: "₽2 999",
        per: t("subscription.plan.perMonth"),
        perks: [
          t("subscription.perk.allPro"),
          t("subscription.perk.aiAnalytics"),
          t("subscription.perk.prioritySupport"),
          t("subscription.perk.integrations")
        ],
        cta: t("subscription.plan.switchTo", { plan: "Elite" }),
      },
    ],
    [t],
  );

  const features = useMemo(
    () => [
      { 
        name: t("subscription.feature.landings"), 
        hint: t("subscription.feature.landingsHint"), 
        lite: false, 
        pro: true, 
        elite: true 
      },
      { 
        name: t("subscription.feature.automations"), 
        hint: t("subscription.feature.automationsHint"), 
        lite: false, 
        pro: true, 
        elite: true 
      },
      { 
        name: t("subscription.feature.aiAnalytics"), 
        hint: t("subscription.feature.aiAnalyticsHint"), 
        lite: false, 
        pro: false, 
        elite: true 
      },
      { 
        name: t("subscription.feature.advancedStats"), 
        hint: t("subscription.feature.advancedStatsHint"), 
        lite: false, 
        pro: true, 
        elite: true 
      },
      { 
        name: t("subscription.feature.basic"), 
        hint: t("subscription.feature.basicHint"), 
        lite: true, 
        pro: true, 
        elite: true 
      },
    ],
    [t],
  );

  const tx = useMemo(
    () => [
      { id: "t1", date: "2026-02-01", title: t("subscription.tx.renewal", { plan: "Pro" }), amount: "₽999" },
      { id: "t2", date: "2026-01-01", title: t("subscription.tx.renewal", { plan: "Pro" }), amount: "₽999" },
    ],
    [t],
  );

  const current = plans.find((p) => p.id === plan) ?? plans[0];

  const apply = (next: PlanId) => {
    if (next === plan) return;
    setPlan(next);
    setPlanState(next);
  };

  const cancel = () => {
    if (plan === "lite") return;
    if (!window.confirm(t("subscription.cancel.confirm"))) return;
    setPlan("lite");
    setPlanState("lite");
  };

  return (
    <div className="dash-shell sub-shell">
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
              <MessagesBell />
            </div>
            <AvatarBubble />
          </div>
        </header>

        <section className="dash-content">
          <div className="sub-head">
            <div>
              <h1 className="sub-title">{t("subscription.title")}</h1>
              <div className="sub-sub">{t("subscription.subtitle")}</div>
            </div>
          </div>

          <div className="sub-hero">
            <div className="dash-card sub-card">
              <div className="sub-current-top">
                <div>
                  <div className="sub-kicker">{t("subscription.current.kicker").toUpperCase()}</div>
                  <div className="sub-current-title">{current.title}</div>
                  <div className="sub-current-hint">
                    {plan === "lite" ? t("subscription.current.notActive") : t("subscription.current.active")}
                  </div>
                </div>

                <span className="sub-pill">
                  <i className="ri-shield-check-line" aria-hidden="true" /> {plan.toUpperCase()}
                </span>
              </div>

              <div className="sub-current-actions">
                <button type="button" className="sub-danger" onClick={cancel} disabled={plan === "lite"}>
                  <i className="ri-close-circle-line" aria-hidden="true" /> {t("subscription.cancel")}
                </button>
                <div className="sub-muted">
                  {t("subscription.cancel.note")}
                </div>
              </div>
            </div>

            <div className="dash-card sub-card">
              <div className="sub-info-head">
                <div>
                  <div className="sub-info-title">{t("subscription.whatHappens.title")}</div>
                  <div className="sub-info-sub">{t("subscription.whatHappens.subtitle")}</div>
                </div>
              </div>

              <div className="sub-info-grid">
                <div className="sub-info-box sub-info-box--good">
                  <div className="sub-info-box-title">
                    <i className="ri-checkbox-circle-line" aria-hidden="true" /> {t("subscription.keep.title")}
                  </div>
                  <ul className="sub-info-list">
                    <li>{t("subscription.keep.item1")}</li>
                    <li>{t("subscription.keep.item2")}</li>
                  </ul>
                </div>
                <div className="sub-info-box sub-info-box--bad">
                  <div className="sub-info-box-title">
                    <i className="ri-error-warning-line" aria-hidden="true" /> {t("subscription.lose.title")}
                  </div>
                  <ul className="sub-info-list">
                    <li>{t("subscription.lose.item1")}</li>
                    <li>{t("subscription.lose.item2")}</li>
                    <li>{t("subscription.lose.item3")}</li>
                    <li>{t("subscription.lose.item4")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="sub-plans" aria-label={t("subscription.plans.aria")}>
            {plans.map((p) => {
              const active = p.id === plan;
              return (
                <div key={p.id} className={"sub-plan" + (active ? " is-active" : "")}>
                  <div className="sub-plan-top">
                    <div className="sub-plan-title">{p.title}</div>
                    <span className={"sub-badge" + (active ? " sub-badge--active" : "")}>
                      {active ? t("subscription.plan.current") : p.tag}
                    </span>
                  </div>
                  <div className="sub-price">
                    <span className="sub-price-main">{p.price}</span>
                    {p.per && <span className="sub-price-per">{p.per}</span>}
                  </div>

                  <ul className="sub-perks">
                    {p.perks.map((x, index) => (
                      <li key={index}>
                        <i className="ri-check-line" aria-hidden="true" /> {x}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={active ? "dash-muted" : "dash-primary"}
                    disabled={active}
                    onClick={() => apply(p.id)}
                  >
                    {active ? t("subscription.plan.already") : p.cta}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="dash-card sub-card sub-compare" aria-label={t("subscription.compare.title")}>
            <div className="sub-section-head">
              <div className="sub-section-title">{t("subscription.compare.title")}</div>
              <div className="sub-section-hint">{t("subscription.compare.hint")}</div>
            </div>

            <div className="sub-table-wrap" role="region" aria-label={t("subscription.table.aria")}>
              <table className="sub-table">
                <thead>
                  <tr>
                    <th>{t("subscription.table.feature")}</th>
                    <th>Lite</th>
                    <th>Pro</th>
                    <th>Elite</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((f) => (
                    <tr key={f.name}>
                      <td>
                        <div className="sub-td-title">{f.name}</div>
                        <div className="sub-td-hint">{f.hint}</div>
                      </td>
                      <td>{f.lite ? <i className="ri-check-line sub-ok" aria-hidden="true" /> : <span className="sub-x">×</span>}</td>
                      <td>{f.pro ? <i className="ri-check-line sub-ok" aria-hidden="true" /> : <span className="sub-x">×</span>}</td>
                      <td>{f.elite ? <i className="ri-check-line sub-ok" aria-hidden="true" /> : <span className="sub-x">×</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dash-card sub-card" aria-label={t("subscription.tx.title")}>
            <div className="sub-section-head">
              <div className="sub-section-title">{t("subscription.tx.title")}</div>
              <div className="sub-section-hint">{t("subscription.subtitle")}</div>
            </div>

            {!tx.length ? (
              <div className="sub-empty">{t("subscription.tx.empty")}</div>
            ) : (
              <div className="sub-tx">
                {tx.map((t) => (
                  <div className="sub-tx-row" key={t.id}>
                    <div className="sub-tx-left">
                      <div className="sub-tx-title">{t.title}</div>
                      <div className="sub-tx-sub">{t.date}</div>
                    </div>
                    <div className="sub-tx-amt">{t.amount}</div>
                  </div>
                ))}
                <div className="sub-tx-note">{t("subscription.tx.note")}</div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
