import React from "react";

interface PlayLabTransitionProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function PlayLabTransition({ className, size, "aria-hidden": ariaHidden = true, ...props }: PlayLabTransitionProps & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaHidden}
      {...props}
    >
      <g transform="translate(40, 40)">

  <path d="M -32 16 L 0 0 L 32 16 L 0 26 Z" fill="#F8DD93" stroke="#9A7820" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M 0 0 L 0 26" fill="none" stroke="#9A7820" stroke-width="1.3" opacity="0.6"/>
  <path d="M 0 0 L -16 -18 L -22 -10 L -10 4" fill="#FCE7B1" stroke="#9A7820" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M 0 0 L 16 -18 L 22 -10 L 10 4" fill="#F8DD93" stroke="#9A7820" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M 32 16 L 46 22 L 52 14 L 38 8 Z" fill="#FCE7B1" stroke="#9A7820" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M -32 16 L -46 8 L -52 14 L -38 22 Z" fill="#F8DD93" stroke="#9A7820" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cx="-46" cy="14" r="1.2" fill="#9A7820"/>
  <path d="M 0 30 Q 4 38 -2 44" fill="none" stroke="#9A7820" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="2 3" opacity="0.55"/>
  

      </g>
    </svg>
  );
}
