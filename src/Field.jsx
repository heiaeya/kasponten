export default function Field({ label, value, onChange }) {
  return (
    <label className="pc-field-wrap">
      <span className="pc-field-label">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="pc-field-input"
      />
    </label>
  );
}
