export default function OpenBook({ className }: { className?: string }) {
  return (
    <svg width="58" height="60" viewBox="0 0 58 60" className={className} aria-hidden="true">
      <path d="M 0 36 Q 0 28 8 26 L 26 22 L 26 56 L 8 60 Q 0 60 0 52 Z" fill="#F8E0E8" stroke="#9A3D55" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M 26 22 L 50 28 Q 56 30 56 38 L 56 52 Q 56 60 50 60 L 26 56 Z" fill="#F8E0E8" stroke="#9A3D55" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M 26 22 L 26 56" stroke="#9A3D55" strokeWidth="1.4" opacity="0.55"/>
      <path d="M 8 32 Q 18 32 24 32" stroke="#9A3D55" strokeWidth="1" opacity="0.5"/>
      <path d="M 8 40 Q 18 40 22 40" stroke="#9A3D55" strokeWidth="1" opacity="0.45"/>
      <path d="M 30 32 Q 42 32 52 32" stroke="#9A3D55" strokeWidth="1" opacity="0.5"/>
      <path d="M 30 40 Q 42 40 50 40" stroke="#9A3D55" strokeWidth="1" opacity="0.45"/>
    </svg>
  );
}
