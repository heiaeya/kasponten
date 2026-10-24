// ============================================================
//  Kasponten — logika hitung Primogem Forecast
// ------------------------------------------------------------
//  File ini SENGAJA dipisah dari tampilan (PrimogemCalculator.jsx)
//  biar gampang ditambah fitur:
//  - Tambah sumber primogem baru  -> tambah 1 entri di SOURCES
//    + 1 blok hitung di calculatePrimogems() + 1 baris breakdown.
//  - Ubah angka (reward abyss, welkin, dll) -> cukup ubah konstanta
//    di bagian atas file ini. Tampilan ikut berubah otomatis.
// ============================================================

// ============ KONSTANTA SUMBER PRIMOGEM ============
export const RESOURCE_PER_ROLL = 160; // 1 pull = 160 primogem
export const PITY_TARGET = 90; // jaminan bintang 5 di banner karakter

export const DAILY_COMMISSION_PER_DAY = 60; // 4 commission ~60 primogem/hari
export const WELKIN_PER_DAY = 90; // Blessing of the Welkin Moon
export const STARDUST_PULLS_PER_MONTH = 5; // Stardust exchange (Paimon shop)
export const SPIRAL_ABYSS_RESET_DAYS = [16]; // reset 1x sebulan (tgl 16)
export const SPIRAL_ABYSS_PER_RESET = 800; // max per reset (full clear 36★)
export const THEATER_RESET_DAYS = [1]; // reset 1x sebulan (tgl 1)
export const THEATER_PER_RESET = 800; // max per reset (full clear)
export const ARCANE_STAGE_COUNT = 2; // Arcane Chamber: 2 stage
export const ARCANE_PER_STAGE = 100; // 100 primogem per stage
export const ARCANE_TOTAL = ARCANE_STAGE_COUNT * ARCANE_PER_STAGE; // 200

// Daftar sumber yang bisa dipilih user.
// `detail` = teks kecil di kartu pilihan.
export const SOURCES = [
  {
    key: "daily",
    label: "Daily Commission",
    icon: "✦",
    detail: `${DAILY_COMMISSION_PER_DAY} primo / hari`,
  },
  {
    key: "welkin",
    label: "Blessing of the Welkin Moon",
    icon: "🌙",
    detail: `${WELKIN_PER_DAY} primo / hari`,
  },
  {
    key: "stardust",
    label: "Stardust Exchange",
    icon: "✨",
    detail: `${STARDUST_PULLS_PER_MONTH} pull / bulan`,
  },
  {
    key: "abyss",
    label: "Spiral Abyss",
    icon: "🌀",
    detail: `${SPIRAL_ABYSS_PER_RESET} primo / reset · tgl 16`,
  },
  {
    key: "theater",
    label: "Imaginarium Theater",
    icon: "🎭",
    detail: `${THEATER_PER_RESET} primo / reset · tgl 1`,
  },
  {
    key: "arcane",
    label: "Arcane Chamber",
    icon: "🔮",
    detail: `+${ARCANE_TOTAL} primo · ${ARCANE_STAGE_COUNT} stage, ikut Theater`,
    dependsOn: "theater", // cuma aktif kalau Imaginarium Theater nyala
  },
];

