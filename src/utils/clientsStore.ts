export type ClientLoyalty = "Не задан" | "VIP" | "Обычный" | "Новый";

export type ClientRecord = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loyalty?: ClientLoyalty;
  birthday?: string; // ISO yyyy-mm-dd
  lastVisit?: string; // ISO yyyy-mm-dd
  tags?: string;
  allergies?: string;
  preferences?: string;
  notes?: string;
};

const STORAGE_KEY = "veloria_clients_v1";

function safeParse(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

function defaultClients(): ClientRecord[] {
  return [
    {
      id: "1",
      name: "denis343434",
      phone: "+7 920 345 6789",
      email: "denismorcukov@gmail.com",
      lastVisit: "",
      loyalty: "Не задан",
    },
  ];
}

export function loadClients(): ClientRecord[] {
  const data = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(data)) return defaultClients();

  const out: ClientRecord[] = [];
  for (const x of data) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.id !== "string") continue;
    if (typeof o.name !== "string") continue;
    out.push({
      id: o.id,
      name: o.name,
      phone: typeof o.phone === "string" ? o.phone : undefined,
      email: typeof o.email === "string" ? o.email : undefined,
      loyalty: typeof o.loyalty === "string" ? (o.loyalty as ClientRecord["loyalty"]) : undefined,
      birthday: typeof o.birthday === "string" ? o.birthday : undefined,
      lastVisit: typeof o.lastVisit === "string" ? o.lastVisit : undefined,
      tags: typeof o.tags === "string" ? o.tags : undefined,
      allergies: typeof o.allergies === "string" ? o.allergies : undefined,
      preferences: typeof o.preferences === "string" ? o.preferences : undefined,
      notes: typeof o.notes === "string" ? o.notes : undefined,
    });
  }

  return out.length ? out : defaultClients();
}

export function saveClients(clients: ClientRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

function genId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

export function addClient(input: Omit<ClientRecord, "id">): ClientRecord {
  const client: ClientRecord = { id: genId(), ...input };
  const cur = loadClients();
  const next = [client, ...cur];
  saveClients(next);
  return client;
}

export function getClientById(id: string): ClientRecord | undefined {
  return loadClients().find((c) => c.id === id);
}

export function updateClient(id: string, input: Omit<ClientRecord, "id">): ClientRecord | undefined {
  const cur = loadClients();
  let updated: ClientRecord | undefined;
  const next = cur.map((c) => {
    if (c.id !== id) return c;
    updated = { id, ...input };
    return updated;
  });
  if (!updated) return undefined;
  saveClients(next);
  return updated;
}

export function removeClient(id: string) {
  const cur = loadClients();
  const next = cur.filter((c) => c.id !== id);
  saveClients(next);
}
