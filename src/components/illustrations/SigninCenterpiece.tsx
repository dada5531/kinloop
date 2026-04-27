/**
 * SigninCenterpiece — large folded letters/envelope motif.
 *
 * Ported directly from kinloop-signin-reference.html.
 * Displayed at 12% opacity behind the password card with a gentle float animation.
 * 360×360 viewBox, three stacked paper sheets with ruled lines.
 */
export default function SigninCenterpiece({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 360 360"
      aria-hidden="true"
      fill="none"
    >
      <g transform="translate(180, 180)">
        {/* Back sheet */}
        <path
          d="M -20 90 Q -22 80 -10 78 L 100 60 Q 110 60 108 70 L 96 130 Q 94 138 86 138 L -10 144 Q -20 144 -18 134 Z"
          fill="#FAEAD8"
          stroke="#B85A3F"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Middle sheet */}
        <path
          d="M -8 80 Q -10 70 2 68 L 108 50 Q 118 50 116 60 L 104 122 Q 102 130 94 130 L 0 134 Q -10 134 -8 124 Z"
          fill="#F5D3B6"
          stroke="#B85A3F"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Front sheet */}
        <path
          d="M 4 68 Q 1 58 14 56 L 116 38 Q 126 38 124 48 L 112 110 Q 110 118 102 118 L 8 122 Q -2 122 0 112 Z"
          fill="#F0BC93"
          stroke="#B85A3F"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Ruled lines on front sheet */}
        <path d="M 14 80 Q 40 76 70 72" stroke="#B85A3F" strokeWidth="1.4" opacity="0.55" />
        <path d="M 16 92 Q 46 88 82 84" stroke="#B85A3F" strokeWidth="1.4" opacity="0.55" />
        <path d="M 20 104 Q 44 100 60 98" stroke="#B85A3F" strokeWidth="1.4" opacity="0.55" />
      </g>
    </svg>
  );
}
