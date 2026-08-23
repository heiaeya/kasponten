// ============ KONSTANTA SUMBER PRIMOGEM ============
export const RESOURCE_PER_ROLL = 160;
export const DAILY_COMMISSION_PER_DAY = 60;     // 4 commission ~60 primogem/hari
export const WELKIN_PER_DAY = 90;                // Blessing of the Welkin Moon
export const STARDUST_PULLS_PER_MONTH = 5;       // Stardust exchange (paimon shop)
export const SPIRAL_ABYSS_RESET_DAYS = [16];     // reset 1x sebulan (tgl 16)
export const SPIRAL_ABYSS_PER_RESET = 800;       // max primogem per reset (full clear 36★)
export const THEATER_RESET_DAYS = [1];           // reset 1x sebulan
export const THEATER_PER_RESET = 800;            // max primogem per reset (full clear)
export const ARCANE_STAGE_COUNT = 2;             // Arcane Chamber: 2 stage
export const ARCANE_PER_STAGE = 100;             // 100 primogem per stage
export const ARCANE_TOTAL = ARCANE_STAGE_COUNT * ARCANE_PER_STAGE; // 200
export const THEATER_PER_RESET_WITH_ARCANE = THEATER_PER_RESET + ARCANE_TOTAL; // 1000

export const SOURCES = [
  { key: "daily", label: "Daily Commission", icon: "✦" },
  { key: "welkin", label: "Blessing of the Welkin Moon", icon: "🌙" },
  { key: "stardust", label: "Stardust Exchange", icon: "✨" },
  { key: "abyss", label: "Spiral Abyss (tiap tgl 16)", icon: "🌀" },
  { key: "theater", label: "Imaginarium Theater (tiap tgl 1)", icon: "🎭" },
  { key: "arcane", label: "Arcane Chamber — 2 stage (+200)", icon: "🔮" },
];

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function rollsFromResource(resource) {
  return Math.floor(resource / RESOURCE_PER_ROLL);
}

// Hitung berapa hari (mulai BESOK sampai endDate inklusif) yang jatuh
// pada salah satu tanggal di `days` (day-of-month).
export function countResetOccurrences(today, endDate, days) {
  let count = 0;
  const cursor = startOfDay(today);
  cursor.setDate(cursor.getDate() + 1); // mulai besok, hari ini dianggap sudah diklaim
  const end = startOfDay(endDate);
  while (cursor <= end) {
    if (days.includes(cursor.getDate())) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function countDaysBetween(today, endDate) {
  const diff = startOfDay(endDate).getTime() - startOfDay(today).getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

// Fungsi utama: terima resource awal, opsi yang dicentang, dan tanggal target.
// Return null kalau tanggal tidak valid.
export function calculatePrimogems({
  genesisCrystals,
  primogems,
  intertwinedFate,
  enabled,
  targetDate,
}) {
  if (!targetDate) return null;

  const today = new Date();
  const selected = new Date(targetDate + "T00:00:00");

  if (isNaN(selected.getTime()) || startOfDay(selected) < startOfDay(today)) {
    return null;
  }

  const g = parseInt(genesisCrystals, 10) || 0;
  const p = parseInt(primogems, 10) || 0;
  const f = parseInt(intertwinedFate, 10) || 0;

  const resourceBefore = g + p + f * RESOURCE_PER_ROLL;
  const days = countDaysBetween(today, selected);

  const dailyBonus = enabled.daily ? DAILY_COMMISSION_PER_DAY * days : 0;
  const welkinBonus = enabled.welkin ? WELKIN_PER_DAY * days : 0;

  const stardustPulls = enabled.stardust
    ? STARDUST_PULLS_PER_MONTH *
      ((selected.getFullYear() - today.getFullYear()) * 12 +
        (selected.getMonth() - today.getMonth()) +
        1)
    : 0;

  const abyssResets = enabled.abyss
    ? countResetOccurrences(today, selected, SPIRAL_ABYSS_RESET_DAYS)
    : 0;
  const abyssBonus = abyssResets * SPIRAL_ABYSS_PER_RESET;

  const theaterResets = enabled.theater
    ? countResetOccurrences(today, selected, THEATER_RESET_DAYS)
    : 0;
  const perReset = enabled.arcane ? THEATER_PER_RESET_WITH_ARCANE : THEATER_PER_RESET;
  const theaterBonus = theaterResets * perReset;
  const arcaneBonus = enabled.arcane ? theaterResets * ARCANE_TOTAL : 0;

  const resourceAfter =
    resourceBefore + dailyBonus + welkinBonus + abyssBonus + theaterBonus;
  const totalPulls = rollsFromResource(resourceAfter) + stardustPulls;

  return {
    resourceBefore,
    pullsBefore: rollsFromResource(resourceBefore),
    dailyBonus,
    welkinBonus,
    stardustPulls,
    abyssBonus,
    abyssResets,
    theaterBonus,
    theaterResets,
    arcaneBonus,
    totalPulls,
    days,
  };
}
