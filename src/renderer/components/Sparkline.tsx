type Props = { values: number[]; width?: number; height?: number; label: string };

/** A 20-year sparkline (0..100) drawn as inline SVG. */
export function Sparkline({ values, width = 64, height = 18, label }: Props): React.JSX.Element {
  const pts = values.slice(-20);
  if (pts.length < 2) return <svg width={width} height={height} role="img" aria-label={label} />;
  const step = width / (pts.length - 1);
  const d = pts
    .map(
      (v, i) =>
        `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(height - (v / 100) * (height - 2) - 1).toFixed(1)}`,
    )
    .join(' ');
  return (
    <svg width={width} height={height} role="img" aria-label={label} className="sparkline">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
