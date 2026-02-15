import { useMemo, useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
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
  const [plan, setPlanState] = useState<PlanId>(() => readPlan());

  const plans = useMemo(
    () => [
      {
        id: "lite" as const,
        title: "Lite",
        tag: "Текущий план",
        price: "Бесплатно",
        per: "",
        perks: ["Онлайн-записи и расписание", "Клиентская база и карточки клиентов", "Автонапоминания по SMS и email"],
        cta: "Перейти на Lite",
      },
      {
        id: "pro" as const,
        title: "Pro",
        tag: "Популярно",
        price: "₽999",
        per: "в месяц",
        perks: ["Все из Lite", "Конструктор лендингов", "Автоматические рассылки и сегментация", "Расширенная статистика и отчеты"],
        cta: "Перейти на Pro",
      },
      {
        id: "elite" as const,
        title: "Elite",
        tag: "Лучшее предложение",
        price: "₽2 999",
        per: "в месяц",
        perks: ["Все из Pro", "ИИ-аналитика и прогнозы", "Приоритетная поддержка 24/7", "Интеграции и автоматизация"],
        cta: "Перейти на Elite",
      },
    ],
    [],
  );

  const features = useMemo(
    () => [
      { name: "Лендинги", hint: "Создание и публикация посадочных страниц под акции и услуги.", lite: false, pro: true, elite: true },
      { name: "Автоматические рассылки", hint: "Сценарии коммуникаций и автоматические воронки.", lite: false, pro: true, elite: true },
      { name: "ИИ-аналитика", hint: "Прогнозирование выручки и рекомендации по клиентам.", lite: false, pro: false, elite: true },
      { name: "Расширенная статистика", hint: "Подробные отчеты по команде, услугам и каналам.", lite: false, pro: true, elite: true },
      { name: "Базовые функции", hint: "Расписание, клиенты и уведомления.", lite: true, pro: true, elite: true },
    ],
    [],
  );

  const tx = useMemo(
    () => [
      { id: "t1", date: "2026-02-01", title: "Продление подписки Pro", amount: "₽999" },
      { id: "t2", date: "2026-01-01", title: "Продление подписки Pro", amount: "₽999" },
    ],
    [],
  );

  const current = plans.find((p) => p.id === plan) ?? plans[0];

  const apply = (next: PlanId) => {
    if (next === plan) return;
    setPlan(next);
    setPlanState(next);
  };

  const cancel = () => {
    if (plan === "lite") return;
    if (!window.confirm("Отменить подписку и перейти на Lite?")) return;
    setPlan("lite");
    setPlanState("lite");
  };

  return (
    <div className="dash-shell sub-shell">
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
          <a className="dash-nav-item" href="/calendar" title="Календарь">
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
          <div className="sub-head">
            <div>
              <h1 className="sub-title">Подписка</h1>
              <div className="sub-sub">Управляйте тарифом и платежами Veloria CRM</div>
            </div>
          </div>

          <div className="sub-hero">
            <div className="dash-card sub-card">
              <div className="sub-current-top">
                <div>
                  <div className="sub-kicker">ТЕКУЩИЙ ПЛАН</div>
                  <div className="sub-current-title">{current.title}</div>
                  <div className="sub-current-hint">
                    {plan === "lite" ? "Подписка еще не оформлена" : "Активная подписка"}
                  </div>
                </div>

                <span className="sub-pill">
                  <i className="ri-shield-check-line" aria-hidden="true" /> {plan.toUpperCase()}
                </span>
              </div>

              <div className="sub-current-actions">
                <button type="button" className="sub-danger" onClick={cancel} disabled={plan === "lite"}>
                  <i className="ri-close-circle-line" aria-hidden="true" /> Отменить подписку
                </button>
                <div className="sub-muted">
                  Вы всегда сможете вернуться на платный тариф позже. Данные сохранятся.
                </div>
              </div>
            </div>

            <div className="dash-card sub-card">
              <div className="sub-info-head">
                <div>
                  <div className="sub-info-title">Что будет при отмене подписки</div>
                  <div className="sub-info-sub">Кратко о том, что изменится после отключения платного доступа.</div>
                </div>
              </div>

              <div className="sub-info-grid">
                <div className="sub-info-box sub-info-box--good">
                  <div className="sub-info-box-title">
                    <i className="ri-checkbox-circle-line" aria-hidden="true" /> Вы сохраните:
                  </div>
                  <ul className="sub-info-list">
                    <li>Все данные о клиентах и записях.</li>
                    <li>Доступ к базовому функционалу (расписание, клиентская база).</li>
                  </ul>
                </div>
                <div className="sub-info-box sub-info-box--bad">
                  <div className="sub-info-box-title">
                    <i className="ri-error-warning-line" aria-hidden="true" /> Вы потеряете доступ к:
                  </div>
                  <ul className="sub-info-list">
                    <li>Созданию лендингов (существующие перестанут работать).</li>
                    <li>ИИ-аналитике и прогнозам.</li>
                    <li>Автоматическим рассылкам.</li>
                    <li>Расширенной статистике.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="sub-plans" aria-label="Тарифы">
            {plans.map((p) => {
              const active = p.id === plan;
              return (
                <div key={p.id} className={"sub-plan" + (active ? " is-active" : "")}>
                  <div className="sub-plan-top">
                    <div className="sub-plan-title">{p.title}</div>
                    <span className={"sub-badge" + (active ? " sub-badge--active" : "")}>{active ? "Текущий план" : p.tag}</span>
                  </div>
                  <div className="sub-price">
                    <span className="sub-price-main">{p.price}</span>
                    {p.per && <span className="sub-price-per">{p.per}</span>}
                  </div>

                  <ul className="sub-perks">
                    {p.perks.map((x) => (
                      <li key={x}>
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
                    {active ? "Уже подключено" : p.cta}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="dash-card sub-card sub-compare" aria-label="Сравнение тарифов">
            <div className="sub-section-head">
              <div className="sub-section-title">Сравнение тарифов</div>
              <div className="sub-section-hint">Выберите план под ваш объем и автоматизацию.</div>
            </div>

            <div className="sub-table-wrap" role="region" aria-label="Таблица тарифов">
              <table className="sub-table">
                <thead>
                  <tr>
                    <th>Возможность</th>
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

          <div className="dash-card sub-card" aria-label="История транзакций">
            <div className="sub-section-head">
              <div className="sub-section-title">История транзакций</div>
              <div className="sub-section-hint">Управляйте тарифом и платежами Veloria CRM</div>
            </div>

            {!tx.length ? (
              <div className="sub-empty">Транзакций пока нет. Как только появится оплата, она появится здесь.</div>
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
                <div className="sub-tx-note">Это демо-данные. Подключение платежей можно сделать позже.</div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