// ============ HELPER TANGGAL ============
export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Format tanggal lokal ke "YYYY-MM-DD" (buat <input type="date">).
// JANGAN pakai toISOString() di sini: itu UTC, jadi di WIB pagi hari
// tanggalnya bisa mundur sehari.
export function toISODate(d) {
  const x = startOfDay(d);
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${mm}-${dd}`;
}

export function todayISO() {
  return toISODate(new Date());
}

// ISO date `days` hari dari hari ini (buat preset tanggal).
export function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function formatDateID(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ============ HELPER ANGKA ============
export function rollsFromResource(resource) {
  return Math.floor(resource / RESOURCE_PER_ROLL);
}

// Input dari form selalu dianggap >= 0 (angka negatif dianggap 0).
function toAmount(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Ringkasan resource yang dimiliki SEKARANG (tanpa tanggal target),
// buat ditampilkan langsung saat user ngisi form.
export function currentPulls({ genesisCrystals, primogems, intertwinedFate }) {
  const resource =
    toAmount(genesisCrystals) +
    toAmount(primogems) +
    toAmount(intertwinedFate) * RESOURCE_PER_ROLL;
  const pulls = rollsFromResource(resource);
  return {
    resource,
    pulls,
    leftover: resource - pulls * RESOURCE_PER_ROLL,
  };
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

function countMonthsTouched(today, selected) {
  return (
    (selected.getFullYear() - today.getFullYear()) * 12 +
    (selected.getMonth() - today.getMonth()) +
    1
  );
}

// ============ FUNGSI UTAMA ============
// Terima resource awal, opsi yang dicentang, dan tanggal target.
// Return null kalau tanggal tidak valid.
//
// Hasilnya termasuk `breakdown`: daftar baris siap-tampil
// ({ key, label, sublabel, text }) — tampilan tinggal me-loop array ini,
// jadi sumber baru otomatis muncul di hasil tanpa ubah JSX.
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

  const resourceBefore = currentPulls({
    genesisCrystals,
    primogems,
    intertwinedFate,
  }).resource;
  const days = countDaysBetween(today, selected);

  // --- per sumber ---
  const dailyBonus = enabled.daily ? DAILY_COMMISSION_PER_DAY * days : 0;
  const welkinBonus = enabled.welkin ? WELKIN_PER_DAY * days : 0;

  const stardustPulls = enabled.stardust
    ? STARDUST_PULLS_PER_MONTH * countMonthsTouched(today, selected)
    : 0;

  const abyssResets = enabled.abyss
    ? countResetOccurrences(today, selected, SPIRAL_ABYSS_RESET_DAYS)
    : 0;
  const abyssBonus = abyssResets * SPIRAL_ABYSS_PER_RESET;

  const theaterResets = enabled.theater
    ? countResetOccurrences(today, selected, THEATER_RESET_DAYS)
    : 0;
  // Arcane cuma dihitung kalau Theater nyala (sama seperti sebelumnya).
  const arcaneBonus =
    enabled.theater && enabled.arcane ? theaterResets * ARCANE_TOTAL : 0;
  const theaterBonus = theaterResets * THEATER_PER_RESET + arcaneBonus;

  // --- total ---
  const resourceAfter =
    resourceBefore + dailyBonus + welkinBonus + abyssBonus + theaterBonus;
  const pullsFromResource = rollsFromResource(resourceAfter);
  const totalPulls = pullsFromResource + stardustPulls;
  const leftoverPrimogems =
    resourceAfter - pullsFromResource * RESOURCE_PER_ROLL;

  const fmt = (n) => n.toLocaleString("id-ID");
  const breakdown = [];
  if (enabled.daily)
    breakdown.push({
      key: "daily",
      label: "Daily Commission",
      sublabel: `${days} hari × ${DAILY_COMMISSION_PER_DAY}`,
      text: `+${fmt(dailyBonus)} primo`,
    });
  if (enabled.welkin)
    breakdown.push({
      key: "welkin",
      label: "Welkin Moon",
      sublabel: `${days} hari × ${WELKIN_PER_DAY}`,
      text: `+${fmt(welkinBonus)} primo`,
    });
  if (enabled.stardust)
    breakdown.push({
      key: "stardust",
      label: "Stardust Exchange",
      sublabel: `${STARDUST_PULLS_PER_MONTH} pull / bulan`,
      text: `+${stardustPulls} pull`,
    });
  if (enabled.abyss)
    breakdown.push({
      key: "abyss",
      label: "Spiral Abyss",
      sublabel: `${abyssResets}× reset × ${fmt(SPIRAL_ABYSS_PER_RESET)}`,
      text: `+${fmt(abyssBonus)} primo`,
    });
  if (enabled.theater)
    breakdown.push({
      key: "theater",
      label: "Imaginarium Theater",
      sublabel: `${theaterResets}× reset × ${fmt(THEATER_PER_RESET)}`,
      text: `+${fmt(theaterResets * THEATER_PER_RESET)} primo`,
    });
  if (enabled.theater && enabled.arcane)
    breakdown.push({
      key: "arcane",
      label: "Arcane Chamber",
      sublabel: `${theaterResets}× reset × ${ARCANE_STAGE_COUNT} stage`,
      text: `+${fmt(arcaneBonus)} primo`,
    });

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
    resourceAfter,
    leftoverPrimogems,
    totalPulls,
    days,
    targetDateLabel: formatDateID(targetDate),
    pity: {
      target: PITY_TARGET,
      reached: totalPulls >= PITY_TARGET,
      remaining: Math.max(0, PITY_TARGET - totalPulls),
      progress: Math.min(100, Math.round((totalPulls / PITY_TARGET) * 100)),
    },
    breakdown,
  };
}
