export default function House({ className }: { className?: string }) {
  return (
    <svg width="48" height="58" viewBox="0 0 48 58" className={className} aria-hidden="true">
      <path d="M 6 22 L 24 6 L 42 22 L 42 50 Q 42 54 38 54 L 10 54 Q 6 54 6 50 Z" fill="#FCE7B1" stroke="#9A7820" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M 4 22 L 24 4 L 44 22" fill="none" stroke="#9A7820" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
      <rect x="18" y="34" width="12" height="20" fill="#F0BC93" stroke="#9A4530" strokeWidth="1.4"/>
      <circle cx="27" cy="44" r="0.8" fill="#9A4530"/>
    </svg>
  );
}
