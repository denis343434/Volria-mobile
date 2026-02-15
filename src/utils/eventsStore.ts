export type CalendarEventRecord = {
  id: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  // Legacy display title (older versions saved only this field).
  title?: string;
  // New fields for "who booked" UX.
  clientName?: string;
  phone?: string;
  email?: string;
  master?: string;
  status?: string;
  note?: string;
  services?: string[];
};

const STORAGE_KEY = "veloria_events_v1";

function safeParse(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

function genId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `e_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

export function loadEvents(): CalendarEventRecord[] {
  const data = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(data)) return [];
  const out: CalendarEventRecord[] = [];
  for (const x of data) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.id !== "string") continue;
    if (typeof o.date !== "string") continue;
    if (typeof o.time !== "string") continue;
    const title = typeof o.title === "string" ? o.title : undefined;
    const clientName = typeof o.clientName === "string" ? o.clientName : undefined;
    const phone = typeof o.phone === "string" ? o.phone : undefined;
    const email = typeof o.email === "string" ? o.email : undefined;
    const master = typeof o.master === "string" ? o.master : undefined;
    const status = typeof o.status === "string" ? o.status : undefined;
    const note = typeof o.note === "string" ? o.note : undefined;
    const services = Array.isArray(o.services) ? o.services.filter((s) => typeof s === "string") : undefined;

    // Backward compatibility: older records had only {title}.
    out.push({
      id: o.id,
      date: o.date,
      time: o.time,
      title,
      clientName,
      phone,
      email,
      master,
      status,
      note,
      services: services?.length ? services : undefined,
    });
  }
  return out;
}

export function saveEvents(events: CalendarEventRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function addEvent(input: Omit<CalendarEventRecord, "id">): CalendarEventRecord {
  const ev: CalendarEventRecord = { id: genId(), ...input };
  const cur = loadEvents();
  const next = [ev, ...cur].slice(0, 500);
  saveEvents(next);
  return ev;
}
