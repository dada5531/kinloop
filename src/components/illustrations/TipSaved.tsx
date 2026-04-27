import React from "react";

interface TipSavedProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function TipSaved({ className, size, "aria-hidden": ariaHidden = true, ...props }: TipSavedProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M 0 -8 Q -12 -28 -22 -18 Q -28 -8 -22 2 L 0 26 L 22 2 Q 28 -8 22 -18 Q 12 -28 0 -8 Z" fill="#F2A4B6" stroke="#9A3D55" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M -8 -10 Q -14 -16 -18 -12" fill="none" stroke="#9A3D55" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
  
      </g>
    </svg>
  );
}
