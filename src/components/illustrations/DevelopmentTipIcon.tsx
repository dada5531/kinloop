import React from "react";

interface DevelopmentTipIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function DevelopmentTipIcon({ className, size, "aria-hidden": ariaHidden = true, ...props }: DevelopmentTipIconProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M -22 -2 Q -22 12 -10 18 Q 0 22 10 18 Q 22 12 22 -2 Z" fill="#F0BC93" stroke="#B85A3F" stroke-width="1.7" stroke-linejoin="round"/>
  <ellipse cx="0" cy="-2" rx="22" ry="4" fill="#F5D3B6" stroke="#B85A3F" stroke-width="1.5"/>
  
      </g>
    </svg>
  );
}
