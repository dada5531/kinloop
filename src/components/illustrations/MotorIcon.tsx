import React from "react";

interface MotorIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function MotorIcon({ className, size, "aria-hidden": ariaHidden = true, ...props }: MotorIconProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M -22 4 L 22 4" stroke="#5D8A5D" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M -16 4 L -16 18" stroke="#9A6A40" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M 16 4 L 16 18" stroke="#9A6A40" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M -22 18 L -10 18" stroke="#9A6A40" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M 10 18 L 22 18" stroke="#9A6A40" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="0" cy="-4" r="6" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.7"/>
  <circle cx="-2" cy="-5" r="1.4" fill="#5D8A5D" opacity="0.5"/>
  

      </g>
    </svg>
  );
}
