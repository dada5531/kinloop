export default function PaperAirplane({ className }: { className?: string }) {
  return (
    <svg width="68" height="56" viewBox="0 0 68 56" className={className} aria-hidden="true">
      <path d="M 0 24 L 32 8 L 60 24 L 32 36 Z" fill="#F8DD93" stroke="#9A7820" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M 32 8 L 32 36" fill="none" stroke="#9A7820" strokeWidth="1.3" opacity="0.6"/>
      <path d="M 32 8 L 18 -6 L 14 0 L 26 12" fill="#FCE7B1" stroke="#9A7820" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M 32 8 L 46 -6 L 50 0 L 38 12" fill="#F8DD93" stroke="#9A7820" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M 60 24 L 68 28 L 64 32 L 56 28 Z" fill="#FCE7B1" stroke="#9A7820" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M 0 24 L -8 18 L -4 14 L 4 18 Z" fill="#F8DD93" stroke="#9A7820" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="-4" cy="18" r="1.2" fill="#9A7820"/>
    </svg>
  );
}
