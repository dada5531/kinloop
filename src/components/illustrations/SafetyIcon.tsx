import React from "react";

interface SafetyIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function SafetyIcon({ className, size, "aria-hidden": ariaHidden = true, ...props }: SafetyIconProps & React.SVGProps<SVGSVGElement>) {
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

    <path d="M 0 0 Q 6 -10 14 -8 Q 12 -2 6 -2 Q 4 4 0 0 Z" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M 4 -3 L 6 4" fill="none" stroke="#5D8A5D" stroke-width="1" opacity="0.6"/>
  
      </g>
    </svg>
  );
}
