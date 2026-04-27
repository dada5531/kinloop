import React from "react";

interface MorningMugProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function MorningMug({ className, size, "aria-hidden": ariaHidden = true, ...props }: MorningMugProps & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 85 130"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaHidden}
      {...props}
    >
      <g transform="translate(5, 62)">

  <path d="M 14 -28 Q 10 -34 14 -40 Q 18 -46 14 -52" fill="none" stroke="#9A4530" stroke-width="1.5" stroke-linecap="round" opacity="0.55"/>
  <path d="M 26 -28 Q 22 -36 26 -44 Q 30 -52 26 -58" fill="none" stroke="#9A4530" stroke-width="1.5" stroke-linecap="round" opacity="0.55"/>
  <path d="M 38 -28 Q 34 -34 38 -40 Q 42 -46 38 -52" fill="none" stroke="#9A4530" stroke-width="1.5" stroke-linecap="round" opacity="0.55"/>
  <path d="M 0 0 Q -2 -10 8 -10 L 50 -10 Q 60 -10 58 0 L 54 44 Q 52 54 42 54 L 14 54 Q 4 54 2 44 Z" fill="#FFF6EC" stroke="#9A4530" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M 58 5 Q 70 5 72 16 Q 72 26 58 26" fill="none" stroke="#9A4530" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M 4 6 Q 30 10 56 6" fill="none" stroke="#9A4530" stroke-width="1.2" opacity="0.4"/>
  <ellipse cx="28" cy="54" rx="30" ry="3" fill="none" stroke="#9A4530" stroke-width="1.2" opacity="0.35"/>
  <g transform="translate(70, 0)" opacity="0.5">
    <path d="M 0 0 Q 4 -6 10 -4 Q 6 0 0 0 Z" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1"/>
    <path d="M 4 0 L 4 8" fill="none" stroke="#5D8A5D" stroke-width="1" stroke-linecap="round"/>
  </g>
  

      </g>
    </svg>
  );
}
