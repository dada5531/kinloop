export default function Plant({ className }: { className?: string }) {
  return (
    <svg width="44" height="62" viewBox="0 0 44 62" className={className} aria-hidden="true">
      <path d="M 22 60 Q 24 44 22 26 Q 20 12 22 0" fill="none" stroke="#5D8A5D" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M 22 18 Q 6 16 4 28 Q 14 34 22 26" fill="#A8C8A8" stroke="#5D8A5D" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M 22 6 Q 38 6 40 18 Q 30 24 22 16" fill="#C2D8B8" stroke="#5D8A5D" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M 22 36 Q 8 38 6 50 Q 16 54 22 46" fill="#A8C8A8" stroke="#5D8A5D" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
