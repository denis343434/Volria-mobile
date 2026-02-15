import { useEffect, useMemo, useRef, useState, type FC } from "react";
import iconUrl from "../assets/img/icon.svg";
import { AvatarBubble } from "../components/AvatarBubble";
import { MessagesBell } from "../components/MessagesBell";
import { clearAvatar, loadAvatar, saveAvatar } from "../utils/avatarStore";
import { clearProfile, loadProfile, saveProfile, type UserProfile } from "../utils/profileStore";
import { validateEmail } from "../utils/validation";
import { useI18n } from "../i18n";
import "../styles/dashboard.css";
import "../styles/settings.css";

export const SettingsPage: FC = () => {
  const { lang, setLang, t } = useI18n();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileDraft, setProfileDraft] = useState<UserProfile>(() => loadProfile());
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");

  const [avatarDraft, setAvatarDraft] = useState<string | null>(() => loadAvatar());
  const [avatarErr, setAvatarErr] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const sync = () => {
      const p = loadProfile();
      setProfile(p);
      if (!profileEdit) setProfileDraft(p);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("veloria-profile-change", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("veloria-profile-change", sync as EventListener);
    };
  }, [profileEdit]);

  const startProfileEdit = () => {
    setProfileNotice("");
    setProfileErrors({});
    setProfileDraft(profile);
    setProfileEdit(true);
  };

  const cancelProfileEdit = () => {
    setProfileNotice("");
    setProfileErrors({});
    setProfileDraft(profile);
    setProfileEdit(false);
  };

  const validateProfile = (p: UserProfile): Record<string, string> => {
    const errors: Record<string, string> = {};
    const name = p.name.trim();
    const email = p.email.trim();

    if (!name) errors.name = t("settings.validation.nameRequired");
    if (!email) errors.email = t("settings.validation.emailRequired");
    else if (!validateEmail(email)) errors.email = t("settings.validation.emailInvalid");

    return errors;
  };

  const submitProfile = async () => {
    setProfileNotice("");
    const errors = validateProfile(profileDraft);
    setProfileErrors(errors);
    if (Object.keys(errors).length) return;

    setProfileSaving(true);
    try {
      // Stub: replace with real API call when backend is ready.
      await new Promise((resolve) => setTimeout(resolve, 600));
      saveProfile(profileDraft);
      setProfile(profileDraft);
      setProfileEdit(false);
      setProfileNotice(t("settings.notice.profileUpdated"));
    } finally {
      setProfileSaving(false);
    }
  };

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
      setAvatarErr(t("settings.avatar.err.notImage"));
      return;
    }
    if (file.size > 700_000) {
      setAvatarErr(t("settings.avatar.err.tooLarge"));
      return;
    }

    const r = new FileReader();
    r.onload = () => {
      const v = typeof r.result === "string" ? r.result : "";
      if (!v.startsWith("data:image/")) {
        setAvatarErr(t("settings.avatar.err.readFailed"));
        return;
      }
      setAvatarDraft(v);
    };
    r.onerror = () => setAvatarErr(t("settings.avatar.err.readFailed"));
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
          <a className="dash-nav-item" href="/dashboard" title={t("nav.home")}>
            <span className="dash-nav-icon">
              <i className="ri-home-5-line" aria-hidden="true" />
            </span>
          </a>
          <a className="dash-nav-item" href="/calendar" title={t("nav.calendar")}>
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
          <a className="dash-nav-item is-active" href="/settings" aria-current="page" title={t("nav.settings")}>
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
              <h1 className="settings-title">{t("settings.title")}</h1>
              <div className="settings-sub">{t("settings.subtitle")}</div>
            </div>
          </div>

          <div className="settings-stack">
            <div className="dash-card settings-card">
              <form
                className="settings-profile"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitProfile();
                }}
              >
                <div className="settings-card-head">
                  <div className="settings-card-title">{t("settings.section.profile")}</div>

                  {!profileEdit ? (
                    <button type="button" className="settings-ghost" onClick={startProfileEdit}>
                      <i className="ri-pencil-line" aria-hidden="true" /> {t("settings.action.edit")}
                    </button>
                  ) : (
                    <div className="settings-actions">
                      <button
                        type="button"
                        className="settings-ghost settings-ghost--muted"
                        onClick={cancelProfileEdit}
                        disabled={profileSaving}
                      >
                        <i className="ri-close-line" aria-hidden="true" /> {t("settings.action.cancel")}
                      </button>
                      <button type="submit" className="settings-ghost" disabled={profileSaving}>
                        <i className="ri-save-3-line" aria-hidden="true" /> {t("settings.action.save")}
                      </button>
                    </div>
                  )}
                </div>

                {profileNotice && <div className="settings-notice">{profileNotice}</div>}

                <div className="settings-row">
                  <div className="settings-row-left">
                    <div className="settings-row-name">{t("settings.field.name")}</div>
                    <div className="settings-row-hint">{t("settings.field.nameHint")}</div>
                  </div>

                  {!profileEdit ? (
                    <div className="settings-pill">{profile.name || "Master"}</div>
                  ) : (
                    <div className="settings-edit">
                      <input
                        className={"settings-input" + (profileErrors.name ? " is-error" : "")}
                        type="text"
                        value={profileDraft.name}
                        onChange={(e) => {
                          setProfileDraft((prev) => ({ ...prev, name: e.target.value }));
                          if (profileErrors.name) setProfileErrors((prev) => ({ ...prev, name: "" }));
                        }}
                        placeholder={t("settings.field.namePlaceholder")}
                        autoComplete="name"
                        disabled={profileSaving}
                      />
                      {profileErrors.name && <div className="settings-error">{profileErrors.name}</div>}
                    </div>
                  )}
                </div>

                <div className="settings-row">
                  <div className="settings-row-left">
                    <div className="settings-row-name">Email</div>
                    <div className="settings-row-hint">{t("settings.field.emailHint")}</div>
                  </div>

                  {!profileEdit ? (
                    <div className="settings-pill">{profile.email || "—"}</div>
                  ) : (
                    <div className="settings-edit">
                      <input
                        className={"settings-input" + (profileErrors.email ? " is-error" : "")}
                        type="email"
                        value={profileDraft.email}
                        onChange={(e) => {
                          setProfileDraft((prev) => ({ ...prev, email: e.target.value }));
                          if (profileErrors.email) setProfileErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        placeholder={t("settings.field.emailPlaceholder")}
                        autoComplete="email"
                        inputMode="email"
                        disabled={profileSaving}
                      />
                      {profileErrors.email && <div className="settings-error">{profileErrors.email}</div>}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="dash-card settings-card">
              <div className="settings-card-head">
                <div className="settings-card-title">{t("settings.section.avatar")}</div>
                <button type="button" className="settings-ghost" onClick={applyAvatar}>
                  <i className="ri-save-3-line" aria-hidden="true" /> {t("settings.action.save")}
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
                    aria-label={t("settings.avatar.preview")}
                    role="img"
                  />
                  <div className="settings-avatar-hint">{t("settings.avatar.hint")}</div>
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
                      <i className="ri-image-add-line" aria-hidden="true" /> {t("settings.avatar.pick")}
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
                      <i className="ri-delete-bin-6-line" aria-hidden="true" /> {t("settings.avatar.reset")}
                    </button>
                  </div>

                  <div className="settings-avatar-grid" aria-label={t("settings.avatar.presets")}>
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
                        title={t("settings.avatar.pickPreset")}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-card settings-card">
              <div className="settings-card-head">
                <div className="settings-card-title">{t("settings.section.notifications")}</div>
              </div>

              <label className="settings-toggle">
                <input type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} />
                <span className="settings-toggle-ui" aria-hidden="true" />
                <span className="settings-toggle-text">
                  <span className="settings-toggle-title">{t("settings.notifications.pushTitle")}</span>
                  <span className="settings-toggle-hint">{t("settings.notifications.pushHint")}</span>
                </span>
              </label>

              <label className="settings-toggle">
                <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />
                <span className="settings-toggle-ui" aria-hidden="true" />
                <span className="settings-toggle-text">
                  <span className="settings-toggle-title">{t("settings.notifications.emailTitle")}</span>
                  <span className="settings-toggle-hint">{t("settings.notifications.emailHint")}</span>
                </span>
              </label>
            </div>

            <div className="dash-card settings-card">
              <div className="settings-card-head">
                <div className="settings-card-title">{t("settings.section.app")}</div>
              </div>

              <div className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-row-name">{t("settings.app.language")}</div>
                  <div className="settings-row-hint">{t("settings.app.languageHint")}</div>
                </div>
                <div className="settings-lang-buttons">
                  <button
                    className={`settings-lang-btn ${lang === 'ru' ? 'active' : ''}`}
                    onClick={() => setLang('ru')}
                    aria-label={t("lang.ru")}
                  >
                    RU
                  </button>
                  <button
                    className={`settings-lang-btn ${lang === 'en' ? 'active' : ''}`}
                    onClick={() => setLang('en')}
                    aria-label={t("lang.en")}
                  >
                    EN
                  </button>
                </div>
              </div>

              <label className="settings-toggle">
                <input type="checkbox" checked={compactMode} onChange={(e) => setCompactMode(e.target.checked)} />
                <span className="settings-toggle-ui" aria-hidden="true" />
                <span className="settings-toggle-text">
                  <span className="settings-toggle-title">{t("settings.app.compactTitle")}</span>
                  <span className="settings-toggle-hint">{t("settings.app.compactHint")}</span>
                </span>
              </label>
            </div>

            <div className="dash-card settings-card">
              <div className="settings-card-head">
                <div className="settings-card-title">{t("settings.section.security")}</div>
              </div>

              <button
                type="button"
                className="settings-danger"
                onClick={() => {
                  localStorage.removeItem("authToken");
                  sessionStorage.removeItem("authToken");
                  clearProfile();
                  window.location.href = "/";
                }}
              >
                <i className="ri-logout-box-r-line" aria-hidden="true" /> {t("settings.security.logout")}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
