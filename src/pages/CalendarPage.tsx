import { useMemo, useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { loadEvents, type CalendarEventRecord } from "../utils/eventsStore";
import "../styles/dashboard.css";
import "../styles/calendar.css";

type ViewMode = "month" | "week" | "day" | "list";

type CalendarEvent = {
  time: string;
  title: string;
};

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function cap(s: string) {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfWeekMon(d: Date) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const dowMon0 = (dt.getDay() + 6) % 7; // Mon=0
  dt.setDate(dt.getDate() - dowMon0);
  return dt;
}

function addDays(d: Date, n: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

function addMinutesToHHMM(hhmm: string, minutes: number) {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return hhmm;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(mm)) return hhmm;
  const total = h * 60 + mm + minutes;
  const safe = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(safe / 60);
  const m2 = safe % 60;
  return `${String(hh).padStart(2, "0")}:${String(m2).padStart(2, "0")}`;
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function buildMonthGrid(monthCursor: Date) {
  const first = startOfMonth(monthCursor);
  const dowMon0 = (first.getDay() + 6) % 7; // Monday=0
  const start = new Date(first);
  start.setDate(first.getDate() - dowMon0);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export const CalendarPage: FC = () => {
  const now = new Date();
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<Date>(startOfMonth(now));
  const [selected, setSelected] = useState<Date>(new Date(now));

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};

    const defaults: CalendarEventRecord[] = [
      { id: "d1", date: "2026-02-14", time: "00:00", title: "Master" },
      { id: "d2", date: "2026-02-15", time: "00:00", title: "Данил" },
    ];

    for (const ev of [...loadEvents(), ...defaults]) {
      (map[ev.date] ??= []).push({ time: ev.time, title: ev.title });
    }

    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.time.localeCompare(b.time));
    }

    return map;
  }, []);

  const grid = useMemo(() => buildMonthGrid(cursor), [cursor]);

  const monthLabel = useMemo(() => {
    const s = cursor.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
    return cap(s);
  }, [cursor]);

  const selectedLabel = useMemo(() => {
    const s = selected.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return cap(s);
  }, [selected]);

  const selectedKey = ymd(selected);
  const selectedEvents = eventsByDay[selectedKey] ?? [];
  const isWeekend = selected.getDay() === 0 || selected.getDay() === 6;

  const weekStart = useMemo(() => startOfWeekMon(selected), [selected]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const weekLabel = useMemo(() => {
    const a = weekDays[0];
    const b = weekDays[6];
    const fa = a.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    const fb = b.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    return `${fa} - ${fb}`;
  }, [weekDays]);

  const listDays = useMemo(() => {
    const days = weekDays.filter((d) => (eventsByDay[ymd(d)]?.length ?? 0) > 0);
    if (!days.length) return [selected];
    return days;
  }, [eventsByDay, selected, weekDays]);

  return (
    <div className="dash-shell cal-shell">
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
              <button className="dash-icon-btn" type="button" title="Обновить" onClick={() => window.location.reload()}>
                <i className="ri-refresh-line" aria-hidden="true" />
              </button>
              <MessagesBell />
            </div>
            <AvatarBubble />
          </div>
        </header>

        <section className="dash-content">
          <div className="cal-head">
            <div>
              <h1 className="cal-title">Календарь</h1>
              <div className="cal-sub">{monthLabel}</div>
              <div className="cal-hint">Планируйте расписание, контролируйте записи и следите за доступностью.</div>
            </div>

            <div className="cal-actions">
              <div className="cal-nav">
                <button
                  type="button"
                  className="cal-nav-btn"
                  title="Предыдущий месяц"
                  onClick={() => setCursor((d) => addMonths(d, -1))}
                >
                  <i className="ri-arrow-left-s-line" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="cal-nav-btn"
                  title="Следующий месяц"
                  onClick={() => setCursor((d) => addMonths(d, 1))}
                >
                  <i className="ri-arrow-right-s-line" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                className="cal-btn"
                onClick={() => {
                  setCursor(startOfMonth(new Date()));
                  setSelected(new Date());
                }}
              >
                <i className="ri-calendar-event-line" aria-hidden="true" /> Сегодня
              </button>
            </div>
          </div>

          <div className="cal-tabs" role="tablist" aria-label="Вид">
            <button type="button" className={`cal-tab ${view === "month" ? "is-active" : ""}`} onClick={() => setView("month")}>
              Месяц
            </button>
            <button type="button" className={`cal-tab ${view === "week" ? "is-active" : ""}`} onClick={() => setView("week")}>
              Неделя
            </button>
            <button type="button" className={`cal-tab ${view === "day" ? "is-active" : ""}`} onClick={() => setView("day")}>
              День
            </button>
            <button type="button" className={`cal-tab ${view === "list" ? "is-active" : ""}`} onClick={() => setView("list")}>
              Список
            </button>
          </div>

          {view === "week" ? (
            <div className="cal-week dash-card" aria-label="Неделя">
              <div className="cal-week-top">
                <div>
                  <div className="cal-week-title">Неделя</div>
                  <div className="cal-week-sub">{weekLabel}</div>
                </div>
                <button
                  type="button"
                  className="cal-week-new"
                  onClick={() => {
                    window.location.href = `/calendar/new?date=${encodeURIComponent(selectedKey)}`;
                  }}
                >
                  <i className="ri-add-line" aria-hidden="true" /> Новая запись
                </button>
              </div>

              <div className="cal-week-scroll" role="region" aria-label="Таблица недели">
                <div className="cal-week-grid" style={{ gridTemplateColumns: `56px repeat(7, minmax(120px, 1fr))` }}>
                  <div className="cal-week-corner" aria-hidden="true" />
                  {weekDays.map((d) => {
                    const k = ymd(d);
                    const isToday = k === ymd(now);
                    const isWknd = d.getDay() === 0 || d.getDay() === 6;
                    const label = d.toLocaleDateString("ru-RU", { weekday: "short", day: "2-digit", month: "2-digit" });
                    return (
                      <button
                        key={k}
                        type="button"
                        className={"cal-week-head" + (isToday ? " is-today" : "") + (isWknd ? " is-weekend" : "")}
                        onClick={() => setSelected(new Date(d))}
                        title={d.toLocaleDateString("ru-RU")}
                      >
                        {label}
                      </button>
                    );
                  })}

                  <div className="cal-week-time is-sticky">Весь день</div>
                  {weekDays.map((d) => {
                    const k = ymd(d);
                    const isWknd = d.getDay() === 0 || d.getDay() === 6;
                    const all = (eventsByDay[k] ?? []).filter((ev) => {
                      const h = Number(ev.time.slice(0, 2));
                      return !Number.isFinite(h) || h < 6 || h > 18;
                    });
                    return (
                      <button
                        key={k + "_all"}
                        type="button"
                        className={"cal-week-cell cal-week-all" + (isWknd ? " is-weekend" : "")}
                        onClick={() => setSelected(new Date(d))}
                        title="Весь день"
                      >
                        {all.slice(0, 1).map((ev) => (
                          <div className="cal-week-ev" key={ev.time + ev.title}>
                            <span className="cal-week-ev-dot" aria-hidden="true" />
                            <span className="cal-week-ev-title">{ev.title}</span>
                          </div>
                        ))}
                        {all.length > 1 && <span className="cal-week-more">+{all.length - 1}</span>}
                      </button>
                    );
                  })}

                  {Array.from({ length: 13 }, (_, i) => 6 + i).map((h) => (
                    <div key={h} className="cal-week-time is-sticky">
                      {String(h).padStart(2, "0")}
                    </div>
                  ))}

                  {Array.from({ length: 13 }, (_, i) => 6 + i).flatMap((h) =>
                    weekDays.map((d) => {
                      const k = ymd(d);
                      const isWknd = d.getDay() === 0 || d.getDay() === 6;
                      const at = (eventsByDay[k] ?? []).filter((ev) => Number(ev.time.slice(0, 2)) === h);
                      return (
                        <button
                          key={k + "_" + h}
                          type="button"
                          className={"cal-week-cell" + (isWknd ? " is-weekend" : "")}
                          onClick={() => setSelected(new Date(d))}
                          title={`${k} ${String(h).padStart(2, "0")}:00`}
                        >
                          {at.slice(0, 1).map((ev) => (
                            <div className="cal-week-ev" key={ev.time + ev.title}>
                              <span className="cal-week-ev-dot" aria-hidden="true" />
                              <span className="cal-week-ev-time">{ev.time}</span>
                              <span className="cal-week-ev-title">{ev.title}</span>
                            </div>
                          ))}
                          {at.length > 1 && <span className="cal-week-more">+{at.length - 1}</span>}
                        </button>
                      );
                    }),
                  )}
                </div>
              </div>
            </div>
          ) : view === "day" ? (
            <div className="cal-dayview dash-card" aria-label="День">
              <div className="cal-week-top">
                <div>
                  <div className="cal-week-title">День</div>
                  <div className="cal-week-sub">{selectedLabel}</div>
                </div>
                <button
                  type="button"
                  className="cal-week-new"
                  onClick={() => {
                    window.location.href = `/calendar/new?date=${encodeURIComponent(selectedKey)}`;
                  }}
                >
                  <i className="ri-add-line" aria-hidden="true" /> Новая запись
                </button>
              </div>

              <div className="cal-week-scroll cal-day-scroll" role="region" aria-label="Таблица дня">
                <div className="cal-week-grid cal-day-grid" style={{ gridTemplateColumns: `56px minmax(240px, 1fr)` }}>
                  <div className="cal-week-corner" aria-hidden="true" />
                  <div className={"cal-week-head" + (ymd(now) === selectedKey ? " is-today" : "")}>
                    {selected.toLocaleDateString("ru-RU", { weekday: "short", day: "2-digit", month: "2-digit" })}
                  </div>

                  <div className="cal-week-time is-sticky">Весь день</div>
                  <button type="button" className={"cal-week-cell cal-week-all" + (isWeekend ? " is-weekend" : "")}>
                    {(eventsByDay[selectedKey] ?? [])
                      .filter((ev) => {
                        const h = Number(ev.time.slice(0, 2));
                        return !Number.isFinite(h) || h < 6 || h > 18;
                      })
                      .slice(0, 2)
                      .map((ev) => (
                        <div className="cal-week-ev" key={ev.time + ev.title}>
                          <span className="cal-week-ev-dot" aria-hidden="true" />
                          <span className="cal-week-ev-title">{ev.title}</span>
                        </div>
                      ))}
                  </button>

                  {Array.from({ length: 13 }, (_, i) => 6 + i).map((h) => (
                    <div key={h} className="cal-week-time is-sticky">
                      {String(h).padStart(2, "0")}
                    </div>
                  ))}

                  {Array.from({ length: 13 }, (_, i) => 6 + i).map((h) => {
                    const at = (eventsByDay[selectedKey] ?? []).filter((ev) => Number(ev.time.slice(0, 2)) === h);
                    return (
                      <button
                        key={selectedKey + "_" + h}
                        type="button"
                        className={"cal-week-cell" + (isWeekend ? " is-weekend" : "")}
                        title={`${selectedKey} ${String(h).padStart(2, "0")}:00`}
                      >
                        {at.slice(0, 2).map((ev) => (
                          <div className="cal-week-ev" key={ev.time + ev.title}>
                            <span className="cal-week-ev-dot" aria-hidden="true" />
                            <span className="cal-week-ev-time">{ev.time}</span>
                            <span className="cal-week-ev-title">{ev.title}</span>
                          </div>
                        ))}
                        {at.length > 2 && <span className="cal-week-more">+{at.length - 2}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : view === "list" ? (
            <div className="cal-list dash-card" aria-label="Список">
              <div className="cal-week-top">
                <div>
                  <div className="cal-week-title">Список</div>
                  <div className="cal-week-sub">Записи за неделю</div>
                </div>
                <button
                  type="button"
                  className="cal-week-new"
                  onClick={() => {
                    window.location.href = `/calendar/new?date=${encodeURIComponent(selectedKey)}`;
                  }}
                >
                  <i className="ri-add-line" aria-hidden="true" /> Новая запись
                </button>
              </div>

              <div className="cal-list-wrap">
                {listDays.map((d) => {
                  const k = ymd(d);
                  const evs = (eventsByDay[k] ?? []).slice().sort((a, b) => a.time.localeCompare(b.time));
                  const wd = d.toLocaleDateString("ru-RU", { weekday: "long" }).toLowerCase();
                  const date = d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
                  return (
                    <div className="cal-list-day" key={k}>
                      <div className="cal-list-head">
                        <div className="cal-list-weekday">{wd}</div>
                        <div className="cal-list-date">{date}</div>
                      </div>

                      {!evs.length ? (
                        <div className="cal-list-empty">В этот день пока нет записей.</div>
                      ) : (
                        <div className="cal-list-rows">
                          {evs.map((ev) => (
                            <div className="cal-list-row" key={ev.time + ev.title}>
                              <div className="cal-list-time">
                                {ev.time} - {addMinutesToHHMM(ev.time, 60)}
                              </div>
                              <span className="cal-list-dot" aria-hidden="true" />
                              <div className="cal-list-title">{ev.title}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="cal-wrap">
              <div className="cal-month dash-card">
                <div className="cal-weekdays" aria-hidden="true">
                  {["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map((w) => (
                    <div className="cal-wd" key={w}>
                      {w}
                    </div>
                  ))}
                </div>

                <div className="cal-grid" role="grid" aria-label="Месяц">
                  {grid.map((d) => {
                    const inMonth = d.getMonth() === cursor.getMonth();
                    const k = ymd(d);
                    const isSel = k === ymd(selected);
                    const isToday = k === ymd(now);
                    const hasEvents = (eventsByDay[k]?.length ?? 0) > 0;

                    return (
                      <button
                        key={k}
                        type="button"
                        className={
                          "cal-day" +
                          (inMonth ? "" : " is-out") +
                          (isSel ? " is-selected" : "") +
                          (isToday ? " is-today" : "")
                        }
                        onClick={() => setSelected(new Date(d))}
                        aria-selected={isSel}
                      >
                        <div className="cal-day-top">
                          <div className="cal-num">{d.getDate()}</div>
                          {hasEvents && <div className="cal-dot" aria-hidden="true" />}
                        </div>
                        {eventsByDay[k]?.slice(0, 1).map((ev) => (
                          <div className="cal-ev" key={ev.title + ev.time}>
                            <span className="cal-ev-time">{ev.time}</span>
                            <span className="cal-ev-title">{ev.title}</span>
                          </div>
                        ))}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="cal-details dash-card">
                <div className="cal-details-head">
                  <div>
                    <div className="cal-details-kicker">ДЕТАЛИ ДНЯ</div>
                    <div className="cal-details-title">{selectedLabel}</div>
                    <div className="dash-card-subtitle">
                      {selectedEvents.length ? "Записи на выбранный день" : "В этот день пока нет записей"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="dash-primary"
                    onClick={() => {
                      window.location.href = `/calendar/new?date=${encodeURIComponent(selectedKey)}`;
                    }}
                    style={{ height: 40 }}
                  >
                    + Новая Запись
                  </button>
                </div>

                {isWeekend && (
                  <div className="cal-callout">
                    <div className="cal-callout-title">Выходной день</div>
                    <div className="cal-callout-text">Эта дата не отмечена как рабочая в вашем расписании.</div>
                  </div>
                )}

                <div className="cal-block">
                  <div className="cal-block-head">
                    <div className="cal-block-title">Свободные слоты</div>
                    <div className="cal-badge">0</div>
                  </div>
                  <div className="cal-block-text">Свободные слоты рассчитываются на основе рабочих часов в настройках.</div>
                  <div className="cal-block-text cal-block-muted">Нет свободных слотов</div>
                </div>

                <div className="cal-block">
                  <div className="cal-block-title">Записи</div>
                  {selectedEvents.length ? (
                    <div className="cal-appts">
                      {selectedEvents.map((ev) => (
                        <div className="cal-appt" key={ev.time + ev.title}>
                          <div className="cal-appt-time">{ev.time}</div>
                          <div className="cal-appt-title">{ev.title}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="cal-block-text">В этот день пока нет записей.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

