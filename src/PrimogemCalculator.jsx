import { useState, useMemo } from "react";
import "./PrimogemCalculator.css";
import Field from "./Field.jsx";
import Row from "./Row.jsx";
import { SOURCES, calculatePrimogems } from "./primogemCalc.js";
import GenshinSchedule from "./GenshinSchedule.jsx";

export default function PrimogemCalculator() {
  const [genesisCrystals, setGenesisCrystals] = useState("");
  const [primogems, setPrimogems] = useState("");
  const [intertwinedFate, setIntertwinedFate] = useState("");
  const [enabled, setEnabled] = useState({
    daily: true,
    welkin: false,
    stardust: false,
    abyss: false,
    theater: false,
    arcane: false,
  });
  const [targetDate, setTargetDate] = useState("");

  const toggle = (key) =>
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));

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

  return (
    <div className="pc-page">
      <div className="pc-curtain-top" />
      <div className="pc-card">
        <p className="pc-eyebrow">FONTAINE TREASURY</p>
        <h1 className="pc-title">Primogem Forecast</h1>
        <p className="pc-subtitle">
          Hitung berapa pull yang akan kamu punya sampai tanggal tertentu.
        </p>

        <div className="pc-section">
          <h2 className="pc-section-title">Yang kamu punya sekarang</h2>
          <div className="pc-grid3">
            <Field label="Genesis Crystals" value={genesisCrystals} onChange={setGenesisCrystals} />
            <Field label="Primogems" value={primogems} onChange={setPrimogems} />
            <Field label="Intertwined Fate" value={intertwinedFate} onChange={setIntertwinedFate} />
          </div>
        </div>

        <div className="pc-section">
          <h2 className="pc-section-title">Sumber primogem yang dihitung</h2>
          <div className="pc-check-list">
            {SOURCES.map((s) => {
              const isArcane = s.key === "arcane";
              const disabled = isArcane && !enabled.theater;
              return (
                <label
                  key={s.key}
                  className="pc-check-item"
                  style={disabled ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                >
                  <input
                    type="checkbox"
                    checked={enabled[s.key]}
                    onChange={() => toggle(s.key)}
                    disabled={disabled}
                    className="pc-checkbox"
                  />
                  <span className="pc-check-icon">{s.icon}</span>
                  <span>{s.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pc-section">
          <h2 className="pc-section-title">Sampai tanggal</h2>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="pc-date-input"
          />
        </div>

        {targetDate && !result && (
          <p className="pc-error-text">
            Pilih tanggal yang valid (tidak boleh sebelum hari ini).
          </p>
        )}

        {result && (
          <div className="pc-result-box">
            <h2 className="pc-section-title">Hasil</h2>
            <Row
              label="Resource sekarang"
              value={`${result.resourceBefore.toLocaleString("id-ID")} (${result.pullsBefore} pull)`}
            />
            {enabled.daily && (
              <Row label="Daily Commission" value={`+${result.dailyBonus.toLocaleString("id-ID")} primogem`} />
            )}
            {enabled.welkin && (
              <Row label="Welkin Moon" value={`+${result.welkinBonus.toLocaleString("id-ID")} primogem`} />
            )}
            {enabled.stardust && (
              <Row label="Stardust Exchange" value={`+${result.stardustPulls} pull`} />
            )}
            {enabled.abyss && (
              <Row
                label={`Spiral Abyss (${result.abyssResets}x reset)`}
                value={`+${result.abyssBonus.toLocaleString("id-ID")} primogem`}
              />
            )}
            {enabled.theater && (
              <Row
                label={`Imaginarium Theater (${result.theaterResets}x reset)`}
                value={`+${result.theaterBonus.toLocaleString("id-ID")} primogem`}
              />
            )}
            {enabled.theater && enabled.arcane && (
              <Row
                label="↳ termasuk Arcane Chamber (2 stage)"
                value={`+${result.arcaneBonus.toLocaleString("id-ID")} primogem`}
              />
            )}
            <div className="pc-divider" />
            <Row label="Total estimasi pull" value={`${result.totalPulls} pull`} big />
            <p className="pc-note">
              Estimasi {result.days} hari dari sekarang. Asumsi: commission & welkin
              diklaim penuh tiap hari, Spiral Abyss & Imaginarium Theater full clear
              tiap reset.
            </p>
          </div>
        )}

        <GenshinSchedule />
      </div>
    </div>
  );
}
