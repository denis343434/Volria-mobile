export type CalendarEventRecord = {
  id: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  title: string;
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
    if (typeof o.title !== "string") continue;
    out.push({ id: o.id, date: o.date, time: o.time, title: o.title });
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

