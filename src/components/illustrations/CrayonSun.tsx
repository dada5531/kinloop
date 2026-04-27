import React from "react";

interface CrayonSunProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function CrayonSun({ className, size, "aria-hidden": ariaHidden = true, ...props }: CrayonSunProps & React.SVGProps<SVGSVGElement>) {
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

    <path d="M 0 0 Q -4 -8 -10 -6 Q -8 0 0 0 Z" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M -4 -2 L -2 -4" stroke="#5D8A5D" stroke-width="1" opacity="0.6"/>
    <path d="M 0 0 Q 4 -10 12 -8 Q 8 -2 0 0 Z" fill="#C2D8B8" stroke="#5D8A5D" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M 4 -4 L 6 -2" stroke="#5D8A5D" stroke-width="1" opacity="0.6"/>
    <path d="M -3 -1 L -3 -10" fill="none" stroke="#5D8A5D" stroke-width="1.4" stroke-linecap="round"/>
  
      </g>
    </svg>
  );
}
