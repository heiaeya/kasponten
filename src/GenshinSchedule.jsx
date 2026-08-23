import { useState, useMemo } from "react";
import "./GenshinSchedule.css";
import { getScheduleEvents, buildMonthGrid } from "./genshinSchedule.js";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function GenshinSchedule() {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Ambil cukup banyak event (2 tahun ke depan) biar navigasi bulan aman
  const events = useMemo(() => getScheduleEvents(20, today), [today]);

  const weeks = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, events),
    [viewYear, viewMonth, events]
  );

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  return (
    <div className="gs-wrap">
      <button className="gs-toggle-btn" onClick={() => setOpen((o) => !o)}>
        {open ? "Tutup Kalender Update" : "📅 Lihat Kalender Update Genshin"}
      </button>

      {open && (
        <div className="gs-panel">
          <div className="gs-cal-header">
            <button className="gs-nav-btn" onClick={goPrevMonth} aria-label="Bulan sebelumnya">
              ‹
            </button>
            <div className="gs-cal-title">
              <span className="gs-cal-month">{MONTH_NAMES[viewMonth]}</span>
              <span className="gs-cal-year">{viewYear}</span>
            </div>
            <button className="gs-nav-btn" onClick={goNextMonth} aria-label="Bulan berikutnya">
              ›
            </button>
          </div>

          <button className="gs-today-btn" onClick={goToday}>
            Ke bulan ini
          </button>

          <div className="gs-legend">
            <span className="gs-legend-item">
              <span className="gs-dot gs-dot-live" /> Livestream
            </span>
            <span className="gs-legend-item">
              <span className="gs-dot gs-dot-update" /> Update
            </span>
          </div>

          <div className="gs-grid gs-grid-head">
            {DAY_NAMES.map((d) => (
              <div key={d} className="gs-day-head">
                {d}
              </div>
            ))}
          </div>

          <div className="gs-grid">
            {weeks.flat().map((day, i) => {
              const isToday = isSameDay(day.date, today);
              const hasLive = day.events.some((e) => e.type === "livestream");
              const hasUpdate = day.events.some((e) => e.type === "update");
              return (
                <div
                  key={i}
                  className={
                    "gs-day" +
                    (day.inMonth ? "" : " gs-day-outside") +
                    (isToday ? " gs-day-today" : "")
                  }
                >
                  <span className="gs-day-num">{day.date.getDate()}</span>
                  <div className="gs-day-dots">
                    {hasLive && <span className="gs-dot gs-dot-live" title="Livestream" />}
                    {hasUpdate && <span className="gs-dot gs-dot-update" title="Update" />}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="gs-disclaimer">
            Perkiraan berdasarkan pola siklus 42 hari (update tiap Rabu, livestream
            12 hari sebelumnya tiap Jumat). Bisa berubah sewaktu-waktu kalau ada
            event khusus, libur panjang, atau pengumuman resmi dari HoYoverse.
          </p>
        </div>
      )}
    </div>
  );
}
