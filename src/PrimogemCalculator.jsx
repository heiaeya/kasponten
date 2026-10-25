import { useState, useMemo, useEffect } from "react";
import "./PrimogemCalculator.css";
import Field from "./Field.jsx";
import Row from "./Row.jsx";
import {
  SOURCES,
  RESOURCE_PER_ROLL,
  calculatePrimogems,
  currentPulls,
  todayISO,
  addDaysISO,
} from "./primogemCalc.js";

// Input user disimpan di localStorage biar nggak hilang pas refresh.
// Fitur berikutnya (akun, riwayat, dll) bisa lanjut dari pola ini.
const STORAGE_KEY = "kasponten:v1";

const DEFAULT_STATE = {
  genesisCrystals: "",
  primogems: "",
  intertwinedFate: "",
  enabled: {
    daily: true,
    welkin: false,
    stardust: false,
    abyss: false,
    theater: false,
    arcane: false,
  },
  targetDate: "",
};

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...saved,
      enabled: { ...DEFAULT_STATE.enabled, ...(saved.enabled || {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const DATE_PRESETS = [
  { label: "7 hari", days: 7 },
  { label: "30 hari", days: 30 },
  { label: "42 hari · 1 patch", days: 42 },
  { label: "90 hari", days: 90 },
];

const fmt = (n) => n.toLocaleString("id-ID");

export default function PrimogemCalculator() {
  const [form, setForm] = useState(loadSaved);
  const { genesisCrystals, primogems, intertwinedFate, enabled, targetDate } =
    form;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // storage penuh / private mode — abaikan, aplikasi tetap jalan
    }
  }, [form]);

  const setField = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggle = (key) =>
    setForm((prev) => {
      const next = { ...prev.enabled, [key]: !prev.enabled[key] };
      // Arcane ikut mati kalau Theater dimatikan (Arcane nempel ke Theater)
      if (key === "theater" && !next.theater) next.arcane = false;
      return { ...prev, enabled: next };
    });

  const resetAll = () => {
    setForm(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // abaikan
    }
  };

  const now = useMemo(
    () =>
      currentPulls({ genesisCrystals, primogems, intertwinedFate }),
    [genesisCrystals, primogems, intertwinedFate]
  );

  const result = useMemo(
    () =>
      calculatePrimogems({
        genesisCrystals,
        primogems,
        intertwinedFate,
        enabled,
        targetDate,
      }),
    [genesisCrystals, primogems, intertwinedFate, enabled, targetDate]
  );

  const isDirty =
    genesisCrystals !== "" ||
    primogems !== "" ||
    intertwinedFate !== "" ||
    targetDate !== "";

  return (
    <div className="pc-page">
      <div className="pc-curtain-top" />
      <main className="pc-card">
        <header className="pc-header">
          <div className="pc-header-main">
            <img
              className="pc-medallion"
              src="/img/furinaicon.png"
              alt=""
              width="64"
              height="64"
            />
            <div>
              <p className="pc-eyebrow">✦ FONTAINE TREASURY ✦</p>
              <h1 className="pc-title">Primogem Forecast</h1>
              <p className="pc-subtitle">
                Hitung berapa pull yang akan kamu punya sampai tanggal tertentu.
              </p>
            </div>
          </div>
          {isDirty && (
            <button type="button" className="pc-reset-btn" onClick={resetAll}>
              ↺ Reset
            </button>
          )}
        </header>

        {/* ---------- 1. Resource sekarang ---------- */}
        <section className="pc-section">
          <h2 className="pc-section-title">
            <span className="pc-step"><span>1</span></span> Yang kamu punya sekarang
          </h2>
          <div className="pc-grid3">
            <Field
              label="Genesis Crystals"
              hint="1 Genesis = 1 primo"
              value={genesisCrystals}
              onChange={setField("genesisCrystals")}
            />
            <Field
              label="Primogems"
              hint={`${RESOURCE_PER_ROLL} primo = 1 pull`}
              value={primogems}
              onChange={setField("primogems")}
            />
            <Field
              label="Intertwined Fate"
              hint="Sudah dalam bentuk pull"
              value={intertwinedFate}
              onChange={setField("intertwinedFate")}
            />
          </div>
          <p className="pc-now-line">
            Total sekarang:{" "}
            <strong>
              {fmt(now.resource)} primo setara · {now.pulls} pull
            </strong>
            {now.leftover > 0 && (
              <span className="pc-now-leftover">
                {" "}
                (sisa {fmt(now.leftover)} primo)
              </span>
            )}
          </p>
        </section>

        {/* ---------- 2. Sumber primogem ---------- */}
        <section className="pc-section">
          <h2 className="pc-section-title">
            <span className="pc-step"><span>2</span></span> Sumber primogem yang dihitung
          </h2>
          <div className="pc-check-grid">
            {SOURCES.map((s) => {
              const disabled = s.dependsOn && !enabled[s.dependsOn];
              const checked = enabled[s.key] && !disabled;
              return (
                <label
                  key={s.key}
                  className={
                    "pc-check-item" +
                    (checked ? " pc-check-item-on" : "") +
                    (disabled ? " pc-check-item-disabled" : "")
                  }
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(s.key)}
                    disabled={disabled}
                    className="pc-checkbox"
                  />
                  <span className="pc-check-text">
                    <span className="pc-check-label">{s.label}</span>
                    <span className="pc-check-detail">
                      {disabled
                        ? "Aktifkan Imaginarium Theater dulu"
                        : s.detail}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* ---------- 3. Tanggal target ---------- */}
        <section className="pc-section">
          <h2 className="pc-section-title">
            <span className="pc-step"><span>3</span></span> Sampai tanggal
          </h2>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setField("targetDate")(e.target.value)}
            min={todayISO()}
            className="pc-date-input"
          />
          <div className="pc-presets">
            {DATE_PRESETS.map((p) => {
              const iso = addDaysISO(p.days);
              return (
                <button
                  key={p.days}
                  type="button"
                  className={
                    "pc-preset" + (targetDate === iso ? " pc-preset-on" : "")
                  }
                  onClick={() => setField("targetDate")(iso)}
                >
                  +{p.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- Hasil ---------- */}
        {targetDate && !result && (
          <p className="pc-error-text" role="alert">
            Pilih tanggal yang valid (tidak boleh sebelum hari ini).
          </p>
        )}

        {!targetDate && (
          <div className="pc-empty">
            Pilih tanggal target di atas buat lihat forecast pull kamu. ✦
          </div>
        )}

        {result && (
          <section className="pc-result-box" aria-live="polite">
            <div className="pc-result-hero">
              <span className="pc-result-sparkle" aria-hidden="true">
                ✦
              </span>
              <span className="pc-result-caption">
                Estimasi pull · {result.targetDateLabel}
              </span>
              <span className="pc-result-total">
                {result.totalPulls}
                <span className="pc-result-unit"> pull</span>
              </span>
              <span className="pc-result-sub">
                {result.days} hari dari sekarang · total{" "}
                {fmt(result.resourceAfter)} primo setara
                {result.stardustPulls > 0 &&
                  ` + ${result.stardustPulls} pull dari Stardust`}
              </span>
            </div>

            <div className="pc-pity">
              <div className="pc-pity-head">
                <span>Menuju pity {result.pity.target} (jaminan bintang 5)</span>
                <span>
                  {result.pity.reached
                    ? "Tercapai ✦"
                    : `kurang ${result.pity.remaining} pull`}
                </span>
              </div>
              <div
                className="pc-pity-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={result.pity.target}
                aria-valuenow={Math.min(result.totalPulls, result.pity.target)}
              >
                <div
                  className="pc-pity-fill"
                  style={{ width: `${result.pity.progress}%` }}
                >
                  <span className="pc-pity-star" aria-hidden="true">
                    ✦
                  </span>
                </div>
              </div>
            </div>

            <div className="pc-divider" />

            <Row
              label="Resource sekarang"
              sublabel={`${result.pullsBefore} pull`}
              value={`${fmt(result.resourceBefore)} primo`}
            />
            {result.breakdown.map((row) => (
              <Row
                key={row.key}
                label={row.label}
                sublabel={row.sublabel}
                value={row.text}
              />
            ))}
            <div className="pc-divider" />
            <Row
              label="Sisa primo di bawah 1 pull"
              value={`${fmt(result.leftoverPrimogems)} primo`}
            />

            <p className="pc-note">
              Estimasi kasar: commission &amp; welkin diasumsikan diklaim penuh
              tiap hari, Spiral Abyss &amp; Imaginarium Theater full clear tiap
              reset. Belum termasuk event, quest, eksplorasi, dan kode redeem.
            </p>
          </section>
        )}

        <footer className="pc-footer">
          Kasponten · Kas Fontaine buat nabung pull — bukan afiliasi HoYoverse.
        </footer>
      </main>
    </div>
  );
}
