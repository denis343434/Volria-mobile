import { useEffect, useState, type FC } from "react";
import { loadAvatar } from "../utils/avatarStore";

export const AvatarBubble: FC<{ title?: string }> = ({ title = "Профиль" }) => {
  const [avatar, setAvatar] = useState<string | null>(() => loadAvatar());

  useEffect(() => {
    const sync = () => setAvatar(loadAvatar());
    window.addEventListener("storage", sync);
    window.addEventListener("veloria-avatar-change", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("veloria-avatar-change", sync as EventListener);
    };
  }, []);

  return (
    <div
      className="dash-avatar"
      title={title}
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
      <div className="dash-avatar-dot" />
    </div>
  );
};

