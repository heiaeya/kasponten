export default function Row({ label, value, big }) {
  return (
    <div className="pc-row">
      <span className={big ? "pc-row-label-big" : "pc-row-label"}>{label}</span>
      <span className={big ? "pc-row-value-big" : "pc-row-value"}>{value}</span>
    </div>
  );
}
