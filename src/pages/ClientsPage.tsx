import { useEffect, useMemo, useRef, useState, type FC, type FormEvent } from "react";
import { createPortal } from "react-dom";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { addClient, loadClients, removeClient, type ClientRecord } from "../utils/clientsStore";
import "../styles/dashboard.css";
import "../styles/clients.css";
import "../styles/quickCreate.css";

type Loyalty = "all" | "vip" | "regular" | "new";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

type QuickForm = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export const ClientsPage: FC = () => {
  const [query, setQuery] = useState("");
  const [loyalty, setLoyalty] = useState<Loyalty>("all");
  const [clients, setClients] = useState<ClientRecord[]>(() => loadClients());

  const [quickOpen, setQuickOpen] = useState(false);
  const [quickErr, setQuickErr] = useState("");
  const [quickSaving, setQuickSaving] = useState(false);
  const [quick, setQuick] = useState<QuickForm>(() => ({ name: "", phone: "", email: "", notes: "" }));
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q);

      const matchesLoyalty =
        loyalty === "all" ||
        (loyalty === "vip" && c.loyalty === "VIP") ||
        (loyalty === "regular" && c.loyalty === "Обычный") ||
        (loyalty === "new" && c.loyalty === "Новый");

      return matchesQuery && matchesLoyalty;
    });
  }, [clients, loyalty, query]);

  const del = (id: string) => {
    if (!window.confirm("Удалить клиента?")) return;
    removeClient(id);
    setClients(loadClients());
  };

  const openQuick = () => {
    setQuickErr("");
    setQuickSaving(false);
    setQuick({ name: "", phone: "", email: "", notes: "" });
    setQuickOpen(true);
  };

  const closeQuick = () => {
    if (quickSaving) return;
    setQuickOpen(false);
  };

  useEffect(() => {
    if (!quickOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (quickSaving) return;
      setQuickOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [quickOpen, quickSaving]);

  const submitQuick = (e: FormEvent) => {
    e.preventDefault();
    setQuickErr("");

    const name = quick.name.trim();
    if (name.length < 2) {
      setQuickErr("Введите имя клиента (минимум 2 символа).");
      return;
    }

    setQuickSaving(true);
    try {
      addClient({
        name,
        phone: quick.phone.trim() || undefined,
        email: quick.email.trim() || undefined,
        notes: quick.notes.trim() || undefined,
        loyalty: "Не задан",
      });
      setClients(loadClients());
      setQuickOpen(false);
    } catch {
      setQuickErr("Не удалось создать клиента. Попробуйте еще раз.");
      setQuickSaving(false);
    }
  };

  return (
    <div className="dash-shell clients-shell">
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
          <a className="dash-nav-item is-active" href="/clients" aria-current="page" title="Клиенты">
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
          <div className="clients-head">
            <div>
              <h1 className="clients-title">Клиенты</h1>
              <div className="clients-sub">Ведите базу клиентов, отслеживайте визиты и отправляйте напоминания.</div>
            </div>

            <div className="clients-actions">
              <button type="button" className="clients-btn clients-btn--outline" onClick={openQuick}>
                <i className="ri-flashlight-line" aria-hidden="true" /> Быстрое Создание
              </button>
              <button
                type="button"
                className="clients-btn clients-btn--primary"
                onClick={() => {
                  window.location.href = "/clients/new";
                }}
              >
                <i className="ri-user-add-line" aria-hidden="true" /> Добавить Клиента
              </button>
            </div>
          </div>

          <div className="dash-card clients-card">
            <div className="clients-toolbar">
              <div className="clients-left">
                <div className="clients-block-title">
                  Мои клиенты <span className="clients-count">{filtered.length}</span>
                </div>
              </div>

              <div className="clients-filters">
                <label className="clients-field">
                  <div className="clients-field-label">Поиск</div>
                  <div className="clients-input-wrap">
                    <i className="ri-search-line" aria-hidden="true" />
                    <input
                      className="clients-input"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Имя, телефон или email"
                    />
                  </div>
                </label>

                <label className="clients-field">
                  <div className="clients-field-label">Лояльность</div>
                  <div className="clients-select-wrap">
                    <select className="clients-select" value={loyalty} onChange={(e) => setLoyalty(e.target.value as Loyalty)}>
                      <option value="all">Все уровни</option>
                      <option value="vip">VIP</option>
                      <option value="regular">Обычный</option>
                      <option value="new">Новый</option>
                    </select>
                    <i className="ri-arrow-down-s-line" aria-hidden="true" />
                  </div>
                </label>

                <div className="clients-pills" aria-label="Быстрые фильтры">
                  <button type="button" className="clients-pill is-active" onClick={() => setLoyalty("all")}>
                    Имена
                  </button>
                  <button
                    type="button"
                    className="clients-pill"
                    onClick={() => {
                      setQuery("");
                      setLoyalty("all");
                    }}
                  >
                    Сброс
                  </button>
                </div>
              </div>
            </div>

            <div className="clients-list">
              {filtered.map((c) => (
                <div className="clients-item" key={c.id}>
                  <div className="clients-item-main">
                    <div className="clients-name">
                      <span className="clients-id">{c.id === "1" ? "1" : "•"}</span> {c.name}
                    </div>

                    <div className="clients-meta">
                      {c.phone && (
                        <div className="clients-meta-row">
                          <i className="ri-phone-line" aria-hidden="true" /> {c.phone}
                        </div>
                      )}
                      {c.email && (
                        <div className="clients-meta-row">
                          <i className="ri-mail-line" aria-hidden="true" /> {c.email}
                        </div>
                      )}
                    </div>

                    <div className="clients-small-grid">
                      <div className="clients-small">
                        <div className="clients-small-label">Последний визит</div>
                        <div className="clients-small-value">{fmtDate(c.lastVisit)}</div>
                      </div>
                      <div className="clients-small">
                        <div className="clients-small-label">Лояльность</div>
                        <div className="clients-badge">{c.loyalty ?? "Не задан"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="clients-item-actions" aria-label="Действия">
                    <button type="button" className="clients-ico" title="Открыть" onClick={() => window.alert("Открыть клиента")}>
                      <i className="ri-eye-line" aria-hidden="true" />
                    </button>
                    <button type="button" className="clients-ico" title="Напоминание" onClick={() => window.alert("Напоминание")}>
                      <i className="ri-notification-2-line" aria-hidden="true" />
                    </button>
                    <button type="button" className="clients-ico" title="Звонок" onClick={() => window.alert("Звонок")}>
                      <i className="ri-phone-fill" aria-hidden="true" />
                    </button>
                    <button type="button" className="clients-ico" title="Редактировать" onClick={() => window.alert("Редактировать")}>
                      <i className="ri-pencil-line" aria-hidden="true" />
                    </button>
                    <button type="button" className="clients-ico is-danger" title="Удалить" onClick={() => del(c.id)}>
                      <i className="ri-delete-bin-6-line" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}

              {!filtered.length && <div className="dash-note">Нет клиентов по текущим фильтрам.</div>}
            </div>

            <div className="clients-footer">
              <div className="clients-footer-text">
                Показано {filtered.length} из {clients.length}
              </div>
              <div className="clients-pager">
                <button type="button" className="clients-page-btn" disabled title="Назад">
                  <i className="ri-arrow-left-s-line" aria-hidden="true" />
                </button>
                <div className="clients-page-num">1</div>
                <button type="button" className="clients-page-btn" disabled title="Вперед">
                  <i className="ri-arrow-right-s-line" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {quickOpen &&
        createPortal(
          <div
            ref={overlayRef}
            className="qc-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Быстрое создание клиента"
            onMouseDown={(e) => {
              if (e.target === overlayRef.current) closeQuick();
            }}
          >
            <div className="qc-modal">
              <div className="qc-top">
                <div>
                  <div className="qc-title">Быстрое создание клиента</div>
                  <div className="qc-sub">
                    Заполните основные данные, остальное сможете добавить позже в карточке клиента.
                  </div>
                </div>
                <button type="button" className="qc-x" onClick={closeQuick} aria-label="Закрыть">
                  <i className="ri-close-line" aria-hidden="true" />
                </button>
              </div>

              {quickErr && (
                <div className="qc-error" role="alert">
                  <i className="ri-error-warning-line" aria-hidden="true" /> {quickErr}
                </div>
              )}

              <form onSubmit={submitQuick}>
                <div className="qc-grid">
                  <label className="qc-field">
                    <div className="qc-label">Имя клиента</div>
                    <input
                      className="qc-input"
                      value={quick.name}
                      onChange={(e) => setQuick((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Имя"
                      autoFocus
                      autoComplete="name"
                    />
                  </label>

                  <label className="qc-field">
                    <div className="qc-label">Телефон</div>
                    <input
                      className="qc-input"
                      value={quick.phone}
                      onChange={(e) => setQuick((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="Телефон"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </label>

                  <label className="qc-field qc-field--span">
                    <div className="qc-label">Email</div>
                    <input
                      className="qc-input"
                      value={quick.email}
                      onChange={(e) => setQuick((p) => ({ ...p, email: e.target.value }))}
                      placeholder="Email"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </label>

                  <label className="qc-field qc-field--span">
                    <div className="qc-label">Заметки</div>
                    <textarea
                      className="qc-area"
                      rows={4}
                      value={quick.notes}
                      onChange={(e) => setQuick((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Заметки"
                    />
                  </label>
                </div>

                <div className="qc-actions">
                  <button type="button" className="qc-btn qc-btn--muted" onClick={closeQuick} disabled={quickSaving}>
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="qc-btn qc-btn--primary"
                    disabled={quickSaving || quick.name.trim().length < 2}
                  >
                    {quickSaving ? "Создание..." : "Создать Клиента"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

