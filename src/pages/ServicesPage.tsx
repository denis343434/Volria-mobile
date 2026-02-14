import { useMemo, useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import "../styles/dashboard.css";
import "../styles/services.css";

type Service = {
  id: string;
  name: string;
  durationMin: number;
  priceRub: number;
  description: string;
  active: boolean;
};

const STORAGE_KEY = "services:v1";

function uid() {
  const c = globalThis.crypto as undefined | { randomUUID?: () => string };
  return c?.randomUUID?.() ?? `svc_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function loadServices(): Service[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Service[];
  } catch {
    return [];
  }
}

function saveServices(items: Service[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const ServicesPage: FC = () => {
  const [items, setItems] = useState<Service[]>(() => loadServices());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [durationMin, setDurationMin] = useState("60");
  const [priceRub, setPriceRub] = useState("0");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countActive = useMemo(() => items.filter((s) => s.active).length, [items]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDurationMin("60");
    setPriceRub("0");
    setDescription("");
    setActive(true);
    setErrors({});
  };

  const openCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (svc: Service) => {
    setEditingId(svc.id);
    setName(svc.name);
    setDurationMin(String(svc.durationMin));
    setPriceRub(String(svc.priceRub));
    setDescription(svc.description);
    setActive(svc.active);
    setErrors({});
    setIsOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Введите название услуги";

    const d = Number(durationMin);
    if (!Number.isFinite(d) || d <= 0) e.durationMin = "Длительность должна быть больше 0";

    const p = Number(priceRub);
    if (!Number.isFinite(p) || p < 0) e.priceRub = "Цена не может быть отрицательной";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const next: Service = {
      id: editingId ?? uid(),
      name: name.trim(),
      durationMin: Math.round(Number(durationMin)),
      priceRub: Math.round(Number(priceRub)),
      description: description.trim(),
      active,
    };

    const updated = editingId
      ? items.map((s) => (s.id === editingId ? next : s))
      : [next, ...items];

    setItems(updated);
    saveServices(updated);
    setIsOpen(false);
    resetForm();
  };

  const remove = (id: string) => {
    if (!window.confirm("Удалить услугу?") ) return;
    const updated = items.filter((s) => s.id !== id);
    setItems(updated);
    saveServices(updated);
  };

  const toggleActive = (id: string) => {
    const updated = items.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setItems(updated);
    saveServices(updated);
  };

  return (
    <div className="dash-shell svc-shell">
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
          <a className="dash-nav-item is-active" href="/services" aria-current="page" title="Услуги">
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
          <div className="svc-head">
            <div>
              <h1 className="svc-title">Услуги</h1>
              <div className="svc-sub">Создавайте услуги, задавайте цену и длительность.</div>
            </div>

            <div className="svc-actions">
              <button type="button" className="svc-btn svc-btn--primary" onClick={openCreate}>
                <i className="ri-add-line" aria-hidden="true" /> Добавить услугу
              </button>
              <div className="svc-stats">
                <div className="svc-stat">
                  <div className="svc-stat-num">{items.length}</div>
                  <div className="svc-stat-label">Всего</div>
                </div>
                <div className="svc-stat">
                  <div className="svc-stat-num">{countActive}</div>
                  <div className="svc-stat-label">Активных</div>
                </div>
              </div>
            </div>
          </div>

          {isOpen && (
            <div className="dash-card svc-form-card">
              <div className="svc-form-head">
                <div className="dash-card-title">{editingId ? "Редактировать услугу" : "Новая услуга"}</div>
                <button
                  type="button"
                  className="svc-x"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  title="Закрыть"
                >
                  <i className="ri-close-line" aria-hidden="true" />
                </button>
              </div>

              <form className="svc-form" onSubmit={submit}>
                <label className="svc-field">
                  <div className="svc-label">Название</div>
                  <input
                    className={`svc-input ${errors.name ? "is-error" : ""}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например: Стрижка"
                  />
                  {errors.name && <div className="svc-error">{errors.name}</div>}
                </label>

                <div className="svc-row">
                  <label className="svc-field">
                    <div className="svc-label">Длительность (мин)</div>
                    <input
                      className={`svc-input ${errors.durationMin ? "is-error" : ""}`}
                      value={durationMin}
                      onChange={(e) => setDurationMin(e.target.value)}
                      inputMode="numeric"
                    />
                    {errors.durationMin && <div className="svc-error">{errors.durationMin}</div>}
                  </label>

                  <label className="svc-field">
                    <div className="svc-label">Цена (₽)</div>
                    <input
                      className={`svc-input ${errors.priceRub ? "is-error" : ""}`}
                      value={priceRub}
                      onChange={(e) => setPriceRub(e.target.value)}
                      inputMode="numeric"
                    />
                    {errors.priceRub && <div className="svc-error">{errors.priceRub}</div>}
                  </label>
                </div>

                <label className="svc-field">
                  <div className="svc-label">Описание</div>
                  <textarea
                    className="svc-input svc-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Короткое описание услуги"
                    rows={3}
                  />
                </label>

                <label className="svc-toggle">
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                  <span className="svc-toggle-ui" aria-hidden="true" />
                  <span className="svc-toggle-text">
                    <span className="svc-toggle-title">Активна</span>
                    <span className="svc-toggle-hint">Показывать услугу при записи</span>
                  </span>
                </label>

                <div className="svc-form-actions">
                  <button type="submit" className="svc-btn svc-btn--primary">
                    <i className="ri-save-3-line" aria-hidden="true" /> Сохранить
                  </button>
                  <button
                    type="button"
                    className="svc-btn svc-btn--ghost"
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="svc-list">
            {!items.length ? (
              <div className="dash-note">Пока нет услуг. Нажмите "Добавить услугу".</div>
            ) : (
              items.map((s) => (
                <div className="dash-card svc-item" key={s.id}>
                  <div className="svc-item-head">
                    <div>
                      <div className="svc-item-title">
                        {s.name}{" "}
                        {!s.active && <span className="svc-badge svc-badge--muted">Отключена</span>}
                        {s.active && <span className="svc-badge">Активна</span>}
                      </div>
                      <div className="svc-item-sub">
                        <span>
                          <i className="ri-time-line" aria-hidden="true" /> {s.durationMin} мин
                        </span>
                        <span>
                          <i className="ri-money-ruble-circle-line" aria-hidden="true" /> {s.priceRub} ₽
                        </span>
                      </div>
                    </div>

                    <div className="svc-item-actions">
                      <button type="button" className="svc-ico" title="Вкл/выкл" onClick={() => toggleActive(s.id)}>
                        <i className={s.active ? "ri-toggle-fill" : "ri-toggle-line"} aria-hidden="true" />
                      </button>
                      <button type="button" className="svc-ico" title="Редактировать" onClick={() => openEdit(s)}>
                        <i className="ri-pencil-line" aria-hidden="true" />
                      </button>
                      <button type="button" className="svc-ico svc-ico--danger" title="Удалить" onClick={() => remove(s.id)}>
                        <i className="ri-delete-bin-6-line" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {s.description && <div className="svc-item-desc">{s.description}</div>}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};




