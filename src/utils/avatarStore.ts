const STORAGE_KEY = "veloria_avatar_v1";

export function loadAvatar(): string | null {
  const v = localStorage.getItem(STORAGE_KEY);
  if (!v) return null;
  // Expect data URL (png/jpg/svg). If something else got saved, ignore it.
  if (!v.startsWith("data:image/")) return null;
  return v;
}

export function saveAvatar(dataUrl: string) {
  localStorage.setItem(STORAGE_KEY, dataUrl);
  window.dispatchEvent(new Event("veloria-avatar-change"));
}

export function clearAvatar() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("veloria-avatar-change"));
}

