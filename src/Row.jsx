export default function Row({ label, sublabel, value, big }) {
  return (
    <div className="pc-row">
      <span className={big ? "pc-row-label-big" : "pc-row-label"}>
        {label}
        {sublabel && <span className="pc-row-sub"> · {sublabel}</span>}
      </span>
      <span className={big ? "pc-row-value-big" : "pc-row-value"}>{value}</span>
    </div>
  );
}
