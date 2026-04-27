import React from "react";

interface BehaviorIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function BehaviorIcon({ className, size, "aria-hidden": ariaHidden = true, ...props }: BehaviorIconProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M 0 -4 Q -10 -22 -18 -16 Q -22 -8 -18 0 L 0 18 L 18 0 Q 22 -8 18 -16 Q 10 -22 0 -4 Z" fill="#F2A4B6" stroke="#9A3D55" stroke-width="1.7" stroke-linejoin="round"/>
  
      </g>
    </svg>
  );
}
