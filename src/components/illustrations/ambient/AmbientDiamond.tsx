/**
 * AmbientDiamond — diamond shape with two small wings/petals.
 * Ported from kinloop-dashboard-reference.html ambient-3.
 * 44×50 viewBox.
 */
export default function AmbientDiamond({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 50" aria-hidden="true" fill="none">
      <g transform="translate(22, 25)">
        <path
          d="M -16 -8 L 0 -16 L 16 -8 L 0 0 Z"
          fill="#F4C95D"
          stroke="#9A7820"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 0 -16 L -8 -22 L -10 -18 L -4 -12"
          fill="#FCE7B1"
          stroke="#9A7820"
          strokeWidth="1.4"
        />
        <path
          d="M 0 -16 L 8 -22 L 10 -18 L 4 -12"
          fill="#F4C95D"
          stroke="#9A7820"
          strokeWidth="1.4"
        />
      </g>
    </svg>
  );
}
