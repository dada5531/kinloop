/**
 * AmbientCloud — soft cloud/blob shape in butter-yellow.
 * Ported from kinloop-dashboard-reference.html ambient-1.
 * 70×56 viewBox.
 */
export default function AmbientCloud({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 70 56" aria-hidden="true" fill="none">
      <path
        d="M 8 50 Q 4 32 12 16 Q 22 6 32 12 Q 24 4 38 4 Q 50 6 54 18 Q 60 30 52 42 Q 44 54 32 52 Q 22 56 8 50 Z"
        fill="#FCE7B1"
        stroke="#9A7820"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
