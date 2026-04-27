/**
 * AmbientSun — small sun with 4 rays in butter-yellow.
 * Ported from kinloop-dashboard-reference.html ambient-4.
 * 32×32 viewBox. This is the one that rotates 180° during its drift cycle.
 */
export default function AmbientSun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" fill="none">
      <circle cx="16" cy="16" r="9" fill="#FCE7B1" stroke="#9A7820" strokeWidth="1.4" />
      <path d="M 16 3 L 16 6" stroke="#9A7820" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 16 26 L 16 29" stroke="#9A7820" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 3 16 L 6 16" stroke="#9A7820" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 26 16 L 29 16" stroke="#9A7820" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
