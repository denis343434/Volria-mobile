import { useMemo, useRef, useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { clearAvatar, loadAvatar, saveAvatar } from "../utils/avatarStore";
import "../styles/dashboard.css";
import "../styles/settings.css";

export const SettingsPage: FC = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const [avatarDraft, setAvatarDraft] = useState<string | null>(() => loadAvatar());
  const [avatarErr, setAvatarErr] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const presets = useMemo(() => {
    const mk = (a: string, b: string, glyph: string) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="80" fill="url(#g)"/>
  <circle cx="52" cy="54" r="28" fill="rgba(255,255,255,0.22)"/>
  <text x="80" y="98" font-family="system-ui,Segoe UI,Arial" font-size="68" font-weight="900" text-anchor="middle" fill="rgba(255,255,255,0.92)">${glyph}</text>
</svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    };

    return [
      mk("#ff00ff", "#7a4bff", "V"),
      mk("#22c55e", "#06b6d4", "A"),
      mk("#f97316", "#ff00ff", "D"),
      mk("#60a5fa", "#a78bfa", "M"),
      mk("#f43f5e", "#fb7185", "S"),
      mk("#eab308", "#f97316", "K"),
    ];
  }, []);

  const onPickFile = (file: File | null) => {
    setAvatarErr("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarErr("Выберите файл изображения.");
      return;
    }
    if (file.size > 700_000) {
      setAvatarErr("Файл слишком большой. Попробуйте изображение до 700KB.");
      return;
    }

    const r = new FileReader();
    r.onload = () => {
      const v = typeof r.result === "string" ? r.result : "";
      if (!v.startsWith("data:image/")) {
        setAvatarErr("Не удалось прочитать изображение.");
        return;
      }
      setAvatarDraft(v);
    };
    r.onerror = () => setAvatarErr("Не удалось прочитать изображение.");
    r.readAsDataURL(file);
  };

  const applyAvatar = () => {
    setAvatarErr("");
    if (!avatarDraft) {
      clearAvatar();
      return;
    }
    saveAvatar(avatarDraft);
  };

  return (
    <div className="dash-shell settings-shell">
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
          <a className="dash-nav-item is-active" href="/settings" aria-current="page" title="Настройки">
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
          <div className="settings-head">
            <div>
              <h1 className="settings-title">Настройки</h1>
              <div className="settings-sub">Управляйте профилем, уведомлениями и приложением.</div>
            </div>
          </div>

          <div className="settings-stack">
            <div className="dash-card settings-card">
              <div className="settings-card-head">
                <div className="settings-card-title">Профиль</div>
                <button
                  type="button"
                  className="settings-ghost"
                  onClick={() => window.alert("Редактирование профиля пока не подключено.")}
                >
                  <i className="ri-pencil-line" aria-hidden="true" /> Изменить
                </button>
              </div>

              <div className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-row-name">Имя</div>
                  <div className="settings-row-hint">Отображается в интерфейсе</div>
                </div>
                <div className="settings-pill">denis343434</div>
              </div>

              <div className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-row-name">Email</div>
                  <div className="settings-row-hint">Для входа и уведомлений</div>
                </div>
                <div className="settings-pill">denismorcukov@gmail.com</div>
              </div>
            </div>

            <div className="dash-card settings-card">
              <div className="settings-card-head">
                <div className="settings-card-title">Аватар</div>
                <button type="button" className="settings-ghost" onClick={applyAvatar}>
                  <i className="ri-save-3-line" aria-hidden="true" /> Сохранить
                </button>
              </div>

              {avatarErr && <div className="settings-avatar-err">{avatarErr}</div>}

              <div className="settings-avatar-row">
                <div className="settings-avatar-preview">
                  <div
                    className="settings-avatar-circle"
                    style={
                      avatarDraft
                        ? {
                            backgroundImage: `url(${avatarDraft})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }
                        : undefined
                    }
                    aria-label="Предпросмотр аватара"
                    role="img"
                  />
                  <div className="settings-avatar-hint">Можно выбрать пресет или загрузить фото.</div>
                </div>

                <div className="settings-avatar-controls">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="settings-avatar-file"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                  />

                  <div className="settings-avatar-actions">
                    <button type="button" className="settings-avatar-btn" onClick={() => fileRef.current?.click()}>
                      <i className="ri-image-add-line" aria-hidden="true" /> Загрузить
                    </button>
                    <button
                      type="button"
                      className="settings-avatar-btn settings-avatar-btn--muted"
                      onClick={() => {
                        setAvatarErr("");
                        setAvatarDraft(null);
                        clearAvatar();
                      }}
                    >
                      <i className="ri-delete-bin-6-line" aria-hidden="true" /> Сбросить
                    </button>
                  </div>

                  <div className="settings-avatar-grid" aria-label="Пресеты аватара">
                    {presets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={"settings-avatar-chip" + (avatarDraft === p ? " is-active" : "")}
                        onClick={() => {
                          setAvatarErr("");
                          setAvatarDraft(p);
                        }}
                        style={{ backgroundImage: `url(${p})` }}
                        title="Выбрать аватар"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-card settings-card">
              <div className="settings-card-head">
                <div className="settings-card-title">Уведомления</div>
              </div>

              <label className="settings-toggle">
                <input type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} />
                <span className="settings-toggle-ui" aria-hidden="true" />
                <span className="settings-toggle-text">
                  <span className="settings-toggle-title">Push-уведомления</span>
                  <span className="settings-toggle-hint">Напоминания о записях и задачах</span>
                </span>
              </label>

              <label className="settings-toggle">
                <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />
                <span className="settings-toggle-ui" aria-hidden="true" />
                <span className="settings-toggle-text">
                  <span className="settings-toggle-title">Email-уведомления</span>
                  <span className="settings-toggle-hint">Сводки и важные изменения</span>
                </span>
              </label>
            </div>

            <div className="dash-card settings-card">
              <div className="settings-card-head">
                <div className="settings-card-title">Приложение</div>
              </div>

              <div className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-row-name">Язык</div>
                  <div className="settings-row-hint">Интерфейс приложения</div>
                </div>
                <div className="settings-select-wrap">
                  <select className="settings-select" defaultValue="ru">
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                  <i className="ri-arrow-down-s-line" aria-hidden="true" />
                </div>
              </div>

              <label className="settings-toggle">
                <input type="checkbox" checked={compactMode} onChange={(e) => setCompactMode(e.target.checked)} />
                <span className="settings-toggle-ui" aria-hidden="true" />
                <span className="settings-toggle-text">
                  <span className="settings-toggle-title">Компактный режим</span>
                  <span className="settings-toggle-hint">Меньше отступов, больше данных</span>
                </span>
              </label>
            </div>

            <div className="dash-card settings-card">
              <div className="settings-card-head">
                <div className="settings-card-title">Безопасность</div>
              </div>

              <button
                type="button"
                className="settings-danger"
                onClick={() => {
                  localStorage.removeItem("authToken");
                  sessionStorage.removeItem("authToken");
                  window.location.href = "/";
                }}
              >
                <i className="ri-logout-box-r-line" aria-hidden="true" /> Выйти из аккаунта
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

