// ============ JADWAL UPDATE GENSHIN IMPACT ============
// Pola dari histori: tiap update berjarak 42 hari (6 minggu), selalu hari Rabu.
// Livestream selalu 12 hari sebelum update, selalu hari Jumat.
// Anchor date di bawah adalah salah satu update yang sudah dikonfirmasi.

export const CYCLE_DAYS = 42;
export const LIVESTREAM_OFFSET_DAYS = 12;

// Anchor: 1 Juli (Rabu) — sudah dikonfirmasi sesuai histori yang diberikan
const ANCHOR_UPDATE = new Date(2026, 6, 1); // bulan 0-indexed: 6 = Juli

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatDate(d) {
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Cari tanggal update PERTAMA yang >= fromDate, berdasarkan kelipatan CYCLE_DAYS dari anchor.
function findFirstUpdateOnOrAfter(fromDate) {
  const anchor = startOfDay(ANCHOR_UPDATE);
  const from = startOfDay(fromDate);
  const diffDays = Math.round((from.getTime() - anchor.getTime()) / 86400000);
  const cyclesPassed = Math.ceil(diffDays / CYCLE_DAYS);
  const result = new Date(anchor);
  result.setDate(result.getDate() + cyclesPassed * CYCLE_DAYS);
  return result;
}

// Generate `count` update berikutnya beserta tanggal livestream-nya, mulai dari fromDate.
export function getUpcomingSchedule(count = 10, fromDate = new Date()) {
  const first = findFirstUpdateOnOrAfter(fromDate);
  const list = [];
  const cursor = new Date(first);

  for (let i = 0; i < count; i++) {
    const updateDate = new Date(cursor);
    const livestreamDate = new Date(updateDate);
    livestreamDate.setDate(livestreamDate.getDate() - LIVESTREAM_OFFSET_DAYS);

    list.push({
      version: i + 1,
      updateDate,
      updateDateLabel: formatDate(updateDate),
      livestreamDate,
      livestreamDateLabel: formatDate(livestreamDate),
    });

    cursor.setDate(cursor.getDate() + CYCLE_DAYS);
  }

  return list;
}

// Generate daftar event (livestream & update) sebagai flat list, tanpa nomor versi.
// Berguna untuk ditandai di tampilan kalender.
export function getScheduleEvents(count = 10, fromDate = new Date()) {
  const schedule = getUpcomingSchedule(count, fromDate);
  const events = [];
  schedule.forEach((item) => {
    events.push({ type: "livestream", date: item.livestreamDate });
    events.push({ type: "update", date: item.updateDate });
  });
  return events;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Bangun grid kalender untuk satu bulan (Senin sebagai awal minggu).
// Return array of weeks, tiap week array of {date, inMonth, events[]}.
export function buildMonthGrid(year, month, events) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Senin
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - startWeekday);

  const weeks = [];
  const cursor = new Date(gridStart);

  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dayEvents = events.filter((e) => isSameDay(e.date, cursor));
      week.push({
        date: new Date(cursor),
        inMonth: cursor.getMonth() === month,
        events: dayEvents,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    // stop kalau minggu ini udah lewat akhir bulan dan udah lengkap 6 baris minimum ga perlu, tapi biar rapi stop early
    if (cursor.getMonth() !== month && w >= 3 && cursor.getDate() <= 7) break;
  }

  return weeks;
}
