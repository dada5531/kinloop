import React from "react";

interface SensoryIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function SensoryIcon({ className, size, "aria-hidden": ariaHidden = true, ...props }: SensoryIconProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M -20 0 Q -22 16 -10 22 Q 0 26 10 22 Q 22 16 20 0 Z" fill="#F0BC93" stroke="#B85A3F" stroke-width="1.7" stroke-linejoin="round"/>
  <ellipse cx="0" cy="0" rx="20" ry="4" fill="#F5D3B6" stroke="#B85A3F" stroke-width="1.5"/>
  <circle cx="-8" cy="-2" r="2" fill="#E8B4A0" stroke="#9A4530" stroke-width="1.2"/>
  <circle cx="2" cy="-3" r="2.4" fill="#E8B4A0" stroke="#9A4530" stroke-width="1.2"/>
  <circle cx="10" cy="-1" r="1.8" fill="#E8B4A0" stroke="#9A4530" stroke-width="1.2"/>
  

      </g>
    </svg>
  );
}
