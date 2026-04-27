export default function Seedling({ className }: { className?: string }) {
  return (
    <svg width="40" height="64" viewBox="0 0 40 64" className={className} aria-hidden="true">
      <path d="M 20 62 Q 22 46 20 28 Q 18 14 20 2" fill="none" stroke="#5D8A5D" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M 20 2 Q 12 -4 16 -10" fill="none" stroke="#5D8A5D" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 20 2 Q 28 -4 24 -10" fill="none" stroke="#5D8A5D" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 18 18 Q 8 18 6 26 Q 14 30 18 24" fill="#A8C8A8" stroke="#5D8A5D" strokeWidth="1.4"/>
      <path d="M 22 12 Q 32 12 34 20 Q 26 24 22 18" fill="#C2D8B8" stroke="#5D8A5D" strokeWidth="1.4"/>
    </svg>
  );
}
