import React from "react";

interface AfternoonSunProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function AfternoonSun({ className, size, "aria-hidden": ariaHidden = true, ...props }: AfternoonSunProps & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaHidden}
      {...props}
    >
      <g transform="translate(48, 48)">

  <circle cx="0" cy="0" r="22" fill="#FCE7B1" stroke="#9A7820" stroke-width="1.7"/>
  <circle cx="0" cy="0" r="22" fill="none" stroke="#9A7820" stroke-width="1.4" opacity="0.6" stroke-dasharray="2 3"/>
  <path d="M 0 -34 L 0 -42" stroke="#9A7820" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M 0 34 L 0 42" stroke="#9A7820" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M -34 0 L -42 0" stroke="#9A7820" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M 34 0 L 42 0" stroke="#9A7820" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M -24 -24 L -30 -30" stroke="#9A7820" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M 24 -24 L 30 -30" stroke="#9A7820" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M -24 24 L -30 30" stroke="#9A7820" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M 24 24 L 30 30" stroke="#9A7820" stroke-width="1.7" stroke-linecap="round"/>
  <circle cx="-6" cy="-2" r="1.4" fill="#9A7820" opacity="0.55"/>
  <circle cx="6" cy="2" r="1.2" fill="#9A7820" opacity="0.55"/>
  

      </g>
    </svg>
  );
}
