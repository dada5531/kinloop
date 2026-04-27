export default function BalloonFlower({ className }: { className?: string }) {
  return (
    <svg width="50" height="74" viewBox="0 0 50 74" className={className} aria-hidden="true">
      <path d="M 25 70 Q 26 52 24 32 Q 22 14 26 0" fill="none" stroke="#9A4530" strokeWidth="1.4" strokeLinecap="round"/>
      <ellipse cx="25" cy="20" rx="14" ry="16" fill="#E8B4A0" stroke="#9A4530" strokeWidth="1.7"/>
      <path d="M 21 12 Q 22 17 24 18" fill="none" stroke="#9A4530" strokeWidth="1" opacity="0.55"/>
      <path d="M 22 36 L 28 36 L 28 32 L 22 32 Z" fill="#9A4530" stroke="#9A4530" strokeWidth="1"/>
    </svg>
  );
}
