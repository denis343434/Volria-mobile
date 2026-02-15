import { useEffect, useMemo, useState, type FC } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n";

type Props = {
  label: string;
  valueYmd: string; // yyyy-mm-dd or ""
  onChangeYmd: (v: string) => void;
  iconClassName?: string;
  placeholder?: string;
  fieldClassName?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseYmd(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(da)) return null;
  if (mo < 1 || mo > 12) return null;
  if (da < 1 || da > 31) return null;
  const d = new Date(y, mo - 1, da);
  // Validate overflow (e.g. 2026-02-31)
  if (d.getFullYear() !== y || d.getMonth() !== mo - 1 || d.getDate() !== da) return null;
  return d;
}

function fmtDmyFromYmd(s: string) {
  const d = parseYmd(s);
  if (!d) return "";
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
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

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function cap(s: string) {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

function buildMonthGrid(monthCursor: Date) {
  const first = startOfMonth(monthCursor);
  const start = startOfWeekMon(first);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(start, i));
  return days;
}

export const DatePickerField: FC<Props> = ({
  label,
  valueYmd,
  onChangeYmd,
  iconClassName = "ri-calendar-line",
  placeholder,
  fieldClassName,
}) => {
  const { lang, t } = useI18n();
  const locale = lang === "ru" ? "ru-RU" : "en-US";

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const selected = useMemo(() => parseYmd(valueYmd), [valueYmd]);

  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(selected ?? today));

  const openSheet = () => {
    setCursor(startOfMonth(selected ?? today));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const grid = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const cursorMonth = cursor.getMonth();
  const selectedKey = selected ? ymd(selected) : "";
  const todayKey = ymd(today);

  const monthLabel = useMemo(() => {
    const s = cursor.toLocaleDateString(locale, { month: "long", year: "numeric" });
    return cap(s);
  }, [cursor, locale]);

  const dow = useMemo(() => {
    // 2024-01-01 is Monday; use any Monday to build Mon..Sun in locale.
    const base = new Date(2024, 0, 1);
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(base, i)));
  }, [locale]);

  return (
    <label className={["cf-field", fieldClassName].filter(Boolean).join(" ")}>
      <div className="cf-label">{label}</div>
      <div className="cf-date-wrap">
        <input
          className="cf-input"
          value={valueYmd ? fmtDmyFromYmd(valueYmd) : ""}
          placeholder={placeholder ?? t("dp.placeholderDate")}
          readOnly
          onFocus={openSheet}
          onClick={openSheet}
        />
        <i className={iconClassName} aria-hidden="true" />
      </div>

      {open &&
        createPortal(
          <div
            className="cf-dp-backdrop"
            role="presentation"
            onMouseDown={() => setOpen(false)}
            onTouchStart={() => setOpen(false)}
          >
            <div
              className="cf-dp-sheet"
              role="dialog"
              aria-label={t("dp.chooseDate")}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <div className="cf-dp-head">
                <div className="cf-dp-head-left">
                  <div className="cf-dp-kicker">{t("dp.chooseDate")}</div>
                  <div className="cf-dp-title">{monthLabel}</div>
                </div>
                <button
                  type="button"
                  className="cf-dp-close"
                  onClick={() => setOpen(false)}
                  aria-label={t("dp.close")}
                >
                  <i className="ri-close-line" aria-hidden="true" />
                </button>
              </div>

              <div className="cf-dp-nav">
                <button
                  type="button"
                  className="cf-dp-nav-btn"
                  onClick={() => setCursor((p) => addMonths(p, -1))}
                  aria-label={t("dp.prevMonth")}
                >
                  <i className="ri-arrow-left-s-line" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="cf-dp-nav-btn"
                  onClick={() => setCursor(startOfMonth(today))}
                  aria-label={t("dp.thisMonth")}
                >
                  <i className="ri-calendar-event-line" aria-hidden="true" /> {t("dp.today")}
                </button>
                <button
                  type="button"
                  className="cf-dp-nav-btn"
                  onClick={() => setCursor((p) => addMonths(p, 1))}
                  aria-label={t("dp.nextMonth")}
                >
                  <i className="ri-arrow-right-s-line" aria-hidden="true" />
                </button>
              </div>

              <div className="cf-dp-dow" aria-hidden="true">
                {dow.map((x) => (
                  <div key={x} className="cf-dp-dow-cell">
                    {x}
                  </div>
                ))}
              </div>

              <div className="cf-dp-grid" role="grid" aria-label={t("dp.calendar")}>
                {grid.map((d) => {
                  const k = ymd(d);
                  const outside = d.getMonth() !== cursorMonth;
                  const isSel = !!selectedKey && k === selectedKey;
                  const isToday = k === todayKey;

                  return (
                    <button
                      key={k}
                      type="button"
                      className={[
                        "cf-dp-day",
                        outside ? "is-outside" : "",
                        isToday ? "is-today" : "",
                        isSel ? "is-selected" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => {
                        onChangeYmd(k);
                        setOpen(false);
                      }}
                      role="gridcell"
                      aria-selected={isSel}
                      aria-label={fmtDmyFromYmd(k)}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="cf-dp-foot">
                <button
                  type="button"
                  className="cf-dp-foot-btn is-muted"
                  onClick={() => {
                    onChangeYmd("");
                    setOpen(false);
                  }}
                >
                  {t("dp.clear")}
                </button>
                <button
                  type="button"
                  className="cf-dp-foot-btn is-primary"
                  onClick={() => {
                    onChangeYmd(todayKey);
                    setOpen(false);
                  }}
                >
                  {t("dp.today")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </label>
  );
};
