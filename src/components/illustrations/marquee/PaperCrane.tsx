export default function PaperCrane({ className }: { className?: string }) {
  return (
    <svg width="60" height="74" viewBox="0 0 60 74" className={className} aria-hidden="true">
      <path d="M 30 8 Q 32 4 38 4 L 54 18 Q 58 22 54 26 L 38 32 L 30 28 Z" fill="#FCE7B1" stroke="#9A7820" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M 30 8 Q 28 4 22 4 L 6 18 Q 2 22 6 26 L 22 32 L 30 28 Z" fill="#F8DD93" stroke="#9A7820" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M 6 26 L 30 44 L 54 26 L 30 56 Z" fill="#F8DD93" stroke="#9A7820" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M 54 26 L 60 30 L 58 33 L 54 30" fill="#FCE7B1" stroke="#9A7820" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="4" cy="22" r="1.4" fill="#9A7820"/>
    </svg>
  );
}
