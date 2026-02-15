export type UserProfile = {
  name: string;
  email: string;
};

function hasToken(storage: Storage): boolean {
  return Boolean((storage.getItem("authToken") || "").trim());
}

function activeStorage(): Storage {
  // Prefer the storage that currently contains an auth token.
  if (hasToken(localStorage)) return localStorage;
  if (hasToken(sessionStorage)) return sessionStorage;
  return localStorage;
}

function readFromAny(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function normalizeEmail(email: string): string {
  return email.trim();
}

function normalizeName(name: string): string {
  return name.trim();
}

function nameFromEmail(email: string): string {
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}

export function loadProfile(): UserProfile {
  const emailRaw = readFromAny("userEmail") || "";
  const nameRaw = readFromAny("userName") || "";

  const email = normalizeEmail(emailRaw);
  const name = normalizeName(nameRaw) || (email ? nameFromEmail(email) : "Master");

  return { name, email };
}

export function saveProfile(next: UserProfile) {
  const email = normalizeEmail(next.email);
  const name = normalizeName(next.name);

  const st = activeStorage();

  st.setItem("userEmail", email);
  st.setItem("userName", name);

  // Keep localStorage in sync because some UI reads from it directly.
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userName", name);

  window.dispatchEvent(new Event("veloria-profile-change"));
}

export function clearProfile() {
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  sessionStorage.removeItem("userEmail");
  sessionStorage.removeItem("userName");
  window.dispatchEvent(new Event("veloria-profile-change"));
}

