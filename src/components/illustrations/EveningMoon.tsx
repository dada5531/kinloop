import React from "react";

interface EveningMoonProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function EveningMoon({ className, size, "aria-hidden": ariaHidden = true, ...props }: EveningMoonProps & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 110 120"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaHidden}
      {...props}
    >
      <g transform="translate(55, 40)">

  <path d="M 12 -10 Q -10 -8 -10 16 Q -8 36 14 38 Q 4 30 4 14 Q 4 -2 12 -10 Z" fill="#D8DCE8" stroke="#4A5A78" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="-2" cy="6" r="1.2" fill="#4A5A78" opacity="0.5"/>
  <circle cx="2" cy="22" r="1" fill="#4A5A78" opacity="0.5"/>
  <g transform="translate(-50, 30)" opacity="0.65">
    <path d="M 0 0 Q -2 -8 6 -8 L 22 -8 Q 30 -8 28 0 Q 32 2 28 6 L 0 6 Q -4 4 0 0 Z" fill="#EDEFF4" stroke="#4A5A78" stroke-width="1.5" stroke-linejoin="round"/>
  </g>
  <g transform="translate(28, 50)" opacity="0.65">
    <path d="M 0 0 Q -2 -8 6 -8 L 18 -8 Q 26 -8 24 0 Q 28 2 24 6 L 0 6 Q -4 4 0 0 Z" fill="#EDEFF4" stroke="#4A5A78" stroke-width="1.5" stroke-linejoin="round"/>
  </g>
  <circle cx="-30" cy="-20" r="1.2" fill="#4A5A78" opacity="0.6"/>
  <circle cx="40" cy="-12" r="1.4" fill="#4A5A78" opacity="0.6"/>
  <circle cx="-12" cy="-30" r="1" fill="#4A5A78" opacity="0.5"/>
  

      </g>
    </svg>
  );
}
