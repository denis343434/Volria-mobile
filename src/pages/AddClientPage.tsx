import { useMemo, useState, type FC, type FormEvent } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { addClient, type ClientLoyalty } from "../utils/clientsStore";
import "../styles/dashboard.css";
import "../styles/clients.css";
import "../styles/clientForm.css";

type FormState = {
  name: string;
  phone: string;
  email: string;
  loyalty: ClientLoyalty;
  birthday: string;
  lastVisit: string;
  tags: string;
  allergies: string;
  preferences: string;
  notes: string;
};

export const AddClientPage: FC = () => {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");

  const [form, setForm] = useState<FormState>(() => ({
    name: "",
    phone: "",
    email: "",
    loyalty: "Не задан",
    birthday: "",
    lastVisit: "",
    tags: "",
    allergies: "",
    preferences: "",
    notes: "",
  }));

  const canSubmit = useMemo(() => form.name.trim().length >= 2 && !saving, [form.name, saving]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

  const cancel = () => {
    window.location.href = "/clients";
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErr("");

    const name = form.name.trim();
    if (name.length < 2) {
      setErr("Введите имя клиента (минимум 2 символа).");
      return;
    }

    setSaving(true);
    try {
      addClient({
        name,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        loyalty: form.loyalty,
        birthday: form.birthday || undefined,
        lastVisit: form.lastVisit || undefined,
        tags: form.tags.trim() || undefined,
        allergies: form.allergies.trim() || undefined,
        preferences: form.preferences.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      window.location.href = "/clients";
    } catch {
      setErr("Не удалось сохранить клиента. Попробуйте еще раз.");
      setSaving(false);
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
          <div className="cf-head">
            <div>
              <h1 className="cf-title">Добавление клиента</h1>
              <div className="cf-sub">Заполните карточку, чтобы персонализировать коммуникации и напоминания.</div>
            </div>
            <button type="button" className="cf-back" onClick={cancel}>
              <i className="ri-arrow-left-line" aria-hidden="true" /> К списку клиентов
            </button>
          </div>

          <form className="dash-card cf-card" onSubmit={submit}>
            {err && (
              <div className="cf-error" role="alert">
                <i className="ri-error-warning-line" aria-hidden="true" /> {err}
              </div>
            )}

            <div className="cf-grid">
              <label className="cf-field">
                <div className="cf-label">Имя клиента</div>
                <input
                  className="cf-input"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Имя клиента"
                  autoComplete="name"
                />
              </label>

              <label className="cf-field">
                <div className="cf-label">Телефон</div>
                <input
                  className="cf-input"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+7 ___ ___ ____"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>

              <label className="cf-field">
                <div className="cf-label">Email</div>
                <input
                  className="cf-input"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  inputMode="email"
                />
              </label>

              <label className="cf-field">
                <div className="cf-label">Уровень лояльности</div>
                <div className="cf-select-wrap">
                  <select
                    className="cf-select"
                    value={form.loyalty}
                    onChange={(e) => update("loyalty", e.target.value as ClientLoyalty)}
                  >
                    <option value="Не задан">Не задан</option>
                    <option value="VIP">VIP</option>
                    <option value="Обычный">Обычный</option>
                    <option value="Новый">Новый</option>
                  </select>
                  <i className="ri-arrow-down-s-line" aria-hidden="true" />
                </div>
              </label>

              <label className="cf-field">
                <div className="cf-label">День рождения</div>
                <div className="cf-date-wrap">
                  <input className="cf-input" type="date" value={form.birthday} onChange={(e) => update("birthday", e.target.value)} />
                  <i className="ri-calendar-line" aria-hidden="true" />
                </div>
              </label>

              <label className="cf-field">
                <div className="cf-label">Последний визит</div>
                <div className="cf-date-wrap">
                  <input className="cf-input" type="date" value={form.lastVisit} onChange={(e) => update("lastVisit", e.target.value)} />
                  <i className="ri-calendar-check-line" aria-hidden="true" />
                </div>
              </label>

              <label className="cf-field cf-field--span">
                <div className="cf-label">Теги</div>
                <textarea
                  className="cf-area"
                  rows={3}
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder="VIP, постоянный, парикмахер"
                />
                <div className="cf-hint">Разделяйте теги запятыми или переносом строки. Подсказок пока нет.</div>
              </label>

              <label className="cf-field cf-field--span">
                <div className="cf-label">Аллергии</div>
                <textarea
                  className="cf-area"
                  rows={3}
                  value={form.allergies}
                  onChange={(e) => update("allergies", e.target.value)}
                  placeholder="Пыльца, цитрусовые"
                />
                <div className="cf-hint">Укажите важные ограничения, чтобы избежать рисков. Подсказок пока нет.</div>
              </label>

              <label className="cf-field cf-field--span">
                <div className="cf-label">Предпочтения</div>
                <textarea
                  className="cf-area"
                  rows={3}
                  value={form.preferences}
                  onChange={(e) => update("preferences", e.target.value)}
                  placeholder={"Чай: зеленый\nМузыка: джаз"}
                />
                <div className="cf-hint">Каждую пару ключ: значение указывайте с новой строки. Подсказок пока нет.</div>
              </label>

              <label className="cf-field cf-field--span">
                <div className="cf-label">Заметки</div>
                <textarea
                  className="cf-area"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Любит утренние визиты, предпочитает натуральные оттенки."
                />
              </label>
            </div>

            <div className="cf-actions">
              <button type="button" className="cf-btn cf-btn--muted" onClick={cancel} disabled={saving}>
                Отмена
              </button>
              <button type="submit" className="cf-btn cf-btn--primary" disabled={!canSubmit}>
                {saving ? "Сохранение..." : "Создать Клиента"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

