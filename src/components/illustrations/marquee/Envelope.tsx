export default function Envelope({ className }: { className?: string }) {
  return (
    <svg width="56" height="48" viewBox="0 0 56 48" className={className} aria-hidden="true">
      <path d="M 0 8 L 50 4 Q 54 4 54 8 L 54 36 Q 54 40 50 40 L 0 44 Q -4 44 -4 40 L -4 12 Q -4 8 0 8 Z" fill="#FFF6EC" stroke="#B85A3F" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M 0 8 L 26 24 L 54 8" fill="none" stroke="#B85A3F" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="26" cy="26" r="6" fill="#E8B4A0" stroke="#9A4530" strokeWidth="1.3"/>
    </svg>
  );
}
