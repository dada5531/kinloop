import React from "react";

interface SleepIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function SleepIcon({ className, size, "aria-hidden": ariaHidden = true, ...props }: SleepIconProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M 8 -16 Q -10 -14 -10 6 Q -8 22 10 22 Q 2 16 2 4 Q 2 -8 8 -16 Z" fill="#F8E0E8" stroke="#9A3D55" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="-2" cy="0" r="1" fill="#9A3D55" opacity="0.5"/>
  <circle cx="0" cy="12" r="0.8" fill="#9A3D55" opacity="0.5"/>
  

      </g>
    </svg>
  );
}
