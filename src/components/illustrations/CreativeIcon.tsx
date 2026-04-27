import React from "react";

interface CreativeIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function CreativeIcon({ className, size, "aria-hidden": ariaHidden = true, ...props }: CreativeIconProps & React.SVGProps<SVGSVGElement>) {
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

    <path d="M -10 -10 L 6 -10 Q 6 -16 12 -16 Q 18 -16 18 -10 L 22 -10 L 22 6 L 16 6 Q 16 12 10 12 Q 4 12 4 6 L -10 6 Z" fill="#F8DD93" stroke="#9A7820" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="6" cy="-2" r="1.2" fill="#9A7820" opacity="0.55"/>
  
      </g>
    </svg>
  );
}
