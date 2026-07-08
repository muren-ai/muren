/** Angular M-mark — verbatim placeholder polygons from v9. Swap real SVG here. */
export default function MurenMark({
  size = 22,
  fill = "#111318",
  className,
}: {
  size?: number;
  fill?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true">
      <g fill={fill}>
        <polygon points="26,30 41,30 41,94 26,94" />
        <polygon points="79,30 94,30 94,94 79,94" />
        <polygon points="41,30 51,30 60,54 69,30 79,30 60,74" />
        <polygon points="60,54 76,94 67,94 53,60" />
      </g>
    </svg>
  );
}
