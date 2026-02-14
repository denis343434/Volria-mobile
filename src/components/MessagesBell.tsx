import { useEffect, useMemo, useRef, useState, type FC } from "react";
import { createPortal } from "react-dom";

type Message = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

type PopPos = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export const MessagesBell: FC = () => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopPos>(() => ({
    top: 0,
    left: 12,
    width: 360,
    maxHeight: 420,
  }));

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "m1",
      title: "Новая запись",
      body: "Клиент попросил перенести время. Проверьте календарь.",
      time: "Только что",
      unread: true,
    },
    {
      id: "m2",
      title: "Напоминание",
      body: "Сегодня нет запланированных визитов. Самое время написать клиентам.",
      time: "10 мин назад",
      unread: false,
    },
    {
      id: "m3",
      title: "Система",
      body: "Профиль обновлен. Проверьте настройки уведомлений.",
      time: "Вчера",
      unread: false,
    },
  ]);

  const unreadCount = useMemo(() => messages.filter((m) => m.unread).length, [messages]);

  useEffect(() => {
    if (!open) return;

    let raf = 0;
    const updatePos = () => {
      cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        const btn = btnRef.current;
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const pad = 12;
        const gap = 10;
        const desiredW = 360;
        const desiredMaxH = 420;

        const width = Math.min(desiredW, Math.max(280, window.innerWidth - pad * 2));
        const left = clamp(rect.right - width, pad, window.innerWidth - width - pad);

        const belowTop = rect.bottom + gap;
        const belowSpace = window.innerHeight - belowTop - pad;
        const aboveSpace = rect.top - gap - pad;

        // Prefer below, but if there is little space below and more space above, open upwards.
        const openUp = belowSpace < 220 && aboveSpace > belowSpace;

        let top = belowTop;
        let maxHeight = Math.min(desiredMaxH, Math.max(160, belowSpace));

        if (openUp) {
          const measuredH = popRef.current?.getBoundingClientRect().height ?? desiredMaxH;
          maxHeight = Math.min(desiredMaxH, Math.max(160, aboveSpace));
          top = clamp(
            rect.top - gap - Math.min(measuredH, maxHeight),
            pad,
            window.innerHeight - pad - 160,
          );
        }

        setPos({ top, left, width, maxHeight });
      });
    };

    updatePos();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      const wrap = wrapRef.current;
      const pop = popRef.current;
      if (!wrap) return;
      if (!(e.target instanceof Node)) return;
      if (wrap.contains(e.target)) return;
      if (pop && pop.contains(e.target)) return;
      setOpen(false);
    };

    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const markAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, unread: false })));
  };

  const clearAll = () => {
    setMessages([]);
  };

  const toggleUnread = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, unread: !m.unread } : m)));
  };

  return (
    <div className="dash-msg" ref={wrapRef}>
      <button
        ref={btnRef}
        className="dash-icon-btn"
        type="button"
        title="Сообщения"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="dash-messages"
        onClick={() => setOpen((v) => !v)}
      >
        <i className="ri-notification-3-line" aria-hidden="true" />
        {unreadCount > 0 && <span className="dash-msg-dot" aria-hidden="true" />}
      </button>

      {open &&
        createPortal(
          <div
            ref={popRef}
            className="dash-pop"
            id="dash-messages"
            role="dialog"
            aria-label="Сообщения"
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}
          >
            <div className="dash-pop-head">
              <div>
                <div className="dash-pop-title">Сообщения</div>
                <div className="dash-pop-sub">{messages.length ? `Новых: ${unreadCount}` : "Пока пусто"}</div>
              </div>
              <div className="dash-pop-actions">
                <button type="button" className="dash-pop-btn" onClick={markAllRead} disabled={!unreadCount}>
                  Прочитано
                </button>
                <button
                  type="button"
                  className="dash-pop-btn dash-pop-btn--danger"
                  onClick={clearAll}
                  disabled={!messages.length}
                >
                  Очистить
                </button>
              </div>
            </div>

            <div className="dash-pop-list" role="list">
              {!messages.length ? (
                <div className="dash-pop-empty">
                  <div className="dash-pop-empty-title">Нет сообщений</div>
                  <div className="dash-pop-empty-text">Когда появятся события, они будут здесь.</div>
                </div>
              ) : (
                messages.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className={"dash-pop-item" + (m.unread ? " is-unread" : "")}
                    onClick={() => toggleUnread(m.id)}
                    title="Нажмите чтобы отметить как прочитано/непрочитано"
                  >
                    <div className="dash-pop-item-top">
                      <div className="dash-pop-item-title">{m.title}</div>
                      <div className="dash-pop-item-time">{m.time}</div>
                    </div>
                    <div className="dash-pop-item-body">{m.body}</div>
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

