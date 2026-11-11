// Règles de planification des soutenances.
// Mêmes valeurs que le front (frontend/src/utils/defense.ts) : à garder alignées.

export const DAY_START = 8; // les soutenances commencent au plus tôt à 08:00
export const DAY_END = 17; // et se terminent au plus tard à 17:00
export const DEFAULT_DURATION = 60; // minutes
export const JURY_MEMBER_COUNT = 3; // jurés en plus du président
export const MIN_JURY_MEMBER_COUNT = 2;

export interface Slot {
  date: string; // "2026-06-18"
  start: number; // minutes depuis minuit
  end: number;
}

// "09:30" -> 570
export function toMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// 570 -> "09:30"
export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function toSlot(date: string, time: string, duration: number): Slot {
  const start = toMinutes(time);
  return { date, start, end: start + duration };
}

// deux créneaux se chevauchent s'ils sont le même jour et que l'un commence avant la fin de l'autre
// (09:00-10:00 et 10:00-11:00 ne se chevauchent pas)
export function slotsOverlap(a: Slot, b: Slot): boolean {
  return a.date === b.date && a.start < b.end && b.start < a.end;
}

// vendredi ou samedi : les soutenances ont lieu du dimanche au jeudi ("2026-06-19" -> true)
export function isWeekend(date: string): boolean {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 5 || day === 6;
}

// le créneau tient dans la journée de soutenances (08:00 - 17:00)
export function fitsInDay(slot: Slot): boolean {
  return slot.start >= DAY_START * 60 && slot.end <= DAY_END * 60;
}

// "2026-02-30" n'existe pas
export function isRealDate(date: string): boolean {
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

// date et heure actuelles en Algérie (le serveur peut tourner en UTC, ex. Render)
export function nowInAlgiers(now = new Date()): {
  date: string;
  minutes: number;
} {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Algiers",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

// la soutenance commence avant maintenant (date passée, ou aujourd'hui à une heure déjà passée)
export function isInPast(
  date: string,
  time: string,
  now = nowInAlgiers(),
): boolean {
  if (date !== now.date) return date < now.date;
  return toMinutes(time) <= now.minutes;
}
