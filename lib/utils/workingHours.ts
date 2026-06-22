type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<DayKey, string> = {
  mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт", sat: "Сб", sun: "Вс",
};

type DaySchedule = { open: string; close: string; closed: boolean };

export function formatWorkingHoursTable(raw?: string | null): Array<{ day: string; value: string }> | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Record<DayKey, DaySchedule>;
    if (!s.mon) return null;
    return DAY_KEYS.map((k) => ({
      day: DAY_LABELS[k],
      value: s[k].closed ? "Выходной" : `${s[k].open} – ${s[k].close}`,
    }));
  } catch {
    return null;
  }
}

export function formatWorkingHours(raw?: string | null): string {
  if (!raw) return "";
  try {
    const s = JSON.parse(raw) as Record<DayKey, DaySchedule>;
    if (!s.mon) return raw;
    const groups: string[] = [];
    let i = 0;
    while (i < DAY_KEYS.length) {
      const key = DAY_KEYS[i];
      const day = s[key];
      let j = i + 1;
      while (j < DAY_KEYS.length) {
        const next = s[DAY_KEYS[j]];
        if (next.closed !== day.closed || next.open !== day.open || next.close !== day.close) break;
        j++;
      }
      const range =
        j - i > 1
          ? `${DAY_LABELS[DAY_KEYS[i]]}–${DAY_LABELS[DAY_KEYS[j - 1]]}`
          : DAY_LABELS[key];
      groups.push(day.closed ? `${range}: выходной` : `${range}: ${day.open}–${day.close}`);
      i = j;
    }
    return groups.join(", ");
  } catch {
    return raw;
  }
}
