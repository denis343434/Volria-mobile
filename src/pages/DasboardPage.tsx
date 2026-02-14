import { type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import "../styles/dashboard.css";

type Metric = {
  label: string;
  value: string;
  hint: string;
};

export const DasboardPage: FC = () => {
  const metrics: Metric[] = [
    { label: "Выручка", value: "0 ₽", hint: "Выручка против прогноза" },
    { label: "Клиенты сегодня", value: "0", hint: "Записано клиентов" },
    { label: "Средний чек", value: "0 ₽", hint: "Чистая выручка за визит" },
    { label: "Повторные визиты", value: "0.0%", hint: "Доля клиентов, вернувшихся" },
  ];

  const marginByDay = [
    { day: "8 фев, вск", minutes: 0, rub: 0 },
    { day: "9 фев, пнд", minutes: 0, rub: 0 },
    { day: "10 фев, втр", minutes: 0, rub: 0 },
    { day: "11 фев, срд", minutes: 0, rub: 0 },
    { day: "12 фев, чтв", minutes: 0, rub: 0 },
    { day: "13 фев, птн", minutes: 0, rub: 0 },
  ];

  const revenueByDay = [
    { day: "14 фев", rub: 0 },
    { day: "13 фев", rub: 0 },
    { day: "12 фев", rub: 0 },
    { day: "11 фев", rub: 0 },
    { day: "10 фев", rub: 0 },
    { day: "9 фев", rub: 0 },
    { day: "8 фев", rub: 0 },
  ];

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar" aria-label="Навигация">
        <div className="dash-brand" title="Veloria">
          <img src={iconUrl} className="dash-brand-icon" alt="Veloria" />
        </div>

        <nav className="dash-nav">
          <a className="dash-nav-item is-active" href="/dashboard" aria-current="page">
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

        <div className="dash-sidebar-bottom">
          <a
            className="dash-nav-item"
            href="/"
            title="Выйти"
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
        <header className="dash-topbar" aria-label="Панель">
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
              <div className="dash-kicker">ГЛАВНЫЙ ЭКРАН</div>
              <h1 className="dash-title">Фокус на сегодня</h1>
            </div>
            <div className="dash-updated">Обновлено 0 секунд назад</div>
          </div>

          <div className="dash-grid">
            <div className="dash-col">
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <div className="dash-card-title">Расписание на сегодня</div>
                    <div className="dash-card-subtitle">Следите за ключевыми визитами и сигналами от ИИ</div>
                  </div>
                  <button className="dash-primary" type="button">Быстрая Запись</button>
                </div>

                <div className="dash-card-body">
                  <div className="dash-empty">
                    Сегодня нет запланированных визитов, самое время заняться привлечением клиентов.
                  </div>
                </div>
              </div>

              <div className="dash-card">
                <div className="dash-card-head">
                  <div className="dash-card-title">Сегодня в цифрах</div>
                  <div className="dash-pill">Прогноз прибыли — 0 ₽</div>
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
                    <div className="dash-card-title">Советы ИИ-ассистента</div>
                    <div className="dash-card-subtitle">Что можно сделать прямо сейчас</div>
                  </div>
                  <div className="dash-head-actions">
                    <span className="dash-tag">В ПРИОРИТЕТЕ</span>
                    <button className="dash-gear" type="button" title="Настроить">
                      <i className="ri-settings-3-line" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="dash-assistant">
                  <div className="dash-assistant-item">
                    <div className="dash-assistant-top">
                      <div className="dash-assistant-title">Проверьте базу клиентов</div>
                      <div className="dash-assistant-badge">МОЖНО ПОЗЖЕ</div>
                    </div>
                    <div className="dash-assistant-text">
                      Нет срочных задач. Напомните о себе клиентам, которые давно не приходили, и обновите предложения.
                    </div>
                    <div className="dash-assistant-actions">
                      <button className="dash-outline" type="button">Запустить Цепочку Напоминаний</button>
                      <button className="dash-muted" type="button" disabled>Обновить Акции</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-section">
            <div className="dash-section-head">
              <div>
                <div className="dash-kicker">АНАЛИТИКА РОСТА</div>
                <div className="dash-section-title">Финансы и эффективность</div>
              </div>
              <button
                className="dash-ghost"
                type="button"
                onClick={() => { window.location.href = "/analytics"; }}
              >
                Открыть Полную Аналитику
              </button>
            </div>

            <div className="dash-grid">
              <div className="dash-col">
                <div className="dash-card">
                  <div className="dash-card-head">
                    <div>
                      <div className="dash-card-title">Маржа/час</div>
                      <div className="dash-card-subtitle">
                        В какие дни работа приносит максимум
                      </div>
                    </div>
                    <div className="dash-chip dash-chip--good">Лучший день: 8 фев, вск — 0 ₽</div>
                  </div>

                  <div className="dash-list">
                    {marginByDay.map((row) => (
                      <div className="dash-row" key={row.day}>
                        <div className="dash-row-top">
                          <div className="dash-row-title">{row.day}</div>
                          <div className="dash-row-right">{row.minutes} мин</div>
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
                      <div className="dash-card-title">Топ-3 маржинальных услуг</div>
                      <div className="dash-card-subtitle">Пока нет данных по услугам</div>
                    </div>
                  </div>
                  <div className="dash-card-body">
                    <div className="dash-note">
                      Когда появятся новые продажи, мы подсветим самые выгодные услуги.
                    </div>
                  </div>
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <div className="dash-card-title">Лучшие клиенты</div>
                  </div>
                  <div className="dash-card-body">
                    <div className="dash-client">
                      <div className="dash-client-rank">1</div>
                      <div className="dash-client-meta">
                        <div className="dash-client-line">LTV: 0 ₽</div>
                        <div className="dash-client-line dash-client-line--muted">Последний визит: —</div>
                      </div>
                    </div>
                    <div className="dash-card-subtitle" style={{ marginTop: 10 }}>
                      Отмечаем тех, кто чаще рекомендует и возвращается.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <div className="dash-card-title">Выручка за период</div>
                <div className="dash-card-subtitle">Сравнение с прошлым периодом</div>
              </div>
              <div className="dash-pill">Нет данных для сравнения</div>
            </div>

            <div className="dash-rev-list">
              {revenueByDay.map((r) => (
                <div className="dash-rev-item" key={r.day}>
                  <div className="dash-rev-top">
                    <div className="dash-rev-date">{r.day}</div>
                    <div className="dash-rev-money">{r.rub} ₽</div>
                  </div>
                  <div className="dash-rev-sub">Нет данных для сравнения</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};







