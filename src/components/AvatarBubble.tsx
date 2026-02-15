import { useEffect, useId, useRef, useState, type FC } from "react";
import { loadAvatar } from "../utils/avatarStore";
import { useI18n } from "../i18n";

function readFromAny(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function displayUserTitle(): string {
  const name = (readFromAny("userName") || "").trim();
  if (name) return name;
  return displayNameFromEmail(readFromAny("userEmail")) ?? "Master";
}

function displayNameFromEmail(email: string | null): string | null {
  if (!email) return null;
  const s = email.trim();
  if (!s) return null;
  const at = s.indexOf("@");
  if (at > 0) return s.slice(0, at);
  return s;
}

export const AvatarBubble: FC<{ title?: string }> = ({ title }) => {
  const { t } = useI18n();
  const resolvedTitle = title ?? t("profile.title");
  const [avatar, setAvatar] = useState<string | null>(() => loadAvatar());
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rid = useId();
  const menuId = `dash-user-menu-${rid}`;

  const [userTitle, setUserTitle] = useState(() => displayUserTitle());
  const [userPlan, setUserPlan] = useState(() => localStorage.getItem("userPlan")?.trim() || "lite");

  useEffect(() => {
    const sync = () => {
      setAvatar(loadAvatar());
      setUserTitle(displayUserTitle());
      setUserPlan(localStorage.getItem("userPlan")?.trim() || "lite");
    };
    window.addEventListener("storage", sync);
    window.addEventListener("veloria-avatar-change", sync as EventListener);
    window.addEventListener("veloria-plan-change", sync as EventListener);
    window.addEventListener("veloria-profile-change", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("veloria-avatar-change", sync as EventListener);
      window.removeEventListener("veloria-plan-change", sync as EventListener);
      window.removeEventListener("veloria-profile-change", sync as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && root.contains(e.target)) return;
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", () => setOpen(false), { once: true });

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="dash-user" ref={rootRef}>
      <button
        type="button"
        className="dash-avatar-btn"
        title={resolvedTitle}
        aria-label={resolvedTitle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="dash-avatar"
          style={
            avatar
              ? {
                  backgroundImage: `url(${avatar})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }
              : undefined
          }
        >
          <span className="dash-avatar-dot" />
        </span>
      </button>

      {open && (
        <div className="dash-user-menu" id={menuId} role="menu" aria-label={t("profile.menuLabel")}>
          <div className="dash-user-menu-head">
            <div className="dash-user-menu-meta">
              <div className="dash-user-menu-name">{userTitle}</div>
              <div className="dash-user-menu-sub">
                <span className="dash-user-menu-status" aria-hidden="true" /> {userPlan}
              </div>
            </div>
          </div>

          <div className="dash-user-menu-list" role="none">
            <a className="dash-user-menu-item" role="menuitem" href="/settings" onClick={() => setOpen(false)}>
              <i className="ri-settings-3-line" aria-hidden="true" />
              {t("nav.settings")}
            </a>
            <a className="dash-user-menu-item" role="menuitem" href="/subscription" onClick={() => setOpen(false)}>
              <i className="ri-bank-card-line" aria-hidden="true" />
              {t("nav.subscription")}
            </a>
          </div>

          <button
            type="button"
            className="dash-user-menu-logout"
            onClick={() => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("userEmail");
              sessionStorage.removeItem("authToken");
              sessionStorage.removeItem("userEmail");
              setOpen(false);
              window.location.href = "/";
            }}
          >
            {t("profile.logout")} <i className="ri-logout-box-r-line" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
