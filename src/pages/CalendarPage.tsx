import { useEffect, useMemo, useState, type FC } from "react";
import { createPortal } from "react-dom";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { loadEvents, type CalendarEventRecord } from "../utils/eventsStore";
import { useI18n } from "../i18n";
import "../styles/dashboard.css";
import "../styles/calendar.css";

type ViewMode = "month" | "week" | "day" | "list";

type Slot =
  | { date: Date; kind: "day" }
  | { date: Date; kind: "all" }
  | { date: Date; kind: "hour"; hour: number };

function displayWho(ev: CalendarEventRecord) {
  const c = (ev.clientName ?? "").trim();
  if (c) return c;
  const t = (ev.title ?? "").trim();
  if (t) return t;
  const m = (ev.master ?? "").trim();
  if (m) return m;
  return "Запись";
}

function hourFromHHMM(hhmm: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const h = Number(m[1]);
  if (!Number.isFinite(h)) return null;
  if (h < 0 || h > 23) return null;
  return h;
}

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
  const { t, lang } = useI18n(); // Добавлен lang
  const now = new Date();
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<Date>(startOfMonth(now));
  const [selected, setSelected] = useState<Date>(new Date(now));
  const [slot, setSlot] = useState<Slot | null>(null);

  useEffect(() => {
    if (!slot) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSlot(null);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [slot]);

  const openDay = (d: Date) => {
    const dd = new Date(d);
    setSelected(dd);
    setSlot({ date: dd, kind: "day" });
  };

  const openAll = (d: Date) => {
    const dd = new Date(d);
    setSelected(dd);
    setSlot({ date: dd, kind: "all" });
  };

  const openHour = (d: Date, hour: number) => {
    const dd = new Date(d);
    setSelected(dd);
    setSlot({ date: dd, kind: "hour", hour });
  };

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEventRecord[]> = {};

    const defaults: CalendarEventRecord[] = [
      { id: "d1", date: "2026-02-14", time: "11:00", clientName: "Анна", phone: "+7 900 000-00-00", master: "Вы", title: "Анна" },
      { id: "d2", date: "2026-02-15", time: "11:00", clientName: "Данил", phone: "+7 900 000-00-01", master: "Данил", title: "Данил" },
    ];

    for (const ev of [...loadEvents(), ...defaults]) {
      (map[ev.date] ??= []).push(ev);
    }

    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.time.localeCompare(b.time));
    }

    return map;
  }, []);

  const grid = useMemo(() => buildMonthGrid(cursor), [cursor]);

  // ИСПРАВЛЕНО: используем toLocaleDateString с учетом языка
  const monthLabel = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
    const s = cursor.toLocaleDateString(locale, options);
    return cap(s);
  }, [cursor, lang]);

  // ИСПРАВЛЕНО: используем toLocaleDateString с учетом языка
  const selectedLabel = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
    const s = selected.toLocaleDateString(locale, options);
    return cap(s);
  }, [selected, lang]);

  const selectedKey = ymd(selected);
  const selectedEvents = eventsByDay[selectedKey] ?? [];
  const isWeekend = selected.getDay() === 0 || selected.getDay() === 6;

  const weekStart = useMemo(() => startOfWeekMon(selected), [selected]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const weekLabel = useMemo(() => {
    const a = weekDays[0];
    const b = weekDays[6];
    const fa = a.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: "2-digit", month: "2-digit" });
    const fb = b.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: "2-digit", month: "2-digit" });
    return `${fa} - ${fb}`;
  }, [weekDays, lang]);

  const listDays = useMemo(() => {
    const days = weekDays.filter((d) => (eventsByDay[ymd(d)]?.length ?? 0) > 0);
    if (!days.length) return [selected];
    return days;
  }, [eventsByDay, selected, weekDays]);

  const slotKey = slot ? ymd(slot.date) : "";
  const slotLabel = useMemo(() => {
    if (!slot) return "";
    const base = selectedLabel; // используем уже переведенную дату
    if (slot.kind === "hour") return `${base}, ${String(slot.hour).padStart(2, "0")}:00`;
    if (slot.kind === "all") return `${base}, ${t("calendar.allDay").toLowerCase()}`;
    return base;
  }, [slot, selectedLabel, t]);

  const slotEvents = useMemo(() => {
    if (!slot) return [];
    const day = (eventsByDay[slotKey] ?? []).slice().sort((a, b) => a.time.localeCompare(b.time));
    if (slot.kind === "day") return day;
    if (slot.kind === "all") {
      return day.filter((ev) => {
        const h = hourFromHHMM(ev.time);
        return h === null || h < 6 || h > 18;
      });
    }
    return day.filter((ev) => hourFromHHMM(ev.time) === slot.hour);
  }, [eventsByDay, slot, slotKey]);

  // Массив дней недели для отображения
  const weekdays = [
    t("calendar.weekdays.mon"),
    t("calendar.weekdays.tue"),
    t("calendar.weekdays.wed"),
    t("calendar.weekdays.thu"),
    t("calendar.weekdays.fri"),
    t("calendar.weekdays.sat"),
    t("calendar.weekdays.sun")
  ];

  return (
    <div className="dash-shell cal-shell">
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
              <button className="dash-icon-btn" type="button" title={t("common.refresh")} onClick={() => window.location.reload()}>
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
              <h1 className="cal-title">{t("calendar.title")}</h1>
              <div className="cal-sub">{monthLabel}</div>
              <div className="cal-hint">{t("calendar.hint")}</div>
            </div>

            <div className="cal-actions">
              <div className="cal-nav">
                <button
                  type="button"
                  className="cal-nav-btn"
                  title={t("calendar.prevMonth")}
                  onClick={() => setCursor((d) => addMonths(d, -1))}
                >
                  <i className="ri-arrow-left-s-line" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="cal-nav-btn"
                  title={t("calendar.nextMonth")}
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
                <i className="ri-calendar-event-line" aria-hidden="true" /> {t("dp.today")}
              </button>
            </div>
          </div>

          <div className="cal-tabs" role="tablist" aria-label={t("calendar.view")}>
            <button type="button" className={`cal-tab ${view === "month" ? "is-active" : ""}`} onClick={() => setView("month")}>
              {t("calendar.view.month")}
            </button>
            <button type="button" className={`cal-tab ${view === "week" ? "is-active" : ""}`} onClick={() => setView("week")}>
              {t("calendar.view.week")}
            </button>
            <button type="button" className={`cal-tab ${view === "day" ? "is-active" : ""}`} onClick={() => setView("day")}>
              {t("calendar.view.day")}
            </button>
            <button type="button" className={`cal-tab ${view === "list" ? "is-active" : ""}`} onClick={() => setView("list")}>
              {t("calendar.view.list")}
            </button>
          </div>

          {view === "week" ? (
            <div className="cal-week dash-card" aria-label={t("calendar.week")}>
              <div className="cal-week-top">
                <div>
                  <div className="cal-week-title">{t("calendar.week")}</div>
                  <div className="cal-week-sub">{weekLabel}</div>
                </div>
                <button
                  type="button"
                  className="cal-week-new"
                  onClick={() => {
                    window.location.href = `/calendar/new?date=${encodeURIComponent(selectedKey)}`;
                  }}
                >
                  <i className="ri-add-line" aria-hidden="true" /> {t("calendar.newBooking")}
                </button>
              </div>

              <div className="cal-week-scroll" role="region" aria-label={t("calendar.weekTable")}>
                <div className="cal-week-grid" style={{ gridTemplateColumns: `56px repeat(7, minmax(0, 1fr))` }}>
                  <div className="cal-week-corner" aria-hidden="true" />
                  {weekDays.map((d) => {
                    const k = ymd(d);
                    const isToday = k === ymd(now);
                    const isWknd = d.getDay() === 0 || d.getDay() === 6;
                    const dayIndex = d.getDay(); // 0 = воскресенье, 1 = понедельник, ...
                    // Преобразуем в индекс для нашего массива (0 = понедельник)
                    const weekdayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
                    const label = d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: "2-digit", month: "2-digit" });
                    return (
                      <button
                        key={k}
                        type="button"
                        className={"cal-week-head" + (isToday ? " is-today" : "") + (isWknd ? " is-weekend" : "")}
                        onClick={() => openDay(d)}
                        title={d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}
                      >
                        <div>{weekdays[weekdayIndex]}</div>
                        <div>{label}</div>
                      </button>
                    );
                  })}

                  <div className="cal-week-time is-sticky">{t("calendar.allDay")}</div>
                  {weekDays.map((d) => {
                    const k = ymd(d);
                    const isWknd = d.getDay() === 0 || d.getDay() === 6;
                    const all = (eventsByDay[k] ?? []).filter((ev) => {
                      const h = hourFromHHMM(ev.time);
                      return h === null || h < 6 || h > 18;
                    });
                    return (
                      <button
                        key={k + "_all"}
                        type="button"
                        className={"cal-week-cell cal-week-all" + (isWknd ? " is-weekend" : "")}
                        onClick={() => openAll(d)}
                        title={t("calendar.allDay")}
                      >
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
                      const at = (eventsByDay[k] ?? []).filter((ev) => hourFromHHMM(ev.time) === h);
                      return (
                        <button
                          key={k + "_" + h}
                          type="button"
                          className={"cal-week-cell" + (isWknd ? " is-weekend" : "")}
                          onClick={() => openHour(d, h)}
                          title={`${k} ${String(h).padStart(2, "0")}:00`}
                        >
                          {at.slice(0, 1).map((ev) => (
                            <div className="cal-week-ev" key={ev.id}>
                              <span className="cal-week-ev-time">{ev.time}</span>
                              <span className="cal-week-ev-title">{displayWho(ev)}</span>
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
            <div className="cal-dayview dash-card" aria-label={t("calendar.day")}>
              <div className="cal-week-top">
                <div>
                  <div className="cal-week-title">{t("calendar.day")}</div>
                  <div className="cal-week-sub">{selectedLabel}</div>
                </div>
                <button
                  type="button"
                  className="cal-week-new"
                  onClick={() => {
                    window.location.href = `/calendar/new?date=${encodeURIComponent(selectedKey)}`;
                  }}
                >
                  <i className="ri-add-line" aria-hidden="true" /> {t("calendar.newBooking")}
                </button>
              </div>

              <div className="cal-week-scroll cal-day-scroll" role="region" aria-label={t("calendar.dayTable")}>
                <div className="cal-week-grid cal-day-grid" style={{ gridTemplateColumns: `56px minmax(0, 1fr)` }}>
                  <div className="cal-week-corner" aria-hidden="true" />
                  <div className={"cal-week-head" + (ymd(now) === selectedKey ? " is-today" : "")}>
                    {selected.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: "short", day: "2-digit", month: "2-digit" })}
                  </div>

                  <div className="cal-week-time is-sticky">{t("calendar.allDay")}</div>
                  <button
                    type="button"
                    className={"cal-week-cell cal-week-all" + (isWeekend ? " is-weekend" : "")}
                    onClick={() => openAll(selected)}
                  >
                    {(eventsByDay[selectedKey] ?? [])
                      .filter((ev) => {
                        const h = hourFromHHMM(ev.time);
                        return h === null || h < 6 || h > 18;
                      })
                      .slice(0, 2)
                      .map((ev) => (
                        <div className="cal-week-ev cal-week-ev-d-f" key={ev.id}>
                          <span className="cal-week-ev-dot" aria-hidden="true" />
                          <span className="cal-week-ev-title">{displayWho(ev)}</span>
                        </div>
                      ))}
                  </button>

                  {Array.from({ length: 13 }, (_, i) => 6 + i).map((h) => (
                    <div key={h} className="cal-week-time is-sticky">
                      {String(h).padStart(2, "0")}
                    </div>
                  ))}

                  {Array.from({ length: 13 }, (_, i) => 6 + i).map((h) => {
                    const at = (eventsByDay[selectedKey] ?? []).filter((ev) => hourFromHHMM(ev.time) === h);
                    return (
                      <button
                        key={selectedKey + "_" + h}
                        type="button"
                        className={"cal-week-cell" + (isWeekend ? " is-weekend" : "")}
                        onClick={() => openHour(selected, h)}
                        title={`${selectedKey} ${String(h).padStart(2, "0")}:00`}
                      >
                        {at.slice(0, 2).map((ev) => (
                          <div className="cal-week-ev" key={ev.id}>
                            <span className="cal-week-ev-time">{ev.time}</span>
                            <span className="cal-week-ev-title">{displayWho(ev)}</span>
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
            <div className="cal-list dash-card" aria-label={t("calendar.list")}>
              <div className="cal-week-top">
                <div>
                  <div className="cal-week-title">{t("calendar.list")}</div>
                  <div className="cal-week-sub">{t("calendar.list.subtitle")}</div>
                </div>
                <button
                  type="button"
                  className="cal-week-new"
                  onClick={() => {
                    window.location.href = `/calendar/new?date=${encodeURIComponent(selectedKey)}`;
                  }}
                >
                  <i className="ri-add-line" aria-hidden="true" /> {t("calendar.newBooking")}
                </button>
              </div>

              <div className="cal-list-wrap">
                {listDays.map((d) => {
                  const k = ymd(d);
                  const evs = (eventsByDay[k] ?? []).slice().sort((a, b) => a.time.localeCompare(b.time));
                  const wd = d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: "long" }).toLowerCase();
                  const date = d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: "numeric", month: "long", year: "numeric" });
                  return (
                    <div className="cal-list-day" key={k}>
                      <div className="cal-list-head">
                        <div className="cal-list-weekday">{wd}</div>
                        <div className="cal-list-date">{date}</div>
                      </div>

                      {!evs.length ? (
                        <div className="cal-list-empty">{t("calendar.bookings.noneDay")}</div>
                      ) : (
                        <div className="cal-list-rows">
                          {evs.map((ev) => (
                            <div className="cal-list-row" key={ev.id}>
                              <div className="cal-list-time">
                                {ev.time} - {addMinutesToHHMM(ev.time, 60)}
                              </div>
                              <span className="cal-list-dot" aria-hidden="true" />
                              <div className="cal-list-title">{displayWho(ev)}</div>
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
                  {weekdays.map((w) => (
                    <div className="cal-wd" key={w}>
                      {w}
                    </div>
                  ))}
                </div>

                <div className="cal-grid" role="grid" aria-label={t("calendar.monthGrid")}>
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
                        </div>
                        {eventsByDay[k]?.slice(0, 1).map((ev) => (
                          <div className="cal-ev" key={ev.id}>
                            <div className="time">
                              <span className="cal-ev-time">{ev.time}</span>
                              {hasEvents && <div className="cal-dot" aria-hidden="true" />}
                            </div>
                            <div className="name">
                              <span className="cal-ev-title">{displayWho(ev)}</span>
                            </div>
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
                    <div className="cal-details-kicker">{t("calendar.dayDetails.kicker").toUpperCase()}</div>
                    <div className="cal-details-title">{selectedLabel}</div>
                    <div className="dash-card-subtitle">
                      {selectedEvents.length ? t("calendar.dayDetails.withBookings") : t("calendar.dayDetails.noBookings")}
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
                    {t("calendar.dayDetails.add")}
                  </button>
                </div>

                {isWeekend && (
                  <div className="cal-callout">
                    <div className="cal-callout-title">{t("calendar.weekend.title")}</div>
                    <div className="cal-callout-text">{t("calendar.weekend.text")}</div>
                  </div>
                )}

                <div className="cal-block">
                  <div className="cal-block-head">
                    <div className="cal-block-title">{t("calendar.freeSlots.title")}</div>
                    <div className="cal-badge">0</div>
                  </div>
                  <div className="cal-block-text">{t("calendar.freeSlots.hint")}</div>
                  <div className="cal-block-text cal-block-muted">{t("calendar.freeSlots.none")}</div>
                </div>

                <div className="cal-block">
                  <div className="cal-block-title">{t("calendar.bookings.title")}</div>
                  {selectedEvents.length ? (
                    <div className="cal-appts">
                      {selectedEvents.map((ev) => (
                        <div className="cal-appt" key={ev.id}>
                          <div className="cal-appt-time">{ev.time}</div>
                          <div className="cal-appt-title">{displayWho(ev)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="cal-block-text">{t("calendar.bookings.noneDay")}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {slot &&
            createPortal(
              <div
                className="cal-sheet-backdrop"
                role="presentation"
                onPointerDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  setSlot(null);
                }}
              >
                <div
                  className="cal-sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-label={t("calendar.sheet.bookings")}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="cal-sheet-head">
                    <div className="cal-sheet-head-left">
                      <div className="cal-sheet-kicker">{t("calendar.sheet.kicker").toUpperCase()}</div>
                      <div className="cal-sheet-title">{slotLabel}</div>
                      <div className="cal-sheet-sub">
                        {slotEvents.length ? t("calendar.sheet.found", { count: slotEvents.length }) : t("calendar.sheet.none")}
                      </div>
                    </div>

                    <div className="cal-sheet-head-right">
                      <button
                        type="button"
                        className="cal-sheet-new"
                        onClick={() => {
                          const k = ymd(slot.date);
                          window.location.href = `/calendar/new?date=${encodeURIComponent(k)}`;
                        }}
                        title={t("calendar.sheet.newTitle")}
                      >
                        <i className="ri-add-line" aria-hidden="true" /> {t("calendar.sheet.new")}
                      </button>
                      <button type="button" className="cal-sheet-close" onClick={() => setSlot(null)} aria-label={t("common.close")}>
                        <i className="ri-close-line" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="cal-sheet-body">
                    {slotEvents.length ? (
                      <div className="cal-sheet-list" role="list">
                        {slotEvents.map((ev) => (
                          <div className="cal-sheet-item" key={ev.id} role="listitem">
                            <div className="cal-sheet-item-main">
                              <div className="cal-sheet-item-top">
                                <div className="cal-sheet-time">{ev.time}</div>
                                <div className="cal-sheet-who">{displayWho(ev)}</div>
                              </div>

                              {(ev.master || ev.services?.length || ev.status) && (
                                <div className="cal-sheet-meta">
                                  {ev.master && (
                                    <span className="cal-sheet-pill">
                                      <i className="ri-user-star-line" aria-hidden="true" /> {ev.master}
                                    </span>
                                  )}
                                  {ev.status && (
                                    <span className="cal-sheet-pill">
                                      <i className="ri-checkbox-circle-line" aria-hidden="true" /> {ev.status}
                                    </span>
                                  )}
                                  {ev.services?.slice(0, 3).map((s) => (
                                    <span className="cal-sheet-pill" key={s}>
                                      <i className="ri-scissors-line" aria-hidden="true" /> {s}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {ev.note && <div className="cal-sheet-note">{ev.note}</div>}
                            </div>

                            <div className="cal-sheet-item-actions">
                              {ev.phone && (
                                <a className="cal-sheet-icon" href={`tel:${ev.phone}`} title={t("calendar.sheet.call")} aria-label={t("calendar.sheet.call")}>
                                  <i className="ri-phone-line" aria-hidden="true" />
                                </a>
                              )}
                              {ev.email && (
                                <a className="cal-sheet-icon" href={`mailto:${ev.email}`} title="Email" aria-label="Email">
                                  <i className="ri-mail-line" aria-hidden="true" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="cal-sheet-empty">{t("calendar.sheet.empty")}</div>
                    )}
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </section>
      </main>
    </div>
  );
};