/**
 * AmbientPlant — stem with two leaves in sage green.
 * Ported from kinloop-dashboard-reference.html ambient-2.
 * 60×76 viewBox.
 */
export default function AmbientPlant({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 76" aria-hidden="true" fill="none">
      <path
        d="M 30 70 Q 32 52 30 32 Q 28 14 30 0"
        stroke="#5D8A5D"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M 30 18 Q 12 18 8 30 Q 18 36 30 28"
        fill="#A8C8A8"
        stroke="#5D8A5D"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M 30 6 Q 48 6 52 18 Q 42 24 30 18"
        fill="#C2D8B8"
        stroke="#5D8A5D"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
